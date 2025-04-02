import Header from "../components/Header";
import InfoCard from "../components/InfoCard";
import RecitationCard from "../components/RecitationCard";
import FeedbackCard from "../components/FeedbackCard";
import ReferenceAudioPlayer from "../components/ReferenceAudioPlayer";
import SettingsModal from "../components/SettingsModal";
import HelpModal from "../components/HelpModal";
import { useRecitation } from "../hooks/useRecitation";

export default function Home() {
  const { feedback } = useRecitation();

  return (
    <div className="bg-slate-100 font-inter text-slate-800 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        <Header />
        
        <InfoCard />
        
        <main className="flex-grow flex flex-col lg:flex-row lg:gap-6 mt-6">
          {/* Main Recitation Area - Takes 2/3 on larger screens */}
          <div className="lg:w-2/3 flex flex-col">
            <RecitationCard />
          </div>
          
          {/* Sidebar - Takes 1/3 on larger screens */}
          <div className="lg:w-1/3 flex flex-col mt-6 lg:mt-0 space-y-6">
            <ReferenceAudioPlayer />
            <FeedbackCard feedbackItems={feedback} />
          </div>
        </main>
        
        <footer className="py-4 text-center text-sm text-slate-500 mt-6">
          <p>© {new Date().getFullYear()} Japji Sahib Recitation Assistant. All rights reserved.</p>
        </footer>
      </div>
      
      <SettingsModal />
      <HelpModal />
    </div>
  );
}
