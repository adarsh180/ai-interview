'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const seedDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/problems/seed', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Success! ${data.count} problems added to database.`);
        setTimeout(() => router.push('/coding'), 2000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="card-glow p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Setup Database</h1>
        <p className="text-gray-300 mb-6">
          Click the button below to populate the database with coding problems.
        </p>
        
        <button
          onClick={seedDatabase}
          disabled={loading}
          className="btn-glow disabled:opacity-50 mb-4"
        >
          {loading ? 'Adding Problems...' : 'Seed Database'}
        </button>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('Success') 
              ? 'bg-green-900/30 text-green-300 border border-green-400/30'
              : 'bg-red-900/30 text-red-300 border border-red-400/30'
          }`}>
            {message}
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={() => router.push('/coding')}
            className="text-teal-400 hover:text-teal-300 text-sm"
          >
            Go to Problems →
          </button>
        </div>
      </div>
    </div>
  );
}