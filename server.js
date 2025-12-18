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

// Network configurations
const NETWORKS = {
  arbitrumOne: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: process.env.ARBITRUM_ONE_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    configPath: path.join(__dirname, 'deployments', 'arbitrumOne', 'deployed-vaults.json'),
    explorer: 'https://arbiscan.io'
  },
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    configPath: path.join(__dirname, 'deployments', 'base', 'deployed-vaults.json'),
    explorer: 'https://basescan.org'
  }
};

// Store providers and configs for each network
const providers = {};
const configs = {};
let currentNetwork = 'arbitrumOne'; // Default network

// Initialize providers for all networks
async function initializeProviders() {
  for (const [networkKey, networkConfig] of Object.entries(NETWORKS)) {
    try {
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      await provider.getNetwork(); // Test connection
      providers[networkKey] = provider;
      console.log(`${networkConfig.name} provider initialized successfully`);
      
      // Load configuration
      try {
        configs[networkKey] = require(networkConfig.configPath);
        console.log(`${networkConfig.name} configuration loaded successfully`);
      } catch (error) {
        console.error(`Failed to load config for ${networkConfig.name}:`, error);
        configs[networkKey] = null;
      }
    } catch (error) {
      console.error(`Failed to initialize provider for ${networkConfig.name}:`, error);
      providers[networkKey] = null;
      configs[networkKey] = null;
    }
  }
}

// Get current provider and config
function getCurrentProvider() {
  return providers[currentNetwork];
}

function getCurrentConfig() {
  return configs[currentNetwork];
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

// Network management endpoints
app.get('/api/networks', (req, res) => {
  const networks = Object.entries(NETWORKS).map(([key, network]) => ({
    key,
    name: network.name,
    chainId: network.chainId,
    explorer: network.explorer,
    isActive: key === currentNetwork,
    hasConfig: configs[key] !== null && configs[key] !== undefined
  }));
  res.json(networks);
});

app.get('/api/network/current', (req, res) => {
  res.json({
    network: currentNetwork,
    networkInfo: NETWORKS[currentNetwork],
    hasConfig: getCurrentConfig() !== null
  });
});

app.post('/api/network/switch', (req, res) => {
  const { network } = req.body;
  if (!network || !NETWORKS[network]) {
    return res.status(400).json({ error: 'Invalid network' });
  }
  
  if (!providers[network]) {
    return res.status(400).json({ error: `Provider for ${network} is not initialized` });
  }
  
  currentNetwork = network;
  res.json({
    success: true,
    network: currentNetwork,
    networkInfo: NETWORKS[currentNetwork]
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
      network: currentNetwork,
      networkName: NETWORKS[currentNetwork].name,
      vaults: await getVaultData(),
      providers: await getProviderData(),
      apyData: await getAPYData(),
      events: await getRecentEvents(),
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
  const config = getCurrentConfig();
  const provider = getCurrentProvider();
  if (!config || !provider) return [];
  
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
  const config = getCurrentConfig();
  const provider = getCurrentProvider();
  if (!config || !provider) return [];
  
  const providers = [];
  
  for (const [name, contractAddress] of Object.entries(config.baseContracts)) {
    if (name.includes('Provider')) {
      try {
        if (!contractAddress) {
          throw new Error(`No address found for provider ${name}`);
        }
        
        // Create provider contract to get deposit rate
        const providerContract = new ethers.Contract(contractAddress, [
          'function getDepositRate(address vault) view returns (uint256 rate)',
          'function getIdentifier() view returns (string memory)'
        ], provider);
        
        let providerIdentifier = formatProviderName(name);
        let depositRates = {};
        
        // Get provider identifier from contract first, fallback to formatted name from config
        try {
          const contractIdentifier = await providerContract.getIdentifier();
          if (contractIdentifier && contractIdentifier.trim() !== '') {
            providerIdentifier = contractIdentifier;
          }
        } catch (idError) {
          console.error(`Error fetching identifier for ${name}:`, idError);
          // Use formatted name from config key as fallback
        }
        
        // Get deposit rates for all available vaults
        for (const [token, vaultConfig] of Object.entries(config.vaults)) {
          try {
            const rateInRay = await providerContract.getDepositRate(vaultConfig.address);
            // Convert from ray (1e27) to percentage
            const rate = (Number(rateInRay) / 1e25).toFixed(4);
            depositRates[token] = rate;
          } catch (rateError) {
            console.error(`Error fetching deposit rate for ${name} on ${token} vault:`, rateError);
            depositRates[token] = '0.0000';
          }
        }
        
        providers.push({
          name: providerIdentifier,
          address: contractAddress,
          depositRates: depositRates,
          status: 'active'
        });
      } catch (error) {
        console.error(`Error fetching provider data for ${name}:`, error);
        providers.push({
          name: name,
          address: contractAddress,
          depositRates: {},
          error: error.message,
          status: 'error'
        });
      }
    }
  }
  
  return providers;
}

async function getAPYData() {
  const config = getCurrentConfig();
  const provider = getCurrentProvider();
  const apyData = [];
  
  if (config && provider) {
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


async function getRecentEvents() {
  return [
    {
      type: 'RebalanceExecuted',
      vault: 'USDC Vault',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      txHash: '0x1234...5678',
      success: true
    },
    {
      type: 'Deposit',
      vault: 'USDT Vault',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      txHash: '0xabcd...efgh',
      success: true
    }
  ];
}

async function getNetworkInfo() {
  const provider = getCurrentProvider();
  const networkConfig = NETWORKS[currentNetwork];
  
  if (!provider) {
    return {
      error: 'Provider not initialized',
      lastUpdate: new Date().toISOString()
    };
  }
  
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData()
    ]);
    
    return {
      network: currentNetwork,
      networkName: networkConfig.name,
      chainId: await provider.getNetwork().then(n => n.chainId),
      blockNumber: blockNumber,
      gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
      explorer: networkConfig.explorer,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    return {
      network: currentNetwork,
      networkName: networkConfig.name,
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

// Format provider name from config key to readable format
function formatProviderName(name) {
  // Remove 'Provider' suffix if present
  let formatted = name.replace(/Provider$/i, '');
  
  // Convert camelCase to Title Case with spaces
  formatted = formatted.replace(/([A-Z])/g, ' $1').trim();
  
  // Handle special cases
  const specialCases = {
    'aave V3': 'Aave V3',
    'compound V3': 'Compound V3',
    're7 Morpho': 'RE7 Morpho',
    'steakhouse High Yield Morpho': 'Steakhouse High Yield Morpho',
    'steakhouse Prime Morpho': 'Steakhouse Prime Morpho',
    'gauntlet Core Morpho': 'Gauntlet Core Morpho',
    'dolomite': 'Dolomite',
    'morpho': 'Morpho'
  };
  
  // Apply special cases
  for (const [key, value] of Object.entries(specialCases)) {
    if (formatted.toLowerCase().includes(key.toLowerCase())) {
      formatted = formatted.replace(new RegExp(key, 'i'), value);
      break;
    }
  }
  
  // Capitalize first letter of each word
  formatted = formatted.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return formatted || name;
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

initializeProviders().then(() => {
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
