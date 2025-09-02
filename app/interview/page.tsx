'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, X, Play, Flag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AIBot from '@/components/AIBot';
import ProctoringMonitor from '@/components/ProctoringMonitor';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'medium' | 'hard';
  category: string;
}

interface TestResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: { [key: number]: number };
}

export default function InterviewPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [loading, setLoading] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const router = useRouter();

  const roles = [
    'Software Engineer',
    'Frontend Developer', 
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'System Architect'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeLeft]);

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
    }
  };

  const generateQuestions = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, count: 35 }),
      });

      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
        setTestStarted(true);
        toast.success('Test started! Good luck!');
      } else {
        toast.error(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          questions,
          answers,
          timeSpent: 3600 - timeLeft
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
        setTestCompleted(true);
        toast.success('Test submitted successfully!');
      } else {
        toast.error(data.error || 'Failed to submit test');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
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
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-100">
                AI Interview Assessment
              </h1>
            </div>
            {testStarted && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-teal-400">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!testStarted && !testCompleted ? (
          /* Role Selection */
          <div className="max-w-2xl mx-auto">
            <div className="card-glow p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Choose Your Role
              </h2>
              <p className="text-gray-300 mb-8">
                Select the role you want to be assessed for. The test will include 35 questions covering technical knowledge, problem-solving, and coding concepts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedRole === role
                        ? 'border-teal-400 bg-teal-400/10 text-white'
                        : 'border-gray-600 hover:border-teal-400/50 text-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4 mb-8">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-yellow-300 mb-2">Test Guidelines:</h3>
                    <ul className="text-sm text-yellow-200 space-y-1">
                      <li>• 35 questions (Medium to Hard difficulty)</li>
                      <li>• 60 minutes time limit</li>
                      <li>• Proctoring enabled (tab switching monitored)</li>
                      <li>• Questions cover technical concepts and coding logic</li>
                      <li>• Results available immediately after submission</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={generateQuestions}
                disabled={!selectedRole || loading}
                className="btn-glow disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>{loading ? 'Generating Questions...' : 'Start Assessment'}</span>
              </button>
            </div>
          </div>
        ) : testStarted && !testCompleted ? (
          /* Test Interface */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Question Panel */}
            <div className="lg:col-span-3">
              <div className="card-glow p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      questions[currentQuestion]?.difficulty === 'hard' 
                        ? 'bg-red-900/30 text-red-300' 
                        : 'bg-yellow-900/30 text-yellow-300'
                    }`}>
                      {questions[currentQuestion]?.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-teal-900/30 text-teal-300">
                      {questions[currentQuestion]?.category}
                    </span>
                  </div>
                  <button
                    onClick={toggleFlag}
                    className={`p-2 rounded-lg transition-colors ${
                      flaggedQuestions.has(currentQuestion)
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'text-gray-400 hover:text-yellow-400'
                    }`}
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-white mb-8 leading-relaxed">
                  {questions[currentQuestion]?.question}
                </h3>

                <div className="space-y-4 mb-8">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                        answers[currentQuestion] === index
                          ? 'border-teal-400 bg-teal-400/10 text-white'
                          : 'border-gray-600 hover:border-teal-400/50 text-gray-300'
                      }`}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-4">
                    {Object.keys(answers).length > 0 && (
                      <button
                        onClick={submitTest}
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Submitting...' : 'Submit Test'}
                      </button>
                    )}
                    
                    {currentQuestion < questions.length - 1 && (
                      <button
                        onClick={nextQuestion}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Panel */}
            <div className="space-y-6">
              <div className="card-glow p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Progress</h4>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                        index === currentQuestion
                          ? 'bg-teal-400 text-navy-900'
                          : answers[index] !== undefined
                          ? 'bg-green-600 text-white'
                          : flaggedQuestions.has(index)
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Answered: {Object.keys(answers).length}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span>Flagged: {flaggedQuestions.size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-600 rounded"></div>
                    <span>Remaining: {questions.length - Object.keys(answers).length}</span>
                  </div>
                </div>
              </div>

              <ProctoringMonitor sessionId="interview-session" userId={1} />
            </div>
          </div>
        ) : showDetailedResults ? (
          /* Detailed Results */
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Detailed Results</h2>
              <button
                onClick={() => setShowDetailedResults(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Summary
              </button>
            </div>
            
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className="card-glow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-gray-300">
                          Q{index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCorrect 
                            ? 'bg-green-900/30 text-green-400 border border-green-400/30'
                            : 'bg-red-900/30 text-red-400 border border-red-400/30'
                        }`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          question.difficulty === 'hard' 
                            ? 'bg-red-900/30 text-red-300' 
                            : 'bg-yellow-900/30 text-yellow-300'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-white mb-6 leading-relaxed">
                      {question.question}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer === optIndex;
                        const isCorrectAnswer = question.correctAnswer === optIndex;
                        
                        let className = 'p-4 rounded-lg border-2 text-left ';
                        if (isCorrectAnswer) {
                          className += 'border-green-400 bg-green-400/10 text-green-100';
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          className += 'border-red-400 bg-red-400/10 text-red-100';
                        } else {
                          className += 'border-gray-600 bg-gray-800/30 text-gray-300';
                        }
                        
                        return (
                          <div key={optIndex} className={className}>
                            <div className="flex items-center space-x-3">
                              <span className="font-medium">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span>{option}</span>
                              {isCorrectAnswer && (
                                <CheckCircle className="h-5 w-5 text-green-400 ml-auto" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <X className="h-5 w-5 text-red-400 ml-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Explanation
                      </h4>
                      <div className="text-blue-200 text-sm leading-relaxed">
                        <div dangerouslySetInnerHTML={{ 
                          __html: question.explanation.replace(/\n/g, '<br>') 
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-glow"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Results Summary */
          <div className="max-w-4xl mx-auto">
            <div className="card-glow p-8 text-center">
              <div className="mb-8">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Assessment Completed!
                </h2>
                <p className="text-gray-300">
                  Here are your results for the {selectedRole} assessment
                </p>
              </div>

              {results && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-teal-900/20 border border-teal-400/30 rounded-lg p-6">
                    <div className="text-3xl font-bold text-teal-400 mb-2">
                      {Math.round(results.score)}%
                    </div>
                    <div className="text-gray-300">Overall Score</div>
                  </div>
                  <div className="bg-cyan-900/20 border border-cyan-400/30 rounded-lg p-6">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">
                      {results.correctAnswers}/{results.totalQuestions}
                    </div>
                    <div className="text-gray-300">Correct Answers</div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-6">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {formatTime(results.timeSpent)}
                    </div>
                    <div className="text-gray-300">Time Spent</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => setShowDetailedResults(true)}
                  className="btn-glow mr-4"
                >
                  View Detailed Results
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-600 transition-colors mr-4"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Take Another Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Bot - Disabled during test */}
      <AIBot disabled={testStarted && !testCompleted} />
    </div>
  );
}