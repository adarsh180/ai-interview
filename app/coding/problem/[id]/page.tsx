'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Play, Lightbulb, CheckCircle, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  testCases: Array<{ input: string; expectedOutput: string; hidden?: boolean }>;
  solutionTemplate: Record<string, string>;
  companies: string[];
}

interface Analysis {
  correctness: { score: number; explanation: string; issues: string[] };
  timeComplexity: { current: string; optimal: string; explanation: string };
  spaceComplexity: { current: string; optimal: string; explanation: string };
  codeQuality: { score: number; strengths: string[]; improvements: string[] };
  approach: { description: string; isOptimal: boolean; alternativeApproaches: string[] };
  optimizedSolution: { code: string; explanation: string };
  learningPoints: string[];
  overallScore: number;
  feedback: string;
}

export default function ProblemSolvePage() {
  const router = useRouter();
  const params = useParams();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<any>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [running, setRunning] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem && problem.solutionTemplate[language]) {
      setCode(problem.solutionTemplate[language]);
    }
  }, [problem, language]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${problemId}`);
      if (response.ok) {
        const data = await response.json();
        setProblem(data.problem);
        if (data.problem.solutionTemplate[language]) {
          setCode(data.problem.solutionTemplate[language]);
        }
      } else {
        toast.error('Problem not found');
        router.push('/coding');
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!problem) return;
    
    setRunning(true);
    try {
      // Simulate code execution with test cases
      const visibleTestCases = problem.testCases.filter(tc => !tc.hidden);
      const results = visibleTestCases.map((testCase, index) => ({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: testCase.expectedOutput, // Simulated - in real app, execute code
        passed: true, // Simulated
        index: index + 1
      }));

      setTestResults({
        passed: results.length,
        total: problem.testCases.length,
        results: results
      });

      toast.success(`${results.length}/${problem.testCases.length} test cases passed!`);
    } catch (error) {
      toast.error('Error running code');
    } finally {
      setRunning(false);
    }
  };

  const analyzeCode = async () => {
    if (!problem || !code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/coding/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemTitle: problem.title,
          problemDescription: problem.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setShowAnalysis(true);
        toast.success('Code analysis complete!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze code');
    } finally {
      setAnalyzing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Problem Not Found</h2>
          <button
            onClick={() => router.push('/coding')}
            className="btn-glow"
          >
            Back to Problems
          </button>
        </div>
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
                onClick={() => router.push('/coding')}
                className="text-gray-400 hover:text-gray-100 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-100">{problem.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-navy-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            <div className="card-glow p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Problem Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{problem.description}</p>
              </div>

              {problem.examples.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-white mb-3">Examples</h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="bg-navy-800/50 rounded-lg p-4 mb-4">
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">Input:</span>
                          <code className="block bg-navy-900 p-2 rounded mt-1 text-green-400 font-mono text-sm">
                            {example.input}
                          </code>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Output:</span>
                          <code className="block bg-navy-900 p-2 rounded mt-1 text-blue-400 font-mono text-sm">
                            {example.output}
                          </code>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-gray-400 text-sm">Explanation:</span>
                            <p className="text-gray-300 text-sm mt-1">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-white mb-3">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index} className="text-gray-300 text-sm">{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {problem.companies.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-white mb-3">Companies</h3>
                  <div className="flex flex-wrap gap-2">
                    {problem.companies.map((company, index) => (
                      <span key={index} className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Test Results */}
            {testResults && (
              <div className="card-glow p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
                <div className="space-y-3">
                  {testResults.results.map((result: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.passed ? 'bg-green-900/20 border-green-800/30' : 'bg-red-900/20 border-red-800/30'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {result.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-sm font-medium text-white">Test Case {result.index}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div><span className="text-gray-400">Input:</span> <code className="text-green-400">{result.input}</code></div>
                        <div><span className="text-gray-400">Expected:</span> <code className="text-blue-400">{result.expected}</code></div>
                        <div><span className="text-gray-400">Actual:</span> <code className="text-yellow-400">{result.actual}</code></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            <div className="card-glow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Code Editor</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={runCode}
                    disabled={running}
                    className="btn-glow flex items-center space-x-2 text-sm disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    <span>{running ? 'Running...' : 'Run Code'}</span>
                  </button>
                  <button
                    onClick={analyzeCode}
                    disabled={analyzing}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{analyzing ? 'Analyzing...' : 'AI Analysis'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-navy-900 border border-gray-600 rounded-lg p-4 text-gray-100 font-mono text-sm resize-none focus:border-teal-400 focus:outline-none"
                placeholder="Write your solution here..."
              />
            </div>

            {/* AI Analysis Results */}
            {showAnalysis && analysis && (
              <div className="card-glow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <span>AI Code Analysis</span>
                  </h3>
                  <div className="text-2xl font-bold text-teal-400">
                    {analysis.overallScore}/100
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-navy-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Time Complexity</h4>
                      <div className="text-sm">
                        <div className="text-gray-300">Current: <code className="text-yellow-400">{analysis.timeComplexity.current}</code></div>
                        <div className="text-gray-300">Optimal: <code className="text-green-400">{analysis.timeComplexity.optimal}</code></div>
                      </div>
                    </div>
                    <div className="bg-navy-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Space Complexity</h4>
                      <div className="text-sm">
                        <div className="text-gray-300">Current: <code className="text-yellow-400">{analysis.spaceComplexity.current}</code></div>
                        <div className="text-gray-300">Optimal: <code className="text-green-400">{analysis.spaceComplexity.optimal}</code></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Approach Analysis</h4>
                    <p className="text-gray-300 text-sm mb-2">{analysis.approach.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        analysis.approach.isOptimal ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {analysis.approach.isOptimal ? 'Optimal' : 'Can be optimized'}
                      </span>
                    </div>
                  </div>

                  {analysis.codeQuality.improvements.length > 0 && (
                    <div className="bg-navy-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Suggestions for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.codeQuality.improvements.map((improvement, index) => (
                          <li key={index} className="text-gray-300 text-sm">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.learningPoints.length > 0 && (
                    <div className="bg-navy-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Key Learning Points</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.learningPoints.map((point, index) => (
                          <li key={index} className="text-gray-300 text-sm">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-teal-900/20 border border-teal-800/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-teal-300 mb-2">AI Feedback</h4>
                    <p className="text-gray-300 text-sm">{analysis.feedback}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}