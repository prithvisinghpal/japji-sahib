import { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DebugPanel() {
  const { settings } = useSettings();
  const { 
    isListening,
    isPaused: recognitionPaused,
    transcript,
    error: recognitionError
  } = useSpeechRecognition();
  
  const {
    isRecording,
    isPaused: recordingPaused,
    error: recordingError
  } = useAudioRecorder();
  
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [logs, setLogs] = useState<{type: string, message: string, timestamp: number}[]>([]);
  
  // Add logs when states change
  useEffect(() => {
    const newLog = {
      type: 'status',
      message: `Recording: ${isRecording ? 'ON' : 'OFF'}, Paused: ${recordingPaused ? 'YES' : 'NO'}, Listening: ${isListening ? 'ON' : 'OFF'}`,
      timestamp: Date.now()
    };
    setLogs(prev => [...prev.slice(-19), newLog]);
  }, [isRecording, isListening, recordingPaused]);
  
  // Add logs when transcript changes
  useEffect(() => {
    if (transcript) {
      const newLog = {
        type: 'transcript',
        message: transcript,
        timestamp: Date.now()
      };
      setLogs(prev => [...prev.slice(-19), newLog]);
    }
  }, [transcript]);
  
  // Add errors to logs
  useEffect(() => {
    if (recognitionError || recordingError) {
      const newLog = {
        type: 'error',
        message: recognitionError || recordingError || 'Unknown error',
        timestamp: Date.now()
      };
      setLogs(prev => [...prev.slice(-19), newLog]);
    }
  }, [recognitionError, recordingError]);
  
  // Only show in development or if debug mode is enabled
  if (process.env.NODE_ENV !== 'development' && !settings.debugMode) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-black/80 text-white p-4 max-w-md shadow-lg border-none">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isListening ? "default" : "secondary"}
              className={isListening ? "bg-green-500" : "bg-gray-500"}
            >
              Speech: {isListening ? 'ON' : 'OFF'}
            </Badge>
            <Badge 
              variant={isRecording ? "default" : "secondary"}
              className={isRecording ? "bg-green-500" : "bg-gray-500"}
            >
              Audio: {isRecording ? 'ON' : 'OFF'}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCollapsed(prev => !prev)}
            className="text-xs text-gray-300 h-6 py-0"
          >
            {isCollapsed ? 'Show Logs' : 'Hide Logs'}
          </Button>
        </div>
        {!isCollapsed && (
          <div className="text-xs overflow-y-auto max-h-60 border border-gray-700 rounded p-2 bg-black">
            {logs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'transcript' ? 'text-blue-300' : 'text-gray-300'}`}>
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>{' '}
                <span>{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">No logs yet</div>
            )}
          </div>
        )}
        {transcript && (
          <div className="mt-2 text-xs">
            <div className="font-semibold text-green-400">Current Transcript:</div>
            <div className="bg-black/60 p-1 rounded max-h-20 overflow-y-auto">
              {transcript}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}