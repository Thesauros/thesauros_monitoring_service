#!/bin/bash

# Thesauros Monitoring Service - Management Script
# Usage: ./manage-service.sh [status|restart|logs|stop|start|nginx|ssl]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [status|restart|logs|stop|start|nginx|ssl]"
    echo ""
    echo "Commands:"
    echo "  status  - Show status of all services"
    echo "  restart - Restart monitoring service"
    echo "  logs    - Show PM2 logs"
    echo "  stop    - Stop monitoring service"
    echo "  start   - Start monitoring service"
    echo "  nginx   - Show Nginx status"
    echo "  ssl     - Check SSL certificate"
    exit 1
fi

ACTION=$1

case $ACTION in
    "status")
        log "📊 PM2 processes status:"
        pm2 status
        
        echo ""
        log "🌐 Nginx status:"
        systemctl status nginx --no-pager
        
        echo ""
        log "🔌 Port check:"
        netstat -tlnp | grep -E ':(80|443|3001)'
        
        echo ""
        log "💾 Disk usage:"
        df -h /opt/thesauros
        
        echo ""
        log "🧠 Memory usage:"
        free -h
        ;;
        
    "restart")
        log "🔄 Restarting monitoring service..."
        pm2 restart thesauros-monitoring
        log "✅ Service restarted"
        pm2 status
        ;;
        
    "logs")
        log "📝 Showing PM2 logs..."
        pm2 logs thesauros-monitoring --lines 50
        ;;
        
    "stop")
        log "⏹️ Stopping monitoring service..."
        pm2 stop thesauros-monitoring
        log "✅ Service stopped"
        pm2 status
        ;;
        
    "start")
        log "▶️ Starting monitoring service..."
        pm2 start thesauros-monitoring
        log "✅ Service started"
        pm2 status
        ;;
        
    "nginx")
        log "🌐 Nginx status:"
        systemctl status nginx --no-pager
        
        echo ""
        log "📋 Nginx configuration:"
        nginx -t
        
        echo ""
        log "📁 Configuration files:"
        ls -la /etc/nginx/sites-enabled/
        ;;
        
    "ssl")
        log "🔒 SSL certificate check:"
        certbot certificates
        
        echo ""
        log "📅 Next SSL renewal:"
        crontab -l | grep certbot || echo "SSL cron not configured"
        ;;
        
    *)
        error "Unknown command: $ACTION"
        ;;
esac
