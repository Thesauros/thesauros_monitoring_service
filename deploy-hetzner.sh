#!/bin/bash

# Thesauros Monitoring Service - Hetzner Deployment Script
# Execute from the cloned repository directory on server 46.62.166.163 as root

set -e

echo "🚀 Starting deployment of Thesauros Monitoring Service on Hetzner..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check root privileges
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root"
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    error "This script must be run from a git repository directory"
fi

# Get current directory
CURRENT_DIR=$(pwd)
log "Working directory: $CURRENT_DIR"

# Check if required files exist
if [ ! -f "server.js" ] || [ ! -f "package.json" ]; then
    error "Required files (server.js, package.json) not found. Make sure you're in the correct repository directory"
fi

# Update system
log "Updating system..."
apt update && apt upgrade -y

# Install required packages
log "Installing required packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x
log "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Check versions
log "Checking versions..."
node --version
npm --version

# Install PM2 globally
log "Installing PM2..."
npm install -g pm2

# Install Nginx
log "Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
log "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create application user
log "Creating thesauros user..."
useradd -m -s /bin/bash thesauros || true
usermod -aG sudo thesauros

# Create application directory and copy files
log "Setting up application directory..."
mkdir -p /opt/thesauros
cp -r . /opt/thesauros/
chown -R thesauros:thesauros /opt/thesauros

# Create .env file
log "Creating .env file..."
cat > /opt/thesauros/.env << 'EOF'
# Thesauros Monitoring UI - Environment Variables
NODE_ENV=production
PORT=3001
ARBITRUM_ONE_RPC_URL=https://arb1.arbitrum.io/rpc
LOG_LEVEL=info
EOF

chown thesauros:thesauros /opt/thesauros/.env

# Configure PM2
log "Configuring PM2..."
su - thesauros << 'EOF'
cd /opt/thesauros
npm install
pm2 start server.js --name "thesauros-monitoring" --env production
pm2 save
pm2 startup
EOF

# Configure PM2 autostart
pm2 startup systemd -u thesauros --hp /home/thesauros
systemctl enable pm2-thesauros

# Configure Nginx
log "Configuring Nginx..."
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

# Check Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Configure firewall
log "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Get SSL certificate
log "Getting SSL certificate..."
certbot --nginx -d monitoring.thesauros.tech --non-interactive --agree-tos --email admin@thesauros.tech

# Configure automatic SSL renewal
log "Configuring automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Final check
log "Checking service status..."
systemctl status nginx --no-pager
pm2 status

log "🎉 Deployment completed!"
log "🌐 Service available at: https://monitoring.thesauros.tech"
log "📊 PM2 status: pm2 status"
log "📝 PM2 logs: pm2 logs thesauros-monitoring"
log "🔧 Restart: pm2 restart thesauros-monitoring"
log "📋 Nginx status: systemctl status nginx"
log "📁 Application copied to: /opt/thesauros"
