# Thesauros Monitoring UI

A simple web application for monitoring the Thesauros DeFi protocol on Arbitrum One.

## 🚀 Quick Start

Open your browser and navigate to http://5.161.205.208
Thesauros Monitoring Dashboard
API is available at http://5.161.205.208/api/health

### Local Development

#### Restart Nginx
systemctl restart nginx

#### View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

#### Restart application
docker-compose restart

#### View application logs
docker-compose logs -f

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Application will be available at http://localhost:3001
```

### Hetzner Deployment

For deployment on Hetzner Cloud, use one of the following options:

#### Option 1: Manual deployment (recommended for beginners)

```bash
chmod +x manual-deploy.sh
./manual-deploy.sh
```

#### Option 2: Automatic deployment

```bash
chmod +x deploy-hetzner.sh
./deploy-hetzner.sh
```

📖 **Detailed guide**: [HETZNER_DEPLOYMENT.md](HETZNER_DEPLOYMENT.md)

## 📋 Features

- **Vault Monitoring**: Track TVL, active providers
- **APY Analysis**: Show yields for various tokens
- **Events**: Display recent transactions
- **Network Status**: Information about Arbitrum One blockchain
- **Responsive UI**: Adaptive interface for all devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Arbitrum One   │
│   (HTML/CSS/JS) │◄──►│   (Express.js)  │◄──►│   (Ethers.js)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Technologies

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Blockchain**: Ethers.js for Arbitrum One interaction
- **Deployment**: Docker, Docker Compose, Nginx
- **Infrastructure**: Hetzner Cloud

## 📁 Project Structure

```
monitoring-ui/
├── server.js              # Express server
├── simple-dashboard.html  # Frontend interface
├── package.json           # Node.js dependencies
├── Dockerfile            # Docker image
├── docker-compose.yml    # Docker Compose configuration
├── deploy-hetzner.sh     # Automatic deployment
├── manual-deploy.sh      # Manual deployment
└── deployments/          # Contract configuration
    └── arbitrumOne/
        └── deployed-vaults.json
```

## 🌐 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/vaults` - Vault data
- `GET /api/providers` - Provider data
- `GET /api/apy` - APY data
- `GET /api/events` - Recent events
- `GET /api/dashboard` - All dashboard data

## 🔒 Security

- Rate limiting for API
- CORS settings
- Helmet.js for security headers
- UFW firewall on server
- SSL/HTTPS through Let's Encrypt

## 💰 Hosting Cost

- **Hetzner CX11**: ~€5/month (2 vCPU, 2GB RAM)
- **Hetzner CX21**: ~€10/month (3 vCPU, 4GB RAM)

## 🚨 Troubleshooting

### Local Development

```bash
# Check ports
lsof -i :3001

# Clean node_modules
rm -rf node_modules package-lock.json
npm install
```

### Production

```bash
# Check logs
docker-compose logs -f

# Restart application
docker-compose restart

# Check status
docker-compose ps
```

## 📞 Support

If you encounter problems:

1. Check logs: `docker-compose logs`
2. Ensure all ports are open
3. Check DNS settings (if using domain)
4. Refer to [HETZNER_DEPLOYMENT.md](HETZNER_DEPLOYMENT.md)

## 🔄 Updates

```bash
# Locally
git pull
npm install
npm run dev

# On server
ssh root@SERVER_IP
cd /opt/thesauros-monitoring
git pull
docker-compose down
docker-compose up -d --build
```

---

**Created by Thesauros Team** 🚀
