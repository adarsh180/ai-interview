'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Target, Code, FileText, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ResumeUpload from '@/components/ResumeUpload';
import ScoreCard from '@/components/ScoreCard';
import AIBot from '@/components/AIBot';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchResumes();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resume/list');
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 pt-16">
      {/* Header */}
      <header className="bg-navy-900 shadow-sm border-b border-teal-400/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 p-0.5 logo-glow flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-navy-950 flex items-center justify-center">
                  <img src="/images/icon.png" alt="Talvio" className="w-5 h-5 object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-100">Welcome back, {user?.name}</h1>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user?.is_admin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <span>Admin Panel</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-400 hover:text-gray-100"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card-glow hover:scale-105 transition-all cursor-pointer p-6">
            <Upload className="h-8 w-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Upload Resume</h3>
            <p className="text-gray-300">Upload and analyze your resume with AI</p>
          </div>
          <div 
            className="card-glow hover:scale-105 transition-all cursor-pointer p-6"
            onClick={() => router.push('/interview')}
          >
            <Target className="h-8 w-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Practice Interview</h3>
            <p className="text-gray-300">AI-powered mock interviews</p>
          </div>
          <div 
            className="card-glow hover:scale-105 transition-all cursor-pointer p-6"
            onClick={() => router.push('/coding')}
          >
            <Code className="h-8 w-8 text-teal-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Coding Practice</h3>
            <p className="text-gray-300">Solve problems and get AI feedback</p>
          </div>
        </div>

        {/* Resume Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Resume Analysis</h2>
            <ResumeUpload onUploadSuccess={fetchResumes} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Your Resumes</h2>
            <div className="space-y-4">
              {resumes.length === 0 ? (
                <div className="card-glow text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No resumes uploaded yet</p>
                </div>
              ) : (
                resumes.map((resume) => (
                  <ScoreCard key={resume.id} resume={resume} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AIBot />
    </div>
  );
}