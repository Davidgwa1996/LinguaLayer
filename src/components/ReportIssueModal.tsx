import React, { useState } from "react";
import { AlertCircle, X, Send } from "lucide-react";

interface ReportIssueModalProps {
  roomId: string;
  userLanguage: string;
  onClose: () => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  roomId,
  userLanguage,
  onClose
}) => {
  const [issueType, setIssueType] = useState<string>("translation");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    
    // Simulate API call to support system
    const metadata = {
      roomId,
      userLanguage,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    console.log("Submitting issue:", { issueType, description, metadata });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Report Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Thank you!</h4>
            <p className="text-slate-500 text-sm">Your report has been submitted to the engineering team. This helps us improve LinguaLayer AI.</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">What went wrong?</label>
              <select 
                value={issueType}
                onChange={e => setIssueType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="translation">Translation is inaccurate or failed</option>
                <option value="voice">Voice transcription is wrong</option>
                <option value="delivery">Message did not arrive</option>
                <option value="other">Other technical issue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Give us details about the message and what went wrong..."
                className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>
            
            <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-500 font-mono flex flex-col space-y-1">
              <span className="font-semibold px-1 text-[10px] uppercase tracking-wider text-slate-400">Attached Metadata</span>
              <div className="bg-white p-2 rounded-md border border-slate-200">
                <div>Room: {roomId.slice(0, 10)}...</div>
                <div>Language: {userLanguage}</div>
                <div className="truncate">Device: {navigator.userAgent.slice(0, 40)}...</div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm flex justify-center items-center gap-2 hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
