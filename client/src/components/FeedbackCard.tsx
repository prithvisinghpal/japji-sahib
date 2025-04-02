import { Card } from "./ui/card";
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
  // Demo feedback for display when there are no actual feedback items
  const demoFeedbackItems = [
    {
      type: 'warning' as const,
      title: 'Example: Pacing could be improved',
      description: 'Try to maintain a steady pace throughout your recitation.'
    },
    {
      type: 'error' as const,
      title: 'Example: Pronunciation error detected',
      description: 'Focus on the correct pronunciation of "ਪੁਰਖੁ".'
    }
  ];
  
  // Use demo feedback if no real feedback items are available
  const displayItems = feedbackItems.length > 0 ? feedbackItems : demoFeedbackItems;
  
  return (
    <Card className="bg-white dark:bg-gray-900 border rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        Feedback
        {feedbackItems.length === 0 && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Examples</span>
        )}
      </h2>
      
      <div className="space-y-4">
        {displayItems.map((item, index) => (
          <div 
            key={index} 
            className={`p-4 ${
              item.type === 'error' 
                ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800' 
                : 'bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
            } rounded-lg flex items-start`}
          >
            <span className={`mr-3 mt-0.5 flex-shrink-0 ${
              item.type === 'error' 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {item.type === 'error' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
            </span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {feedbackItems.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm italic mt-4">
          Start reciting or click "Test Progress" to see real feedback
        </p>
      )}
    </Card>
  );
}
