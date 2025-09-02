'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ProctoringMonitorProps {
  sessionId: string;
  userId: number;
}

export default function ProctoringMonitor({ sessionId, userId }: ProctoringMonitorProps) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  useEffect(() => {
    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        logEvent('tab_switch', { count: tabSwitchCount + 1 });
        
        if (tabSwitchCount >= 2) {
          toast.error('Multiple tab switches detected. Interview may be auto-submitted.');
        } else {
          toast('Tab switch detected. Please stay focused on the interview.', { icon: '⚠️' });
        }
      }
    };

    // Prevent copy/paste
    const preventCopyPaste = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        logEvent('copy_paste_attempt', { key: e.key });
        toast('Copy/paste is disabled during the interview.', { icon: '⚠️' });
      }
    };

    // Detect developer tools
    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        logEvent('devtools_detected', {});
        toast('Developer tools detected. Please close them.', { icon: '⚠️' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', preventCopyPaste);
    
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Request webcam access
    requestWebcamAccess();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', preventCopyPaste);
      clearInterval(devToolsInterval);
    };
  }, [sessionId, userId, tabSwitchCount]);

  const requestWebcamAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      setWebcamEnabled(true);
      logEvent('webcam_enabled', {});
      
      // Take periodic snapshots (every 30 seconds)
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const takeSnapshot = () => {
        if (ctx && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          // Convert to hash for privacy
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hash = simpleHash(imageData.data);
          logEvent('webcam_snapshot', { hash });
        }
      };
      
      const snapshotInterval = setInterval(takeSnapshot, 30000);
      
      // Cleanup on unmount
      return () => {
        clearInterval(snapshotInterval);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.log('Webcam access denied or not available');
      logEvent('webcam_denied', {});
    }
  };

  const logEvent = async (eventType: string, eventData: any) => {
    try {
      await fetch('/api/proctoring/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType,
          eventData,
        }),
      });
    } catch (error) {
      console.error('Failed to log proctoring event:', error);
    }
  };

  const simpleHash = (data: Uint8ClampedArray): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i += 100) { // Sample every 100th pixel for performance
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }
    return hash.toString(36);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-dark-800 border border-dark-700 rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${webcamEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-300">Proctoring Active</span>
        </div>
        {tabSwitchCount > 0 && (
          <div className="text-yellow-400 text-xs mt-1">
            Tab switches: {tabSwitchCount}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple hash function for privacy-preserving image fingerprinting