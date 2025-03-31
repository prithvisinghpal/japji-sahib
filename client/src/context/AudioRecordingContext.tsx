import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

type AudioRecordingContextType = {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  playRecording: () => void;
  pausePlayback: () => void;
};

const AudioRecordingContext = createContext<AudioRecordingContextType | undefined>(undefined);

export function AudioRecordingProvider({ children }: { children: React.ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for playback
  if (typeof window !== 'undefined' && !audioElementRef.current) {
    audioElementRef.current = new Audio();
    
    // Add event listener to update UI when playback ends
    audioElementRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });
  }

  const startRecording = useCallback(async () => {
    try {
      // Reset state
      setError(null);
      audioChunksRef.current = [];

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create new MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers for data and errors
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Create URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Update audio element source
        if (audioElementRef.current) {
          audioElementRef.current.src = url;
        }
        
        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Update state
        setIsRecording(false);
        setIsPaused(false);
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data in 100ms chunks
      setIsRecording(true);
      
      // Log the state change
      console.log("Waveform state changed:", { isRecording: true, isPaused: false });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown recording error';
      setError(errorMessage);
      console.error('Error starting recording:', errorMessage);
    }
  }, []);

  const stopRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        
        // Update state
        setIsRecording(false);
        setIsPaused(false);
        console.log("Waveform state changed:", { isRecording: false, isPaused: false });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error stopping recording';
      setError(errorMessage);
      console.error('Error stopping recording:', errorMessage);
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current && isRecording && !isPaused) {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        console.log("Waveform state changed:", { isRecording: true, isPaused: true });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error pausing recording';
      setError(errorMessage);
      console.error('Error pausing recording:', errorMessage);
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current && isRecording && isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        console.log("Waveform state changed:", { isRecording: true, isPaused: false });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error resuming recording';
      setError(errorMessage);
      console.error('Error resuming recording:', errorMessage);
    }
  }, [isRecording, isPaused]);

  const playRecording = useCallback(() => {
    try {
      if (audioElementRef.current && audioUrl) {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error playing recording';
      setError(errorMessage);
      console.error('Error playing recording:', errorMessage);
    }
  }, [audioUrl]);

  const pausePlayback = useCallback(() => {
    try {
      if (audioElementRef.current && isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error pausing playback';
      setError(errorMessage);
      console.error('Error pausing playback:', errorMessage);
    }
  }, [isPlaying]);

  const value = {
    isRecording,
    isPaused,
    isPlaying,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playRecording,
    pausePlayback,
  };

  return (
    <AudioRecordingContext.Provider value={value}>
      {children}
    </AudioRecordingContext.Provider>
  );
}

export function useAudioRecording() {
  const context = useContext(AudioRecordingContext);
  if (context === undefined) {
    throw new Error('useAudioRecording must be used within an AudioRecordingProvider');
  }
  return context;
}