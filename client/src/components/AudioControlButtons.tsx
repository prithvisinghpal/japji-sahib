import { Button } from "@/components/ui/button";
import { Mic, Square, Pause, Play } from "lucide-react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function AudioControlButtons() {
  // Get toast for notifications
  const { toast } = useToast();
  
  // Get audio recorder state and functions
  const {
    isRecording,
    isPaused,
    error: recorderError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  // Get speech recognition state and functions
  const { 
    isListening, 
    error: recognitionError,
    transcript,
    startSpeechRecognition, 
    stopSpeechRecognition 
  } = useSpeechRecognition();
  
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

  // Handle start recording
  const handleStartRecording = async () => {
    console.log("Starting recording and speech recognition");
    try {
      await startRecording();
      
      // Small delay to ensure audio recording is initialized
      setTimeout(() => {
        startSpeechRecognition();
        console.log("🎤 Speech recognition initialized");
        
        toast({
          title: "Recitation Started",
          description: "Your recitation is now being recorded and analyzed.",
        });
      }, 500);
    } catch (err) {
      console.error("Error starting recitation:", err);
      toast({
        title: "Error Starting Recitation",
        description: "There was a problem starting your recitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle stop recording
  const handleStopRecording = () => {
    console.log("Stopping recording and speech recognition");
    stopRecording();
    stopSpeechRecognition();
    
    toast({
      title: "Recitation Stopped",
      description: "Your recitation has been processed.",
    });
  };

  // Handle pause recording
  const handlePauseRecording = () => {
    console.log("Pausing recording and speech recognition");
    pauseRecording();
    stopSpeechRecognition();
    
    toast({
      title: "Recitation Paused",
      description: "You can resume your recitation at any time.",
    });
  };

  // Handle resume recording
  const handleResumeRecording = () => {
    console.log("Resuming recording and speech recognition");
    resumeRecording();
    
    // Small delay to ensure audio recording is resumed
    setTimeout(() => {
      startSpeechRecognition();
      
      toast({
        title: "Recitation Resumed",
        description: "Continue your recitation from where you left off.",
      });
    }, 500);
  };

  return (
    <div className="flex justify-center gap-2 my-4">
      {!isRecording ? (
        <Button
          onClick={handleStartRecording}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Mic className="mr-2 h-4 w-4" />
          Start Recitation
        </Button>
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