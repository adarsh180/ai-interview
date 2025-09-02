'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import AIBot from '@/components/AIBot';

export default function SignInPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Welcome back!');
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 smoky-bg"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 z-20 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-6 w-6" />
      </Link>

      {/* Sign In Form */}
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="card-glow p-8">
          <div className="text-center mb-8">
            <div className="logo-glow mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 p-0.5 mx-auto flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-navy-950 flex items-center justify-center">
                  <img src="/images/icon.png" alt="Talvio" className="w-7 h-7 object-contain" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white text-glow mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your Talvio account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-teal-400 hover:text-teal-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* AI Bot */}
      <AIBot />
    </div>
  );
}