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
    try {
      // Reset any previous errors
      setError(null);
      
      // Get media stream if we don't already have one
      if (!stream.current) {
        stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      // Reset audio chunks
      audioChunks.current = [];
      
      // Create media recorder
      mediaRecorder.current = new MediaRecorder(stream.current);
      
      // Handle data available event
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };
      
      // Start recording
      mediaRecorder.current.start();
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
