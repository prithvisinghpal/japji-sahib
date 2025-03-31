import { useState, useRef, useEffect } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio recorder when component mounts
  useEffect(() => {
    // Clean up media stream on unmount
    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start recording
  const startRecording = async () => {
    console.log('startRecording called');
    try {
      // Reset any previous errors
      setError(null);
      
      // Get media stream if we don't already have one
      if (!stream.current) {
        console.log('Getting user media...');
        stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('User media obtained successfully');
      }
      
      // Reset audio chunks
      audioChunks.current = [];
      
      // Create media recorder
      console.log('Creating MediaRecorder...');
      mediaRecorder.current = new MediaRecorder(stream.current);
      console.log('MediaRecorder created with state:', mediaRecorder.current.state);
      
      // Handle data available event
      mediaRecorder.current.ondataavailable = (event) => {
        console.log('Data available event, size:', event.data.size);
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.current.onstop = () => {
        console.log('Recording stopped, creating audio blob');
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Create URL for the audio blob
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Create audio element for playback
        if (!audioElement.current) {
          audioElement.current = new Audio(url);
          audioElement.current.onended = () => {
            setIsPlaying(false);
          };
        } else {
          audioElement.current.src = url;
        }
      };
      
      // Start recording
      console.log('Starting MediaRecorder...');
      mediaRecorder.current.start();
      console.log('MediaRecorder started with state:', mediaRecorder.current.state);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please ensure you have granted microphone permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    console.log('stopRecording called, current state:', mediaRecorder.current?.state);
    if (mediaRecorder.current && isRecording) {
      try {
        mediaRecorder.current.stop();
        setIsRecording(false);
        setIsPaused(false);
        
        // Stop all tracks in the stream to fully release the microphone
        if (stream.current) {
          stream.current.getTracks().forEach(track => track.stop());
          stream.current = null;
        }
      } catch (err) {
        console.error('Error stopping recording:', err);
        setError('Failed to stop recording properly. Please reload the page if issues persist.');
        // Force state reset in case of error
        setIsRecording(false);
        setIsPaused(false);
      }
    } else {
      console.warn('Cannot stop: MediaRecorder not recording or not initialized');
    }
  };
  
  // Pause recording
  const pauseRecording = () => {
    console.log('pauseRecording called, current state:', mediaRecorder.current?.state);
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'recording') {
      try {
        mediaRecorder.current.pause();
        setIsPaused(true);
      } catch (err) {
        console.error('Error pausing recording:', err);
        setError('Failed to pause recording. Please try again.');
      }
    } else {
      console.warn('Cannot pause: MediaRecorder not in recording state or not initialized');
    }
  };
  
  // Resume recording
  const resumeRecording = () => {
    console.log('resumeRecording called, current state:', mediaRecorder.current?.state);
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'paused') {
      try {
        mediaRecorder.current.resume();
        setIsPaused(false);
      } catch (err) {
        console.error('Error resuming recording:', err);
        setError('Failed to resume recording. Please try again.');
      }
    } else {
      console.warn('Cannot resume: MediaRecorder not in paused state or not initialized');
    }
  };
  
  // Play the recorded audio
  const playRecording = () => {
    if (audioElement.current && audioUrl) {
      try {
        audioElement.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Error playing audio:', err);
        setError('Failed to play audio recording. Please try again.');
      }
    }
  };
  
  // Pause audio playback
  const pausePlayback = () => {
    if (audioElement.current && isPlaying) {
      try {
        audioElement.current.pause();
        setIsPlaying(false);
      } catch (err) {
        console.error('Error pausing audio playback:', err);
      }
    }
  };
  
  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  return {
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
    pausePlayback
  };
}
