import { Button } from "@/components/ui/button";
import { Mic, Square, Pause, Play } from "lucide-react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function AudioControlButtons() {
  // Get audio recorder state and functions
  const {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  // Get speech recognition state and functions
  const { startSpeechRecognition, stopSpeechRecognition } = useSpeechRecognition();

  // Handle start recording
  const handleStartRecording = async () => {
    console.log("Starting recording and speech recognition");
    await startRecording();
    startSpeechRecognition();
  };

  // Handle stop recording
  const handleStopRecording = () => {
    console.log("Stopping recording and speech recognition");
    stopRecording();
    stopSpeechRecognition();
  };

  // Handle pause recording
  const handlePauseRecording = () => {
    console.log("Pausing recording and speech recognition");
    pauseRecording();
    stopSpeechRecognition();
  };

  // Handle resume recording
  const handleResumeRecording = () => {
    console.log("Resuming recording and speech recognition");
    resumeRecording();
    startSpeechRecognition();
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