# SSH Deployment Setup Guide

This guide explains how to set up the GitHub Action for SSH deployment of your Vite application.

## Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SSH_HOST` | Your server's IP address or hostname | `192.168.1.100` or `yourserver.com` |
| `SSH_USERNAME` | SSH username for server access | `ubuntu` or `your-username` |
| `SSH_PRIVATE_KEY` | Private SSH key for authentication | Contents of your private key file |
| `DEPLOY_PATH` | Absolute path where files should be deployed | `/var/www/html` or `/home/user/public_html` |

### Optional Secrets

| Secret Name | Description | Default | Example |
|-------------|-------------|---------|---------|
| `SSH_PORT` | SSH port number | `22` | `2222` |
| `WEB_USER` | Web server user | `www-data` | `nginx` |
| `WEB_GROUP` | Web server group | `www-data` | `nginx` |
| `RESTART_COMMAND` | Command to restart web server | None | `systemctl reload nginx` |
| `HEALTH_CHECK_URL` | URL to check after deployment | None | `https://yoursite.com` |

## SSH Key Setup

### 1. Generate SSH Key Pair

On your local machine or a secure environment:

```bash
# Generate a new SSH key pair specifically for deployment
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# This creates two files:
# ~/.ssh/deploy_key (private key - add to GitHub secrets)
# ~/.ssh/deploy_key.pub (public key - add to server)
```

### 2. Add Public Key to Server

Copy the public key to your server:

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/deploy_key.pub user@yourserver.com

# Or manually add it to authorized_keys:
cat ~/.ssh/deploy_key.pub | ssh user@yourserver.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Add Private Key to GitHub Secrets

```bash
# Copy the private key content
cat ~/.ssh/deploy_key
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) and add it as the `SSH_PRIVATE_KEY` secret in GitHub.

## Server Requirements

### Minimum Requirements

- SSH access with key-based authentication
- Node.js (if you need to run any server-side processes)
- Web server (Apache, Nginx, or similar)
- Proper file permissions for the deployment directory

### Recommended Server Setup

```bash
# Create deployment directory
sudo mkdir -p /var/www/yoursite
sudo chown www-data:www-data /var/www/yoursite

# Ensure SSH service is running
sudo systemctl enable ssh
sudo systemctl start ssh
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yoursite.com www.yoursite.com;
    root /var/www/yoursite;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Handle static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Security Best Practices

### 1. SSH Key Security
- Use ED25519 keys (more secure than RSA)
- Never share private keys
- Use different keys for different purposes
- Regularly rotate keys

### 2. Server Security
- Disable password authentication: `PasswordAuthentication no` in `/etc/ssh/sshd_config`
- Use non-standard SSH port if possible
- Enable UFW firewall: `sudo ufw enable`
- Keep server updated: `sudo apt update && sudo apt upgrade`

### 3. GitHub Secrets Security
- Use environment-specific secrets for staging/production
- Regularly audit and rotate secrets
- Use minimal required permissions

## Workflow Features

### Automatic Features
- ✅ Builds the Vite application
- ✅ Creates compressed archive for faster transfer
- ✅ Creates automatic backups before deployment
- ✅ Sets proper file permissions
- ✅ Cleans up old backups (keeps last 3)
- ✅ Optional health check after deployment
- ✅ Optional web server restart

### Deployment Process
1. **Build**: Compiles your Vite app using `npm run build`
2. **Package**: Creates a compressed archive of the build files
3. **Backup**: Creates a timestamped backup of current deployment
4. **Deploy**: Transfers and extracts files to the server
5. **Configure**: Sets proper permissions and ownership
6. **Restart**: Optionally restarts the web server
7. **Verify**: Runs health check to ensure deployment success

## Troubleshooting

### Common Issues

#### SSH Connection Failed
```
Error: ssh: connect to host xxx.xxx.xxx.xxx port 22: Connection refused
```
**Solutions:**
- Verify `SSH_HOST` and `SSH_PORT` secrets
- Ensure SSH service is running on server
- Check firewall rules

#### Permission Denied
```
Error: scp: /path/to/deploy: Permission denied
```
**Solutions:**
- Verify `SSH_USERNAME` has access to `DEPLOY_PATH`
- Check directory ownership and permissions
- Ensure user is in the correct group

#### Build Failed
```
Error: npm ERR! code ELIFECYCLE
```
**Solutions:**
- Check your `package.json` scripts
- Ensure all dependencies are properly declared
- Review build logs for specific errors

### Testing the Deployment

1. **Test SSH connection locally:**
```bash
ssh -i ~/.ssh/deploy_key user@yourserver.com
```

2. **Test manual deployment:**
```bash
npm run build
scp -r dist/* user@yourserver.com:/var/www/yoursite/
```

3. **Monitor GitHub Actions logs** for detailed error information

## Environment-Specific Configuration

For multiple environments (staging, production), create separate workflow files:

- `.github/workflows/deploy-staging.yml` (triggers on `develop` branch)
- `.github/workflows/deploy-production.yml` (triggers on `main` branch)

Use environment-specific secrets:
- `STAGING_SSH_HOST`, `PROD_SSH_HOST`
- `STAGING_DEPLOY_PATH`, `PROD_DEPLOY_PATH`

This ensures safe deployments across different environments.