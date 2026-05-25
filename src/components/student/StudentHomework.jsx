import React, { useState, useMemo } from 'react';
import { BookOpen, ExternalLink, Calendar, Filter, X } from 'lucide-react';

export default function StudentHomework({ homework }) {
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAttachment, setFilterAttachment] = useState('');

  const clearFilters = () => {
    setFilterDay('');
    setFilterMonth('');
    setFilterStatus('');
    setFilterAttachment('');
  };

  const hasActiveFilters = filterDay || filterMonth || filterStatus || filterAttachment;

  const filteredHomework = useMemo(() => {
    return homework.filter((hw) => {
      if (filterDay && hw.dueDate !== filterDay) return false;
      if (filterMonth && !hw.dueDate?.startsWith(filterMonth)) return false;
      if (filterStatus && hw.status !== filterStatus) return false;
      if (filterAttachment === 'yes' && !hw.referenceLink) return false;
      if (filterAttachment === 'no' && hw.referenceLink) return false;
      return true;
    });
  }, [homework, filterDay, filterMonth, filterStatus, filterAttachment]);

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
          My Homework
        </h2>
        <p className="text-sm text-slate-400 mt-1">Check your pending assignments and due dates.</p>
      </div>

      {/* Filters Card */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Filter className="h-3.5 w-3.5" />
            Filter Assignments
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Day Filter */}
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              title="Filter by exact due date"
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs pl-8 pr-1 py-2 rounded-xl focus:outline-none [color-scheme:dark] cursor-pointer transition-all"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-400/70 pointer-events-none" />
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              title="Filter by month"
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs pl-8 pr-1 py-2 rounded-xl focus:outline-none [color-scheme:dark] cursor-pointer transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none transition-all cursor-pointer"
          >
            <option value="" className="bg-slate-950">All Status</option>
            <option value="Pending" className="bg-slate-950">🕐 Pending</option>
            <option value="Completed" className="bg-slate-950">✅ Completed</option>
          </select>

          {/* Attachment Filter */}
          <select
            value={filterAttachment}
            onChange={(e) => setFilterAttachment(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none transition-all cursor-pointer"
          >
            <option value="" className="bg-slate-950">All Attachments</option>
            <option value="yes" className="bg-slate-950">📎 With Link</option>
            <option value="no" className="bg-slate-950">🚫 No Link</option>
          </select>
        </div>

        {hasActiveFilters && (
          <p className="text-xs text-slate-500 mt-2.5">
            Showing <span className="text-orange-400 font-bold">{filteredHomework.length}</span> of {homework.length} assignments
          </p>
        )}
      </div>

      {/* Homework List */}
      <div className="glass-card p-6 rounded-2xl">
        {filteredHomework.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>
              {homework.length === 0
                ? 'No homework assigned yet! Enjoy your free time.'
                : 'No results match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHomework.map((hw) => {
              const isCompleted = hw.status === 'Completed';
              return (
                <div
                  key={hw.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-800/30 border-slate-700/50 opacity-70'
                      : 'bg-orange-500/5 border-orange-500/20'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}
                        >
                          {hw.status}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Due: {hw.dueDate}
                        </span>
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
