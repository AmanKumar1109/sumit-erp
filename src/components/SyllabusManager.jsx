import React, { useState, useMemo, useCallback } from 'react';
import {
  Target, Plus, Trash2, Pencil, X, Save, CheckCircle2, Circle,
  ChevronRight, BookOpen, User, Upload, AlertTriangle, Trophy,
  Zap, Star, BarChart2
} from 'lucide-react';

// ─── Circular Progress Ring (SVG) ────────────────────────────────────────────
function ProgressRing({ percent, size = 88, strokeWidth = 7 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const color =
    percent === 100 ? '#10b981'
    : percent >= 60  ? '#f59e0b'
    : percent >= 30  ? '#f97316'
    :                  '#f43f5e';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.65s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold text-white leading-none">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

// ─── Color palette by completion % ───────────────────────────────────────────
const col = (pct) => {
  if (pct === 100) return { bar: 'bg-emerald-500', text: 'text-emerald-400', ring: '#10b981', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (pct >= 60)   return { bar: 'bg-amber-500',   text: 'text-amber-400',   ring: '#f59e0b', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  if (pct >= 30)   return { bar: 'bg-orange-500',  text: 'text-orange-400',  ring: '#f97316', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
  return               { bar: 'bg-rose-500',    text: 'text-rose-400',    ring: '#f43f5e', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
};

// ─── Markdown parser ─────────────────────────────────────────────────────────
const parseMarkdown = (md) => {
  const lines = md.split('\n');
  const result = [];
  let current = null;
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (/^#{1,3}\s/.test(t)) {
      const name = t.replace(/^#+\s*/, '').trim();
      if (name) { current = { name, chapters: [] }; result.push(current); }
    } else if (/^[-*•]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
      const name = t.replace(/^[-*•\d.)\s]+/, '').trim();
      if (name && current) current.chapters.push(name);
    }
  }
  return result;
};

// ─── Reusable small Dialog wrapper ───────────────────────────────────────────
function Dialog({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export default function SyllabusManager({ students, syllabus, onSaveSyllabus, onDeleteSyllabus }) {
  // ── Selection state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExamId, setSelectedExamId]     = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // ── Dialog state
  const [examDialog,    setExamDialog]    = useState({ open: false, name: '', editId: null });
  const [subjectDialog, setSubjectDialog] = useState({ open: false, name: '', editId: null });
  const [chapterDialog, setChapterDialog] = useState({ open: false, name: '', editId: null });
  const [importDialog,  setImportDialog]  = useState({ open: false, markdown: '', parsed: [], step: 'input' });
  const [deleteConfirm, setDeleteConfirm] = useState({ id: null, type: null, label: '' });

  const [saving,   setSaving]   = useState(false);
  const [toggling, setToggling] = useState(null);

  // ── Helpers
  const student = students.find(s => s.id === selectedStudentId);

  const exams = useMemo(() =>
    syllabus
      .filter(d => d.type === 'exam' && d.studentId === selectedStudentId)
      .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [syllabus, selectedStudentId]);

  const subjectsFor = useCallback((examId) =>
    syllabus
      .filter(d => d.type === 'subject' && d.examId === examId)
      .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [syllabus]);

  const chaptersFor = useCallback((subjectId) =>
    syllabus
      .filter(d => d.type === 'chapter' && d.subjectId === subjectId)
      .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [syllabus]);

  const selectedExam    = exams.find(e => e.id === selectedExamId);
  const selectedSubject = syllabus.find(d => d.id === selectedSubjectId);
  const currentSubjects = selectedExamId ? subjectsFor(selectedExamId) : [];
  const currentChapters = selectedSubjectId ? chaptersFor(selectedSubjectId) : [];

  // Exam-level progress
  const examProgress = useMemo(() => {
    if (!selectedExamId) return { done: 0, total: 0, pct: 0 };
    let done = 0, total = 0;
    for (const s of subjectsFor(selectedExamId)) {
      const chs = chaptersFor(s.id);
      done += chs.filter(c => c.completed).length;
      total += chs.length;
    }
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [syllabus, selectedExamId, subjectsFor, chaptersFor]);

  // Subject-level progress (for right panel header)
  const subjectDone  = currentChapters.filter(c => c.completed).length;
  const subjectTotal = currentChapters.length;
  const subjectPct   = subjectTotal === 0 ? 0 : Math.round((subjectDone / subjectTotal) * 100);

  // ── Navigation helpers
  const changeStudent = (id) => {
    setSelectedStudentId(id);
    setSelectedExamId(null);
    setSelectedSubjectId(null);
  };
  const changeExam = (id) => {
    setSelectedExamId(id);
    setSelectedSubjectId(null);
  };

  // ── Save handlers
  const saveExam = async () => {
    if (!examDialog.name.trim() || !selectedStudentId) return;
    setSaving(true);
    try {
      const existing = syllabus.find(d => d.id === examDialog.editId);
      await onSaveSyllabus({
        ...(examDialog.editId ? { id: examDialog.editId } : {}),
        type: 'exam',
        studentId: selectedStudentId,
        studentName: student?.name || 'Unknown',
        name: examDialog.name.trim(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
      setExamDialog({ open: false, name: '', editId: null });
    } finally { setSaving(false); }
  };

  const saveSubject = async () => {
    if (!subjectDialog.name.trim() || !selectedExamId) return;
    setSaving(true);
    try {
      const existing = syllabus.find(d => d.id === subjectDialog.editId);
      await onSaveSyllabus({
        ...(subjectDialog.editId ? { id: subjectDialog.editId } : {}),
        type: 'subject',
        studentId: selectedStudentId,
        studentName: student?.name || 'Unknown',
        examId: selectedExamId,
        name: subjectDialog.name.trim(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
      setSubjectDialog({ open: false, name: '', editId: null });
    } finally { setSaving(false); }
  };

  const saveChapter = async () => {
    if (!chapterDialog.name.trim() || !selectedSubjectId) return;
    setSaving(true);
    try {
      const existing = syllabus.find(d => d.id === chapterDialog.editId);
      await onSaveSyllabus({
        ...(chapterDialog.editId ? { id: chapterDialog.editId } : {}),
        type: 'chapter',
        studentId: selectedStudentId,
        studentName: student?.name || 'Unknown',
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        name: chapterDialog.name.trim(),
        completed: existing?.completed ?? false,
        completedAt: existing?.completedAt ?? null,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
      setChapterDialog({ open: false, name: '', editId: null });
    } finally { setSaving(false); }
  };

  const toggleChapter = async (chapter) => {
    setToggling(chapter.id);
    try {
      await onSaveSyllabus({
        ...chapter,
        completed: !chapter.completed,
        completedAt: !chapter.completed ? new Date().toISOString() : null,
      });
    } finally { setToggling(null); }
  };

  // ── Cascade delete
  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      if (deleteConfirm.type === 'exam') {
        for (const s of subjectsFor(deleteConfirm.id)) {
          for (const c of chaptersFor(s.id)) await onDeleteSyllabus(c.id);
          await onDeleteSyllabus(s.id);
        }
        if (selectedExamId === deleteConfirm.id) { setSelectedExamId(null); setSelectedSubjectId(null); }
      } else if (deleteConfirm.type === 'subject') {
        for (const c of chaptersFor(deleteConfirm.id)) await onDeleteSyllabus(c.id);
        if (selectedSubjectId === deleteConfirm.id) setSelectedSubjectId(null);
      }
      await onDeleteSyllabus(deleteConfirm.id);
    } finally { setDeleteConfirm({ id: null, type: null, label: '' }); }
  };

  // ── Markdown import
  const handleParseMarkdown = () => {
    const parsed = parseMarkdown(importDialog.markdown);
    setImportDialog(p => ({ ...p, parsed, step: 'preview' }));
  };

  const handleImport = async () => {
    if (!selectedSubjectId && importDialog.parsed.length > 0) return; // need a subject for chapters
    // If parsed has subjects, create them; else bulk-add as chapters to selectedSubject
    setSaving(true);
    try {
      if (importDialog.parsed.length > 0 && importDialog.parsed[0].chapters !== undefined) {
        // Full syllabus import: subjects + chapters
        for (let si = 0; si < importDialog.parsed.length; si++) {
          const subj = importDialog.parsed[si];
          const subjId = `subj_${Date.now()}_${si}_${Math.random().toString(36).slice(2, 6)}`;
          await onSaveSyllabus({
            id: subjId,
            type: 'subject',
            studentId: selectedStudentId,
            studentName: student?.name || 'Unknown',
            examId: selectedExamId,
            name: subj.name,
            createdAt: new Date(Date.now() + si * 10).toISOString(),
          });
          for (let ci = 0; ci < subj.chapters.length; ci++) {
            await onSaveSyllabus({
              type: 'chapter',
              studentId: selectedStudentId,
              studentName: student?.name || 'Unknown',
              examId: selectedExamId,
              subjectId: subjId,
              name: subj.chapters[ci],
              completed: false,
              completedAt: null,
              createdAt: new Date(Date.now() + si * 1000 + ci * 10).toISOString(),
            });
          }
        }
      }
      setImportDialog({ open: false, markdown: '', parsed: [], step: 'input' });
    } finally { setSaving(false); }
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-emerald-600/15 p-2 rounded-xl border border-emerald-500/20">
            <Target className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Syllabus &amp; Progress
          </h2>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Manage exam-wise syllabi and track chapter completion for each student.
        </p>
      </div>

      {/* ── Student Selector */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          <User className="h-3.5 w-3.5" /> Student
        </div>
        <select
          value={selectedStudentId}
          onChange={e => changeStudent(e.target.value)}
          className="flex-1 w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition-all cursor-pointer"
        >
          <option value="" className="bg-slate-950">-- Select a student --</option>
          {students.map(s => (
            <option key={s.id} value={s.id} className="bg-slate-950">{s.name} ({s.studentClass})</option>
          ))}
        </select>
      </div>

      {selectedStudentId ? (
        <>
          {/* ── Exam Tabs */}
          <div className="glass-card px-4 py-3.5 rounded-2xl flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exam:</span>
            <div className="flex flex-wrap gap-2 flex-1">
              {exams.map(exam => (
                <div key={exam.id} className="relative group">
                  <button
                    onClick={() => changeExam(exam.id)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      selectedExamId === exam.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {exam.name}
                  </button>
                  <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 z-10">
                    <button
                      onClick={() => setExamDialog({ open: true, name: exam.name, editId: exam.id })}
                      className="p-0.5 bg-slate-900 border border-slate-700 rounded text-slate-500 hover:text-blue-400 cursor-pointer"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: exam.id, type: 'exam', label: exam.name })}
                      className="p-0.5 bg-slate-900 border border-slate-700 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setExamDialog({ open: true, name: '', editId: null })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 border border-dashed border-emerald-500/40 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> New Exam
              </button>
            </div>
          </div>

          {selectedExamId ? (
            <>
              {/* ── Exam Progress Banner */}
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center gap-6 flex-wrap">
                  <ProgressRing percent={examProgress.pct} size={90} strokeWidth={7} />
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-lg font-extrabold text-white">{selectedExam?.name}</h3>
                      {examProgress.pct === 100 && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Complete!
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-semibold ${col(examProgress.pct).text}`}>
                      {examProgress.done} of {examProgress.total} chapters completed
                    </p>
                    <div className="mt-2.5 h-2 bg-slate-800 rounded-full overflow-hidden max-w-xs">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${col(examProgress.pct).bar}`}
                        style={{ width: `${examProgress.pct}%` }}
                      />
                    </div>
                    {examProgress.pct === 100 && (
                      <p className="text-xs text-emerald-400 mt-2 font-semibold">
                        🎉 Excellent! The entire syllabus has been covered!
                      </p>
                    )}
                  </div>
                  {/* Quick stats */}
                  <div className="flex gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-white">{examProgress.total - examProgress.done}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Left</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-emerald-400">{examProgress.done}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Done</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-indigo-400">{currentSubjects.length}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Subjects</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Two-column: Subjects + Chapters */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Subjects panel */}
                <div className="lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col gap-4 min-h-[420px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-400" /> Subjects
                    </h3>
                    <button
                      onClick={() => setSubjectDialog({ open: true, name: '', editId: null })}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Subject
                    </button>
                  </div>

                  {currentSubjects.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                      <BarChart2 className="h-8 w-8 mb-2 opacity-25" />
                      <p className="text-xs text-center">No subjects yet.<br />Click "+ Add Subject" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                      {currentSubjects.map(subject => {
                        const chs  = chaptersFor(subject.id);
                        const done = chs.filter(c => c.completed).length;
                        const pct  = chs.length === 0 ? 0 : Math.round((done / chs.length) * 100);
                        const c    = col(pct);
                        const isSel = selectedSubjectId === subject.id;

                        return (
                          <div
                            key={subject.id}
                            onClick={() => setSelectedSubjectId(isSel ? null : subject.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                              isSel
                                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                                : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-bold truncate ${isSel ? 'text-emerald-300' : 'text-slate-200'}`}>
                                    {subject.name}
                                  </span>
                                  <span className={`text-xs font-extrabold ml-2 flex-shrink-0 ${c.text}`}>{pct}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-600 font-medium">{done}/{chs.length} chapters</span>
                                  {pct === 100 && chs.length > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                                      <Trophy className="h-2.5 w-2.5" /> Done!
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => setSubjectDialog({ open: true, name: subject.name, editId: subject.id })}
                                  className="p-1.5 text-slate-600 hover:text-blue-400 rounded cursor-pointer hover:bg-blue-500/10 transition-colors"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ id: subject.id, type: 'subject', label: subject.name })}
                                  className="p-1.5 text-slate-600 hover:text-red-400 rounded cursor-pointer hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Chapters panel */}
                <div className="lg:col-span-3 glass-card p-5 rounded-2xl flex flex-col gap-4 min-h-[420px]">
                  {!selectedSubjectId ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-600">
                      <Target className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">Select a subject to see its chapters</p>
                    </div>
                  ) : (
                    <>
                      {/* Chapter panel header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                            {selectedSubject?.name}
                          </h3>
                          <p className={`text-xs font-semibold mt-0.5 ${col(subjectPct).text}`}>
                            {subjectDone}/{subjectTotal} chapters &bull; {subjectPct}% complete
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setImportDialog({ open: true, markdown: '', parsed: [], step: 'input' })}
                            className="flex items-center gap-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer"
                          >
                            <Upload className="h-3.5 w-3.5" /> Import MD
                          </button>
                          <button
                            onClick={() => setChapterDialog({ open: true, name: '', editId: null })}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add Chapter
                          </button>
                        </div>
                      </div>

                      {/* Subject progress bar */}
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden -mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${col(subjectPct).bar}`}
                          style={{ width: `${subjectPct}%` }}
                        />
                      </div>

                      {currentChapters.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-600">
                          <p className="text-xs text-center">No chapters yet.<br />Add chapters or import from markdown!</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[520px] pr-1">
                          {currentChapters.map((chapter, idx) => {
                            const isToggling = toggling === chapter.id;
                            return (
                              <div
                                key={chapter.id}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${
                                  chapter.completed
                                    ? 'bg-emerald-500/5 border-emerald-500/15'
                                    : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
                                }`}
                              >
                                {/* Index */}
                                <span className="text-[11px] font-bold text-slate-700 w-5 text-right flex-shrink-0 select-none">
                                  {idx + 1}
                                </span>

                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleChapter(chapter)}
                                  disabled={isToggling}
                                  className={`flex-shrink-0 transition-all duration-200 cursor-pointer ${
                                    isToggling ? 'opacity-40 scale-90' : 'hover:scale-110 active:scale-90'
                                  }`}
                                >
                                  {chapter.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-slate-700 hover:text-emerald-400 transition-colors" />
                                  )}
                                </button>

                                {/* Chapter name */}
                                <span
                                  className={`flex-1 text-sm font-medium transition-all duration-300 ${
                                    chapter.completed
                                      ? 'line-through text-slate-600'
                                      : 'text-slate-200'
                                  }`}
                                >
                                  {chapter.name}
                                </span>

                                {/* Done badge */}
                                {chapter.completed && (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    ✓ Done
                                  </span>
                                )}

                                {/* Actions */}
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={() => setChapterDialog({ open: true, name: chapter.name, editId: chapter.id })}
                                    className="p-1 text-slate-700 hover:text-blue-400 rounded cursor-pointer transition-colors"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ id: chapter.id, type: 'chapter', label: chapter.name })}
                                    className="p-1 text-slate-700 hover:text-red-400 rounded cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Completion celebration */}
                      {subjectTotal > 0 && subjectPct === 100 && (
                        <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                          <Trophy className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                          <p className="text-sm font-bold text-emerald-400">
                            🎉 All chapters in <span className="text-white">{selectedSubject?.name}</span> are complete!
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-slate-600">
              <Target className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Select or create an exam above to get started.</p>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-slate-600">
          <Target className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">Select a student to manage their syllabus.</p>
        </div>
      )}

      {/* ═══════════ DIALOGS ═══════════ */}

      {/* Exam Dialog */}
      {examDialog.open && (
        <Dialog
          title={examDialog.editId ? '✏️ Rename Exam' : '🎯 New Exam'}
          onClose={() => setExamDialog({ open: false, name: '', editId: null })}
        >
          <input
            autoFocus type="text" value={examDialog.name}
            onChange={e => setExamDialog(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && saveExam()}
            placeholder="e.g. UT-1, Half Yearly, Annual Exam..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all placeholder:text-slate-600"
          />
          <button
            onClick={saveExam}
            disabled={!examDialog.name.trim() || saving}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : examDialog.editId ? 'Update' : 'Create Exam'}
          </button>
        </Dialog>
      )}

      {/* Subject Dialog */}
      {subjectDialog.open && (
        <Dialog
          title={subjectDialog.editId ? '✏️ Rename Subject' : '📚 Add Subject'}
          onClose={() => setSubjectDialog({ open: false, name: '', editId: null })}
        >
          <input
            autoFocus type="text" value={subjectDialog.name}
            onChange={e => setSubjectDialog(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && saveSubject()}
            placeholder="e.g. Mathematics, Physics, Chemistry..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all placeholder:text-slate-600"
          />
          <button
            onClick={saveSubject}
            disabled={!subjectDialog.name.trim() || saving}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : subjectDialog.editId ? 'Update' : 'Add Subject'}
          </button>
        </Dialog>
      )}

      {/* Chapter Dialog */}
      {chapterDialog.open && (
        <Dialog
          title={chapterDialog.editId ? '✏️ Rename Chapter' : '📖 Add Chapter'}
          onClose={() => setChapterDialog({ open: false, name: '', editId: null })}
        >
          <input
            autoFocus type="text" value={chapterDialog.name}
            onChange={e => setChapterDialog(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && saveChapter()}
            placeholder="e.g. Chapter 1: Real Numbers, Light..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all placeholder:text-slate-600"
          />
          <button
            onClick={saveChapter}
            disabled={!chapterDialog.name.trim() || saving}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : chapterDialog.editId ? 'Update' : 'Add Chapter'}
          </button>
        </Dialog>
      )}

      {/* Import Markdown Dialog */}
      {importDialog.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
              <h3 className="text-lg font-bold text-white">
                {importDialog.step === 'input' ? '📥 Import from Markdown' : '👀 Preview & Import'}
              </h3>
              <button
                onClick={() => setImportDialog({ open: false, markdown: '', parsed: [], step: 'input' })}
                className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {importDialog.step === 'input' ? (
                <>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Paste your syllabus in markdown format. Use{' '}
                    <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded"># Subject Name</code>{' '}
                    for subjects and{' '}
                    <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded">- Chapter Name</code>{' '}
                    for chapters under each subject. All chapters will be created under the currently selected subject's exam.
                  </p>
                  {/* Example */}
                  <div className="bg-[#0d1117] border border-slate-700/60 rounded-xl px-4 py-3 mb-4 font-mono text-xs space-y-0.5">
                    <div className="text-purple-400"># Mathematics</div>
                    <div className="text-slate-400">- Real Numbers</div>
                    <div className="text-slate-400">- Polynomials</div>
                    <div className="text-slate-400">- Pair of Linear Equations</div>
                    <div className="mt-1 text-purple-400"># Physics</div>
                    <div className="text-slate-400">- Light — Reflection and Refraction</div>
                    <div className="text-slate-400">- Human Eye and Colourful World</div>
                    <div className="text-slate-400">- Electricity</div>
                  </div>
                  <textarea
                    autoFocus
                    value={importDialog.markdown}
                    onChange={e => setImportDialog(p => ({ ...p, markdown: e.target.value }))}
                    placeholder="Paste your markdown syllabus here..."
                    rows={12}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 resize-none placeholder:text-slate-700 leading-relaxed"
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                    <Star className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm text-slate-300">
                      Found{' '}
                      <span className="text-emerald-400 font-bold">{importDialog.parsed.length} subject{importDialog.parsed.length !== 1 ? 's' : ''}</span>
                      {' '}and{' '}
                      <span className="text-emerald-400 font-bold">
                        {importDialog.parsed.reduce((a, s) => a + s.chapters.length, 0)} chapters
                      </span>. Review before importing.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {importDialog.parsed.map((subject, si) => (
                      <div key={si} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                          <span className="font-bold text-slate-200">{subject.name}</span>
                          <span className="text-xs text-slate-600">({subject.chapters.length} ch)</span>
                        </div>
                        <div className="space-y-1.5 pl-6">
                          {subject.chapters.map((ch, ci) => (
                            <div key={ci} className="flex items-center gap-2 text-sm text-slate-400">
                              <Circle className="h-3 w-3 text-slate-700 flex-shrink-0" />
                              {ch}
                            </div>
                          ))}
                          {subject.chapters.length === 0 && (
                            <p className="text-xs text-slate-600 italic">No chapters found under this subject</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex gap-3 justify-end flex-shrink-0">
              {importDialog.step === 'input' ? (
                <>
                  <button
                    onClick={() => setImportDialog({ open: false, markdown: '', parsed: [], step: 'input' })}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleParseMarkdown}
                    disabled={!importDialog.markdown.trim()}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" /> Parse & Preview
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setImportDialog(p => ({ ...p, step: 'input' }))}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={saving || importDialog.parsed.length === 0}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {saving ? 'Importing...' : <><Star className="h-4 w-4" /> Import Syllabus</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm.id && (
        <Dialog
          title="⚠️ Confirm Delete"
          onClose={() => setDeleteConfirm({ id: null, type: null, label: '' })}
        >
          <div className="flex items-start gap-3 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              {deleteConfirm.type === 'exam'
                ? `Deleting "${deleteConfirm.label}" will permanently remove this exam and all its subjects and chapters.`
                : deleteConfirm.type === 'subject'
                ? `Deleting "${deleteConfirm.label}" will permanently remove this subject and all its chapters.`
                : `Delete chapter "${deleteConfirm.label}"?`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm({ id: null, type: null, label: '' })}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={executeDelete}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
