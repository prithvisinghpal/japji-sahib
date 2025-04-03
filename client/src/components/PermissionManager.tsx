import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Mic, Volume2, VolumeX, MicOff, X } from 'lucide-react';

export default function PermissionManager() {
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Check microphone permission status
  useEffect(() => {
    async function checkMicPermission() {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          // Modern browsers support this API
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
          });
        } else {
          // Fallback to a simpler check for older browsers
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => setMicPermission('granted'))
            .catch(() => setMicPermission('denied'));
        }
      } catch (err) {
        console.error('Error checking microphone permission:', err);
        setMicPermission('unknown');
      }
    }
    
    checkMicPermission();
  }, []);

  // Request microphone permission
  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      setMicPermission('denied');
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);

    // Mute/unmute all audio elements on the page
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = !audioEnabled;
    });
  };

  // Hide the panel
  const hidePanel = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        size="sm"
        className="fixed bottom-2 right-2 z-50 bg-gray-900 hover:bg-gray-800"
      >
        Show Permissions
      </Button>
    );
  }

  return (
    <div className="fixed bottom-2 right-2 bg-gray-900 text-white p-2 rounded-lg shadow-lg z-50 text-sm flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Permission Settings</span>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={hidePanel}
        >
          <X size={14} />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span>Speech:</span>
        {micPermission === 'granted' ? (
          <div className="flex items-center">
            <Mic className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">ON</span>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            className="py-0 h-6 border-red-500 text-red-500 hover:bg-red-900/20"
            onClick={requestMicPermission}
          >
            <MicOff className="h-4 w-4 mr-1" />
            OFF
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span>Audio:</span>
        <Button 
          size="sm" 
          variant="outline" 
          className={`py-0 h-6 ${audioEnabled 
            ? 'border-green-500 text-green-500 hover:bg-green-900/20' 
            : 'border-red-500 text-red-500 hover:bg-red-900/20'}`}
          onClick={toggleAudio}
        >
          {audioEnabled ? (
            <>
              <Volume2 className="h-4 w-4 mr-1" />
              ON
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 mr-1" />
              OFF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}