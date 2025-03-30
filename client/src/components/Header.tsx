import { Settings, BookOpenText } from "lucide-react";
import { Button } from "./ui/button";
import { useSettings } from "../context/SettingsContext";

export default function Header() {
  const { openSettings } = useSettings();

  return (
    <header className="py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-primary p-2 rounded-lg mr-3">
            <BookOpenText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold font-mukta text-primary">
            Japji Sahib Mistake Detector
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={openSettings}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
