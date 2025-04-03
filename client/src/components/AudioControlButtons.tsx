import { Button } from "@/components/ui/button";
import { Mic, Square, Pause, Play, RefreshCw } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { useRecitation } from "../hooks/useRecitation";
import { useAudioRecording } from "../context/AudioRecordingContext";
import ReplayButton from "./ReplayButton";

export default function AudioControlButtons() {
  // Get toast for notifications
  const { toast } = useToast();
  
  // Track button state to prevent multiple clicks
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get recitation processor
  const { restartRecitation, processRecognizedText } = useRecitation();
  
  // Get all audio recording state and functions
  const {
    isRecording,
    isPaused,
    isPlaying,
    audioBlob,
    audioUrl,
    error: recorderError,
    recordedText,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playRecording,
    pausePlayback,
    setRecordedText,
    resetRecording,
  } = useAudioRecording();

  // Get speech recognition state and functions
  const { 
    isListening, 
    isPaused: speechIsPaused,
    error: recognitionError,
    transcript,
    startSpeechRecognition, 
    stopSpeechRecognition,
    togglePause 
  } = useSpeechRecognition({
    onTranscriptChange: useCallback((newTranscript: string) => {
      console.log("🎯 Transcript change detected, forwarding to recitation processor");
      if (newTranscript && newTranscript.trim() !== '') {
        // Process the transcript for visualization
        console.log("🎯 FULL TRANSCRIPT:", newTranscript);
        
        // Strip any non-Gurmukhi characters that might have been incorrectly recognized
        // This helps with better matching against the reference text
        const cleanedTranscript = newTranscript
          .replace(/[a-zA-Z0-9]/g, '') // Remove Latin characters and numbers
          .replace(/[^\u0A00-\u0A7F\s]/g, '') // Keep only Gurmukhi characters and spaces
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
          
        console.log("🎯 CLEANED TRANSCRIPT:", cleanedTranscript);
        
        // Only process if we have meaningful Gurmukhi text
        if (cleanedTranscript && cleanedTranscript.length > 1) {
          processRecognizedText(cleanedTranscript);
        
          // Save the transcript in the audio recording context for replay
          setRecordedText(cleanedTranscript);
          
          // Log detailed info for debugging
          console.log("🎯 Text processing pipeline triggered:", {
            originalLength: newTranscript.length,
            cleanedLength: cleanedTranscript.length,
            sample: cleanedTranscript.substring(0, 50) + '...',
            processingTime: new Date().toISOString()
          });
        } else {
          console.log("🎯 Not enough Gurmukhi text detected in transcript, skipping processing");
        }
      }
    }, [processRecognizedText, setRecordedText])
  });
  
  // Handle errors
  useEffect(() => {
    if (recorderError) {
      toast({
        title: "Recording Error",
        description: recorderError,
        variant: "destructive",
      });
    }
  }, [recorderError, toast]);
  
  useEffect(() => {
    if (recognitionError) {
      toast({
        title: "Speech Recognition Error",
        description: recognitionError,
        variant: "destructive",
      });
    }
  }, [recognitionError, toast]);
  
  // Log transcript changes
  useEffect(() => {
    if (transcript) {
      console.log("🎤 Current speech transcript:", transcript);
    }
  }, [transcript]);
  
  // Handle start recording
  const handleStartRecording = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log("Starting recording and speech recognition");
      
      // Reset the recitation state before starting
      restartRecitation();
      
      // Start audio recording
      await startRecording();
      
      // Small delay to ensure audio recording is initialized
      setTimeout(() => {
        startSpeechRecognition();
        console.log("🎤 Speech recognition initialized");
        
        toast({
          title: "Recitation Started",
          description: "Your recitation is now being recorded and analyzed.",
        });
        
        setIsProcessing(false);
      }, 500);
    } catch (err) {
      console.error("Error starting recitation:", err);
      toast({
        title: "Error Starting Recitation",
        description: "There was a problem starting your recitation. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Handle stop recording
  const handleStopRecording = () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log("Stopping recording and speech recognition");
      
      // Stop audio recording
      stopRecording();
      
      // Stop speech recognition
      stopSpeechRecognition();
      
      toast({
        title: "Recitation Stopped",
        description: "Your recitation has been processed.",
      });
      
      setIsProcessing(false);
    } catch (err) {
      console.error("Error stopping recitation:", err);
      toast({
        title: "Error Stopping Recitation",
        description: "There was a problem stopping your recitation.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Handle pause recording
  const handlePauseRecording = () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log("Pausing recording and speech recognition");
      
      // Pause audio recording
      pauseRecording();
      
      // Toggle pause in speech recognition
      togglePause();
      
      toast({
        title: "Recitation Paused",
        description: "You can resume your recitation at any time.",
      });
      
      setIsProcessing(false);
    } catch (err) {
      console.error("Error pausing recitation:", err);
      toast({
        title: "Error Pausing Recitation",
        description: "There was a problem pausing your recitation.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Handle resume recording
  const handleResumeRecording = () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log("Resuming recording and speech recognition");
      
      // Resume audio recording
      resumeRecording();
      
      // Toggle pause in speech recognition to resume
      togglePause();
      
      toast({
        title: "Recitation Resumed",
        description: "Continue your recitation from where you left off.",
      });
      
      setIsProcessing(false);
    } catch (err) {
      console.error("Error resuming recitation:", err);
      toast({
        title: "Error Resuming Recitation",
        description: "There was a problem resuming your recitation.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  // Handle complete restart of the application
  const handleClearAndRestart = () => {
    try {
      console.log("Clearing and restarting everything");
      
      // Stop any ongoing processes
      if (isListening) {
        stopSpeechRecognition();
      }
      
      // Reset the audio recording state (this will handle stopping recording and playback)
      resetRecording();
      
      // Reset the recitation state
      restartRecitation();
      
      toast({
        title: "Reset Complete",
        description: "All recordings and progress have been cleared. You can start fresh now.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error resetting the application:", err);
      toast({
        title: "Error Resetting",
        description: "There was a problem resetting the application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 my-4">
      <div className="flex justify-center gap-2">
        {!isRecording ? (
          <>
            <Button
              onClick={handleStartRecording}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Mic className="mr-2 h-4 w-4" />
              Start Recitation
            </Button>
            
            {audioBlob && (
              <ReplayButton />
            )}
          </>
        ) : (
          <>
            {!isPaused ? (
              <Button
                onClick={handlePauseRecording}
                variant="outline"
                className="border-amber-500 text-amber-500 hover:bg-amber-50"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleResumeRecording}
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
            
            <Button
              onClick={handleStopRecording}
              variant="destructive"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </>
        )}
      </div>
      
      {/* Clear & Restart Button - only show when not recording */}
      {!isRecording && (
        <div className="flex justify-center mt-2">
          <Button
            onClick={handleClearAndRestart}
            variant="outline"
            className="border-gray-400 text-gray-600 hover:bg-gray-50"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear & Restart
          </Button>
        </div>
      )}
    </div>
  );
}