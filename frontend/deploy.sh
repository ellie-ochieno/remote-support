#!/bin/bash

echo "🚀 RemotCyberHelp Deployment Script"
echo "==================================="

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

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI found!"

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    print_warning "Project not linked to Supabase. Please run:"
    echo "supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

print_success "Project is linked to Supabase!"

# Deploy Edge Functions
print_status "Deploying Edge Functions..."

# Deploy the make-server function
supabase functions deploy make-server --no-verify-jwt

if [ $? -eq 0 ]; then
    print_success "Edge Functions deployed successfully!"
else
    print_error "Edge Functions deployment failed!"
    print_warning "Common solutions for 403 errors:"
    echo "1. Check if you're logged in: supabase login"
    echo "2. Verify project access: supabase projects list"
    echo "3. Re-link project: supabase link --project-ref YOUR_PROJECT_REF"
    echo "4. Check organization permissions in Supabase dashboard"
    exit 1
fi

# Apply database migrations
print_status "Applying database migrations..."

# Check if database is accessible
supabase db ping

if [ $? -eq 0 ]; then
    print_success "Database connection successful!"
    
    # Push database schema
    supabase db push
    
    if [ $? -eq 0 ]; then
        print_success "Database schema applied successfully!"
    else
        print_warning "Database schema application failed. You may need to apply it manually."
    fi
else
    print_error "Cannot connect to database. Please check your configuration."
fi

# Display function URLs
print_status "Getting function URLs..."
FUNCTION_URL=$(supabase functions list | grep "make-server" | awk '{print $2}')

if [ ! -z "$FUNCTION_URL" ]; then
    print_success "Deployment completed!"
    echo ""
    echo "📍 Function URL: $FUNCTION_URL"
    echo "🔍 Health Check: $FUNCTION_URL/health"
    echo ""
    echo "Next steps:"
    echo "1. Update your frontend API configuration to use this URL"
    echo "2. Test the health check endpoint"
    echo "3. Verify database schema in Supabase Dashboard"
else
    print_warning "Could not retrieve function URL. Check Supabase dashboard manually."
fi

echo ""
print_success "Deployment script completed!"