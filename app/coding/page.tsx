'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Code, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  solved: boolean;
  attempted: boolean;
  acceptanceRate: number;
  likes: number;
  companies: string[];
}

export default function CodingProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const router = useRouter();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/problems');
      const data = await response.json();
      setProblems(data.problems || []);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((problem: Problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === 'All' || problem.topic === topicFilter;
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Solved' && problem.solved) ||
      (statusFilter === 'Attempted' && problem.attempted && !problem.solved) ||
      (statusFilter === 'Todo' && !problem.attempted);
    return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus;
  }).sort((a: Problem, b: Problem) => {
    if (sortBy === 'difficulty') {
      const order: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      return order[a.difficulty] - order[b.difficulty];
    }
    if (sortBy === 'acceptance') {
      return b.acceptanceRate - a.acceptanceRate;
    }
    return (a as any)[sortBy] - (b as any)[sortBy];
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (problem: Problem) => {
    if (problem.solved) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (problem.attempted) return <Clock className="h-4 w-4 text-yellow-400" />;
    return <div className="h-4 w-4 rounded-full border-2 border-gray-600"></div>;
  };

  const topics = ['All', ...Array.from(new Set(problems.map((p: Problem) => p.topic)))];
  const solvedCount = problems.filter((p: Problem) => p.solved).length;
  const attemptedCount = problems.filter((p: Problem) => p.attempted && !p.solved).length;

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
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-gray-100 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-semibold text-gray-100">Coding Problems</h1>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Solved: {solvedCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">Attempted: {attemptedCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Total: {problems.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="card-glow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-teal-400 focus:outline-none"
              />
            </div>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-teal-400 focus:outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-teal-400 focus:outline-none"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-teal-400 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="Todo">Todo</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-teal-400 focus:outline-none"
            >
              <option value="id">Sort by ID</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="acceptance">Sort by Acceptance</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredProblems.length} of {problems.length} problems
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {filteredProblems.map((problem: Problem) => (
            <div
              key={problem.id}
              onClick={() => router.push(`/coding/problem/${problem.id}`)}
              className="card-glow p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(problem)}
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm font-mono">#{problem.id}</span>
                    <h3 className="text-lg font-semibold text-white hover:text-teal-400 transition-colors">
                      {problem.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                    {problem.topic}
                  </span>
                  <div className="text-sm text-gray-400">
                    {problem.acceptanceRate}%
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <span>👍</span>
                    <span>{problem.likes}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Companies:</span>
                  <div className="flex space-x-2">
                    {problem.companies?.map((company: string, idx: number) => (
                      <span key={idx} className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-teal-400">
                  <Code className="h-4 w-4" />
                  <span className="text-sm">Solve Problem</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}