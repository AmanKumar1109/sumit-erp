import React, { useState, useMemo, useCallback } from 'react';
import {
  Target, BookOpen, CheckCircle2, Circle, Trophy, ChevronRight,
  BarChart2, TrendingUp, Zap
} from 'lucide-react';

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function ProgressRing({ percent, size = 80, strokeWidth = 6, label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const color =
    percent === 100 ? '#10b981'
    : percent >= 60  ? '#f59e0b'
    : percent >= 30  ? '#f97316'
    :                  '#f43f5e';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-extrabold text-white leading-none" style={{ fontSize: size * 0.18 }}>
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      {label && <span className="text-[11px] font-semibold text-slate-400 text-center max-w-[80px] truncate">{label}</span>}
    </div>
  );
}

// ─── Color helpers ────────────────────────────────────────────────────────────
const col = (pct) => {
  if (pct === 100) return { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' };
  if (pct >= 60)   return { bar: 'bg-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25'   };
  if (pct >= 30)   return { bar: 'bg-orange-500',  text: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25'  };
  return               { bar: 'bg-rose-500',    text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25'    };
};

// ─────────────────────────────────────────────────────────────────────────────
export default function StudentSyllabus({ syllabus }) {
  // syllabus already filtered to this student in App.jsx
  const [selectedExamId,    setSelectedExamId]    = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const exams = useMemo(() =>
    syllabus.filter(d => d.type === 'exam')
      .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [syllabus]);

  const subjectsFor = useCallback((examId) =>
    syllabus.filter(d => d.type === 'subject' && d.examId === examId)
      .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [syllabus]);

  const chaptersFor = useCallback((subjectId) =>
    syllabus.filter(d => d.type === 'chapter' && d.subjectId === subjectId)
      .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [syllabus]);

  const selectedExam    = exams.find(e => e.id === selectedExamId);
  const selectedSubject = syllabus.find(d => d.id === selectedSubjectId);
  const currentSubjects = selectedExamId ? subjectsFor(selectedExamId) : [];
  const currentChapters = selectedSubjectId ? chaptersFor(selectedSubjectId) : [];

  // Exam-level stats
  const examStats = useMemo(() => {
    if (!selectedExamId) return { done: 0, total: 0, pct: 0 };
    let done = 0, total = 0;
    for (const s of subjectsFor(selectedExamId)) {
      const chs = chaptersFor(s.id);
      done  += chs.filter(c => c.completed).length;
      total += chs.length;
    }
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [syllabus, selectedExamId, subjectsFor, chaptersFor]);

  const subjectDone  = currentChapters.filter(c => c.completed).length;
  const subjectTotal = currentChapters.length;
  const subjectPct   = subjectTotal === 0 ? 0 : Math.round((subjectDone / subjectTotal) * 100);

  const motivationalMsg = (pct) => {
    if (pct === 100) return { msg: '🎉 You\'ve covered it all! Amazing work!', cls: 'text-emerald-400' };
    if (pct >= 80)   return { msg: '🔥 Almost there — keep going!', cls: 'text-amber-400' };
    if (pct >= 50)   return { msg: '⚡ Great momentum! Halfway done.', cls: 'text-orange-400' };
    if (pct >= 20)   return { msg: '📚 Making progress — stay consistent!', cls: 'text-blue-400' };
    return                   { msg: '🚀 Let\'s get started!', cls: 'text-indigo-400' };
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-6xl mx-auto">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-emerald-600/15 p-2 rounded-xl border border-emerald-500/20">
            <Target className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            My Syllabus &amp; Progress
          </h2>
        </div>
        <p className="text-sm text-slate-400 mt-1 ml-14">
          Track your exam preparation and chapter completion.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card p-16 rounded-2xl text-center text-slate-600">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No syllabus assigned yet.</p>
          <p className="text-xs mt-1 opacity-70">Your tutor will set up your exam syllabus soon!</p>
        </div>
      ) : (
        <>
          {/* Exam overview cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {exams.map(exam => {
              let done = 0, total = 0;
              for (const s of subjectsFor(exam.id)) {
                const chs = chaptersFor(s.id);
                done  += chs.filter(c => c.completed).length;
                total += chs.length;
              }
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              const c   = col(pct);
              const isSelected = selectedExamId === exam.id;

              return (
                <button
                  key={exam.id}
                  onClick={() => { setSelectedExamId(isSelected ? null : exam.id); setSelectedSubjectId(null); }}
                  className={`glass-card p-4 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                    isSelected ? `${c.bg} ${c.border}` : 'border-transparent hover:border-slate-700'
                  }`}
                >
                  <ProgressRing percent={pct} size={72} strokeWidth={6} />
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-200">{exam.name}</p>
                    <p className={`text-xs font-semibold ${c.text}`}>{done}/{total} chapters</p>
                  </div>
                  {pct === 100 && total > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Trophy className="h-2.5 w-2.5" /> Complete
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected exam detail */}
          {selectedExamId && (
            <>
              {/* Exam progress banner */}
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center gap-5 flex-wrap">
                  <ProgressRing percent={examStats.pct} size={90} strokeWidth={7} />
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="text-lg font-extrabold text-white mb-0.5">{selectedExam?.name}</h3>
                    <p className={`text-sm font-semibold ${col(examStats.pct).text}`}>
                      {examStats.done} of {examStats.total} chapters completed
                    </p>
                    <div className="mt-2.5 h-2 bg-slate-800 rounded-full overflow-hidden max-w-xs">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${col(examStats.pct).bar}`}
                        style={{ width: `${examStats.pct}%` }}
                      />
                    </div>
                    <p className={`text-xs font-semibold mt-2 ${motivationalMsg(examStats.pct).cls}`}>
                      {motivationalMsg(examStats.pct).msg}
                    </p>
                  </div>
                  {/* Per-subject rings */}
                  <div className="flex flex-wrap gap-4">
                    {currentSubjects.map(s => {
                      const chs  = chaptersFor(s.id);
                      const done = chs.filter(c => c.completed).length;
                      const pct  = chs.length === 0 ? 0 : Math.round((done / chs.length) * 100);
                      return <ProgressRing key={s.id} percent={pct} size={60} strokeWidth={5} label={s.name} />;
                    })}
                  </div>
                </div>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Subjects panel */}
                <div className="lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col gap-3 min-h-[380px]">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-400" /> Subjects
                  </h3>
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                    {currentSubjects.length === 0 ? (
                      <div className="flex items-center justify-center h-24 text-slate-600 text-xs">
                        No subjects yet
                      </div>
                    ) : (
                      currentSubjects.map(subject => {
                        const chs  = chaptersFor(subject.id);
                        const done = chs.filter(c => c.completed).length;
                        const pct  = chs.length === 0 ? 0 : Math.round((done / chs.length) * 100);
                        const c    = col(pct);
                        const isSel = selectedSubjectId === subject.id;

                        return (
                          <button
                            key={subject.id}
                            onClick={() => setSelectedSubjectId(isSel ? null : subject.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                              isSel
                                ? `${c.bg} ${c.border}`
                                : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-bold ${isSel ? c.text : 'text-slate-200'}`}>
                                {subject.name}
                              </span>
                              <span className={`text-xs font-extrabold ${c.text}`}>{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-600">{done}/{chs.length} chapters</span>
                              {pct === 100 && chs.length > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                                  <Trophy className="h-2.5 w-2.5" /> Done!
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Chapter list panel */}
                <div className="lg:col-span-3 glass-card p-5 rounded-2xl flex flex-col gap-4 min-h-[380px]">
                  {!selectedSubjectId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                      <BarChart2 className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">Click a subject to see its chapters</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                          {selectedSubject?.name}
                        </h3>
                        <p className={`text-xs font-semibold mt-0.5 ${col(subjectPct).text}`}>
                          {subjectDone}/{subjectTotal} chapters &bull; {subjectPct}% complete
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden -mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${col(subjectPct).bar}`}
                          style={{ width: `${subjectPct}%` }}
                        />
                      </div>

                      {currentChapters.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-600">
                          <p className="text-xs">No chapters in this subject yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[480px] pr-1">
                          {currentChapters.map((chapter, idx) => (
                            <div
                              key={chapter.id}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                chapter.completed
                                  ? 'bg-emerald-500/5 border-emerald-500/15'
                                  : 'bg-slate-900/30 border-slate-800/50'
                              }`}
                            >
                              {/* Index */}
                              <span className="text-[11px] font-bold text-slate-700 w-5 text-right flex-shrink-0 select-none">
                                {idx + 1}
                              </span>

                              {/* Status icon (read-only) */}
                              {chapter.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-700 flex-shrink-0" />
                              )}

                              {/* Chapter name */}
                              <span
                                className={`flex-1 text-sm font-medium ${
                                  chapter.completed ? 'line-through text-slate-600' : 'text-slate-200'
                                }`}
                              >
                                {chapter.name}
                              </span>

                              {chapter.completed && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  ✓ Done
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Completion celebration */}
                      {subjectTotal > 0 && subjectPct === 100 && (
                        <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                          <Trophy className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                          <p className="text-sm font-bold text-emerald-400">
                            🎉 <span className="text-white">{selectedSubject?.name}</span> is complete!
                          </p>
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className={`${col(subjectPct).bg} ${col(subjectPct).border} border rounded-xl p-3 text-center`}>
                          <div className={`text-xl font-extrabold ${col(subjectPct).text}`}>{subjectPct}%</div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Complete</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 text-center">
                          <div className="text-xl font-extrabold text-white">{subjectDone}</div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Done</div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 text-center">
                          <div className="text-xl font-extrabold text-slate-300">{subjectTotal - subjectDone}</div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Remaining</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
