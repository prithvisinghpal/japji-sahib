import { useEffect, useState, useRef } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function AudioWaveform() {
  // Local state
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(50).fill(10));
  
  // Animation frame reference
  const animationRef = useRef<number | null>(null);
  
  // Get recording state from the hooks
  const { isRecording, isPaused } = useAudioRecorder();
  const { isListening } = useSpeechRecognition();
  
  // Determine if we should be animating
  const isActive = isRecording && !isPaused;
  
  // Waveform animation function
  const animateWaveform = () => {
    if (isActive) {
      const newBars = Array(50).fill(0).map(() => Math.floor(Math.random() * 40) + 5);
      setWaveformBars(newBars);
    }
    animationRef.current = requestAnimationFrame(animateWaveform);
  };
  
  // Start/stop animation based on recording state
  useEffect(() => {
    console.log('Waveform state changed:', { isRecording, isPaused });
    
    if (isActive) {
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
      if (!isRecording) {
        setWaveformBars(Array(50).fill(10));
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isPaused, isActive]);
  
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
      <div className="flex items-center">
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
      </div>
    </div>
  );
}