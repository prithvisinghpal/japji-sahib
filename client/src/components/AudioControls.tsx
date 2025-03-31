import { useEffect } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useRecitation } from "../hooks/useRecitation";
import AudioWaveform from "./AudioWaveform";
import AudioControlButtons from "./AudioControlButtons";

export default function AudioControls() {
  // Get audio recorder state
  const { isRecording, audioBlob, error: recorderError } = useAudioRecorder();
  
  // Get speech recognition state
  const { 
    isListening, 
    transcript, 
    error: recognitionError 
  } = useSpeechRecognition();
  
  // Get text comparison function
  const { processRecognizedText } = useRecitation();
  
  // Log state for debugging
  useEffect(() => {
    console.log("AudioControls state:", {
      isRecording,
      isListening,
      hasAudioBlob: !!audioBlob,
      transcript: transcript.substring(0, 50) + (transcript.length > 50 ? "..." : "")
    });
  }, [isRecording, isListening, audioBlob, transcript]);
  
  // Process transcript when speech recognition completes
  useEffect(() => {
    if (!isListening && transcript) {
      console.log("Speech recognition completed, processing transcript:", 
        transcript.substring(0, 100) + (transcript.length > 100 ? "..." : ""));
      processRecognizedText(transcript);
    }
  }, [isListening, transcript, processRecognizedText]);
  
  // Display any errors
  const error = recorderError || recognitionError;
  
  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 mb-4 rounded-md text-sm">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* We're breaking down AudioControls into two separate components now */}
      <AudioControlButtons />
      <AudioWaveform />
    </div>
  );
}