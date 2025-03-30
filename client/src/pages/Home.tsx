import Header from "../components/Header";
import InfoCard from "../components/InfoCard";
import RecitationCard from "../components/RecitationCard";
import FeedbackCard from "../components/FeedbackCard";
import SettingsModal from "../components/SettingsModal";
import HelpModal from "../components/HelpModal";
import { useRecitation } from "../hooks/useRecitation";

export default function Home() {
  const { feedback } = useRecitation();

  return (
    <div className="bg-slate-100 font-inter text-slate-800 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow flex flex-col">
          <InfoCard />
          <RecitationCard />
          <FeedbackCard feedbackItems={feedback} />
        </main>
        
        <footer className="py-4 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Japji Sahib Recitation Assistant. All rights reserved.</p>
        </footer>
      </div>
      
      <SettingsModal />
      <HelpModal />
    </div>
  );
}
