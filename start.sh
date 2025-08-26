#!/bin/bash

# School Management API Startup Script
# This script automates the startup process for development and testing

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 14 ]; then
            print_success "Node.js version $(node --version) is compatible"
            return 0
        else
            print_error "Node.js version $(node --version) is too old. Please install Node.js 14 or higher."
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 14 or higher."
        return 1
    fi
}

# Function to check npm
check_npm() {
    if command_exists npm; then
        print_success "npm is available"
        return 0
    else
        print_error "npm is not installed. Please install npm."
        return 1
    fi
}

# Function to check MongoDB
check_mongodb() {
    if command_exists mongod; then
        print_success "MongoDB is available"
        return 0
    else
        print_warning "MongoDB is not installed locally. Make sure you have a MongoDB instance running."
        return 0
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully"
        return 0
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Function to create environment file
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=24h
RESET_PASSWORD_EXPIRE=10m
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF
        print_success ".env file created. Please update with your actual values."
    else
        print_status ".env file already exists"
    fi
}

# Function to start MongoDB (if available)
start_mongodb() {
    if command_exists mongod; then
        if ! port_in_use 27017; then
            print_status "Starting MongoDB..."
            mongod --dbpath ./data/db > /dev/null 2>&1 &
            MONGODB_PID=$!
            sleep 3
            if kill -0 $MONGODB_PID 2>/dev/null; then
                print_success "MongoDB started successfully (PID: $MONGODB_PID)"
                return 0
            else
                print_error "Failed to start MongoDB"
                return 1
            fi
        else
            print_status "MongoDB is already running on port 27017"
            return 0
        fi
    else
        print_warning "MongoDB not available locally. Make sure you have a MongoDB instance running."
        return 0
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    if npm test; then
        print_success "All tests passed!"
        return 0
    else
        print_error "Some tests failed!"
        return 1
    fi
}

# Function to start the server
start_server() {
    if port_in_use 3000; then
        print_warning "Port 3000 is already in use. Stopping existing process..."
        lsof -ti:3000 | xargs kill -9
        sleep 2
    fi
    
    print_status "Starting the server..."
    if npm start; then
        print_success "Server started successfully on port 3000"
        return 0
    else
        print_error "Failed to start server"
        return 1
    fi
}

# Function to start in development mode
start_dev() {
    if port_in_use 3000; then
        print_warning "Port 3000 is already in use. Stopping existing process..."
        lsof -ti:3000 | xargs kill -9
        sleep 2
    fi
    
    print_status "Starting the server in development mode..."
    if npm run dev; then
        print_success "Server started in development mode on port 3000"
        return 0
    else
        print_error "Failed to start server in development mode"
        return 1
    fi
}

# Function to run API tests
run_api_tests() {
    print_status "Running API tests..."
    if node test-api.js; then
        print_success "API tests completed successfully"
        return 0
    else
        print_error "API tests failed"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "School Management API Startup Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  install     Install dependencies"
    echo "  setup       Setup environment (create .env file)"
    echo "  test        Run test suite"
    echo "  start       Start the server"
    echo "  dev         Start the server in development mode"
    echo "  api-test    Run API tests (requires server to be running)"
    echo "  full        Full setup and start (install, setup, start)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install     # Install dependencies"
    echo "  $0 setup       # Setup environment"
    echo "  $0 test        # Run tests"
    echo "  $0 start       # Start server"
    echo "  $0 dev         # Start in development mode"
    echo "  $0 full        # Complete setup and start"
}

# Function to cleanup
cleanup() {
    if [ ! -z "$MONGODB_PID" ]; then
        print_status "Stopping MongoDB..."
        kill $MONGODB_PID 2>/dev/null
    fi
    
    if port_in_use 3000; then
        print_status "Stopping server..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main function
main() {
    case "${1:-help}" in
        "install")
            check_node_version && check_npm && install_dependencies
            ;;
        "setup")
            create_env_file
            ;;
        "test")
            check_node_version && check_npm && run_tests
            ;;
        "start")
            check_node_version && check_npm && start_mongodb && start_server
            ;;
        "dev")
            check_node_version && check_npm && start_mongodb && start_dev
            ;;
        "api-test")
            check_node_version && check_npm && run_api_tests
            ;;
        "full")
            check_node_version && check_npm && check_mongodb && \
            install_dependencies && create_env_file && start_mongodb && start_server
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 