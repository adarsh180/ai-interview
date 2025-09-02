#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running production build checks...\n');

// Check environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GROQ_API_KEY'
];

console.log('✅ Checking environment variables...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

// Check JWT_SECRET length
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

console.log('✅ Environment variables validated');

// Type check
console.log('✅ Running TypeScript type check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.error('❌ TypeScript check failed');
  process.exit(1);
}

// Build check
console.log('✅ Running Next.js build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Check build output
const buildDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found');
  process.exit(1);
}

console.log('\n🎉 All checks passed! Ready for deployment.');