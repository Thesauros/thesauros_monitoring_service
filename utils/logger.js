const fs = require('fs');
const path = require('path');

class AlertLogger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.alertLogFile = path.join(this.logDir, 'alerts.log');
    this.metricsLogFile = path.join(this.logDir, 'metrics.log');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Log alert to file
  logAlert(alertType, alertData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: alertType,
      data: alertData,
      severity: alertData.severity || 'medium'
    };

    // Log to console
    console.log(`🚨 ALERT [${alertType.toUpperCase()}]:`, JSON.stringify(logEntry, null, 2));

    // Log to file
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.alertLogFile, logLine);

    // Log to metrics file for analysis
    this.logMetrics('alert', {
      alertType,
      severity: alertData.severity || 'medium',
      timestamp: logEntry.timestamp
    });
  }

  // Log metrics for analysis
  logMetrics(metricType, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      metricType,
      data
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.metricsLogFile, logLine);
  }

  // Get recent alerts
  getRecentAlerts(hours = 24) {
    try {
      if (!fs.existsSync(this.alertLogFile)) {
        return [];
      }

      const logContent = fs.readFileSync(this.alertLogFile, 'utf8');
      const lines = logContent.trim().split('\n').filter(line => line.trim());
      
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      return lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(entry => entry && new Date(entry.timestamp) > cutoffTime)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error reading alert logs:', error);
      return [];
    }
  }

  // Get alert statistics
  getAlertStats(hours = 24) {
    const alerts = this.getRecentAlerts(hours);
    
    const stats = {
      total: alerts.length,
      high: 0,
      medium: 0,
      low: 0,
      byType: {}
    };

    alerts.forEach(alert => {
      // Count by severity
      if (alert.severity === 'high') stats.high++;
      else if (alert.severity === 'medium') stats.medium++;
      else if (alert.severity === 'low') stats.low++;

      // Count by type
      if (!stats.byType[alert.type]) {
        stats.byType[alert.type] = 0;
      }
      stats.byType[alert.type]++;
    });

    return stats;
  }

  // Clean old logs (keep last 7 days)
  cleanOldLogs() {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    [this.alertLogFile, this.metricsLogFile].forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const logContent = fs.readFileSync(file, 'utf8');
          const lines = logContent.trim().split('\n').filter(line => line.trim());
          
          const recentLines = lines.filter(line => {
            try {
              const entry = JSON.parse(line);
              return new Date(entry.timestamp) > cutoffTime;
            } catch (e) {
              return false;
            }
          });

          fs.writeFileSync(file, recentLines.join('\n') + '\n');
        } catch (error) {
          console.error(`Error cleaning log file ${file}:`, error);
        }
      }
    });
  }
}

module.exports = new AlertLogger();
