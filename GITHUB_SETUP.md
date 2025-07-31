# GitHub Setup Guide for CraftingTable OS

This guide will help you set up your CraftingTable OS project on GitHub.

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Fill in the repository details:
   - **Repository name**: `craftingtable-os`
   - **Description**: `Educational electronics platform with gamified learning, circuit simulation, and Discord integration`
   - **Visibility**: Choose Public or Private based on your preference
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your Replit terminal:

```bash
# Add the GitHub remote to existing repository
git remote add origin https://github.com/austineckman/BoringComputer.git

# Stage all your files
git add .

# Commit your current changes
git commit -m "Initial commit: CraftingTable OS with Gizbo's Scraplight Cartel"

# Push to GitHub
git push -u origin main
```

## Step 3: Set Up Environment Variables for Production

### Option A: GitHub Secrets (for GitHub Actions)
If you plan to use GitHub Actions for deployment:

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Go to "Secrets and variables" → "Actions"
4. Add these secrets:
   - `DATABASE_URL`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_GUILD_ID`
   - `SESSION_SECRET`

### Option B: Deployment Platform Secrets
For platforms like Vercel, Railway, or Heroku, you'll add these environment variables in their respective dashboards.

## Step 4: Update Repository Settings

1. **Set Default Branch**: Ensure "main" is set as the default branch
2. **Branch Protection**: Consider protecting the main branch:
   - Go to Settings → Branches
   - Add rule for "main"
   - Enable "Require pull request reviews before merging"
3. **Topics**: Add relevant topics to help others discover your project:
   - `electronics`
   - `education`
   - `gamification`
   - `arduino`
   - `circuit-simulation`
   - `discord-bot`
   - `react`
   - `typescript`

## Step 5: Create Additional GitHub Files (Optional)

### Issue Templates
Create `.github/ISSUE_TEMPLATE/` folder with:
- `bug_report.md`
- `feature_request.md`

### Pull Request Template
Create `.github/pull_request_template.md`

### GitHub Actions Workflow
Create `.github/workflows/ci.yml` for automated testing

## Step 6: Update README Links

After pushing to GitHub, update any links in your README that reference:
- Clone URLs
- Deployment links
- Contribution guidelines

## Step 7: Consider Adding

1. **License File**: Add a `LICENSE` file (MIT, GPL, etc.)
2. **Contributing Guidelines**: Create `CONTRIBUTING.md`
3. **Code of Conduct**: Add `CODE_OF_CONDUCT.md`
4. **Changelog**: Create `CHANGELOG.md` for version tracking

## Commands Summary

Here are the exact commands to run in your Replit terminal:

```bash
# Check current status
git status

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: CraftingTable OS with Gizbo's Scraplight Cartel and Discord integration"

# Add GitHub remote (REPLACE YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/craftingtable-os.git

# Push to GitHub
git push -u origin main
```

## Troubleshooting

### Authentication Issues
If you get authentication errors:
1. Use GitHub CLI: `gh auth login`
2. Or use a Personal Access Token instead of password
3. Or use SSH keys for authentication

### Remote Already Exists
If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/craftingtable-os.git
```

### Permission Denied
Make sure your GitHub repository allows pushes and you have the correct permissions.

## Next Steps After GitHub Setup

1. **Set up continuous deployment** with your preferred platform
2. **Create project documentation** in the wiki
3. **Set up issue tracking** for bug reports and feature requests
4. **Consider creating releases** for stable versions
5. **Add collaborators** if this is a team project

## Important Notes

- Keep your Discord bot tokens and API keys secure
- Never commit `.env` files to the repository
- Consider using GitHub Dependabot for security updates
- Set up branch protection rules for collaborative development