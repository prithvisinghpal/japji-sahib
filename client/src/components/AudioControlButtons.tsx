import { Button } from "@/components/ui/button";
import { Mic, Square, Pause, Play } from "lucide-react";
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
  
  // Get audio recorder state and functions
  const {
    isRecording,
    isPaused,
    error: recorderError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    setRecordedText,
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
      // Process the transcript for visualization
      processRecognizedText(newTranscript);
      
      // Save the transcript in the audio recording context for replay
      setRecordedText(newTranscript);
    }, [processRecognizedText, setRecordedText])
  });
  
  // Display any errors as toast notifications
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
  
  // Log when transcript changes
  useEffect(() => {
    if (transcript) {
      console.log("🎤 Current speech transcript:", transcript);
    }
  }, [transcript]);
  
  // Handle start recording with debounce
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

  const { isPlaying, playRecording, pausePlayback, audioBlob } = useAudioRecording();

  return (
    <div className="flex justify-center gap-2 my-4">
      {!isRecording ? (
        <>
          <Button
            onClick={handleStartRecording}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Mic className="mr-2 h-4 w-4" />
            Start Recitation
          </Button>
          {audioBlob && <ReplayButton />}
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
  );
}