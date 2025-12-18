# ADX-Agent Interactive Coding Assistant Makefile

.PHONY: help build dev prod clean logs test validate lint format install-deps

# Default target
help:
	@echo "ADX-Agent Interactive Coding Assistant - Build Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  install-deps   Install development dependencies"
	@echo "  build          Build all Docker images"
	@echo "  dev            Start development environment"
	@echo "  prod           Start production environment"
	@echo "  clean          Clean up containers and images"
	@echo "  logs           View logs for all services"
	@echo "  test           Run tests"
	@echo "  validate       Validate API endpoints"
	@echo "  lint           Run linting"
	@echo "  format         Format code"
	@echo "  reset          Reset environment to clean state"
	@echo ""
	@echo "Service-specific targets:"
	@echo "  backend-dev    Start only backend in development"
	@echo "  frontend-dev   Start only frontend in development"
	@echo "  desktop-dev    Start only desktop in development"
	@echo ""
	@echo "Examples:"
	@echo "  make dev                    # Start development environment"
	@echo "  make prod                   # Start production environment"
	@echo "  make validate               # Validate all APIs"

# Install development dependencies
install-deps:
	@echo "Installing development dependencies..."
	@echo "Installing Node.js dependencies..."
	cd frontend && npm install
	@echo "Installing Python dependencies..."
	cd backend && pip install -r app/requirements.txt
	@echo "Installing development tools..."
	pip install flake8 black isort pytest docker-compose

# Build all Docker images
build:
	@echo "Building Docker images..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml build --no-cache
	@echo "✅ All images built successfully"

# Start development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d
	@echo "✅ Development environment started"
	@echo "🌐 Access points:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend: http://localhost:8000"
	@echo "   Desktop: http://localhost:6080"

# Start production environment
prod:
	@echo "Starting production environment..."
	@if [ ! -f .env ]; then \
		echo "❌ .env file not found. Copy .env.example to .env and configure."; \
		exit 1; \
	fi
	docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
	@echo "✅ Production environment started"

# Clean up containers and images
clean:
	@echo "Cleaning up Docker containers and images..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml down -v
	docker-compose -f infrastructure/docker/docker-compose.prod.yml down -v
	docker system prune -f
	@echo "✅ Cleanup completed"

# View logs
logs:
	@echo "Showing logs for all services..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f --tail=50

# Run tests
test:
	@echo "Running tests..."
	@echo "Testing backend..."
	cd backend && python -m pytest app/tests/ -v
	@echo "Testing frontend..."
	cd frontend && npm test
	@echo "✅ Tests completed"

# Validate API endpoints
validate:
	@echo "Validating API endpoints..."
	@if ! docker-compose -f infrastructure/docker/docker-compose.dev.yml ps | grep -q "Up"; then \
		echo "❌ Services not running. Start with 'make dev' first."; \
		exit 1; \
	fi
	./scripts/validate-apis.sh

# Run linting
lint:
	@echo "Running linting..."
	@echo "Linting Python code..."
	cd backend && flake8 app/ --max-line-length=100 --ignore=E203,W503
	@echo "Linting TypeScript code..."
	cd frontend && npx eslint src/ --ext .ts,.tsx
	@echo "✅ Linting completed"

# Format code
format:
	@echo "Formatting code..."
	@echo "Formatting Python code..."
	cd backend && black app/ && isort app/
	@echo "Formatting TypeScript code..."
	cd frontend && npx prettier --write src/
	@echo "✅ Code formatting completed"

# Reset environment to clean state
reset: clean
	@echo "Resetting environment..."
	@if [ -d ".git" ]; then \
		git checkout -- .; \
	fi
	docker system prune -af
	@echo "✅ Environment reset completed"

# Service-specific targets
backend-dev:
	@echo "Starting backend development server..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend-dev:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

desktop-dev:
	@echo "Starting desktop environment..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml up desktop -d

# Database targets
db-migrate:
	@echo "Running database migrations..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml exec backend python -m alembic upgrade head

db-seed:
	@echo "Seeding database..."
	docker-compose -f infrastructure/docker/docker-compose.dev.yml exec backend python -c "from app.database import seed_data; seed_data()"

# Monitoring targets
monitor:
	@echo "Starting monitoring stack..."
	docker-compose -f infrastructure/docker/docker-compose.prod.yml up monitoring -d

# Security targets
security-scan:
	@echo "Running security scan..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy image adx-agent-frontend:latest
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy image adx-agent-backend:latest

# Performance targets
load-test:
	@echo "Running load tests..."
	@if ! command -v k6 &> /dev/null; then \
		echo "Installing k6..."; \
		brew install k6 || apt-get install k6; \
	fi
	k6 run scripts/load-test.js

# Deployment targets
deploy-staging:
	@echo "Deploying to staging environment..."
	@if [ ! -f .env.staging ]; then \
		echo "❌ .env.staging file not found."; \
		exit 1; \
	fi
	env $$(cat .env.staging) docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

deploy-production:
	@echo "Deploying to production environment..."
	@if [ ! -f .env.production ]; then \
		echo "❌ .env.production file not found."; \
		exit 1; \
	fi
	@read -p "Are you sure you want to deploy to production? (y/N) " confirm && \
	if [[ $$confirm == [yY] || $$confirm == [yY][eE][sS] ]]; then \
		env $$(cat .env.production) docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d; \
	else \
		echo "Deployment cancelled."; \
	fi

# Maintenance targets
backup:
	@echo "Creating backup..."
	docker-compose -f infrastructure/docker/docker-compose.prod.yml exec database pg_dump -U agent_user agent_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created"

restore:
	@echo "Restoring from backup..."
	@read -p "Enter backup file name: " backup_file; \
	if [ -f "$$backup_file" ]; then \
		docker-compose -f infrastructure/docker/docker-compose.prod.yml exec -T database psql -U agent_user agent_db < $$backup_file; \
		echo "✅ Backup restored"; \
	else \
		echo "❌ Backup file not found: $$backup_file"; \
	fi

# Health check target
health-check:
	@echo "Running health checks..."
	@echo "Checking frontend..."
	@curl -f http://localhost:3000 >/dev/null 2>&1 && echo "✅ Frontend: Healthy" || echo "❌ Frontend: Unhealthy"
	@echo "Checking backend..."
	@curl -f http://localhost:8000/health >/dev/null 2>&1 && echo "✅ Backend: Healthy" || echo "❌ Backend: Unhealthy"
	@echo "Checking desktop..."
	@curl -f http://localhost:6080 >/dev/null 2>&1 && echo "✅ Desktop: Healthy" || echo "❌ Desktop: Unhealthy"
	@echo "Checking database..."
	@docker-compose -f infrastructure/docker/docker-compose.dev.yml exec -T database pg_isready -U agent_user >/dev/null 2>&1 && echo "✅ Database: Healthy" || echo "❌ Database: Unhealthy"
	@echo "Checking Redis..."
	@docker-compose -f infrastructure/docker/docker-compose.dev.yml exec -T redis redis-cli ping | grep -q PONG && echo "✅ Redis: Healthy" || echo "❌ Redis: Unhealthy"

# Show status
status:
	@echo "Service Status:"
	docker-compose -f infrastructure/docker/docker-compose.dev.yml ps
	@echo ""
	@echo "Resource Usage:"
	docker stats --no-stream

# Update dependencies
update-deps:
	@echo "Updating dependencies..."
	@echo "Updating Node.js dependencies..."
	cd frontend && npm update
	@echo "Updating Python dependencies..."
	cd backend && pip install --upgrade -r app/requirements.txt
	@echo "✅ Dependencies updated"