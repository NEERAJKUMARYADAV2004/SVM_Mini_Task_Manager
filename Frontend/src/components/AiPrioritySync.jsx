import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Loader2 } from 'lucide-react';

export function AiPrioritySync({ tasks }) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only run if there are pending tasks
    const pendingTasks = tasks.filter(t => t.status !== 'Done');
    
    if (pendingTasks.length === 0) {
      setInsight("You have no pending tasks today. Great job!");
      setLoading(false);
      return;
    }

    const generateInsight = async () => {
      setLoading(true);
      setError('');
      try {
        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey) throw new Error("Gemini API key is missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Prepare context for the AI
        const promptContext = pendingTasks.map(t => 
          `- Task: ${t.taskName}, Type: ${t.type}, Score Impact: ${t.score}`
        ).join('\n');

        const prompt = `You are a productivity AI for the SVM portal. 
        Review these pending tasks for today:
        ${promptContext}
        
        Provide a very short, single-sentence recommendation (under 15 words) on which task the user should focus on first based on the highest negative score impact. Make it sound encouraging. Highlight the task name with double inverted commas.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        setInsight(response.text().trim());
      } catch (err) {
        console.error("AI Gen Error:", err);
        setError("Daily AI Outage! Check back tomorrow for AI-powered motivation!");
        // setError(err.message || "Unknown API Error");
      }
      setLoading(false);
    };

    generateInsight();
  }, [tasks]); // Re-run when tasks array changes

  return (
    <div className="max-w-md bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full tracking-widest uppercase">
          AI Priority Sync
        </span>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-sm">Analyzing priorities...</p>
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {insight}
        </p>
      )}
    </div>
  );
}