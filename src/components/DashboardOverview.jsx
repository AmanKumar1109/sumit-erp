import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, IndianRupee, UserPlus, ArrowRight, BookOpen, Clock } from 'lucide-react';

export default function DashboardOverview({ students, payments = [] }) {
  const totalStudents = students.length;

  // Calculate day-wise distribution
  const dayCounts = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  students.forEach((s) => {
    if (s.weeklyDays && Array.isArray(s.weeklyDays)) {
      s.weeklyDays.forEach((day) => {
        if (dayCounts[day] !== undefined) {
          dayCounts[day]++;
        }
      });
    }
  });

  // Calculate actual collected this month
  const currentMonthRaw = new Date().toISOString().slice(0, 7); // e.g., "2026-05"
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const actualCollection = payments
    .filter((p) => p.monthYearRaw === currentMonthRaw || p.date.startsWith(currentMonthRaw))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Get recent 4 students
  const recentStudents = [...students].reverse().slice(0, 4);

  // High-traffic day calculation
  let busiestDay = 'None';
  let maxCount = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      busiestDay = day;
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Welcome Back, Chief! 👋
          </h2>
          <p className="text-slate-400 mt-1.5 text-sm md:text-base">
            The absolute easiest system to manage your tuition hub.
          </p>
        </div>
        <Link
          to="/add-student"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 cursor-pointer text-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add Student
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Students</p>
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{totalStudents}</h3>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              Active Registered
            </p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-center text-indigo-400">
            <Users className="h-7 w-7" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Busiest Tuition Day</p>
            <h3 className="text-2xl font-extrabold text-indigo-300 tracking-tight truncate max-w-[160px]">
              {busiestDay}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              {maxCount > 0 ? `${maxCount} students scheduled` : 'No days selected yet'}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center justify-center text-purple-400">
            <Calendar className="h-7 w-7" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fees Collected</p>
            <h3 className="text-4xl font-extrabold text-emerald-400 tracking-tight">
              ₹{actualCollection.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              For {currentMonthName}
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center text-emerald-400">
            <IndianRupee className="h-7 w-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Weekly distribution (3 cols) */}
        <div className="lg:col-span-3 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Weekly Class Load
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Real-time chart of daily expected students:
            </p>
          </div>

          <div className="space-y-4 mt-6">
            {Object.entries(dayCounts).map(([day, count]) => {
              const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
              return (
                <div key={day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">{day}</span>
                    <span className="text-slate-400">{count} {count === 1 ? 'Student' : 'Students'}</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Recent Registrations (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              Recent Enrolled
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Recently registered students:
            </p>
          </div>

          <div className="space-y-4 my-6 flex-1 flex flex-col justify-center">
            {recentStudents.length > 0 ? (
              recentStudents.map((student, idx) => (
                <div
                  key={student.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-800 transition-colors"
                >
                  <div className="space-y-0.5 truncate">
                    <p className="text-sm font-bold text-slate-200 truncate">{student.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Class {student.studentClass} • {student.board}
                    </p>
                  </div>
                  <div className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-1 rounded-md font-semibold">
                    {student.weeklyDays?.length || 0} Days
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No students registered yet.
                <div className="mt-2">
                  <Link to="/add-student" className="text-indigo-400 hover:underline font-semibold">
                    Register first student →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {totalStudents > 0 && (
            <Link
              to="/students"
              className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 group self-center"
            >
              View Full Student Directory
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
