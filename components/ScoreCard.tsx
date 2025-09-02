'use client';

import { FileText, Target, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface ScoreCardProps {
  resume: {
    id: number;
    filename: string;
    confidence_score: number;
    parsed_data: any;
    created_at: string;
  };
  onDelete?: () => void;
}

export default function ScoreCard({ resume, onDelete }: ScoreCardProps) {
  const [deleting, setDeleting] = useState(false);
  const score = resume.confidence_score || 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-900/30';
    if (score >= 60) return 'bg-yellow-900/30';
    return 'bg-red-900/30';
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume analysis?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/resume/delete?id=${resume.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Resume analysis deleted successfully');
        onDelete?.();
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

  return (
    <div className="card-glow hover:scale-105 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-teal-400" />
          <div>
            <h3 className="font-semibold text-gray-100">{resume.filename}</h3>
            <p className="text-sm text-gray-400">
              {new Date(resume.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full ${getScoreBg(score)}`}>
            <span className={`font-semibold ${getScoreColor(score)}`}>
              {score}% Match
            </span>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            title="Delete analysis"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {resume.parsed_data && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              Skills: {resume.parsed_data.skills?.slice(0, 3).join(', ')}
              {resume.parsed_data.skills?.length > 3 && '...'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              Experience: {resume.parsed_data.experience?.length || 0} positions
            </span>
          </div>

          {score < 70 && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
              <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-300">Improvement Suggestions:</p>
                <p className="text-yellow-200">
                  Consider adding more relevant skills and quantifying your achievements.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <button className="text-teal-400 hover:text-teal-300 text-sm font-medium">
          View Detailed Analysis →
        </button>
      </div>
    </div>
  );
}