import { useState, useRef, useEffect } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const stream = useRef<MediaStream | null>(null);
  
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
      };
      
      // Start recording
      console.log('Starting MediaRecorder...');
      mediaRecorder.current.start();
      console.log('MediaRecorder started with state:', mediaRecorder.current.state);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please ensure you have granted microphone permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };
  
  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'recording') {
      try {
        mediaRecorder.current.pause();
      } catch (err) {
        console.error('Error pausing recording:', err);
      }
    }
  };
  
  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorder.current && isRecording && mediaRecorder.current.state === 'paused') {
      try {
        mediaRecorder.current.resume();
      } catch (err) {
        console.error('Error resuming recording:', err);
      }
    }
  };
  
  return {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
}
