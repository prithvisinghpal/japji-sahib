import { useState, useRef, useEffect } from "react";
import { useRecitation } from "./useRecitation";
import { useSettings } from "../context/SettingsContext";

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
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      setError("Speech recognition is not supported in this browser. Please try using Chrome, Edge, or Safari.");
      return;
    }

    try {
      // Create recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      
      // Configure
      recognition.current.continuous = true;
      recognition.current.interimResults = settings.realtimeFeedback;
      recognition.current.lang = 'pa-IN'; // Punjabi language
      recognition.current.maxAlternatives = 1;
      
      console.log('Speech recognition initialized with settings:', {
        continuous: recognition.current.continuous,
        interimResults: recognition.current.interimResults,
        lang: recognition.current.lang
      });
      
      // Event handlers
      recognition.current.onresult = (event: any) => {
        try {
          if (!event.results || event.resultIndex >= event.results.length) {
            console.error('Invalid speech recognition result event:', event);
            return;
          }
          
          const resultIndex = event.resultIndex;
          const transcript = event.results[resultIndex][0].transcript;
          
          console.log('Recognition result:', transcript);
          
          // Update transcript
          setTranscript(prevTranscript => {
            const newTranscript = prevTranscript + ' ' + transcript;
            
            // Process the recognized text if real-time feedback is enabled
            if (settings.realtimeFeedback) {
              processRecognizedText(newTranscript);
            }
            
            return newTranscript;
          });
        } catch (err) {
          console.error('Error processing speech recognition result:', err);
        }
      };
      
      recognition.current.onerror = (event: any) => {
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
      };
      
      recognition.current.onend = () => {
        if (isListening && !isPaused) {
          // Auto restart if listening and not paused
          try {
            if (recognition.current) {
              recognition.current.start();
              console.log("Speech recognition restarted");
            }
          } catch (err) {
            console.error("Error restarting speech recognition:", err);
            setError("Failed to restart speech recognition. Please try again.");
            setIsListening(false);
          }
        } else {
          setIsListening(false);
          
          // Process the final transcript
          if (!settings.realtimeFeedback && transcript) {
            processRecognizedText(transcript);
          }
        }
      };
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Failed to initialize speech recognition. Please try reloading the page.');
    }
    
    // Clean up on unmount
    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (err) {
          console.error('Error stopping speech recognition on cleanup:', err);
        }
      }
    };
  }, [settings.realtimeFeedback, isListening, isPaused, transcript, processRecognizedText]);
  
  // Start recognition
  const startSpeechRecognition = () => {
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
  };
  
  // Stop recognition
  const stopSpeechRecognition = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
      
      // Process the final transcript if not done in real-time
      if (!settings.realtimeFeedback && transcript) {
        processRecognizedText(transcript);
      }
    }
  };
  
  // Toggle pause/resume
  const togglePause = () => {
    const newIsPaused = !isPaused;
    setIsPaused(newIsPaused);
    
    if (recognition.current && isListening) {
      if (newIsPaused) {
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
  };
  
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