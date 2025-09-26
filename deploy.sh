#!/bin/bash

# Thesauros Monitoring Service Deployment Script
# Usage: ./deploy.sh [start|stop|restart|update|status]

set -e

SERVICE_NAME="thesauros-monitoring"
SERVICE_FILE="server.js"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed. Installing..."
        npm install -g pm2
        log_success "PM2 installed successfully"
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        log_warning ".env file not found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            log_warning "Please edit .env file with your configuration before starting the service"
            log_warning "Required: CHAINLINK_API_KEY, ARBITRUM_ONE_RPC_URL"
            exit 1
        else
            log_error "env.example file not found. Cannot create .env file"
            exit 1
        fi
    fi
}

# Check if required environment variables are set
check_env_vars() {
    source .env
    if [ -z "$CHAINLINK_API_KEY" ] || [ "$CHAINLINK_API_KEY" = "your_chainlink_api_key_here" ]; then
        log_error "CHAINLINK_API_KEY is not set in .env file"
        exit 1
    fi
    
    if [ -z "$ARBITRUM_ONE_RPC_URL" ]; then
        log_error "ARBITRUM_ONE_RPC_URL is not set in .env file"
        exit 1
    fi
    
    log_success "Environment variables are properly configured"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    npm install
    log_success "Dependencies installed"
}

# Start service
start_service() {
    log_info "Starting $SERVICE_NAME service..."
    
    check_pm2
    check_env
    check_env_vars
    
    # Check if service is already running
    if pm2 list | grep -q "$SERVICE_NAME"; then
        log_warning "Service is already running. Use 'restart' to restart it."
        return 1
    fi
    
    pm2 start $SERVICE_FILE --name $SERVICE_NAME
    pm2 save
    log_success "Service started successfully"
    log_info "Service is running on port ${PORT:-3001}"
    log_info "Dashboard: http://localhost:${PORT:-3001}"
}

# Stop service
stop_service() {
    log_info "Stopping $SERVICE_NAME service..."
    
    if pm2 list | grep -q "$SERVICE_NAME"; then
        pm2 stop $SERVICE_NAME
        pm2 delete $SERVICE_NAME
        log_success "Service stopped successfully"
    else
        log_warning "Service is not running"
    fi
}

# Restart service
restart_service() {
    log_info "Restarting $SERVICE_NAME service..."
    
    check_pm2
    check_env
    check_env_vars
    
    if pm2 list | grep -q "$SERVICE_NAME"; then
        pm2 restart $SERVICE_NAME
    else
        pm2 start $SERVICE_FILE --name $SERVICE_NAME
        pm2 save
    fi
    
    log_success "Service restarted successfully"
}

# Update service
update_service() {
    log_info "Updating $SERVICE_NAME service..."
    
    # Stop service
    if pm2 list | grep -q "$SERVICE_NAME"; then
        pm2 stop $SERVICE_NAME
    fi
    
    # Install dependencies
    install_deps
    
    # Start service
    pm2 start $SERVICE_FILE --name $SERVICE_NAME
    pm2 save
    
    log_success "Service updated successfully"
}

# Show service status
show_status() {
    log_info "Service status:"
    
    if pm2 list | grep -q "$SERVICE_NAME"; then
        pm2 show $SERVICE_NAME
        log_info "Logs: pm2 logs $SERVICE_NAME"
        log_info "Monitor: pm2 monit"
    else
        log_warning "Service is not running"
    fi
}

# Show logs
show_logs() {
    log_info "Showing logs for $SERVICE_NAME:"
    pm2 logs $SERVICE_NAME --lines 50
}

# Main script logic
case "${1:-start}" in
    "start")
        start_service
        ;;
    "stop")
        stop_service
        ;;
    "restart")
        restart_service
        ;;
    "update")
        update_service
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start     Start the monitoring service"
        echo "  stop      Stop the monitoring service"
        echo "  restart   Restart the monitoring service"
        echo "  update    Update and restart the service"
        echo "  status    Show service status"
        echo "  logs      Show service logs"
        echo "  help      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 restart"
        echo "  $0 logs"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac