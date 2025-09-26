const express = require('express');
const cors = require('cors');
const path = require('path');
const { ethers } = require('ethers');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize provider with retry logic
let provider;
async function initializeProvider() {
  try {
    provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_ONE_RPC_URL || 'https://arb1.arbitrum.io/rpc');
    await provider.getNetwork(); // Test connection
    console.log('Provider initialized successfully');
  } catch (error) {
    console.error('Failed to initialize provider:', error);
    process.exit(1);
  }
}

// Load configuration
const configPath = path.join(__dirname, 'deployments', 'arbitrumOne', 'deployed-vaults.json');
let config = null;

try {
  config = require(configPath);
  console.log('Configuration loaded successfully');
} catch (error) {
  console.error('Failed to load config:', error);
}

// Helper function to serialize BigInt values
function serializeData(data) {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api/vaults', async (req, res) => {
  try {
    const vaults = await getVaultData();
    res.json(serializeData(vaults));
  } catch (error) {
    console.error('Error fetching vaults:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/providers', async (req, res) => {
  try {
    const providers = await getProviderData();
    res.json(serializeData(providers));
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/apy', async (req, res) => {
  try {
    const apyData = await getAPYData();
    res.json(serializeData(apyData));
  } catch (error) {
    console.error('Error fetching APY data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await getRecentEvents();
    res.json(serializeData(events));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/keepers', async (req, res) => {
  try {
    const keepers = await getKeeperData();
    res.json(serializeData(keepers));
  } catch (error) {
    console.error('Error fetching keeper data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await getAllAlerts();
    res.json(serializeData(alerts));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      alerts: logger.getAlertStats(24),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version
      },
      lastUpdate: new Date().toISOString()
    };
    res.json(serializeData(stats));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const dashboardData = {
      vaults: await getVaultData(),
      providers: await getProviderData(),
      apyData: await getAPYData(),
      events: await getRecentEvents(),
      keepers: await getKeeperData(),
      alerts: await getAllAlerts(),
      networkInfo: await getNetworkInfo(),
      lastUpdate: new Date().toISOString()
    };
    
    res.json(serializeData(dashboardData));
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Data fetching functions
async function getVaultData() {
  if (!config) return [];
  
  const vaults = [];
  
  for (const [token, vaultConfig] of Object.entries(config.vaults)) {
    try {
      const vault = new ethers.Contract(vaultConfig.address, [
        'function totalAssets() view returns (uint256)',
        'function totalSupply() view returns (uint256)',
        'function asset() view returns (address)',
        'function activeProvider() view returns (address)'
      ], provider);
      
      const [totalAssets, totalShares, asset, activeProvider] = await Promise.all([
        vault.totalAssets(),
        vault.totalSupply(),
        vault.asset(),
        vault.activeProvider()
      ]);
      
      const decimals = getTokenDecimals(token);
      const tvl = ethers.formatUnits(totalAssets, decimals);
      const shares = ethers.formatUnits(totalShares, 18);
      
      // Get provider info
      let providerInfo = null;
      try {
        const providerContract = new ethers.Contract(activeProvider, [
          'function getIdentifier() view returns (string memory)',
          'function getDepositRate(address vault) view returns (uint256 rate)'
        ], provider);
        
        const [providerName, rateInRay] = await Promise.all([
          providerContract.getIdentifier(),
          providerContract.getDepositRate(vaultConfig.address)
        ]);
        
        const apy = (Number(rateInRay) / 1e25).toFixed(4);
        
        providerInfo = {
          address: activeProvider,
          name: providerName,
          apy: apy
        };
      } catch (error) {
        console.error(`Error fetching provider info for ${token}:`, error);
        providerInfo = {
          address: activeProvider,
          name: 'unknown',
          apy: '0.0000',
          error: error.message
        };
      }
      
      vaults.push({
        name: vaultConfig.name,
        symbol: vaultConfig.symbol,
        address: vaultConfig.address,
        asset: asset,
        tvl: tvl,
        totalShares: shares,
        activeProvider: activeProvider,
        providerInfo: providerInfo,
        token: token,
        status: vaultConfig.status
      });
    } catch (error) {
      console.error(`Error fetching vault data for ${token}:`, error);
      vaults.push({
        name: vaultConfig.name,
        symbol: vaultConfig.symbol,
        address: vaultConfig.address,
        error: error.message,
        token: token,
        status: 'error'
      });
    }
  }
  
  return vaults;
}

async function getProviderData() {
  if (!config) return [];
  
  const providers = [];
  
  for (const [name, contractConfig] of Object.entries(config.baseContracts)) {
    if (name.includes('Provider')) {
      try {
        const balance = await provider.getBalance(contractConfig.address);
        
        providers.push({
          name: name,
          address: contractConfig.address,
          balance: ethers.formatEther(balance),
          status: contractConfig.status
        });
      } catch (error) {
        console.error(`Error fetching provider data for ${name}:`, error);
        providers.push({
          name: name,
          address: contractConfig.address,
          error: error.message,
          status: 'error'
        });
      }
    }
  }
  
  return providers;
}

async function getAPYData() {
  const apyData = [];
  
  if (config) {
    for (const [token, vaultConfig] of Object.entries(config.vaults)) {
      try {
        const vault = new ethers.Contract(vaultConfig.address, [
          'function activeProvider() view returns (address)'
        ], provider);
        
        const activeProviderAddress = await vault.activeProvider();
        
        // Get provider contract
        const providerContract = new ethers.Contract(activeProviderAddress, [
          'function getDepositRate(address vault) view returns (uint256 rate)',
          'function getIdentifier() view returns (string memory)'
        ], provider);
        
        // Get real APY from provider
        const rateInRay = await providerContract.getDepositRate(vaultConfig.address);
        const providerName = await providerContract.getIdentifier();
        
        // Convert from ray (1e27) to percentage
        const apy = (Number(rateInRay) / 1e25).toFixed(4); // Convert to percentage
        
        apyData.push({
          token: token,
          vaultAddress: vaultConfig.address,
          assetAddress: vaultConfig.asset,
          apy: apy,
          provider: providerName,
          providerAddress: activeProviderAddress,
          source: 'blockchain'
        });
      } catch (error) {
        console.error(`Error fetching APY for ${token}:`, error);
        apyData.push({
          token: token,
          vaultAddress: vaultConfig.address,
          assetAddress: vaultConfig.asset,
          apy: '0.0000',
          provider: 'unknown',
          providerAddress: 'unknown',
          source: 'error',
          error: error.message
        });
      }
    }
  }
  
  return apyData;
}

async function getKeeperData() {
  const keepers = [];
  
  if (config && config.chainlinkKeepers) {
    for (const [key, keeperConfig] of Object.entries(config.chainlinkKeepers)) {
      try {
        // Fetch real data from Chainlink API
        const keeperData = await fetchKeeperFromChainlinkAPI(keeperConfig.id);
        
        // Calculate additional metrics
        const metrics = calculateKeeperMetrics(keeperData);
        
        // Check for alerts
        const alerts = checkKeeperAlerts(keeperData, metrics);
        
        keepers.push({
          id: keeperConfig.id,
          name: keeperConfig.name,
          description: keeperConfig.description,
          url: keeperConfig.url,
          status: keeperData.status,
          lastRun: keeperData.lastRun,
          nextRun: keeperData.nextRun,
          balance: keeperData.balance,
          totalSpent: keeperData.totalSpent,
          gasLimit: keeperData.gasLimit,
          gasPrice: keeperData.gasPrice,
          triggerType: keeperData.triggerType,
          network: 'arbitrum',
          // New metrics
          uptime: metrics.uptime,
          performance: metrics.performance,
          costEfficiency: metrics.costEfficiency,
          successRate: metrics.successRate,
          executionCount: metrics.executionCount,
          // Alerts
          alerts: alerts,
          lastUpdate: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error fetching keeper data for ${key}:`, error);
        
        // Log error alert
        logger.logAlert('KEEPER_ERROR', {
          keeperId: keeperConfig.id,
          keeperName: keeperConfig.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        keepers.push({
          id: keeperConfig.id,
          name: keeperConfig.name,
          description: keeperConfig.description,
          url: keeperConfig.url,
          status: 'error',
          error: error.message,
          alerts: [{
            type: 'error',
            message: `Failed to fetch data: ${error.message}`,
            severity: 'high',
            timestamp: new Date().toISOString()
          }],
          lastUpdate: new Date().toISOString()
        });
      }
    }
  }
  
  return keepers;
}

async function getRecentEvents() {
  return [
    {
      type: 'RebalanceExecuted',
      vault: 'USDC Vault',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      txHash: '0x1234...5678',
      success: true,
      keeper: 'Vault Rebalancer Keeper'
    },
    {
      type: 'KeeperExecution',
      vault: 'USDT Vault',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      txHash: '0xabcd...efgh',
      success: true,
      keeper: 'Vault Maintenance Keeper'
    }
  ];
}

async function getNetworkInfo() {
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData()
    ]);
    
    return {
      chainId: await provider.getNetwork().then(n => n.chainId),
      blockNumber: blockNumber,
      gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      lastUpdate: new Date().toISOString()
    };
  }
}

function getTokenDecimals(token) {
  const decimals = {
    'WETH': 18,
    'USDC': 6,
    'USDT': 6,
    'DAI': 18,
    'FRAX': 18,
    'USDC_e': 6
  };
  return decimals[token] || 18;
}

// Chainlink API integration
async function fetchKeeperFromChainlinkAPI(keeperId) {
  const chainlinkApiKey = process.env.CHAINLINK_API_KEY;
  const chainlinkApiUrl = process.env.CHAINLINK_API_URL || 'https://automation.chain.link/api/v1';
  
  if (!chainlinkApiKey) {
    throw new Error('CHAINLINK_API_KEY not configured');
  }
  
  try {
    const response = await fetch(`${chainlinkApiUrl}/upkeeps/${keeperId}`, {
      headers: {
        'Authorization': `Bearer ${chainlinkApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Chainlink API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      status: data.status || 'unknown',
      lastRun: data.lastRun || null,
      nextRun: data.nextRun || null,
      balance: data.balance || '0',
      totalSpent: data.totalSpent || '0',
      gasLimit: data.gasLimit || '500000',
      gasPrice: data.gasPrice || '0',
      triggerType: data.triggerType || 'time-based',
      executionCount: data.executionCount || 0,
      successCount: data.successCount || 0,
      failureCount: data.failureCount || 0,
      rawData: data
    };
  } catch (error) {
    console.error(`Failed to fetch keeper data from Chainlink API:`, error);
    throw error;
  }
}

// Calculate keeper metrics
function calculateKeeperMetrics(keeperData) {
  const now = new Date();
  const lastRun = keeperData.lastRun ? new Date(keeperData.lastRun) : null;
  
  // Calculate uptime (time since last successful run)
  let uptime = 0;
  if (lastRun) {
    uptime = Math.floor((now - lastRun) / 1000 / 60); // minutes
  }
  
  // Calculate performance (average execution time)
  const performance = keeperData.executionCount > 0 ? 
    (keeperData.successCount / keeperData.executionCount) * 100 : 0;
  
  // Calculate cost efficiency (cost per successful execution)
  const costEfficiency = keeperData.successCount > 0 ? 
    parseFloat(keeperData.totalSpent) / keeperData.successCount : 0;
  
  // Calculate success rate
  const successRate = keeperData.executionCount > 0 ? 
    (keeperData.successCount / keeperData.executionCount) * 100 : 100;
  
  return {
    uptime: uptime,
    performance: performance.toFixed(2),
    costEfficiency: costEfficiency.toFixed(6),
    successRate: successRate.toFixed(2),
    executionCount: keeperData.executionCount
  };
}

// Check for alerts
function checkKeeperAlerts(keeperData, metrics) {
  const alerts = [];
  const now = new Date();
  
  // Low balance alert
  if (parseFloat(keeperData.balance) < 0.1) {
    alerts.push({
      type: 'low_balance',
      message: `Low balance: ${keeperData.balance} ETH`,
      severity: 'high',
      timestamp: now.toISOString()
    });
  }
  
  // Missed execution alert (no run in last 2 hours)
  if (keeperData.lastRun) {
    const lastRun = new Date(keeperData.lastRun);
    const hoursSinceLastRun = (now - lastRun) / 1000 / 60 / 60;
    
    if (hoursSinceLastRun > 2) {
      alerts.push({
        type: 'missed_execution',
        message: `No execution in ${hoursSinceLastRun.toFixed(1)} hours`,
        severity: 'medium',
        timestamp: now.toISOString()
      });
    }
  }
  
  // Low success rate alert
  if (parseFloat(metrics.successRate) < 90) {
    alerts.push({
      type: 'low_success_rate',
      message: `Low success rate: ${metrics.successRate}%`,
      severity: 'medium',
      timestamp: now.toISOString()
    });
  }
  
  // High cost efficiency alert
  if (parseFloat(metrics.costEfficiency) > 0.01) {
    alerts.push({
      type: 'high_cost',
      message: `High cost per execution: ${metrics.costEfficiency} ETH`,
      severity: 'low',
      timestamp: now.toISOString()
    });
  }
  
  // Status alerts
  if (keeperData.status === 'paused') {
    alerts.push({
      type: 'paused',
      message: 'Keeper is paused',
      severity: 'high',
      timestamp: now.toISOString()
    });
  }
  
  return alerts;
}

// Alert logging system
function logAlert(alertType, alertData) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: alertType,
    data: alertData,
    severity: alertData.severity || 'medium'
  };
  
  // Log to console
  console.log(`🚨 ALERT [${alertType.toUpperCase()}]:`, JSON.stringify(logEntry, null, 2));
  
  // In production, you would also log to:
  // - File system
  // - Database
  // - External monitoring service (DataDog, New Relic, etc.)
  // - Slack/Discord webhooks
  // - Email notifications
}

// Get all alerts
async function getAllAlerts() {
  try {
    const stats = logger.getAlertStats(24); // Last 24 hours
    const recent = logger.getRecentAlerts(24); // Last 24 hours
    
    return {
      total: stats.total,
      high: stats.high,
      medium: stats.medium,
      low: stats.low,
      byType: stats.byType,
      recent: recent.slice(0, 10), // Last 10 alerts
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {},
      recent: [],
      error: error.message,
      lastUpdate: new Date().toISOString()
    };
  }
}

// Serve simple HTML dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-dashboard.html'));
});

// Serve simple HTML dashboard for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-dashboard.html'));
});

initializeProvider().then(() => {
  // Clean old logs on startup
  logger.cleanOldLogs();
  
  app.listen(PORT, () => {
    console.log(`🚀 Thesauros Monitoring Service started successfully!`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    console.log(`📈 Keepers: http://localhost:${PORT}/api/keepers`);
    console.log(`🚨 Alerts: http://localhost:${PORT}/api/alerts`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });
}).catch((error) => {
  console.error("Failed to initialize provider:", error);
  process.exit(1);
});
