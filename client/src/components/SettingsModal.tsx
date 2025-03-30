import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { useSettings } from "../context/SettingsContext";

export default function SettingsModal() {
  const { 
    isSettingsOpen, 
    closeSettings,
    settings,
    updateSettings,
    resetSettings
  } = useSettings();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={closeSettings}>
      <DialogContent className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Audio Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="micSensitivity">Microphone Sensitivity</Label>
                <Select 
                  value={settings.micSensitivity} 
                  onValueChange={(value: "low" | "medium" | "high") => updateSettings({ micSensitivity: value })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="noiseReduction">Noise Reduction</Label>
                <Switch
                  id="noiseReduction"
                  checked={settings.noiseReduction}
                  onCheckedChange={(checked) => updateSettings({ noiseReduction: checked })}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Display Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select 
                  value={settings.fontSize} 
                  onValueChange={(value: "small" | "medium" | "large") => updateSettings({ fontSize: value })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Recognition Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="strictnessLevel">Strictness Level</Label>
                <Select 
                  value={settings.strictnessLevel} 
                  onValueChange={(value: "relaxed" | "standard" | "strict") => updateSettings({ strictnessLevel: value })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="realtimeFeedback">Real-time Feedback</Label>
                <Switch
                  id="realtimeFeedback"
                  checked={settings.realtimeFeedback}
                  onCheckedChange={(checked) => updateSettings({ realtimeFeedback: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={resetSettings}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Reset to Default
          </Button>
          <Button 
            onClick={closeSettings}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
