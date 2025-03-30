import { Card } from "@/components/ui/card";
import { AlertTriangle, AlertCircle } from "lucide-react";

type FeedbackItem = {
  type: 'error' | 'warning';
  title: string;
  description: string;
};

type FeedbackCardProps = {
  feedbackItems: FeedbackItem[];
};

export default function FeedbackCard({ feedbackItems }: FeedbackCardProps) {
  if (feedbackItems.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Feedback</h2>
        <p className="text-slate-500 text-center py-4">No feedback available yet. Start reciting to receive feedback.</p>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Feedback</h2>
      <div className="space-y-3">
        {feedbackItems.map((item, index) => (
          <div 
            key={index} 
            className={`p-3 ${item.type === 'error' ? 'bg-error bg-opacity-10' : 'bg-warning bg-opacity-10'} rounded-lg flex items-start`}
          >
            <span className={`mr-2 mt-0.5 ${item.type === 'error' ? 'text-error' : 'text-warning'}`}>
              {item.type === 'error' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
            </span>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
