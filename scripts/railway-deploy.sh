#!/bin/bash

# ADX-Agent Railway Deployment Script
# This script automates the deployment of ADX-Agent to Railway

set -e

echo "🚀 ADX-Agent Railway Deployment Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    else
        print_success "Railway CLI found"
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js first."
        exit 1
    else
        print_success "Node.js $(node --version) found"
    fi
    
    # Check if Python is installed
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 not found. Please install Python3 first."
        exit 1
    else
        print_success "Python3 $(python3 --version) found"
    fi
}

# Check environment variables
check_environment() {
    print_status "Checking environment variables..."
    
    # Required variables
    required_vars=(
        "E2B_API_KEY"
        "GOOGLE_GENERATIVE_AI_API_KEY"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_warning "Missing required environment variables:"
        printf '   - %s\n' "${missing_vars[@]}"
        print_warning "Please set these variables before continuing:"
        echo "export E2B_API_KEY=your_e2b_api_key"
        echo "export GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key"
        
        read -p "Do you want to continue without setting these variables? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    else
        print_success "All required environment variables are set"
    fi
}

# Login to Railway
railway_login() {
    print_status "Logging in to Railway..."
    
    if ! railway whoami &> /dev/null; then
        print_status "Please login to Railway..."
        railway login
    else
        print_success "Already logged in to Railway"
    fi
}

# Initialize Railway project
init_project() {
    print_status "Initializing Railway project..."
    
    if [ ! -f "railway.json" ]; then
        print_status "Creating railway.json..."
        cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
    fi
    
    # Check if project exists
    if ! railway status &> /dev/null; then
        print_status "Creating new Railway project..."
        railway init adx-agent
        print_success "Railway project created"
    else
        print_success "Railway project already exists"
    fi
}

# Set environment variables
set_environment() {
    print_status "Setting environment variables..."
    
    # Basic configuration
    railway variables set NODE_ENV=production
    railway variables set PYTHONPATH=/app
    
    # API configuration
    if [ ! -z "$E2B_API_KEY" ]; then
        railway variables set E2B_API_KEY="$E2B_API_KEY"
        print_success "E2B API key set"
    fi
    
    if [ ! -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
        railway variables set GOOGLE_GENERATIVE_AI_API_KEY="$GOOGLE_GENERATIVE_AI_API_KEY"
        print_success "Google AI API key set"
    fi
    
    # Security configuration
    railway variables set JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-jwt-secret")
    railway variables set ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || echo "change-me-encryption-key")
    
    print_success "Environment variables configured"
}

# Deploy services
deploy_services() {
    print_status "Deploying ADX-Agent services..."
    
    # Deploy frontend
    if [ -d "frontend" ]; then
        print_status "Deploying frontend service..."
        cd frontend
        railway up --service adx-agent-frontend
        cd ..
        print_success "Frontend deployed"
    fi
    
    # Deploy backend
    if [ -d "backend" ]; then
        print_status "Deploying backend service..."
        cd backend
        railway up --service adx-agent-backend
        cd ..
        print_success "Backend deployed"
    fi
    
    # Add database if not exists
    print_status "Setting up database..."
    railway add --service adx-agent-database postgresql
    railway add --service adx-agent-cache redis
    
    print_success "Database services added"
}

# Configure domains
configure_domains() {
    print_status "Configuring custom domains..."
    
    read -p "Enter your domain name (or press Enter to skip): " domain_name
    
    if [ ! -z "$domain_name" ]; then
        print_status "Adding custom domain: $domain_name"
        railway domain add "$domain_name"
        
        # Add API subdomain
        if [[ "$domain_name" == *"."* ]]; then
            api_domain="api.${domain_name#*.}"
        else
            api_domain="api.$domain_name"
        fi
        railway domain add "$api_domain"
        
        print_success "Custom domains configured:"
        echo "   - Frontend: https://$domain_name"
        echo "   - API: https://$api_domain"
    else
        print_warning "Skipping custom domain configuration"
        print_status "You can add custom domains later with:"
        echo "   railway domain add yourdomain.com"
    fi
}

# Health check
health_check() {
    print_status "Running health checks..."
    
    # Wait for deployment to be ready
    sleep 30
    
    # Check frontend
    if railway status --service adx-agent-frontend &> /dev/null; then
        frontend_url=$(railway status --service adx-agent-frontend 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
        if [ ! -z "$frontend_url" ]; then
            if curl -f -s "$frontend_url" > /dev/null; then
                print_success "Frontend health check passed"
            else
                print_warning "Frontend health check failed"
            fi
        fi
    fi
    
    # Check backend
    if railway status --service adx-agent-backend &> /dev/null; then
        backend_url=$(railway status --service adx-agent-backend 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
        if [ ! -z "$backend_url" ]; then
            if curl -f -s "$backend_url/health" > /dev/null; then
                print_success "Backend health check passed"
            else
                print_warning "Backend health check failed"
            fi
        fi
    fi
}

# Display deployment summary
display_summary() {
    echo ""
    print_success "🎉 ADX-Agent deployment completed!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "======================"
    
    # Show service URLs
    echo "🌐 Service URLs:"
    railway status 2>/dev/null | grep -E "(Service|URL)" || echo "   Check Railway dashboard for URLs"
    
    echo ""
    echo "🔧 Useful Commands:"
    echo "==================="
    echo "   railway status                    # Check deployment status"
    echo "   railway logs --follow             # View live logs"
    echo "   railway shell                     # Open shell in deployment"
    echo "   railway metrics                   # View service metrics"
    echo "   railway variables                 # List environment variables"
    
    echo ""
    echo "📚 Documentation:"
    echo "================"
    echo "   - Railway CLI: https://docs.railway.com/guides/cli"
    echo "   - ADX-Agent Docs: ./docs/deployment/RAILWAY-DEPLOYMENT.md"
    
    echo ""
    print_success "🚀 Your ADX-Agent is now live on Railway!"
}

# Main deployment function
main() {
    echo "Starting ADX-Agent Railway deployment..."
    echo "========================================"
    
    # Pre-deployment checks
    check_prerequisites
    check_environment
    railway_login
    
    # Initialize project
    init_project
    
    # Set environment
    set_environment
    
    # Deploy services
    deploy_services
    
    # Configure domains
    configure_domains
    
    # Health check
    health_check
    
    # Display summary
    display_summary
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy"|"")
        main
        ;;
    "status")
        railway status
        ;;
    "logs")
        railway logs --follow
        ;;
    "metrics")
        railway metrics
        ;;
    "shell")
        railway shell
        ;;
    "variables")
        railway variables
        ;;
    "domains")
        railway domain list
        ;;
    "help"|"-h"|"--help")
        echo "ADX-Agent Railway Deployment Script"
        echo "=================================="
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  deploy    Full deployment (default)"
        echo "  status    Check deployment status"
        echo "  logs      View deployment logs"
        echo "  metrics   View service metrics"
        echo "  shell     Open shell in deployment"
        echo "  variables List environment variables"
        echo "  domains   List custom domains"
        echo "  help      Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac