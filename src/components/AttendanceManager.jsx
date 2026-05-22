import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ChevronRight,
  BarChart3,
  Users,
  Calendar,
  StickyNote,
  Save,
  AlertCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD */
const todayISO = () => new Date().toISOString().slice(0, 10);

/** Returns YYYY-MM string for a given Date */
const toYearMonth = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Day name from JS getDay() index */
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Count how many times specific weekdays appear in a given year-month.
 * @param {string} yearMonth  e.g. "2026-05"
 * @param {string[]} weeklyDays  e.g. ["Monday", "Wednesday"]
 */
function countScheduledDaysInMonth(yearMonth, weeklyDays) {
  if (!weeklyDays || weeklyDays.length === 0) return 0;
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayIndex = new Date(year, month - 1, d).getDay();
    const dayName = DAY_NAMES[dayIndex];
    if (weeklyDays.includes(dayName)) count++;
  }
  return count;
}

// ─────────────────────────────────────────────
// Status Config
// ─────────────────────────────────────────────
const STATUS_CONFIG = {
  Present: {
    label: 'Present',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
    activeBg: 'bg-emerald-500/25 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)]',
    dot: 'bg-emerald-400',
  },
  Absent: {
    label: 'Absent',
    icon: XCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20',
    activeBg: 'bg-rose-500/25 border-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.25)]',
    dot: 'bg-rose-400',
  },
  Replacement: {
    label: 'Replacement',
    icon: RefreshCcw,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
    activeBg: 'bg-amber-500/25 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)]',
    dot: 'bg-amber-400',
  },
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StudentAttendanceRow({ student, entry, onChange }) {
  const status = entry?.status || null;
  const note = entry?.note || '';

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 hover:border-slate-600/60 transition-all duration-300">
      {/* Student Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">
          {student.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">{student.name}</p>
          <p className="text-xs text-slate-500 truncate">{student.subject || 'No subject'}</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {(student.weeklyDays || []).map((d) => (
            <span key={d} className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              {d.substring(0, 3)}
            </span>
          ))}
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isActive = status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ status: isActive ? null : key, note: key !== 'Replacement' ? '' : note })}
              className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                isActive ? `${cfg.activeBg} ${cfg.color}` : `${cfg.bg} text-slate-400 hover:text-slate-300`
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? cfg.color : ''}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Note Input for Replacement */}
      {status === 'Replacement' && (
        <div className="flex items-center gap-2 animate-in fade-in duration-200">
          <StickyNote className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Note (e.g., Compensation for Wednesday's leave)"
            value={note}
            onChange={(e) => onChange({ status, note: e.target.value })}
            className="flex-1 bg-amber-500/5 border border-amber-500/20 text-amber-200 placeholder-amber-700/60 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 1: Mark Attendance
// ─────────────────────────────────────────────

function MarkAttendanceTab({ students, attendance, onSaveAttendance }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showAll, setShowAll] = useState(false);
  const [entries, setEntries] = useState({}); // { studentId: { status, note } }
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const selectedDayName = DAY_NAMES[new Date(selectedDate + 'T00:00:00').getDay()];

  // Pre-fill entries from existing attendance records for this date
  const existingForDate = useMemo(() => {
    const map = {};
    attendance.forEach((rec) => {
      if (rec.date === selectedDate) map[rec.studentId] = rec;
    });
    return map;
  }, [attendance, selectedDate]);

  const displayedStudents = useMemo(() => {
    if (showAll) return students;
    return students.filter((s) => (s.weeklyDays || []).includes(selectedDayName));
  }, [students, showAll, selectedDayName]);

  const handleChange = (studentId, value) => {
    setEntries((prev) => ({ ...prev, [studentId]: value }));
  };

  const getEntry = (studentId) => {
    // Local edits override existing data
    if (entries[studentId] !== undefined) return entries[studentId];
    if (existingForDate[studentId]) {
      return {
        status: existingForDate[studentId].status,
        note: existingForDate[studentId].notes || '',
      };
    }
    return { status: null, note: '' };
  };

  const handleSave = async () => {
    const toSave = displayedStudents.filter((s) => {
      const e = getEntry(s.id);
      return e.status !== null;
    });

    if (toSave.length === 0) {
      setSavedMsg('⚠️ No status marked!');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        toSave.map((s) => {
          const e = getEntry(s.id);
          return onSaveAttendance({
            studentId: s.id,
            studentName: s.name,
            date: selectedDate,
            status: e.status,
            notes: e.note || '',
            createdAt: new Date().toISOString(),
          });
        })
      );
      setSavedMsg(`✅ ${toSave.length} record(s) saved successfully!`);
      setEntries({});
    } catch (err) {
      console.error(err);
      setSavedMsg('❌ Error saving attendance. Try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(''), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Picker */}
        <div className="flex items-center gap-2 glass-card border border-slate-700/50 px-4 py-2.5 rounded-xl">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setEntries({}); }}
            className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 glass-card border border-slate-700/50 rounded-xl p-1.5">
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              !showAll
                ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            📅 Scheduled Today ({selectedDayName})
          </button>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              showAll
                ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            👥 All Students
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-medium text-slate-300 animate-in fade-in">{savedMsg}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-900/40 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Student Count Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Users className="h-3.5 w-3.5" />
        <span>
          {displayedStudents.length} student{displayedStudents.length !== 1 ? 's' : ''} shown
          {!showAll && ` scheduled on ${selectedDayName}`}
        </span>
      </div>

      {/* Student Rows */}
      {displayedStudents.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No students scheduled for {selectedDayName}</p>
          <p className="text-xs mt-1">Switch to "All Students" to mark extra/replacement classes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedStudents.map((s) => (
            <StudentAttendanceRow
              key={s.id}
              student={s}
              entry={getEntry(s.id)}
              onChange={(val) => handleChange(s.id, val)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 2: Monthly Summary
// ─────────────────────────────────────────────

function MonthlySummaryTab({ students, attendance }) {
  const currentYearMonth = toYearMonth(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);

  const summaryData = useMemo(() => {
    return students.map((s) => {
      const workingDays = countScheduledDaysInMonth(selectedMonth, s.weeklyDays || []);
      const monthRecords = attendance.filter(
        (rec) => rec.studentId === s.id && rec.date?.startsWith(selectedMonth)
      );
      const presentCount = monthRecords.filter((r) => r.status === 'Present').length;
      const absentCount = monthRecords.filter((r) => r.status === 'Absent').length;
      const replacementCount = monthRecords.filter((r) => r.status === 'Replacement').length;
      const classesTaken = presentCount + replacementCount;
      const remaining = Math.max(0, workingDays - classesTaken);
      const replacementNotes = monthRecords
        .filter((r) => r.status === 'Replacement' && r.notes)
        .map((r) => r.notes);

      return {
        student: s,
        workingDays,
        presentCount,
        absentCount,
        replacementCount,
        classesTaken,
        remaining,
        replacementNotes,
      };
    });
  }, [students, attendance, selectedMonth]);

  return (
    <div className="flex flex-col gap-6">
      {/* Month Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 glass-card border border-slate-700/50 px-4 py-2.5 rounded-xl">
          <BarChart3 className="h-4 w-4 text-purple-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark]"
          />
        </div>
        <p className="text-xs text-slate-500">
          Showing monthly summary for <span className="text-slate-300 font-semibold">{selectedMonth}</span>
        </p>
      </div>

      {/* Summary Table */}
      {students.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No students found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Schedule</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">Working Days</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">Present</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-rose-400 uppercase tracking-wider">Absent</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">Replacement</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-purple-400 uppercase tracking-wider">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summaryData.map(({ student, workingDays, presentCount, absentCount, replacementCount, remaining, replacementNotes }) => (
                <tr key={student.id} className="hover:bg-slate-800/30 transition-colors duration-150 group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
                        {student.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.subject || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {(student.weeklyDays || []).map((d) => (
                        <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                          {d.substring(0, 3)}
                        </span>
                      ))}
                      {(!student.weeklyDays || student.weeklyDays.length === 0) && (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-indigo-300 font-bold text-base">{workingDays}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold text-sm border border-emerald-500/20">
                      {presentCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 font-semibold text-sm border border-rose-500/20">
                      {absentCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-semibold text-sm border border-amber-500/20">
                        {replacementCount}
                      </span>
                      {replacementNotes.length > 0 && (
                        <div className="group/notes relative">
                          <span className="text-[10px] text-amber-600 cursor-help underline decoration-dotted">
                            {replacementNotes.length} note{replacementNotes.length > 1 ? 's' : ''}
                          </span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-300 shadow-xl z-50 hidden group-hover/notes:block">
                            <p className="font-semibold text-amber-400 mb-1.5">Replacement Notes:</p>
                            {replacementNotes.map((note, i) => (
                              <p key={i} className="text-slate-400 mb-1">• {note}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-sm border ${
                      remaining === 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : remaining <= 2
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {remaining}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-1">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" />Working Days = dynamically calculated from student's schedule</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Present = regular attended classes</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Replacement = extra/compensation class</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" />Remaining = Working Days − (Present + Replacement)</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function AttendanceManager({ students, attendance, onSaveAttendance }) {
  const [activeTab, setActiveTab] = useState('mark');

  const tabs = [
    { id: 'mark', label: 'Mark Attendance', icon: CalendarCheck },
    { id: 'summary', label: 'Monthly Summary', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-indigo-600/15 p-2 rounded-xl border border-indigo-500/20">
              <CalendarCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Attendance Manager
            </h2>
          </div>
          <p className="text-sm text-slate-500 ml-14">
            Daily attendance marking with replacement class tracking &amp; monthly analytics
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 glass-card border border-slate-700/40 px-4 py-2 rounded-xl">
          <AlertCircle className="h-3.5 w-3.5 text-indigo-400" />
          <span>Same date re-submit updates existing record</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 glass-card border border-slate-700/50 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'mark' && (
          <MarkAttendanceTab
            students={students}
            attendance={attendance}
            onSaveAttendance={onSaveAttendance}
          />
        )}
        {activeTab === 'summary' && (
          <MonthlySummaryTab students={students} attendance={attendance} />
        )}
      </div>
    </div>
  );
}
