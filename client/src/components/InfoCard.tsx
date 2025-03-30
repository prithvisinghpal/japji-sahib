import { useState } from "react";
import { Card } from "./ui/card";
import { X } from "lucide-react";
import { Button } from "./ui/button";

export default function InfoCard() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Card className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Japji Sahib Recitation Assistant</h2>
          <p className="text-slate-600">This tool helps you improve your Japji Sahib recitation by detecting mistakes and providing feedback.</p>
        </div>
        <Button
          variant="ghost" 
          size="icon"
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex items-center text-sm">
          <div className="w-4 h-4 bg-[#E6B422] rounded-full mr-2"></div>
          <span>Current position</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-4 h-4 bg-[#10B981] opacity-50 rounded-full mr-2"></div>
          <span>Correct recitation</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-4 h-4 bg-[#EF4444] opacity-50 rounded-full mr-2"></div>
          <span>Detected error</span>
        </div>
      </div>
    </Card>
  );
}
