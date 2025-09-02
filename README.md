# Talvio AI Interview Platform

🚀 **Production-Ready AI-Powered Interview Platform**

A comprehensive platform combining AI-powered resume analysis with coding practice, built with Next.js 14, TypeScript, and advanced AI integration.

## ✨ Features

### 🎯 AI Resume Analysis
- **Smart ATS Scoring** with company-tier specific evaluation
- **Unbiased Assessment** valuing diverse educational backgrounds
- **Detailed Feedback** with actionable improvement suggestions
- **Multi-Company Analysis** (Tier 1: FAANG, Tier 2: Unicorns, Tier 3: Startups)
- **PDF Report Generation** for professional sharing

### 💻 Coding Practice Platform
- **Interactive Code Editor** with multi-language support
- **AI-Powered Code Analysis** using Groq API
- **Comprehensive Problem Set** with difficulty levels
- **Real-time Test Case Execution**
- **Detailed Performance Analytics**

### 👨💼 Admin Dashboard
- **User Management** with progress tracking
- **Problem Management** (CRUD operations)
- **Analytics Dashboard** with visual charts
- **Real-time Synchronization**
- **Role-based Access Control**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, JWT Authentication
- **Database**: MySQL (TiDB Cloud compatible)
- **AI**: Groq API with Llama 3.1 models
- **Deployment**: Vercel
- **UI**: Lucide React icons, React Hot Toast

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/talvio-ai-interview)

## 📋 Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Database Configuration
DATABASE_URL=mysql://username:password@host:port/database_name

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Groq API Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here

# Admin Credentials
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword123!

# Environment
NODE_ENV=production
```

## 🏗️ Local Development

```bash
# Clone the repository
git clone <repository-url>
cd talvio-ai-interview

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

## 📊 Production Checklist

- [x] TypeScript compilation ✅
- [x] Production build ✅
- [x] Environment validation ✅
- [x] Database connection ✅
- [x] API routes optimized ✅
- [x] Error handling ✅
- [x] Security measures ✅

## 🔧 Build Commands

```bash
# Type check
npm run type-check

# Production build
npm run build

# Test database connection
npm run test:db

# Full deployment check
npm run deploy:check
```

## 📱 Usage

### For Users
1. **Register/Login** to access the platform
2. **Upload Resume** for AI-powered analysis
3. **Practice Coding** with interactive problems
4. **Get AI Feedback** on code solutions
5. **Track Progress** with detailed analytics

### For Admins
1. **Login** with admin credentials
2. **Manage Problems** - Add, edit, delete coding questions
3. **Monitor Users** - View progress and analytics
4. **System Analytics** - Track platform usage

## 🔒 Security Features

- JWT Authentication with secure token handling
- Password hashing using bcrypt
- SQL injection protection
- Environment variable validation
- Role-based access control
- Secure database connections

## 📈 Performance Optimizations

- Database connection pooling
- Next.js 14 optimizations
- Image optimization
- Code splitting
- API route optimization
- Error boundary implementation

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

## 🆘 Support

For support and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review environment variables setup
- Verify database connection
- Check API endpoints

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for better interview preparation**

**Admin Access**: Use the credentials set in your environment variables to access the admin panel at `/admin`.