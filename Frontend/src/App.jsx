import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TaskCard } from './components/TaskCard';
import { Sparkles, Loader2 } from 'lucide-react';

const GAS_URL = import.meta.env.VITE_GAS_URL;
const GAS_KEY = import.meta.env.VITE_API_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState("Analyzing tasks...");
  
  // Extract user from URL (e.g., mysite.com/?user=Neeraj)
  const userName = new URLSearchParams(window.location.search).get('user') || 'Staff';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${GAS_URL}?user=${userName}&key=${GAS_KEY}`);
      const data = await response.json();
      
      if (data.tasks) {
        setTasks(data.tasks);
        generateAIInsight(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // The required AI Integration Feature
  const generateAIInsight = async (currentTasks) => {
    if (currentTasks.length === 0) {
      setAiInsight("You have no pending tasks today. Great job!");
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const taskList = currentTasks.map(t => `${t.taskName} (Score impact: ${t.score}, Type: ${t.type})`).join(", ");
      const prompt = `Act as a productivity coach for a school staff member. They have these tasks: ${taskList}. Give exactly one short, motivating sentence telling them which task to do first to maximize their score and efficiency. Keep it under 15 words.`;
      
      const result = await model.generateContent(prompt);
      setAiInsight(result.response.text());
    } catch (error) {
      // Fallback if API key is missing or fails
      const maxImpactTask = currentTasks.reduce((prev, current) => (prev.score < current.score) ? prev : current);
      setAiInsight(`Focus on "${maxImpactTask.taskName}" first to secure your highest points today.`);
    }
  };

  const handleComplete = async (rowId) => {
    // 1. Optimistic UI update (feels instant on mobile)
    const updatedTasks = tasks.filter(t => t.rowId !== rowId);
    setTasks(updatedTasks);
    
    // Re-run AI insight on remaining tasks
    generateAIInsight(updatedTasks);

    // 2. Background sync to Google Sheet
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId: rowId, key: GAS_KEY })
      });
    } catch (error) {
      console.error("Failed to update task in backend", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col gap-4 items-center justify-center text-slate-400">
        <Loader2 className="animate-spin" size={32} />
        <p className="animate-pulse">Loading SVM Workspace...</p>
      </div>
    );
  }

  const recurringTasks = tasks.filter(t => t.type === 'Daily' || t.type === 'Weekly');
  const oneTimeTasks = tasks.filter(t => t.type === 'One-time');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 max-w-md mx-auto font-sans selection:bg-indigo-500/30">
      <header className="mb-8 pt-4">
        <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mb-1">SVM Portal</p>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          Hello, {userName}
        </h1>
      </header>

      {/* AI Intelligence Section */}
      <section className="mb-8 relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-[2rem] shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-full">AI Priority Sync</span>
        </div>
        <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">
          {aiInsight}
        </p>
      </section>

      {/* Task Lists */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
          <p className="text-slate-400">All caught up for today!</p>
        </div>
      ) : (
        <>
          {recurringTasks.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Recurring Schedule</h2>
              {recurringTasks.map(t => (
                <TaskCard key={t.rowId} task={t} onComplete={handleComplete} />
              ))}
            </section>
          )}

          {oneTimeTasks.length > 0 && (
            <section className="pb-10">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">One-Time Operations</h2>
              {oneTimeTasks.map(t => (
                <TaskCard key={t.rowId} task={t} onComplete={handleComplete} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default App;