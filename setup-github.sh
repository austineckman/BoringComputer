#!/bin/bash

# GitHub Setup Script for CraftingTable OS
# This script helps you quickly set up your project on GitHub

echo "🚀 CraftingTable OS - GitHub Setup Script"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    echo "✅ Git repository initialized"
fi

# Get GitHub username
echo "📝 Please enter your GitHub username:"
read -r GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

# Repository name
REPO_NAME="BoringComputer"
REPO_URL="https://github.com/austineckman/$REPO_NAME.git"

echo ""
echo "🔗 Repository URL: $REPO_URL"
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists. Removing..."
    git remote remove origin
fi

# Add new remote
echo "🔗 Adding GitHub remote..."
git remote add origin "$REPO_URL"

# Stage all files
echo "📦 Staging files..."
git add .

# Show status
echo "📋 Current git status:"
git status --short

echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit: CraftingTable OS with Gizbo's Scraplight Cartel

Features:
- Retro desktop environment with Windows 95 aesthetics
- Discord OAuth integration with role-based access
- Gizbo's Scraplight Cartel treasure auction system
- Interactive circuit builder with AVR8js simulation
- Quest system with XP and inventory management
- Modern UI redesign with authentic character lore"

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Your repository is now available at:"
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "📚 Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Add a description and topics"
    echo "3. Set up environment variables for deployment"
    echo "4. Consider setting up branch protection rules"
    echo ""
    echo "📖 For detailed setup instructions, see GITHUB_SETUP.md"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "🔧 This might be because:"
    echo "   - Repository doesn't exist on GitHub yet"
    echo "   - Authentication issues"
    echo "   - Network connectivity problems"
    echo ""
    echo "📋 Manual steps:"
    echo "1. Create repository at: https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Don't initialize with README, .gitignore, or license"
    echo "4. Run: git push -u origin main"
fi