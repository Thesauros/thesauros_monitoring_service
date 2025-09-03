# 🚀 Deploying Thesauros Monitoring Service on Hetzner

## 📋 Requirements

- Hetzner server with Ubuntu/Debian
- Root access
- Domain `monitoring.thesauros.tech` (must point to server IP)
- Minimum 1GB RAM, 20GB disk

## 🔧 Quick Deployment

### 1. Connect to server
```bash
ssh root@46.62.166.163
```

### 2. Download deployment script
```bash
wget https://raw.githubusercontent.com/Thesauros/souros_monitoring_service/main/deploy-hetzner.sh
chmod +x deploy-hetzner.sh
```

### 3. Run deployment
```bash
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

### Step 2: Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Check version
node --version
npm --version
```

### Step 3: Install PM2
```bash
npm install -g pm2
```

### Step 4: Install Nginx
```bash
apt install -y nginx
```

### Step 5: Install Certbot for SSL
```bash
apt install -y certbot python3-certbot-nginx
```

### Step 6: Configure Application
```bash
# Create user
useradd -m -s /bin/bash thesauros
usermod -aG sudo thesauros

# Create directory
mkdir -p /opt/thesauros
chown thesauros:thesauros /opt/thesauros

# Clone repository
su - thesauros << 'EOF'
cd /opt/thesauros
git clone https://github.com/Thesauros/souros_monitoring_service.git .
npm install
EOF
```

### Step 7: Create .env file
```bash
cat > /opt/thesauros/.env << 'EOF'
NODE_ENV=production
PORT=3001
ARBITRUM_ONE_RPC_URL=https://arb1.arbitrum.io/rpc
LOG_LEVEL=info
EOF

chown thesauros:thesauros /opt/thesauros/.env
```

### Step 8: Configure PM2
```bash
su - thesauros << 'EOF'
cd /opt/thesauros
pm2 start server.js --name "thesauros-monitoring" --env production
pm2 save
pm2 startup
EOF

# Configure autostart
pm2 startup systemd -u thesauros --hp /home/thesauros
systemctl enable pm2-thesauros
```

### Step 9: Configure Nginx
```bash
cat > /etc/nginx/sites-available/thesauros-monitoring << 'EOF'
server {
    listen 80;
    server_name monitoring.thesauros.tech;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activate site
ln -sf /etc/nginx/sites-available/thesauros-monitoring /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Check and restart
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### Step 10: Configure Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Step 11: Get SSL Certificate
```bash
certbot --nginx -d monitoring.thesauros.tech --non-interactive --agree-tos --email admin@thesauros.tech
```

### Step 12: Configure Automatic SSL Renewal
```bash
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
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
/opt/thesauros/                    # Application directory
├── server.js                      # Main server file
├── package.json                   # Dependencies
├── .env                          # Environment variables
├── deployments/                  # Vaults configuration
└── simple-dashboard.html         # HTML dashboard

/etc/nginx/sites-available/       # Nginx configuration
/etc/nginx/sites-enabled/         # Active sites
```

## 🔄 Application Update

```bash
cd /opt/thesauros
git pull origin main
npm install
pm2 restart thesauros-monitoring
```

## 📞 Support

If problems occur:
1. Check logs: `pm2 logs thesauros-monitoring`
2. Check status: `./manage-service.sh status`
3. Restart service: `./manage-service.sh restart`
