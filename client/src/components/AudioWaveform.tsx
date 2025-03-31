import { useEffect, useState, useRef } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";

export default function AudioWaveform() {
  // Local state
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(50).fill(10));
  const [animationError, setAnimationError] = useState<string | null>(null);
  
  // Animation frame reference
  const animationRef = useRef<number | null>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Get recording state from the hooks
  const { isRecording, isPaused, error: recorderError } = useAudioRecorder();
  const { isListening, error: recognitionError } = useSpeechRecognition();
  
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
  
  // Display errors as toast notifications
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
  
  // Start/stop animation based on recording state
  useEffect(() => {
    console.log('Waveform state changed:', { isRecording, isPaused });
    
    if (isActive) {
      // Start animation
      if (!animationRef.current) {
        console.log('Starting waveform animation');
        try {
          animationRef.current = requestAnimationFrame(animateWaveform);
        } catch (err) {
          console.error('Error starting waveform animation:', err);
          setAnimationError('Failed to animate waveform');
        }
      }
    } else {
      // Stop animation
      if (animationRef.current) {
        console.log('Stopping waveform animation');
        try {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        } catch (err) {
          console.error('Error stopping waveform animation:', err);
        }
      }
      
      // Reset bars when not recording
      if (!isRecording) {
        setWaveformBars(Array(50).fill(10));
        setAnimationError(null); // Clear any animation errors
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        try {
          cancelAnimationFrame(animationRef.current);
        } catch (err) {
          console.error('Error in animation cleanup:', err);
        }
      }
    };
  }, [isRecording, isPaused, isActive]);
  
  return (
    <div className="border-t pt-4">
      <div className="relative h-[60px] w-full bg-slate-100 overflow-hidden rounded-lg mb-4">
        {animationError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <p className="text-red-500 text-sm px-4 text-center">{animationError}</p>
          </div>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center" id="waveform">
            {waveformBars.map((height, index) => (
              <div 
                key={index} 
                className="w-[3px] mx-[2px] bg-primary rounded-[1px] transition-all duration-200" 
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
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
        
        {/* Status indicators for debugging */}
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isRecording ? 'bg-green-500' : 'bg-gray-300'}`} 
                title="Recording status"></span>
          <span className={`inline-block w-2 h-2 rounded-full ${isListening ? 'bg-blue-500' : 'bg-gray-300'}`}
                title="Speech recognition status"></span>
        </div>
      </div>
    </div>
  );
}