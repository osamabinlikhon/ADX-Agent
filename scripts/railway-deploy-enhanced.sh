#!/bin/bash

# ADX-Agent Enhanced Railway Deployment Script
# This script automates the deployment of ADX-Agent to Railway with advanced features

set -e

echo "🚀 ADX-Agent Enhanced Railway Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
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
    
    # Check for Railway CLI version
    railway_version=$(railway --version 2>/dev/null | head -n1 || echo "unknown")
    print_success "Railway CLI: $railway_version"
}

# Detect and validate Config-as-Code files
validate_config_as_code() {
    print_step "Validating Config-as-Code configuration..."
    
    config_files=()
    
    # Check for railway.toml files
    for service in "frontend" "backend" "desktop" "."; do
        if [ -f "$service/railway.toml" ] || [ -f "$service/railway.json" ]; then
            config_files+=("$service")
            print_success "Found config file in $service"
        fi
    done
    
    if [ ${#config_files[@]} -eq 0 ]; then
        print_warning "No config-as-code files found. Creating default configurations..."
        create_default_configs
    else
        print_success "Found ${#config_files[@]} service(s) with config-as-code files"
    fi
}

# Create default Railway configuration files
create_default_configs() {
    print_status "Creating default Railway configurations..."
    
    # Root configuration
    if [ ! -f "railway.toml" ]; then
        cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"

[deploy]
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckTimeout = 60
EOF
        print_success "Created root railway.toml"
    fi
    
    # Frontend configuration
    if [ -d "frontend" ] && [ ! -f "frontend/railway.toml" ]; then
        cat > frontend/railway.toml << 'EOF'
[build]
builder = "nixpacks"
buildCommand = "npm ci && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
EOF
        print_success "Created frontend railway.toml"
    fi
    
    # Backend configuration
    if [ -d "backend" ] && [ ! -f "backend/railway.toml" ]; then
        cat > backend/railway.toml << 'EOF'
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
preDeployCommand = ["python -m alembic upgrade head"]
EOF
        print_success "Created backend railway.toml"
    fi
}

# Enhanced environment variable validation
check_environment() {
    print_step "Checking environment variables..."
    
    # Required variables
    required_vars=(
        "E2B_API_KEY"
        "GOOGLE_GENERATIVE_AI_API_KEY"
    )
    
    # Optional but recommended
    recommended_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "ENCRYPTION_KEY"
    )
    
    missing_required=()
    missing_recommended=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_required+=("$var")
        fi
    done
    
    for var in "${recommended_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_recommended+=("$var")
        fi
    done
    
    if [ ${#missing_required[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        printf '   - %s\n' "${missing_required[@]}"
        print_error "Please set these variables before continuing"
        exit 1
    else
        print_success "All required environment variables are set"
    fi
    
    if [ ${#missing_recommended[@]} -ne 0 ]; then
        print_warning "Missing recommended environment variables:"
        printf '   - %s\n' "${missing_recommended[@]}"
        print_warning "These will be auto-generated if not set"
    else
        print_success "All recommended environment variables are set"
    fi
}

# Enhanced Railway project initialization
init_project_enhanced() {
    print_step "Initializing Railway project with advanced features..."
    
    # Check if project exists
    if ! railway status &> /dev/null; then
        print_status "Creating new Railway project..."
        railway init adx-agent --template="Empty"
        print_success "Railway project created"
    else
        print_success "Railway project already exists"
    fi
    
    # Link to existing project if not already linked
    if ! railway link &> /dev/null; then
        print_status "Linking to existing project..."
        railway link
    fi
    
    # Configure project settings
    print_status "Configuring project settings..."
    railway variables set RAILWAY_ENVIRONMENT=production
    railway variables set RAILWAY_DEPLOYMENT_ID=$(date +%s)
    
    print_success "Project configuration complete"
}

# Enhanced environment setup with auto-generation
set_environment_enhanced() {
    print_step "Setting up environment variables with auto-generation..."
    
    # Basic configuration
    railway variables set NODE_ENV=production
    railway variables set PYTHONPATH=/app
    
    # Auto-generate secrets if not provided
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "auto-generated-jwt-$(date +%s)")
        railway variables set JWT_SECRET="$JWT_SECRET"
        print_success "Auto-generated JWT_SECRET"
    else
        railway variables set JWT_SECRET="$JWT_SECRET"
        print_success "JWT_SECRET set from environment"
    fi
    
    if [ -z "$ENCRYPTION_KEY" ]; then
        ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || echo "auto-generated-key-$(date +%s)")
        railway variables set ENCRYPTION_KEY="$ENCRYPTION_KEY"
        print_success "Auto-generated ENCRYPTION_KEY"
    else
        railway variables set ENCRYPTION_KEY="$ENCRYPTION_KEY"
        print_success "ENCRYPTION_KEY set from environment"
    fi
    
    # API configuration
    if [ ! -z "$E2B_API_KEY" ]; then
        railway variables set E2B_API_KEY="$E2B_API_KEY"
        print_success "E2B API key set"
    fi
    
    if [ ! -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
        railway variables set GOOGLE_GENERATIVE_AI_API_KEY="$GOOGLE_GENERATIVE_AI_API_KEY"
        print_success "Google AI API key set"
    fi
    
    # Auto-add database if not exists
    print_status "Setting up database services..."
    
    # PostgreSQL
    if ! railway status --service adx-agent-database &> /dev/null; then
        print_status "Adding PostgreSQL database..."
        railway add --service adx-agent-database postgresql
        print_success "PostgreSQL database added"
    else
        print_success "PostgreSQL database already exists"
    fi
    
    # Redis
    if ! railway status --service adx-agent-cache &> /dev/null; then
        print_status "Adding Redis cache..."
        railway add --service adx-agent-cache redis
        print_success "Redis cache added"
    else
        print_success "Redis cache already exists"
    fi
    
    # Wait for database services to be ready
    print_status "Waiting for database services to initialize..."
    sleep 30
}

# Enhanced service deployment with config-as-code
deploy_services_enhanced() {
    print_step "Deploying services with Config-as-Code support..."
    
    services=()
    
    # Detect services with configurations
    for service_dir in frontend backend desktop; do
        if [ -d "$service_dir" ]; then
            if [ -f "$service_dir/railway.toml" ] || [ -f "$service_dir/railway.json" ]; then
                services+=("$service_dir")
                print_status "Found configured service: $service_dir"
            fi
        fi
    done
    
    # Deploy each service
    for service in "${services[@]}"; do
        print_status "Deploying $service service..."
        cd "$service"
        
        # Deploy with config-as-code
        if railway up --service "adx-agent-$service"; then
            print_success "$service deployed successfully"
        else
            print_error "Failed to deploy $service"
            cd ..
            continue
        fi
        
        cd ..
        
        # Wait for deployment to stabilize
        print_status "Waiting for $service deployment to stabilize..."
        sleep 15
        
        # Check deployment status
        if railway status --service "adx-agent-$service" &> /dev/null; then
            service_url=$(railway status --service "adx-agent-$service" 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
            if [ ! -z "$service_url" ]; then
                print_success "$service is available at: $service_url"
            fi
        fi
    done
    
    # Deploy root project if it has a railway.toml
    if [ -f "railway.toml" ] && [ ! -f "frontend/railway.toml" ] && [ ! -f "backend/railway.toml" ]; then
        print_status "Deploying main project service..."
        if railway up --service adx-agent-main; then
            print_success "Main project deployed successfully"
        else
            print_error "Failed to deploy main project"
        fi
    fi
}

# Enhanced health checks with comprehensive validation
health_check_enhanced() {
    print_step "Running comprehensive health checks..."
    
    # Wait for all deployments to be ready
    print_status "Waiting for deployments to be ready..."
    sleep 60
    
    services=()
    for service_name in "adx-agent-frontend" "adx-agent-backend" "adx-agent-desktop" "adx-agent-main"; do
        if railway status --service "$service_name" &> /dev/null; then
            services+=("$service_name")
        fi
    done
    
    if [ ${#services[@]} -eq 0 ]; then
        print_warning "No services found for health checking"
        return 1
    fi
    
    healthy_services=0
    failed_services=()
    
    for service in "${services[@]}"; do
        print_status "Checking health of $service..."
        
        # Get service URL
        service_url=$(railway status --service "$service" 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
        
        if [ -z "$service_url" ]; then
            print_warning "No URL found for $service"
            failed_services+=("$service")
            continue
        fi
        
        # Perform health checks based on service type
        if [[ "$service" == *"backend"* ]]; then
            health_endpoint="$service_url/health"
        else
            health_endpoint="$service_url"
        fi
        
        # Health check with timeout
        if curl -f -s --max-time 30 "$health_endpoint" > /dev/null 2>&1; then
            print_success "$service health check passed"
            ((healthy_services++))
        else
            print_warning "$service health check failed"
            failed_services+=("$service")
        fi
    done
    
    # Summary
    echo ""
    print_status "Health Check Summary:"
    echo "====================="
    print_success "Healthy services: $healthy_services/${#services[@]}"
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        print_warning "Failed services:"
        printf '   - %s\n' "${failed_services[@]}"
        print_warning "Some services may need manual intervention"
    else
        print_success "All services are healthy!"
    fi
}

# Enhanced domain configuration
configure_domains_enhanced() {
    print_step "Configuring custom domains and networking..."
    
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
        
        # Add monitoring subdomain
        if [[ "$domain_name" == *"."* ]]; then
            monitoring_domain="monitoring.${domain_name#*.}"
        else
            monitoring_domain="monitoring.$domain_name"
        fi
        railway domain add "$monitoring_domain"
        
        print_success "Custom domains configured:"
        echo "   - Frontend: https://$domain_name"
        echo "   - API: https://$api_domain"
        echo "   - Monitoring: https://$monitoring_domain"
        
        # Update environment variables with custom domains
        railway variables set FRONTEND_URL="https://$domain_name"
        railway variables set API_URL="https://$api_domain"
        railway variables set MONITORING_URL="https://$monitoring_domain"
        
    else
        print_warning "Skipping custom domain configuration"
        print_status "Using Railway-provided domains for now"
        print_status "You can add custom domains later with:"
        echo "   railway domain add yourdomain.com"
    fi
}

# Enhanced deployment summary with detailed information
display_summary_enhanced() {
    echo ""
    print_success "🎉 ADX-Agent enhanced deployment completed!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "======================"
    
    # Show service URLs and status
    echo "🌐 Service URLs and Status:"
    services=()
    for service_name in "adx-agent-frontend" "adx-agent-backend" "adx-agent-desktop" "adx-agent-main"; do
        if railway status --service "$service_name" &> /dev/null; then
            services+=("$service_name")
        fi
    done
    
    for service in "${services[@]}"; do
        service_url=$(railway status --service "$service" 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
        service_status=$(railway status --service "$service" 2>/dev/null | grep -E "(Running|Deploying|Failed)" | head -1 || echo "Status unknown")
        
        if [ ! -z "$service_url" ]; then
            echo "   $service: $service_url ($service_status)"
        else
            echo "   $service: $service_status"
        fi
    done
    
    # Show configuration files used
    echo ""
    echo "⚙️ Config-as-Code Files:"
    config_count=0
    for service_dir in frontend backend desktop "."; do
        if [ -f "$service_dir/railway.toml" ] || [ -f "$service_dir/railway.json" ]; then
            ((config_count++))
            echo "   ✓ $service_dir has Railway configuration"
        fi
    done
    echo "   Total: $config_count configuration file(s) used"
    
    echo ""
    echo "🔧 Enhanced Features Enabled:"
    echo "   ✓ Config-as-Code deployment"
    echo "   ✓ Auto-generated secrets"
    echo "   ✓ Database service integration"
    echo "   ✓ Comprehensive health checks"
    echo "   ✓ Custom domain support"
    echo "   ✓ Environment variable validation"
    
    echo ""
    echo "🔧 Useful Commands:"
    echo "==================="
    echo "   railway status                    # Check deployment status"
    echo "   railway logs --follow             # View live logs"
    echo "   railway shell                     # Open shell in deployment"
    echo "   railway metrics                   # View service metrics"
    echo "   railway variables                 # List environment variables"
    echo "   railway domain list               # List custom domains"
    echo "   railway deploy --service SERVICE  # Deploy specific service"
    
    echo ""
    echo "📚 Documentation:"
    echo "================"
    echo "   - Railway CLI: https://docs.railway.com/guides/cli"
    echo "   - ADX-Agent Docs: ./docs/deployment/RAILWAY-DEPLOYMENT.md"
    echo "   - Config-as-Code: https://docs.railway.com/guides/config-as-code"
    
    echo ""
    print_success "🚀 Your ADX-Agent is now live on Railway with enhanced features!"
}

# Main enhanced deployment function
main_enhanced() {
    echo "Starting ADX-Agent enhanced Railway deployment..."
    echo "=================================================="
    
    # Pre-deployment checks
    check_prerequisites
    check_environment
    
    # Configuration validation
    validate_config_as_code
    
    # Initialize project with enhanced features
    init_project_enhanced
    
    # Set up environment with auto-generation
    set_environment_enhanced
    
    # Deploy services with config-as-code
    deploy_services_enhanced
    
    # Configure domains
    configure_domains_enhanced
    
    # Health check with comprehensive validation
    health_check_enhanced
    
    # Display enhanced summary
    display_summary_enhanced
}

# Handle script arguments with enhanced commands
case "${1:-deploy}" in
    "deploy"|"")
        main_enhanced
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
    "validate")
        validate_config_as_code
        ;;
    "health")
        health_check_enhanced
        ;;
    "help"|"-h"|"--help")
        echo "ADX-Agent Enhanced Railway Deployment Script"
        echo "============================================="
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  deploy    Full enhanced deployment (default)"
        echo "  status    Check deployment status"
        echo "  logs      View deployment logs"
        echo "  metrics   View service metrics"
        echo "  shell     Open shell in deployment"
        echo "  variables List environment variables"
        echo "  domains   List custom domains"
        echo "  validate  Validate config-as-code files"
        echo "  health    Run health checks"
        echo "  help      Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac