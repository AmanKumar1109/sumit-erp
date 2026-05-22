import React, { useState } from 'react';
import { CalendarCheck, Search, Plus, Trash2, Clock, User, X } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimeTableManager({ students, timetable, onSave, onDelete }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '16:00',
    endTime: '17:00',
    subject: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter timetable for selected student
  const studentSchedule = timetable.filter(t => t.studentId === selectedStudent);

  // Sort schedule by day and time
  const sortedSchedule = [...studentSchedule].sort((a, b) => {
    const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !formData.subject || !formData.startTime || !formData.endTime) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        studentId: selectedStudent,
        ...formData,
        createdAt: new Date().toISOString()
      });
      setFormData({ ...formData, subject: '' }); // reset subject, keep day/time
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
          Student Time Table
        </h2>
        <p className="text-sm text-slate-400 mt-1">Manage individual class schedules and subjects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-purple-400" />
            Add Schedule Entry
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">Select Student</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.studentClass})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">Day of Week</label>
              <select
                required
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
                className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">End Time</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">Subjects (comma separated)</label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics, Science, English"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedStudent}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add to Schedule
            </button>
          </form>
        </div>

        {/* Right Column: Schedule Display */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
           {!selectedStudent ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
               <CalendarCheck className="h-12 w-12 opacity-20 mb-3" />
               <p>Select a student to view or manage their timetable.</p>
             </div>
           ) : (
             <div>
               <h3 className="text-lg font-bold text-white mb-6">Current Schedule</h3>
               {sortedSchedule.length === 0 ? (
                 <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-slate-800 border-dashed">
                   <p className="text-sm text-slate-400">No classes scheduled yet.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {DAYS_OF_WEEK.map(day => {
                     const dayClasses = sortedSchedule.filter(s => s.day === day);
                     if (dayClasses.length === 0) return null;

                     return (
                       <div key={day} className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
                         <div className="bg-slate-800/60 px-4 py-2 border-b border-slate-700/50">
                           <span className="font-bold text-sm text-purple-300">{day}</span>
                         </div>
                         <div className="divide-y divide-slate-800/50">
                           {dayClasses.map(cls => (
                             <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                               <div>
                                 <div className="flex flex-wrap gap-1.5 mb-1.5">
                                   {cls.subject.split(',').map((sub, i) => (
                                     <span key={i} className="bg-purple-500/20 text-purple-300 text-[11px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
                                       {sub.trim()}
                                     </span>
                                   ))}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                   <Clock className="h-3.5 w-3.5" />
                                   {cls.startTime} - {cls.endTime}
                                 </div>
                               </div>
                               <button 
                                 onClick={() => onDelete(cls.id)}
                                 className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                 title="Delete Entry"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
