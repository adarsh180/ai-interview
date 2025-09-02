'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader, Target, TrendingUp, Award, Code, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ResumeUploadProps {
  onUploadSuccess: () => void;
}

interface FitScoreData {
  score: number;
  breakdown?: {
    skills_match?: number;
    experience_match?: number;
    education_match?: number;
    projects_match?: number;
  };
  gaps?: string[];
  suggestions?: string[];
  strengths?: string[];
}

interface AnalysisResults {
  success: boolean;
  resumeId: number;
  parsedData: any;
  fitScores: Record<string, FitScoreData>;
  message: string;
}

interface JobAnalysisConfig {
  role: string;
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
  yearsOfExperience: number;
  company?: string;
  specificRequirements?: string[];
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobConfigs, setJobConfigs] = useState<JobAnalysisConfig[]>([
    { role: 'Software Engineer', experienceLevel: 'mid', yearsOfExperience: 2 }
  ]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Validate job configurations
    const validConfigs = jobConfigs.filter(config => config.role.trim().length > 0);
    if (validConfigs.length === 0) {
      toast.error('Please configure at least one job role');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('jobConfigs', JSON.stringify(validConfigs));

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Resume analyzed successfully!');
        setResults(data);
        setShowResults(true);
        onUploadSuccess();
      } else {
        const errorMessage = data.error || 'Upload failed';
        toast.error(errorMessage);
        console.error('Upload error:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const addJobConfig = () => {
    setJobConfigs([...jobConfigs, { role: '', experienceLevel: 'mid', yearsOfExperience: 2, company: '' }]);
  };

  const updateJobConfig = (index: number, field: keyof JobAnalysisConfig, value: any) => {
    const updated = [...jobConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setJobConfigs(updated);
  };

  const removeJobConfig = (index: number) => {
    setJobConfigs(jobConfigs.filter((_, i) => i !== index));
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm('Are you sure you want to delete this resume analysis? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/resume/delete?id=${resumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Resume analysis deleted successfully');
        setShowResults(false);
        setResults(null);
        setSelectedFile(null);
        onUploadSuccess(); // Refresh the resume list
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete resume analysis');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const generatePDF = () => {
    if (!results) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .role-section { border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
            .score { font-size: 24px; font-weight: bold; color: #0891b2; }
            .breakdown { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 15px 0; }
            .breakdown-item { text-align: center; padding: 10px; background: #f9fafb; border-radius: 6px; }
            .strengths { background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 10px 0; }
            .gaps { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 10px 0; }
            .suggestions { background: #eff6ff; padding: 15px; border-radius: 6px; margin: 10px 0; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 5px 0; }
            .candidate-info { background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Resume Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section candidate-info">
            <h2>Candidate Information</h2>
            <p><strong>Name:</strong> ${results.parsedData?.name || 'Not specified'}</p>
            <p><strong>Email:</strong> ${results.parsedData?.email || 'Not specified'}</p>
            <p><strong>Skills:</strong> ${results.parsedData?.skills?.join(', ') || 'Not specified'}</p>
          </div>

          ${Object.entries(results.fitScores).map(([role, scoreData]: [string, any]) => `
            <div class="role-section">
              <h2>${role}</h2>
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="score">${scoreData.score}% Overall Fit</span>
              </div>
              
              <div class="breakdown">
                <div class="breakdown-item">
                  <strong>Skills</strong><br>
                  <span style="font-size: 18px; color: ${scoreData.breakdown?.skills_match >= 70 ? '#22c55e' : scoreData.breakdown?.skills_match >= 50 ? '#eab308' : '#ef4444'}">
                    ${scoreData.breakdown?.skills_match || 0}%
                  </span>
                </div>
                <div class="breakdown-item">
                  <strong>Experience</strong><br>
                  <span style="font-size: 18px; color: ${scoreData.breakdown?.experience_match >= 70 ? '#22c55e' : scoreData.breakdown?.experience_match >= 50 ? '#eab308' : '#ef4444'}">
                    ${scoreData.breakdown?.experience_match || 0}%
                  </span>
                </div>
                <div class="breakdown-item">
                  <strong>Education</strong><br>
                  <span style="font-size: 18px; color: ${scoreData.breakdown?.education_match >= 70 ? '#22c55e' : scoreData.breakdown?.education_match >= 50 ? '#eab308' : '#ef4444'}">
                    ${scoreData.breakdown?.education_match || 0}%
                  </span>
                </div>
                <div class="breakdown-item">
                  <strong>Projects</strong><br>
                  <span style="font-size: 18px; color: ${scoreData.breakdown?.projects_match >= 70 ? '#22c55e' : scoreData.breakdown?.projects_match >= 50 ? '#eab308' : '#ef4444'}">
                    ${scoreData.breakdown?.projects_match || 0}%
                  </span>
                </div>
              </div>

              ${scoreData.strengths?.length > 0 ? `
                <div class="strengths">
                  <h3>Key Strengths</h3>
                  <ul>
                    ${scoreData.strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${scoreData.gaps?.length > 0 ? `
                <div class="gaps">
                  <h3>Areas for Improvement</h3>
                  <ul>
                    ${scoreData.gaps.map((gap: string) => `<li>${gap}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${scoreData.suggestions?.length > 0 ? `
                <div class="suggestions">
                  <h3>Recommendations</h3>
                  <ul>
                    ${scoreData.suggestions.map((suggestion: string) => `<li>${suggestion}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (showResults && results) {
    return (
      <div className="space-y-6">
        <div className="card-glow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Resume Analysis Results</h3>
            <div className="text-sm text-gray-400">
              Analyzed: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Parsed Resume Data Summary */}
          {results.parsedData && (
            <div className="mb-6 p-4 bg-navy-800/30 rounded-lg border border-teal-400/20">
              <h4 className="text-lg font-medium text-white mb-3">Extracted Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white ml-2">{results.parsedData.name || 'Not found'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2">{results.parsedData.email || 'Not found'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white ml-2">{results.parsedData.phone || 'Not found'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Skills Found:</span>
                  <span className="text-white ml-2">{results.parsedData.skills?.length || 0}</span>
                </div>
              </div>
              {results.parsedData.skills && results.parsedData.skills.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Top Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.parsedData.skills.slice(0, 8).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-teal-400/20 text-teal-300 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Job Role Analysis */}
          {Object.entries(results.fitScores).map(([role, scoreData]: [string, FitScoreData]) => (
            <div key={role} className="mb-6 p-6 bg-navy-800/50 rounded-lg border border-white/10 glassmorphism-card">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-medium text-white">{role}</h4>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    scoreData.score >= 80 ? 'text-green-400' :
                    scoreData.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {scoreData.score}%
                  </div>
                  <div className="text-xs text-gray-400">Overall Fit</div>
                </div>
              </div>
              
              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <Target className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Skills</div>
                  <div className={`text-lg font-bold ${
                    (scoreData.breakdown?.skills_match || 0) >= 70 ? 'text-green-400' :
                    (scoreData.breakdown?.skills_match || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {scoreData.breakdown?.skills_match || 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Experience</div>
                  <div className={`text-lg font-bold ${
                    (scoreData.breakdown?.experience_match || 0) >= 70 ? 'text-green-400' :
                    (scoreData.breakdown?.experience_match || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {scoreData.breakdown?.experience_match || 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Education</div>
                  <div className={`text-lg font-bold ${
                    (scoreData.breakdown?.education_match || 0) >= 70 ? 'text-green-400' :
                    (scoreData.breakdown?.education_match || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {scoreData.breakdown?.education_match || 0}%
                  </div>
                </div>
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <Code className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Projects</div>
                  <div className={`text-lg font-bold ${
                    (scoreData.breakdown?.projects_match || 0) >= 70 ? 'text-green-400' :
                    (scoreData.breakdown?.projects_match || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {scoreData.breakdown?.projects_match || 0}%
                  </div>
                </div>
              </div>
              
              {/* Strengths */}
              {scoreData.strengths && scoreData.strengths.length > 0 && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h5 className="text-lg font-medium text-green-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Key Strengths
                  </h5>
                  <ul className="space-y-2">
                    {scoreData.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Areas to Improve */}
              {scoreData.gaps && scoreData.gaps.length > 0 && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h5 className="text-lg font-medium text-red-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Areas to Improve
                  </h5>
                  <ul className="space-y-2">
                    {scoreData.gaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Suggestions */}
              {scoreData.suggestions && scoreData.suggestions.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h5 className="text-lg font-medium text-green-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {scoreData.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowResults(false);
                setSelectedFile(null);
                setResults(null);
              }}
              className="btn-glow flex-1 min-w-[200px]"
            >
              Upload Another Resume
            </button>
            <button
              onClick={generatePDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            {results?.resumeId && (
              <button
                onClick={() => handleDelete(results.resumeId)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleting ? 'Deleting...' : 'Delete Analysis'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-glow p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Job Analysis Configuration</h3>
        <div className="space-y-6 mb-4">
          {jobConfigs.map((config, index) => (
            <div key={index} className="p-4 bg-navy-800/50 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Role</label>
                  <input
                    type="text"
                    value={config.role}
                    onChange={(e) => updateJobConfig(index, 'role', e.target.value)}
                    placeholder="e.g., Software Engineer, Data Scientist"
                    className="w-full bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-teal-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={config.company || ''}
                    onChange={(e) => updateJobConfig(index, 'company', e.target.value)}
                    placeholder="e.g., Google, Microsoft, Startup"
                    className="w-full bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-teal-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                  <select
                    value={config.experienceLevel}
                    onChange={(e) => updateJobConfig(index, 'experienceLevel', e.target.value)}
                    className="w-full bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-teal-400 focus:outline-none"
                  >
                    <option value="fresher">Fresher (0-1 years)</option>
                    <option value="junior">Junior (1-3 years)</option>
                    <option value="mid">Mid-level (3-5 years)</option>
                    <option value="senior">Senior (5-8 years)</option>
                    <option value="lead">Lead/Principal (8+ years)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={config.yearsOfExperience}
                    onChange={(e) => updateJobConfig(index, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                    className="w-full bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:border-teal-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  {jobConfigs.length > 1 && (
                    <button
                      onClick={() => removeJobConfig(index)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Specific Requirements (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., React, Python, Machine Learning, AWS"
                  onChange={(e) => {
                    const requirements = e.target.value.split(',').map(req => req.trim()).filter(req => req);
                    updateJobConfig(index, 'specificRequirements', requirements);
                  }}
                  className="w-full bg-navy-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-teal-400 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated list of specific skills or technologies</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addJobConfig}
          className="text-teal-400 hover:text-teal-300 text-sm flex items-center space-x-2"
        >
          <span>+ Add Another Job Configuration</span>
        </button>
      </div>
      
      <div className="card-glow p-6">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-teal-400 bg-navy-800'
              : 'border-gray-600 hover:border-teal-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">
            {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
          </h3>
          <p className="text-gray-300 mb-4">
            Drag and drop your PDF resume, or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Supports PDF files up to 10MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-navy-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-teal-400" />
              <div>
                <p className="font-medium text-gray-100">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Upload & Analyze</span>
              )}
            </button>
            <button
              onClick={() => setSelectedFile(null)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}