import React from 'react';
import { CalendarCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function StudentAttendance({ attendance }) {
  // We can calculate total present/absent stats
  const totalClasses = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          My Attendance
        </h2>
        <p className="text-sm text-slate-400 mt-1">Review your daily class attendance.</p>
      </div>

      {/* Summary Stats */}
      {totalClasses > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Present</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{presentCount}</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Absent</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{absentCount}</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Late</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{lateCount}</p>
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass-card p-6 rounded-2xl">
        {attendance.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {attendance.map((record) => {
                  let statusBadge = '';
                  let Icon = CheckCircle2;
                  if (record.status === 'Present') {
                    statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    Icon = CheckCircle2;
                  } else if (record.status === 'Absent') {
                    statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                    Icon = XCircle;
                  } else {
                    statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    Icon = AlertCircle;
                  }

                  return (
                    <tr key={record.id} className="hover:bg-slate-900/30 transition-all duration-200">
                      <td className="py-3 px-4 text-sm font-bold text-slate-200">
                        {record.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${statusBadge}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {record.note || '—'}
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
