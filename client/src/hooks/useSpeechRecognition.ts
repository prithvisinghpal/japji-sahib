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
          console.log('👂 Speech recognition result event received:', event);
          
          if (!event.results || event.results.length === 0) {
            console.error('👂 Invalid speech recognition result event - empty results:', event);
            return;
          }
          
          // Get the results from the event
          let newTranscript = '';
          let finalTranscriptDetected = false;
          
          // Process all results in the event (not just the latest)
          for (let i = 0; i < event.results.length; i++) {
            // Check if this result is final
            if (event.results[i].isFinal) {
              const result = event.results[i][0].transcript;
              console.log(`👂 Final result [${i}]:`, result);
              newTranscript += ' ' + result;
              finalTranscriptDetected = true;
            } else if (settings.realtimeFeedback) {
              // Include interim results only if realtime feedback is enabled
              const result = event.results[i][0].transcript;
              console.log(`👂 Interim result [${i}]:`, result);
              newTranscript += ' ' + result;
            }
          }
          
          if (newTranscript.trim()) {
            console.log('👂 Combined transcript:', newTranscript);
            
            // Update transcript state and process immediately
            const fullTranscript = transcript + ' ' + newTranscript.trim();
            setTranscript(fullTranscript);
            
            console.log('👂 Updated full transcript:', fullTranscript);
            
            // Send transcript for processing on every update
            console.log('👂 Sending transcript for processing...');
            processRecognizedText(fullTranscript);
            
            // If we have a final transcript, also process it separately to ensure it's captured
            if (finalTranscriptDetected && settings.realtimeFeedback) {
              console.log('👂 Final transcript detected, processing separately');
              setTimeout(() => {
                processRecognizedText(fullTranscript);
              }, 500);
            }
          }
        } catch (err) {
          console.error('👂 Error processing speech recognition result:', err);
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
    console.log('startSpeechRecognition called, current state:', { isListening, isPaused });
    setError(null);
    setTranscript("");
    
    if (recognition.current) {
      try {
        console.log('Starting recognition.current.start()');
        recognition.current.start();
        console.log('Recognition started successfully');
        setIsListening(true);
        setIsPaused(false);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start speech recognition. Please try again.');
      }
    } else {
      console.error('Recognition.current is null - speech recognition not initialized properly');
      setError('Speech recognition not initialized. Please reload the page.');
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