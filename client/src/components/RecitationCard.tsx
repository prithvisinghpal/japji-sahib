import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { HelpCircle, RefreshCcw } from "lucide-react";
import GurmukthiText from "./GurmukthiText";
import AudioControls from "./AudioControls";
import { useRecitation } from "../hooks/useRecitation";
import { useSettings } from "../context/SettingsContext";

export default function RecitationCard() {
  const { 
    recitationState, 
    progressPercentage, 
    restartRecitation 
  } = useRecitation();
  
  const { openHelp } = useSettings();

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
      
      {/* Gurmukhi Text Display */}
      <GurmukthiText recitationState={recitationState} />
      
      {/* Audio Controls */}
      <AudioControls />
    </Card>
  );
}
