# 🚀 Deploying Thesauros Monitoring Service on Hetzner

## 📋 Requirements

- Hetzner server with Ubuntu/Debian
- Root access
- Domain `monitoring.thesauros.tech` (must point to server IP)
- Minimum 1GB RAM, 20GB disk
- Repository already cloned on server

## 🔧 Quick Deployment

### 1. Connect to server
```bash
ssh root@46.62.166.163
```

### 2. Navigate to cloned repository
```bash
cd /root/thesauros/my_repo
```

### 3. Make script executable and run deployment
```bash
chmod +x deploy-hetzner.sh
./deploy-hetzner.sh
```

## 📝 Step-by-step Deployment

### Step 1: Server Preparation
```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git unzip software-properties-common
```

### Step 2: Navigate to Repository
```bash
# Go to your cloned repository directory
cd /root/thesauros/my_repo

# Verify you're in the right place
ls -la
# Should show: server.js, package.json, deploy-hetzner.sh, etc.
```

### Step 3: Run Deployment Script
```bash
# Make script executable
chmod +x deploy-hetzner.sh

# Run deployment
./deploy-hetzner.sh
```

## 🛠️ Service Management

### Download Management Script
```bash
wget https://raw.githubusercontent.com/Thesauros/souros_monitoring_service/main/manage-service.sh
chmod +x manage-service.sh
```

### Management Commands
```bash
./manage-service.sh status    # Show status of all services
./manage-service.sh restart   # Restart monitoring service
./manage-service.sh logs      # View logs
./manage-service.sh stop      # Stop service
./manage-service.sh start     # Start service
./manage-service.sh nginx     # Nginx status
./manage-service.sh ssl       # Check SSL
```

## 📊 Service Verification

### Check PM2
```bash
pm2 status
pm2 logs thesauros-monitoring
```

### Check Nginx
```bash
systemctl status nginx
nginx -t
```

### Check Ports
```bash
netstat -tlnp | grep -E ':(80|443|3001)'
```

### Check SSL
```bash
certbot certificates
```

## 🌐 Service Access

After successful deployment, the service will be available at:
- **HTTP**: http://monitoring.thesauros.tech
- **HTTPS**: https://monitoring.thesauros.tech

## 🔍 Troubleshooting

### If PM2 doesn't start
```bash
pm2 delete thesauros-monitoring
cd /opt/thesauros
pm2 start server.js --name "thesauros-monitoring"
```

### If Nginx doesn't work
```bash
systemctl status nginx
journalctl -u nginx -f
```

### If SSL doesn't work
```bash
certbot certificates
certbot --nginx -d monitoring.thesauros.tech
```

### Check application logs
```bash
pm2 logs thesauros-monitoring --lines 100
```

## 📁 File Structure

```
/root/thesauros/my_repo/        # Your repository directory
├── server.js                    # Main server file
├── package.json                 # Dependencies
├── deploy-hetzner.sh           # Deployment script
└── ...                         # Other project files

/opt/thesauros/                 # Production application directory
├── server.js                    # Copied from repository
├── package.json                 # Copied from repository
├── .env                        # Environment variables
└── ...                         # All project files

/etc/nginx/sites-available/     # Nginx configuration
/etc/nginx/sites-enabled/       # Active sites
```

## 🔄 Application Update

```bash
# Update your repository
cd /root/thesauros/my_repo
git pull origin main

# Re-run deployment script to update production
./deploy-hetzner.sh
```

## 📞 Support

If problems occur:
1. Check logs: `pm2 logs thesauros-monitoring`
2. Check status: `./manage-service.sh status`
3. Restart service: `./manage-service.sh restart`
