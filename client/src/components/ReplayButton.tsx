import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useAudioRecording } from "../context/AudioRecordingContext";

export default function ReplayButton() {
  const { isPlaying, audioBlob, playRecording, pausePlayback } = useAudioRecording();

  const handleTogglePlayback = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      playRecording();
    }
  };

  if (!audioBlob) return null;

  return (
    <Button
      onClick={handleTogglePlayback}
      variant="outline"
      className="border-blue-500 text-blue-500 hover:bg-blue-50"
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