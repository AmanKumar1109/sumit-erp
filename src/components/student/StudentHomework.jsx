import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

export default function StudentHomework({ homework }) {
  // Homework is already filtered by UID in App.jsx for students
  
  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
          My Homework
        </h2>
        <p className="text-sm text-slate-400 mt-1">Check your pending assignments and due dates.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        {homework.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No homework assigned yet! Enjoy your free time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {homework.map((hw) => {
              const isCompleted = hw.status === 'Completed';
              return (
                <div key={hw.id} className={`p-5 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-slate-800/30 border-slate-700/50 opacity-70' 
                    : 'bg-orange-500/5 border-orange-500/20'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {hw.status}
                        </span>
                        <span className="text-xs font-medium text-slate-400">Due: {hw.dueDate}</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-200">{hw.subject}</h4>
                      <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">
                        {hw.description}
                      </p>
                    </div>
                  </div>
                  
                  {hw.referenceLink && (
                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                      <a 
                        href={hw.referenceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/20 transition-colors w-max"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Attached Reference
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
