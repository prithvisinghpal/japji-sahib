import { useState, useRef, useEffect, useCallback } from "react";
import { useRecitation } from "./useRecitation";
import { useSettings } from "@/context/SettingsContext";

interface SpeechRecognitionInstance extends EventTarget {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
  onend: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { processRecognizedText } = useRecitation();
  const { settings } = useSettings();
  
  const recognition = useRef<SpeechRecognitionInstance | null>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      
      // Configure recognition
      recognition.current.continuous = true;
      recognition.current.interimResults = settings.realtimeFeedback;
      recognition.current.lang = 'pa-IN'; // Punjabi language
      recognition.current.maxAlternatives = 1;
      
      // Add event handlers
      recognition.current.onresult = handleRecognitionResult;
      recognition.current.onerror = handleRecognitionError;
      recognition.current.onend = handleRecognitionEnd;
    } else {
      setError("Speech recognition is not supported in this browser. Please try using Chrome, Edge, or Safari.");
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [settings.realtimeFeedback]);
  
  // Handle recognition result
  const handleRecognitionResult = useCallback((event: any) => {
    const resultIndex = event.resultIndex;
    const transcript = event.results[resultIndex][0].transcript;
    
    // Update transcript
    setTranscript(prevTranscript => {
      const newTranscript = prevTranscript + ' ' + transcript;
      
      // Process the recognized text if real-time feedback is enabled
      if (settings.realtimeFeedback) {
        processRecognizedText(newTranscript);
      }
      
      return newTranscript;
    });
  }, [processRecognizedText, settings.realtimeFeedback]);
  
  // Handle recognition error
  const handleRecognitionError = useCallback((event: any) => {
    console.error('Speech recognition error:', event.error);
    
    let errorMessage = "There was an error with speech recognition. ";
    
    switch (event.error) {
      case 'no-speech':
        errorMessage += "No speech was detected. Please try speaking again.";
        break;
      case 'audio-capture':
        errorMessage += "No microphone was found. Please ensure your microphone is connected and enabled.";
        break;
      case 'not-allowed':
        errorMessage += "Microphone permission was denied. Please enable microphone access.";
        break;
      case 'network':
        errorMessage += "Network error occurred. Please check your internet connection.";
        break;
      default:
        errorMessage += "Please try again.";
    }
    
    setError(errorMessage);
  }, []);
  
  // Handle recognition end
  const handleRecognitionEnd = useCallback(() => {
    if (isListening && !isPaused) {
      // Auto restart if listening and not paused
      if (recognition.current) {
        recognition.current.start();
      }
    } else {
      setIsListening(false);
      
      // Process the final transcript
      if (!settings.realtimeFeedback && transcript) {
        processRecognizedText(transcript);
      }
    }
  }, [isListening, isPaused, transcript, processRecognizedText, settings.realtimeFeedback]);
  
  // Start recognition
  const startSpeechRecognition = useCallback(() => {
    setError(null);
    setTranscript("");
    
    if (recognition.current) {
      try {
        recognition.current.start();
        setIsListening(true);
        setIsPaused(false);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start speech recognition. Please try again.');
      }
    }
  }, []);
  
  // Stop recognition
  const stopSpeechRecognition = useCallback(() => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
      
      // Process the final transcript if not done in real-time
      if (!settings.realtimeFeedback && transcript) {
        processRecognizedText(transcript);
      }
    }
  }, [isListening, transcript, processRecognizedText, settings.realtimeFeedback]);
  
  // Toggle pause/resume
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    
    if (recognition.current && isListening) {
      if (!isPaused) {
        // Pause recognition
        recognition.current.stop();
      } else {
        // Resume recognition
        try {
          recognition.current.start();
        } catch (err) {
          console.error('Error resuming speech recognition:', err);
        }
      }
    }
  }, [isListening, isPaused]);
  
  return {
    recognition: recognition.current,
    isListening,
    isPaused,
    transcript,
    error,
    startSpeechRecognition,
    stopSpeechRecognition,
    togglePause
  };
}
