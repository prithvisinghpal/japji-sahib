import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { HelpCircle, RefreshCcw } from "lucide-react";
import GurmukthiText from "./GurmukthiText";
import AudioControlButtons from "./AudioControlButtons";
import AudioWaveform from "./AudioWaveform";
import { useRecitation } from "../hooks/useRecitation";
import { useSettings } from "../context/SettingsContext";
import { useAudioRecording } from "../context/AudioRecordingContext";
import { useEffect } from "react";

export default function RecitationCard() {
  const { 
    recitationState, 
    progressPercentage,
    restartRecitation,
    processRecognizedText
  } = useRecitation();
  
  const { 
    openHelp 
  } = useSettings();
  
  const {
    recordedText,
    isRecording,
    isPlaying,
    setRecordedText
  } = useAudioRecording();
  
  // Simulate highlighting during playback
  useEffect(() => {
    if (isPlaying && recordedText) {
      console.log("🎵 Playing back with text:", recordedText);
      // When playback starts, process recorded text to highlight words
      processRecognizedText(recordedText);
    }
  }, [isPlaying, recordedText, processRecognizedText]);
  
  // For debugging purpose - set a test progress percentage
  const testProgress = () => {
    console.log("🧪 Testing progress update");
    // Process a larger test string to update progress with more words
    const testText = "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥ ॥ ਜਪੁ ॥ ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥ ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥";
    
    // Reset the recitation state before processing the test text
    restartRecitation();
    
    // Process the test text
    processRecognizedText(testText);
    
    // Also update the recordedText in AudioRecordingContext
    setRecordedText(testText);
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-6 mb-6 flex-grow flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recitation</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={openHelp}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={restartRecitation}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          >
            <RefreshCcw className="h-5 w-5" />
          </Button>
          {/* Test button for progress */}
          <Button
            variant="outline"
            size="sm"
            onClick={testProgress}
            className="text-xs"
          >
            Test Progress
          </Button>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-500 mb-1">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Audio Control Buttons - Centered below progress bar */}
      <AudioControlButtons />
      
      {/* Gurmukhi Text Display */}
      <div className="my-6 flex-grow overflow-y-auto">
        <GurmukthiText recitationState={recitationState} />
      </div>
      
      {/* Audio Waveform */}
      <div className="mt-auto">
        <AudioWaveform />
      </div>
    </Card>
  );
}
