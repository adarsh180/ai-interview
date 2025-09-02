'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, Users, Code, FileText, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Problem {
  id?: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  testCases: Array<{ input: string; expectedOutput: string; hidden?: boolean }>;
  solutionTemplate: Record<string, string>;
  companies: string[];
  acceptanceRate?: number;
  likes?: number;
  dislikes?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [dailyActivity, setDailyActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [formData, setFormData] = useState<Problem>({
    title: '',
    difficulty: 'Easy',
    topic: '',
    description: '',
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    testCases: [{ input: '', expectedOutput: '', hidden: false }],
    solutionTemplate: {
      javascript: '// Write your solution here\nfunction solution() {\n    \n}',
      python: '# Write your solution here\ndef solution():\n    pass',
      java: 'public class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your solution here\n    }\n};'
    },
    companies: ['']
  });
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        if (userData.is_admin) {
          setUser(userData);
          fetchData();
        } else {
          toast.error('Access denied. Admin privileges required.');
          router.push('/dashboard');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [problemsRes, usersRes, progressRes] = await Promise.all([
        fetch('/api/admin/problems'),
        fetch('/api/admin/users'),
        fetch('/api/admin/progress')
      ]);

      if (problemsRes.ok) {
        const problemsData = await problemsRes.json();
        setProblems(problemsData.problems || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgressData(progressData.users || []);
        setDailyActivity(progressData.dailyActivity || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSaveProblem = async () => {
    try {
      console.log('Submitting form data:', formData);
      
      // Validate required fields
      if (!formData.title || !formData.difficulty || !formData.topic || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const url = editingProblem ? `/api/admin/problems/${editingProblem.id}` : '/api/admin/problems';
      const method = editingProblem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        toast.success(`Problem ${editingProblem ? 'updated' : 'created'} successfully!`);
        setShowProblemForm(false);
        setEditingProblem(null);
        resetForm();
        fetchData();
      } else {
        toast.error(responseData.error || 'Failed to save problem');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDeleteProblem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Problem deleted successfully!');
        fetchData();
      } else {
        toast.error('Failed to delete problem');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      difficulty: 'Easy',
      topic: '',
      description: '',
      examples: [{ input: '', output: '', explanation: '' }],
      constraints: [''],
      testCases: [{ input: '', expectedOutput: '', hidden: false }],
      solutionTemplate: {
        javascript: '// Write your solution here\nfunction solution() {\n    \n}',
        python: '# Write your solution here\ndef solution():\n    pass',
        java: 'public class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}',
        cpp: '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your solution here\n    }\n};'
      },
      companies: ['']
    });
  };

  const addArrayField = (field: 'examples' | 'constraints' | 'testCases' | 'companies') => {
    if (field === 'examples') {
      setFormData(prev => ({
        ...prev,
        examples: [...prev.examples, { input: '', output: '', explanation: '' }]
      }));
    } else if (field === 'constraints') {
      setFormData(prev => ({
        ...prev,
        constraints: [...prev.constraints, '']
      }));
    } else if (field === 'testCases') {
      setFormData(prev => ({
        ...prev,
        testCases: [...prev.testCases, { input: '', expectedOutput: '', hidden: false }]
      }));
    } else if (field === 'companies') {
      setFormData(prev => ({
        ...prev,
        companies: [...prev.companies, '']
      }));
    }
  };

  const removeArrayField = (field: 'examples' | 'constraints' | 'testCases' | 'companies', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-100">Admin Dashboard</h1>
              <span className="text-sm text-gray-400">Welcome, {user?.name}</span>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-navy-800/50 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'problems', label: 'Problems', icon: Code },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'progress', label: 'User Progress', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-navy-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Problems</p>
                  <p className="text-3xl font-bold text-white">{problems.length}</p>
                </div>
                <Code className="h-8 w-8 text-teal-400" />
              </div>
            </div>
            
            <div className="card-glow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            
            <div className="card-glow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Easy Problems</p>
                  <p className="text-3xl font-bold text-white">
                    {problems.filter(p => p.difficulty === 'Easy').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* Problems Tab */}
        {activeTab === 'problems' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Manage Problems</h2>
              <button
                onClick={() => {
                  setShowProblemForm(true);
                  setEditingProblem(null);
                  resetForm();
                }}
                className="btn-glow flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Problem</span>
              </button>
            </div>

            <div className="space-y-4">
              {problems.map((problem) => (
                <div key={problem.id} className="card-glow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          problem.difficulty === 'Easy' ? 'bg-green-400/20 text-green-400' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                          {problem.topic}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">{problem.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingProblem(problem);
                          setFormData(problem);
                          setShowProblemForm(true);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => problem.id && handleDeleteProblem(problem.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">User Management</h2>
            <div className="card-glow overflow-hidden">
              <table className="w-full">
                <thead className="bg-navy-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-navy-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-400/20 text-purple-400' : 'bg-gray-400/20 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">User Progress Analytics</h2>
            
            {/* Progress Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card-glow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-white">{progressData.filter(u => u.total_attempts > 0).length}</p>
                  </div>
                  <Users className="h-6 w-6 text-teal-400" />
                </div>
              </div>
              
              <div className="card-glow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Submissions</p>
                    <p className="text-2xl font-bold text-white">
                      {progressData.reduce((sum, user) => sum + (user.total_attempts || 0), 0)}
                    </p>
                  </div>
                  <Code className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              
              <div className="card-glow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Problems Solved</p>
                    <p className="text-2xl font-bold text-white">
                      {progressData.reduce((sum, user) => sum + (user.problems_solved || 0), 0)}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
              
              <div className="card-glow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg ATS Score</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(progressData.reduce((sum, user) => sum + (user.avg_ats_score || 0), 0) / Math.max(progressData.length, 1))}%
                    </p>
                  </div>
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Daily Activity Chart */}
            <div className="card-glow p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Activity (Last 30 Days)</h3>
              <div className="h-64 flex items-end space-x-2">
                {dailyActivity.slice(0, 30).map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-teal-400 rounded-t"
                      style={{ 
                        height: `${Math.max((day.activity_count / Math.max(...dailyActivity.map(d => d.activity_count))) * 200, 4)}px` 
                      }}
                    ></div>
                    <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual User Progress */}
            <div className="card-glow overflow-hidden">
              <div className="px-6 py-4 bg-navy-800 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Individual User Progress</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Problems Solved</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Attempts</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Resumes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg ATS Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {progressData.map((user) => {
                      const successRate = user.total_attempts > 0 ? (user.problems_solved / user.total_attempts * 100) : 0;
                      return (
                        <tr key={user.id} className="hover:bg-navy-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                              <span className="text-sm text-white">{user.problems_solved || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.total_attempts || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.resumes_uploaded || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-purple-400 h-2 rounded-full" 
                                  style={{ width: `${Math.min(user.avg_ats_score || 0, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-white">{Math.round(user.avg_ats_score || 0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    successRate >= 70 ? 'bg-green-400' : 
                                    successRate >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${successRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-white">{Math.round(successRate)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Problem Form Modal */}
      {showProblemForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-navy-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingProblem ? 'Edit Problem' : 'Add New Problem'}
              </h3>
              <button
                onClick={() => setShowProblemForm(false)}
                className="text-gray-400 hover:text-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-navy-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full bg-navy-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
                  className="bg-navy-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-navy-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                />
              </div>

              {/* Examples */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Examples</label>
                  <button
                    onClick={() => addArrayField('examples')}
                    className="text-teal-400 hover:text-teal-300 text-sm"
                  >
                    + Add Example
                  </button>
                </div>
                {formData.examples.map((example, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Input"
                      value={example.input}
                      onChange={(e) => {
                        const newExamples = [...formData.examples];
                        newExamples[index].input = e.target.value;
                        setFormData(prev => ({ ...prev, examples: newExamples }));
                      }}
                      className="bg-navy-800 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Output"
                      value={example.output}
                      onChange={(e) => {
                        const newExamples = [...formData.examples];
                        newExamples[index].output = e.target.value;
                        setFormData(prev => ({ ...prev, examples: newExamples }));
                      }}
                      className="bg-navy-800 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Explanation (optional)"
                        value={example.explanation || ''}
                        onChange={(e) => {
                          const newExamples = [...formData.examples];
                          newExamples[index].explanation = e.target.value;
                          setFormData(prev => ({ ...prev, examples: newExamples }));
                        }}
                        className="flex-1 bg-navy-800 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm"
                      />
                      {formData.examples.length > 1 && (
                        <button
                          onClick={() => removeArrayField('examples', index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Constraints</label>
                  <button
                    onClick={() => addArrayField('constraints')}
                    className="text-teal-400 hover:text-teal-300 text-sm"
                  >
                    + Add Constraint
                  </button>
                </div>
                {formData.constraints.map((constraint, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter constraint"
                      value={constraint}
                      onChange={(e) => {
                        const newConstraints = [...formData.constraints];
                        newConstraints[index] = e.target.value;
                        setFormData(prev => ({ ...prev, constraints: newConstraints }));
                      }}
                      className="flex-1 bg-navy-800 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm"
                    />
                    {formData.constraints.length > 1 && (
                      <button
                        onClick={() => removeArrayField('constraints', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Companies */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Companies</label>
                  <button
                    onClick={() => addArrayField('companies')}
                    className="text-teal-400 hover:text-teal-300 text-sm"
                  >
                    + Add Company
                  </button>
                </div>
                {formData.companies.map((company, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Company name"
                      value={company}
                      onChange={(e) => {
                        const newCompanies = [...formData.companies];
                        newCompanies[index] = e.target.value;
                        setFormData(prev => ({ ...prev, companies: newCompanies }));
                      }}
                      className="flex-1 bg-navy-800 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm"
                    />
                    {formData.companies.length > 1 && (
                      <button
                        onClick={() => removeArrayField('companies', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Test Cases */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Test Cases</label>
                  <button
                    onClick={() => addArrayField('testCases')}
                    className="text-teal-400 hover:text-teal-300 text-sm"
                  >
                    + Add Test Case
                  </button>
                </div>
                {formData.testCases.map((testCase, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Input"
                      value={testCase.input}
                      onChange={(e) => {
                        const newTestCases = [...formData.testCases];
                        newTestCases[index].input = e.target.value;
                        setFormData(prev => ({ ...prev, testCases: newTestCases }));
                      }}
                      className="bg-navy-800 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Expected Output"
                      value={testCase.expectedOutput}
                      onChange={(e) => {
                        const newTestCases = [...formData.testCases];
                        newTestCases[index].expectedOutput = e.target.value;
                        setFormData(prev => ({ ...prev, testCases: newTestCases }));
                      }}
                      className="bg-navy-800 border border-gray-600 rounded px-2 py-1 text-gray-100 text-sm"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={testCase.hidden || false}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases];
                            newTestCases[index].hidden = e.target.checked;
                            setFormData(prev => ({ ...prev, testCases: newTestCases }));
                          }}
                          className="rounded"
                        />
                        <span className="text-xs text-gray-400">Hidden</span>
                      </label>
                      {formData.testCases.length > 1 && (
                        <button
                          onClick={() => removeArrayField('testCases', index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowProblemForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProblem}
                className="btn-glow flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingProblem ? 'Update' : 'Create'} Problem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}