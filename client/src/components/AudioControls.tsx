import { Button } from "./ui/button";
import { Mic, Pause } from "lucide-react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useEffect, useState } from "react";

export default function AudioControls() {
  const { 
    isRecording, 
    startRecording, 
    stopRecording,
    pauseRecording,
    resumeRecording,
    audioBlob
  } = useAudioRecorder();
  
  const {
    recognition,
    startSpeechRecognition,
    stopSpeechRecognition,
    isPaused,
    togglePause
  } = useSpeechRecognition();
  
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(50).fill(10));
  
  // Animate waveform when recording
  useEffect(() => {
    let animationId: number;
    
    const animateWaveform = () => {
      if (isRecording && !isPaused) {
        setWaveformBars(waveformBars.map(() => Math.floor(Math.random() * 40) + 5));
        animationId = requestAnimationFrame(animateWaveform);
      }
    };
    
    if (isRecording && !isPaused) {
      animationId = requestAnimationFrame(animateWaveform);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRecording, isPaused, waveformBars]);
  
  // Start/stop speech recognition with recording
  useEffect(() => {
    if (isRecording && !isPaused && recognition) {
      startSpeechRecognition();
    } else if (!isRecording && recognition) {
      stopSpeechRecognition();
    }
  }, [isRecording, isPaused, recognition, startSpeechRecognition, stopSpeechRecognition]);
  
  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const handlePauseToggle = () => {
    if (isRecording) {
      togglePause();
      
      // Only need to pause recording explicitly - resuming is handled by togglePause
      if (!isPaused) {
        pauseRecording();
      }
      // The pauseRecording/resumeRecording happens in speech recognition via togglePause
    }
  };
  
  return (
    <div className="border-t pt-4">
      <div className="relative h-[60px] w-full bg-slate-100 overflow-hidden rounded-lg mb-4">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center" id="waveform">
          {waveformBars.map((height, index) => (
            <div 
              key={index} 
              className="w-[3px] mx-[2px] bg-primary rounded-[1px] transition-all duration-200" 
              style={{ height: `${height}px` }}
            ></div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">
            {isRecording && !isPaused && (
              <>
                <span className="inline-block w-2 h-2 bg-[#EF4444] rounded-full mr-1"></span>
                Recording in progress...
              </>
            )}
            {isRecording && isPaused && (
              <>
                <span className="inline-block w-2 h-2 bg-[#F59E0B] rounded-full mr-1"></span>
                Recording paused
              </>
            )}
            {!isRecording && (
              <>
                <span className="inline-block w-2 h-2 bg-slate-500 rounded-full mr-1"></span>
                Ready to record
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            disabled={!isRecording}
            onClick={handlePauseToggle}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            <Pause className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleRecordToggle}
            className={`p-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-primary'} text-white hover:bg-primary-dark transition-colors flex items-center justify-center`}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Styles moved to inline styles */}
    </div>
  );
}
