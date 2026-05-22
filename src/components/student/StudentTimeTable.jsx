import React from 'react';
import { CalendarCheck, Clock } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudentTimeTable({ timetable }) {
  // Sort schedule by day and time
  const sortedSchedule = [...timetable].sort((a, b) => {
    const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
          My Time Table
        </h2>
        <p className="text-sm text-slate-400 mt-1">Your weekly class schedule.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        {sortedSchedule.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No classes scheduled yet. Enjoy your free time!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS_OF_WEEK.map(day => {
              const dayClasses = sortedSchedule.filter(s => s.day === day);
              if (dayClasses.length === 0) return null;

              return (
                <div key={day} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300">
                  <div className="bg-gradient-to-r from-purple-900/40 to-transparent px-5 py-3 border-b border-slate-800/80">
                    <span className="font-extrabold text-sm text-purple-300 uppercase tracking-widest">{day}</span>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {dayClasses.map(cls => (
                      <div key={cls.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {cls.subject.split(',').map((sub, i) => (
                            <span key={i} className="bg-purple-500/20 text-purple-300 text-sm font-bold px-2.5 py-1 rounded-lg border border-purple-500/30">
                              {sub.trim()}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                          <div className="bg-purple-500/10 text-purple-400 p-1 rounded-md">
                            <Clock className="h-4 w-4" />
                          </div>
                          {cls.startTime} — {cls.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
