import { CheckCircle } from 'lucide-react';

export const TaskCard = ({ task, onComplete }) => {
  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl mb-4 transition-transform active:scale-95 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-lg text-white mb-1 leading-tight">{task.taskName}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${task.type === 'Daily' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'}`}>
              {task.type}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Impact: {task.score}pts</span>
          </div>
        </div>
        
        <button 
          onClick={() => onComplete(task.rowId)}
          className="flex-shrink-0 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-3 rounded-xl border border-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <CheckCircle size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};