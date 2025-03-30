import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "../context/SettingsContext";

export default function HelpModal() {
  const { isHelpOpen, closeHelp } = useSettings();

  return (
    <Dialog open={isHelpOpen} onOpenChange={closeHelp}>
      <DialogContent className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">How to Use</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-2">Getting Started</h3>
            <p className="text-slate-600">Follow these steps to begin your Japji Sahib recitation practice:</p>
            <ol className="list-decimal ml-5 mt-2 space-y-2 text-slate-600">
              <li>Press the microphone button to start recording</li>
              <li>Recite Japji Sahib at your normal pace</li>
              <li>The app will follow along with your recitation</li>
              <li>Mistakes will be highlighted in real-time</li>
              <li>Press pause if you need to take a break</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Understanding Feedback</h3>
            <div className="space-y-2 text-slate-600">
              <p>The app provides different types of feedback:</p>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#E6B422] opacity-50 rounded-full mr-2"></div>
                <span>Yellow highlighting shows your current position</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#10B981] opacity-50 rounded-full mr-2"></div>
                <span>Green highlighting indicates correct recitation</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#EF4444] opacity-50 rounded-full mr-2"></div>
                <span>Red highlighting shows detected errors</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Tips for Better Recognition</h3>
            <ul className="list-disc ml-5 space-y-2 text-slate-600">
              <li>Recite in a quiet environment for better accuracy</li>
              <li>Speak clearly but naturally at a moderate pace</li>
              <li>Position yourself approximately 6-12 inches from the microphone</li>
              <li>Adjust microphone sensitivity in settings if needed</li>
              <li>Practice regularly to improve both recitation and recognition</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end">
          <Button 
            onClick={closeHelp}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
