import { Button } from "./ui/button";
import { Mic, Pause } from "lucide-react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useEffect, useState, useRef } from "react";

export default function AudioControls() {
  // Local state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(50).fill(10));
  
  // Animation frame reference
  const animationRef = useRef<number | null>(null);
  
  // Hooks
  const { 
    startRecording, 
    stopRecording,
    pauseRecording,
    resumeRecording
  } = useAudioRecorder();
  
  const {
    startSpeechRecognition,
    stopSpeechRecognition
  } = useSpeechRecognition();
  
  // Waveform animation function
  const animateWaveform = () => {
    if (isActive && !isPaused) {
      const newBars = Array(50).fill(0).map(() => Math.floor(Math.random() * 40) + 5);
      setWaveformBars(newBars);
    }
    animationRef.current = requestAnimationFrame(animateWaveform);
  };
  
  // Start/stop animation based on recording state
  useEffect(() => {
    console.log('Recording state changed:', { isActive, isPaused });
    
    if (isActive && !isPaused) {
      // Start animation
      if (!animationRef.current) {
        console.log('Starting waveform animation');
        animationRef.current = requestAnimationFrame(animateWaveform);
      }
    } else {
      // Stop animation
      if (animationRef.current) {
        console.log('Stopping waveform animation');
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Reset bars when not recording
      if (!isActive) {
        setWaveformBars(Array(50).fill(10));
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isPaused]);
  
  // Handle record button click
  const handleRecordToggle = async () => {
    console.log('Record button clicked, current state:', { isActive, isPaused });
    
    if (isActive) {
      // Stop recording
      setIsActive(false);
      setIsPaused(false);
      stopRecording();
      stopSpeechRecognition();
      console.log('Recording stopped');
    } else {
      // Start recording
      setIsActive(true);
      setIsPaused(false);
      
      try {
        console.log('Starting audio recording...');
        await startRecording();
        
        // Start speech recognition after a small delay
        setTimeout(() => {
          console.log('Starting speech recognition...');
          startSpeechRecognition();
        }, 500);
      } catch (err) {
        console.error('Error starting recording:', err);
        setIsActive(false);
      }
    }
  };
  
  // Handle pause button click
  const handlePauseToggle = () => {
    if (!isActive) return;
    
    setIsPaused(prev => !prev);
    
    if (!isPaused) {
      // Pause recording
      pauseRecording();
      stopSpeechRecognition();
      console.log('Recording paused');
    } else {
      // Resume recording
      resumeRecording();
      
      // Start speech recognition again after a small delay
      setTimeout(() => {
        startSpeechRecognition();
      }, 300);
      
      console.log('Recording resumed');
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
            {isActive && !isPaused && (
              <>
                <span className="inline-block w-2 h-2 bg-[#EF4444] rounded-full mr-1"></span>
                Recording in progress...
              </>
            )}
            {isActive && isPaused && (
              <>
                <span className="inline-block w-2 h-2 bg-[#F59E0B] rounded-full mr-1"></span>
                Recording paused
              </>
            )}
            {!isActive && (
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
            disabled={!isActive}
            onClick={handlePauseToggle}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            <Pause className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleRecordToggle}
            className={`p-3 rounded-full ${isActive ? 'bg-red-500' : 'bg-primary'} text-white hover:bg-primary-dark transition-colors flex items-center justify-center`}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}