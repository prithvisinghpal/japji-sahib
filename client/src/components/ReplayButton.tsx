import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useAudioRecording } from "../context/AudioRecordingContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function ReplayButton() {
  const { 
    isPlaying, 
    audioBlob, 
    recordedText,
    playRecording, 
    pausePlayback 
  } = useAudioRecording();
  
  const { toast } = useToast();

  // Show a toast when playback starts
  useEffect(() => {
    if (isPlaying) {
      toast({
        title: "Playback Started",
        description: "Your recording is being played back. The text will be analyzed as it plays.",
        duration: 3000, // Keep the toast visible longer
      });
    }
  }, [isPlaying, toast]);

  const handleTogglePlayback = () => {
    if (isPlaying) {
      pausePlayback();
      toast({
        title: "Playback Paused",
        description: "You can resume playback at any time.",
        duration: 3000,
      });
    } else {
      if (recordedText) {
        console.log("Starting playback with recorded text:", recordedText.substring(0, 50) + "...");
      }
      playRecording();
    }
  };

  if (!audioBlob) return null;

  return (
    <Button
      onClick={handleTogglePlayback}
      variant="outline"
      className={isPlaying 
        ? "border-amber-500 text-amber-500 hover:bg-amber-50"
        : "border-blue-500 text-blue-500 hover:bg-blue-50"
      }
    >
      {isPlaying ? (
        <>
          <Pause className="mr-2 h-4 w-4" />
          Pause Playback
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          Replay Recording
        </>
      )}
    </Button>
  );
}