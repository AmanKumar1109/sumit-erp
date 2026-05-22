import React from 'react';
import { LayoutDashboard, GraduationCap, Calendar, Clock, ArrowRight, FileText, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard({ student, homework }) {
  if (!student) {
    return (
      <div className="flex justify-center p-10">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pending homeworks
  const pendingHw = homework.filter(hw => hw.status === 'Pending');

  return (
    <div className="animate-fade-in flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Welcome Hero */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
              <GraduationCap className="h-8 w-8 text-pink-400" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white">Welcome, {student.name}!</h2>
              <p className="text-slate-400 font-medium">Class: {student.studentClass}</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-300">Days: {student.weeklyDays?.join(', ') || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
              <Clock className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-semibold text-slate-300">Time: {student.tuitionTime || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links / Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pending Homework Alert */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-white">Pending Homework</h3>
            <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg text-xs font-bold">
              {pendingHw.length} Tasks
            </span>
          </div>
          
          {pendingHw.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500 bg-slate-900/30 rounded-xl p-4 border border-slate-800/50">
              You're all caught up!
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {pendingHw.slice(0, 3).map(hw => (
                <div key={hw.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-200">{hw.subject}</span>
                    <span className="text-xs text-orange-400 font-medium">Due: {hw.dueDate}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{hw.description}</p>
                </div>
              ))}
            </div>
          )}
          
          <Link to="/homework" className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            View All Homework <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Quick Links */}
        <div className="glass-card p-6 rounded-2xl">
           <h3 className="font-bold text-lg text-white mb-4">Quick Navigation</h3>
           <div className="grid grid-cols-2 gap-4">
             <Link to="/attendance" className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col items-center text-center gap-2">
               <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                 <Calendar className="h-6 w-6 text-blue-400" />
               </div>
               <span className="text-sm font-bold text-slate-300 group-hover:text-white">Attendance</span>
             </Link>
             
             <Link to="/tests" className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-pink-500/50 transition-all group flex flex-col items-center text-center gap-2">
               <div className="p-2 bg-pink-500/10 rounded-lg group-hover:scale-110 transition-transform">
                 <FileText className="h-6 w-6 text-pink-400" />
               </div>
               <span className="text-sm font-bold text-slate-300 group-hover:text-white">Test Scores</span>
             </Link>
             
             <Link to="/payments" className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col items-center text-center gap-2">
               <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                 <IndianRupee className="h-6 w-6 text-emerald-400" />
               </div>
               <span className="text-sm font-bold text-slate-300 group-hover:text-white">Fee Status</span>
             </Link>
           </div>
        </div>

      </div>
    </div>
  );
}
