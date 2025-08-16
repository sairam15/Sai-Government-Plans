#!/bin/bash

# Medicare & Medicaid Plans App Deployment Script
# This script helps deploy the app to various platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# App configuration
APP_NAME="Medicare & Medicaid Plans Comparison App"
REPO_NAME="medicare-medicaid-plans"
FILES=("index.html" "script.js" "styles.css" "README.md")

echo -e "${BLUE}🚀 $APP_NAME Deployment Script${NC}"
echo "=================================="

# Function to check if files exist
check_files() {
    echo -e "${YELLOW}📁 Checking required files...${NC}"
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✅ $file found${NC}"
        else
            echo -e "${RED}❌ $file not found${NC}"
            exit 1
        fi
    done
    echo ""
}

# Function to create deployment package
create_package() {
    echo -e "${YELLOW}📦 Creating deployment package...${NC}"
    
    # Create deployment directory
    DEPLOY_DIR="deployment-package"
    mkdir -p "$DEPLOY_DIR"
    
    # Copy files
    for file in "${FILES[@]}"; do
        cp "$file" "$DEPLOY_DIR/"
    done
    
    # Copy deployment guides
    cp deploy-*.md "$DEPLOY_DIR/" 2>/dev/null || true
    cp deployment-config.json "$DEPLOY_DIR/" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Deployment package created in $DEPLOY_DIR/${NC}"
    echo ""
}

# Function to show deployment options
show_options() {
    echo -e "${BLUE}🌐 Choose your deployment option:${NC}"
    echo ""
    echo "1. GitHub Pages (Free, 5 minutes)"
    echo "2. Netlify (Free, 10 minutes)"
    echo "3. Vercel (Free, 10 minutes)"
    echo "4. Internal Server (Self-hosted)"
    echo "5. AWS S3 + CloudFront (Paid)"
    echo "6. Show all deployment guides"
    echo "7. Exit"
    echo ""
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    echo -e "${YELLOW}📋 GitHub Pages Deployment Instructions:${NC}"
    echo ""
    echo "1. Go to your GitHub repository:"
    echo "   https://github.com/your-username/$REPO_NAME"
    echo ""
    echo "2. Click 'Settings' tab"
    echo ""
    echo "3. Scroll down to 'Pages' section"
    echo ""
    echo "4. Under 'Source', select 'Deploy from a branch'"
    echo ""
    echo "5. Choose 'main' branch"
    echo ""
    echo "6. Click 'Save'"
    echo ""
    echo "7. Wait 2-3 minutes for deployment"
    echo ""
    echo "Your app will be available at:"
    echo "https://your-username.github.io/$REPO_NAME"
    echo ""
}

# Function to deploy to Netlify
deploy_netlify() {
    echo -e "${YELLOW}📋 Netlify Deployment Instructions:${NC}"
    echo ""
    echo "1. Go to https://netlify.com"
    echo ""
    echo "2. Sign up/Login with your GitHub account"
    echo ""
    echo "3. Click 'New site from Git'"
    echo ""
    echo "4. Choose GitHub as your Git provider"
    echo ""
    echo "5. Select your $REPO_NAME repository"
    echo ""
    echo "6. Configure build settings:"
    echo "   - Build command: (leave empty)"
    echo "   - Publish directory: ."
    echo ""
    echo "7. Click 'Deploy site'"
    echo ""
    echo "Your app will be available at:"
    echo "https://your-medicare-app.netlify.app"
    echo ""
}

# Function to deploy to internal server
deploy_internal() {
    echo -e "${YELLOW}📋 Internal Server Deployment Instructions:${NC}"
    echo ""
    echo "1. Copy files to your web server:"
    echo "   sudo mkdir -p /var/www/medicare-app"
    echo "   sudo cp *.html *.js *.css /var/www/medicare-app/"
    echo ""
    echo "2. Configure web server (Apache example):"
    echo "   sudo nano /etc/apache2/sites-available/medicare-app.conf"
    echo ""
    echo "3. Enable the site:"
    echo "   sudo a2ensite medicare-app"
    echo "   sudo systemctl restart apache2"
    echo ""
    echo "4. Your app will be available at:"
    echo "   http://your-server-ip/medicare-app/"
    echo ""
}

# Function to show all guides
show_all_guides() {
    echo -e "${BLUE}📚 All Deployment Guides:${NC}"
    echo ""
    echo "📖 GitHub Pages: deploy-github-pages.md"
    echo "📖 Netlify: deploy-netlify.md"
    echo "📖 Internal Server: deploy-internal.md"
    echo "📖 AWS S3: deploy-aws.md"
    echo "📖 Vercel: deploy-vercel.md"
    echo ""
    echo "📋 Configuration: deployment-config.json"
    echo ""
}

# Main script
main() {
    check_files
    create_package
    
    while true; do
        show_options
        read -p "Enter your choice (1-7): " choice
        
        case $choice in
            1)
                deploy_github_pages
                ;;
            2)
                deploy_netlify
                ;;
            3)
                echo -e "${YELLOW}📋 Vercel Deployment:${NC}"
                echo "See deploy-vercel.md for detailed instructions"
                echo ""
                ;;
            4)
                deploy_internal
                ;;
            5)
                echo -e "${YELLOW}📋 AWS S3 Deployment:${NC}"
                echo "See deploy-aws.md for detailed instructions"
                echo ""
                ;;
            6)
                show_all_guides
                ;;
            7)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice. Please enter 1-7.${NC}"
                ;;
        esac
        
        read -p "Press Enter to continue..."
        clear
    done
}

# Run main function
main
