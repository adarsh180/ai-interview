# Talvio AI Interview Platform - Production Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MySQL Database**: TiDB Cloud, PlanetScale, or any MySQL-compatible database
3. **Groq API Key**: Get from [console.groq.com](https://console.groq.com)

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Database Configuration
DATABASE_URL=mysql://username:password@host:port/database_name

# JWT Secret (generate a secure 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Groq API Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here

# Admin Credentials
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword123!

# Environment
NODE_ENV=production
```

## Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/talvio-ai-interview)

### Option 2: Manual Deploy

1. **Fork/Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd talvio-ai-interview
   ```

2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Database Setup

### TiDB Cloud (Recommended)

1. Create account at [tidbcloud.com](https://tidbcloud.com)
2. Create a new cluster
3. Get connection string from cluster dashboard
4. Use as `DATABASE_URL` in environment variables

### PlanetScale Alternative

1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Use as `DATABASE_URL`

## Post-Deployment Steps

1. **Initialize Database**
   - After deployment, visit `https://your-app.vercel.app/api/init` (POST request)
   - Or use curl: `curl -X POST https://your-app.vercel.app/api/init`
   - This creates all necessary database tables

2. **Verify Database Connection**
   - Visit `/api/test` to check if APIs are working
   - Check Vercel function logs for any errors

3. **Admin Access**
   - Login with credentials set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`
   - Access admin panel at `/admin`

4. **Test Features**
   - Upload a resume for AI analysis
   - Try mock interview feature
   - Test coding practice platform

## Security Considerations

- **JWT_SECRET**: Use a cryptographically secure random string (32+ chars)
- **ADMIN_PASSWORD**: Use a strong password with special characters
- **Database**: Ensure SSL is enabled for production
- **API Keys**: Never commit API keys to version control

## Performance Optimization

- Database connection pooling is configured
- Next.js optimization enabled
- Image optimization configured
- API timeouts set to 30 seconds

## Monitoring

- Check Vercel Function logs for errors
- Monitor database connection limits
- Track API usage for Groq

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL` format: `mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}`
   - For TiDB Cloud: Ensure SSL is enabled in connection string
   - Check database server status and whitelist Vercel IPs
   - Example TiDB URL: `mysql://username.root:password@gateway01.region.prod.aws.tidbcloud.com:4000/database_name?ssl={"rejectUnauthorized":true}`

2. **JWT Errors**
   - Verify `JWT_SECRET` is 32+ characters
   - Check for special characters in secret

3. **Groq API Errors**
   - Verify `GROQ_API_KEY` is valid
   - Check API quota limits

### Support

- Check deployment logs in Vercel dashboard
- Verify all environment variables are set
- Test database connection separately

## Production Checklist

- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] Admin credentials set
- [ ] Groq API key valid
- [ ] SSL certificates active
- [ ] Domain configured (if custom)
- [ ] Error monitoring setup
- [ ] Backup strategy implemented

## Scaling Considerations

- Database: Monitor connection limits
- API: Consider rate limiting for production
- Storage: Plan for resume file storage
- Monitoring: Set up alerts for errors

---

**Built with ❤️ for better interview preparation**

For support, check the troubleshooting section or create an issue in the repository.