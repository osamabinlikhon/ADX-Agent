# GitHub Actions & Railway Integration Setup Guide

## 🔐 Step-by-Step Setup Guide

This guide will walk you through setting up GitHub Actions integration with Railway for the ADX-Agent project.

## 📋 Prerequisites

- [ ] Railway account with project created
- [ ] GitHub repository with ADX-Agent code
- [ ] Access to GitHub repository settings
- [ ] Railway CLI installed (optional, for local testing)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Railway Project Token

1. **Open Railway Dashboard**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Select your ADX-Agent project

2. **Generate Project Token**
   - Navigate to **Settings** → **Tokens**
   - Click **"Create Token"**
   - Give it a name like "GitHub Actions"
   - Copy the token immediately (you won't see it again)

### Step 2: Create Railway Account Token (for PR Environments)

1. **Go to Account Settings**
   - Click your avatar in Railway dashboard
   - Go to **Account Settings**

2. **Generate Account Token**
   - Navigate to **Tokens** section
   - Click **"Create Token"**
   - Select **"Account Token"** (not project token)
   - Name it "GitHub PR Environments"
   - Copy the token

### Step 3: Get Railway Project ID

1. **Find Project ID**
   - In your project dashboard, look at the URL
   - Format: `https://railway.app/project/{PROJECT_ID}`
   - Copy the PROJECT_ID

### Step 4: Configure GitHub Repository Secrets

1. **Open GitHub Repository**
   - Go to your ADX-Agent repository on GitHub

2. **Navigate to Secrets**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**

3. **Add Required Secrets**

Add these secrets one by one:

```bash
# Core Railway Integration
RAILWAY_TOKEN
# Value: [Your project token from Step 1]

RAILWAY_API_TOKEN
# Value: [Your account token from Step 2]

RAILWAY_PROJECT_ID
# Value: [Your project ID from Step 3]

# Environment Configuration
RAILWAY_BASE_ENVIRONMENT
# Value: production

RAILWAY_DATABASE_SERVICE_ID
# Value: [Get this from your Railway project - see instructions below]

# Optional but Recommended
DISCORD_WEBHOOK
# Value: [Your Discord webhook URL - optional]

SLACK_WEBHOOK
# Value: [Your Slack webhook URL - optional]
```

#### Getting Database Service ID:

1. **In Railway Dashboard**
   - Go to your ADX-Agent project
   - Click on your database service (PostgreSQL)
   - Look at the service URL or use Railway CLI:
   ```bash
   railway status --service adx-agent-database
   ```

### Step 5: Enable GitHub Actions

1. **Enable Workflows**
   - In your GitHub repository, go to **Actions** tab
   - Click **"Enable workflows"** if prompted

2. **Verify Workflow Files**
   - Check that these files exist in `.github/workflows/`:
     - `railway-deploy.yml`
     - `railway-pr-envs.yml`
     - `railway-ci-cd.yml`
     - `tests.yml`

## 🎯 Testing the Integration

### Test 1: Manual Deployment

```bash
# Trigger a manual deployment
gh workflow run railway-deploy.yml -f environment=staging
```

### Test 2: Pull Request Environment

1. **Create a test branch:**
   ```bash
   git checkout -b test-pr-env
   git push origin test-pr-env
   ```

2. **Create a pull request**
   - GitHub Actions should automatically:
     - Create a PR environment on Railway
     - Deploy services to the PR environment
     - Post deployment URLs to the PR comment

### Test 3: Production Deployment

1. **Push to main branch:**
   ```bash
   git checkout main
   git merge test-pr-env
   git push origin main
   ```

2. **Verify deployment:**
   - Check GitHub Actions tab for workflow status
   - Check Railway dashboard for deployment status
   - Verify services are accessible

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Railway token invalid"
**Solution:**
- Verify token hasn't expired
- Check token has correct permissions
- Regenerate token if needed

#### Issue: "Project not found"
**Solution:**
- Verify PROJECT_ID is correct
- Check token has access to project
- Ensure you're using project token, not account token

#### Issue: "PR environment not created"
**Solution:**
- Verify `RAILWAY_API_TOKEN` is account-level token
- Check token has account scope, not workspace scope
- Verify `RAILWAY_PROJECT_ID` is correct

#### Issue: "Deployment failed"
**Solution:**
- Check Railway logs in dashboard
- Verify all required environment variables are set
- Check test suite passes before deployment

### Debug Commands

```bash
# Check Railway connection
railway whoami

# List projects
railway projects

# Check service status
railway status

# View logs
railway logs --follow

# Test deployment locally
railway up --service adx-agent-frontend
```

## 📊 Monitoring Setup

### Discord Notifications

1. **Create Discord Webhook**
   - In Discord server, go to channel settings
   - Click **Integrations** → **Webhooks**
   - Create new webhook
   - Copy webhook URL

2. **Add to GitHub Secrets**
   ```bash
   DISCORD_WEBHOOK: https://discord.com/api/webhooks/...
   ```

### GitHub Actions Monitoring

1. **Enable Notifications**
   - Go to repository **Settings** → **Notifications**
   - Enable **Actions** notifications
   - Choose delivery method (email, Discord, etc.)

2. **Set up Status Checks**
   - Go to repository **Settings** → **Branches**
   - Add rule for `main` branch
   - Require status checks to pass
   - Require branches to be up to date

## 🔄 Advanced Configuration

### Custom Environments

To add staging environment:

1. **Create Staging Environment in Railway**
   ```bash
   railway environment new staging --copy production
   ```

2. **Update GitHub Secrets**
   ```bash
   RAILWAY_BASE_ENVIRONMENT: staging
   ```

### Team Projects

If using Railway team projects:

1. **Add Team ID to Secrets**
   ```bash
   RAILWAY_TEAM_ID: your_team_id
   ```

2. **Update Workflow Commands**
   ```bash
   railway link --project PROJECT_ID --environment ENV --team TEAM_ID
   ```

### Custom Database Configuration

For different database setups:

1. **Get Database Service ID**
   ```bash
   railway status --service adx-agent-database
   ```

2. **Update Secret**
   ```bash
   RAILWAY_DATABASE_SERVICE_ID: service_123456789
   ```

## 📚 Additional Resources

- [Railway CLI Documentation](https://docs.railway.com/guides/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway GitHub Integration](https://docs.railway.com/guides/github)
- [ADX-Agent Railway Deployment Guide](./RAILWAY-DEPLOYMENT.md)

## 🆘 Need Help?

- **Railway Discord**: [Join Railway Discord](https://discord.gg/railway)
- **GitHub Support**: [GitHub Support](https://support.github.com)
- **ADX-Agent Issues**: Create issue in repository

---

**Setup Guide Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Author**: MiniMax Agent