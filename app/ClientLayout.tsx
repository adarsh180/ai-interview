'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Target, Code, LogOut, User, Menu, X } from 'lucide-react';

function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    router.push('/');
  };

  const isHomePage = pathname === '/';
  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  if (isHomePage || isAuthPage) {
    return null; // Don't show navbar on home and auth pages
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur-md border-b border-teal-400/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 p-0.5 logo-glow flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <div className="w-9 h-9 rounded-full bg-navy-950 flex items-center justify-center">
                <img src="/images/logo.png" alt="Talvio" className="w-5 h-5 object-contain" />
              </div>
            </div>
            <span className="text-xl font-bold text-white group-hover:text-glow transition-all duration-300">Talvio</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  pathname === '/dashboard'
                    ? 'bg-teal-400/20 text-teal-400 border border-teal-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800/50'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                href="/interview"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  pathname === '/interview'
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800/50'
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Practice Interview</span>
              </Link>
              
              <Link
                href="/coding"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  pathname === '/coding'
                    ? 'bg-teal-400/20 text-teal-400 border border-teal-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800/50'
                }`}
              >
                <Code className="h-4 w-4" />
                <span>Coding Practice</span>
              </Link>
              
              {user?.is_admin && (
                <Link
                  href="/admin"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    pathname === '/admin'
                      ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-navy-800/50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          )}

          {/* User Menu */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center">
                  <User className="h-4 w-4 text-navy-950" />
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-gray-400">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800/50 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/signin"
                className="text-gray-300 hover:text-white font-medium transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-glow inline-block"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-teal-400/20">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Upload className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/interview"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Target className="h-4 w-4" />
                  <span>Practice Interview</span>
                </Link>
                <Link
                  href="/coding"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Code className="h-4 w-4" />
                  <span>Coding Practice</span>
                </Link>
                
                {user?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="border-t border-teal-400/20 pt-2 mt-2">
                  <div className="px-4 py-2">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/signin"
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-navy-800/50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-navy-900 font-semibold rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}