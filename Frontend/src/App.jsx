import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TaskCard } from './components/TaskCard';
import { AiPrioritySync } from './components/AiPrioritySync'; 
import { Sparkles, Loader2, LogOut, KeyRound } from 'lucide-react';

const SESSION_SECRET = import.meta.env.VITE_SESSION_SECRET;
const GAS_URL = import.meta.env.VITE_GAS_URL;
const SESSION_DURATION = 5 * 60 * 1000; 

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  // Changed to Email
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPIN, setLoginPIN] = useState('');
  const [currentSession, setCurrentSession] = useState(null); 
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const checkAndRestoreSession = async () => {
      const savedStr = localStorage.getItem('svm_secure_session');
      if (savedStr) {
        try {
          const savedSession = JSON.parse(savedStr);
          
          if (Date.now() > savedSession.expiry) {
            handleLogout("Session expired due to inactivity. Please log in again.");
          } else {
            savedSession.expiry = Date.now() + SESSION_DURATION;
            localStorage.setItem('svm_secure_session', JSON.stringify(savedSession));
            
            await fetchTasks(savedSession.email, savedSession.pass, true);
            setCurrentSession(savedSession);
          }
        } catch (e) {
          handleLogout();
        }
      }
      setIsCheckingSession(false);
    };

    checkAndRestoreSession();
  }, []);

  useEffect(() => {
    if (currentSession) {
      const timeLeft = currentSession.expiry - Date.now();
      
      if (timeLeft <= 0) {
        handleLogout("Session expired. Please log in again.");
      } else {
        const timerId = setTimeout(() => {
          handleLogout("Session expired due to inactivity. Please log in again.");
        }, timeLeft);
        
        return () => clearTimeout(timerId);
      }
    }
  }, [currentSession]);

  const handleCompleteTask = (rowId) => {
    setTasks(prev => prev.map(t => 
      t.rowId === rowId ? {...t, status: 'Done', score: 10} : t
    ));

    fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({
        rowId: rowId,
        email: currentSession.email, // Use email for secure POST
        hash: currentSession.hash
      })
    }).catch(err => {
      console.error("Complete error", err);
      fetchTasks(currentSession.email, currentSession.pass, true); 
    });
  };

  const fetchTasks = async (emailToUse, pinToUse, isSilent = false) => {
    // Hash is now generated using the email
    const secureHash = `${emailToUse}_${SESSION_SECRET}`;
    
    try {
      // 🚨 THIS IS THE CRITICAL LINE: It must say ?email=, NOT ?user=
      const targetUrl = `${GAS_URL}?email=${encodeURIComponent(emailToUse)}&pass=${pinToUse}&hash=${secureHash}`;
      console.log("Attempting to fetch:", targetUrl); // This helps debug!
      
      const response = await fetch(targetUrl);
      const data = await response.json();

      if (data.error) {
        setTasks([]);
        return { error: data.error };
      } else {
        setTasks(data.tasks || []);
        return { success: true, email: emailToUse, name: data.userName, pass: pinToUse, hash: secureHash };
      }
    } catch (err) {
      console.error("Fetch error:", err);
      return { error: "Network error. Please try again." };
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Trim spaces and ensure email is lowercased for strict matching
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPIN = loginPIN.trim();

    if (!cleanEmail || !cleanPIN) {
      setAuthError("Enter Email and PIN.");
      return;
    }

    setLoading(true);
    setAuthError('');
    
    const result = await fetchTasks(cleanEmail, cleanPIN, false);

    if (result.error) {
      setAuthError(result.error);
    } else if (result.success) {
      const newSession = { 
        email: result.email,
        name: result.name, // Save the actual name returned from the backend
        pass: result.pass,
        hash: result.hash,
        expiry: Date.now() + SESSION_DURATION
      };
      
      localStorage.setItem('svm_secure_session', JSON.stringify(newSession));
      setCurrentSession(newSession);
    }
    setLoading(false);
  };

  const handleLogout = (message = '') => {
    setLoading(true);
    localStorage.removeItem('svm_secure_session');
    setCurrentSession(null);
    setTasks([]);
    setLoginPIN('');
    setLoginEmail(''); // Clear email
    if (message) setAuthError(message);
    setLoading(false);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <KeyRound className="w-12 h-12 text-indigo-500 mb-6 mx-auto bg-indigo-500/10 p-3 rounded-full"/>
          <h2 className="text-2xl font-bold mb-2 text-center tracking-wide">SVM Portal</h2>
          <p className="text-slate-400 mb-8 text-sm text-center">Secure Task Management.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Input changed to type email */}
            <input 
              type="email" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email Address"
              className="bg-[#0a0f1c]/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
            <input 
              type="password" 
              value={loginPIN}
              onChange={(e) => setLoginPIN(e.target.value)}
              placeholder="4-Digit PIN"
              className="bg-[#0a0f1c]/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 tracking-widest text-center text-lg"
              maxLength="4"
            />
            {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 transition-colors py-3 rounded-xl font-bold text-sm tracking-wide disabled:opacity-50 mt-2"
            >
              {loading ? "VERIFYING..." : "SECURE LOGIN"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const recurringTasks = tasks.filter(t => (t.type === 'Daily' || t.type === 'Weekly') && t.status !== 'Done');
  const oneTimeTasks = tasks.filter(t => t.type === 'One-time' && t.status !== 'Done');

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white font-sans">
      <div className="max-w-md mx-auto p-6 pb-24 relative">
        <header className="mb-12 flex justify-between items-start pt-2">
            <div>
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">SVM Portal</p>
                {/* Greeting uses the Name from the backend, not the email */}
                <h1 className="text-3xl font-bold mt-1">Hello, {currentSession.name}</h1>
            </div>
            <button 
                onClick={() => handleLogout("Successfully logged out.")}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 bg-white/5 px-4 py-2.5 rounded-full transition-colors"
            >
                {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <LogOut size={16} />}
                {loading ? '...' : 'LOGOUT'}
            </button>
        </header>
        
        {pendingTasks.length > 0 && (
          <AiPrioritySync tasks={pendingTasks} />
        )}

        <section className="mb-8">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Recurring tasks</h2>
            {recurringTasks.length > 0 ? (
              recurringTasks.map(t => (
                <TaskCard key={t.rowId} task={t} onComplete={handleCompleteTask}/> 
              ))
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-sm">
                All caught up for today!
              </div>
            )}
        </section>

        <section className="pb-10">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">One-time tasks</h2>
            {oneTimeTasks.length > 0 ? (
              oneTimeTasks.map(t => (
                <TaskCard key={t.rowId} task={t} onComplete={handleCompleteTask}/>
              ))
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-sm">
                All caught up for today!
              </div>
            )}
        </section>
      </div>
    </div>
  );
}