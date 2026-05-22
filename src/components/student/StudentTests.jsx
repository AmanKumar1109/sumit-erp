import React from 'react';
import { FileText } from 'lucide-react';

export default function StudentTests({ tests }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          My Test Scores
        </h2>
        <p className="text-sm text-slate-400 mt-1">Review your recent academic performance.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        {tests.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No tests recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-3 px-4">Date & Subject</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tests.map((test) => {
                  const percentage = (test.marksScored / test.totalMarks) * 100;
                  let scoreColor = 'text-emerald-400';
                  if (percentage < 40) scoreColor = 'text-rose-400';
                  else if (percentage < 70) scoreColor = 'text-amber-400';

                  return (
                    <tr key={test.id} className="hover:bg-slate-900/30 transition-all duration-200">
                      <td className="py-3 px-4">
                        <div className="text-[10px] text-slate-500 font-semibold mb-0.5">{test.date}</div>
                        <div className="text-sm font-bold text-slate-200">{test.subject}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-base font-extrabold ${scoreColor}`}>
                            {test.marksScored} <span className="text-xs text-slate-500 font-medium">/ {test.totalMarks}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{percentage.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="text-xs text-slate-400 truncate" title={test.remarks || 'No remarks'}>
                          {test.remarks || '—'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
