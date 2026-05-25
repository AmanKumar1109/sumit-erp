import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Library, FolderOpen, Folder, ChevronRight, ChevronDown,
  Plus, Pencil, Trash2, X, Save, Link as LinkIcon, FileText,
  Eye, Code, BookOpen, ExternalLink, User, AlertTriangle
} from 'lucide-react';

// ─── Notion-style markdown component overrides ───────────────────────────────
const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl font-extrabold text-white border-b border-slate-700/60 pb-2 mb-4 mt-6 first:mt-0 tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800/60 pb-1.5 mb-3 mt-5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold text-indigo-300 mb-2 mt-4">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-bold text-slate-200 mb-2 mt-3">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-sm font-semibold text-slate-300 mb-1 mt-2">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-xs font-semibold text-slate-400 mb-1 mt-2 uppercase tracking-wide">{children}</h6>
  ),
  p: ({ children }) => (
    <p className="text-sm text-slate-300 leading-relaxed mb-3">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-amber-300/90">{children}</em>
  ),
  del: ({ children }) => (
    <del className="line-through text-slate-500">{children}</del>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-3 ml-1 text-sm text-slate-300">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <span className="text-violet-400 mt-1 flex-shrink-0 text-xs">▸</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-orange-500/50 pl-4 py-1 my-3 bg-slate-900/30 rounded-r-xl italic text-slate-400 text-sm">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) => {
    if (inline) {
      return (
        <code className="bg-orange-500/15 text-orange-300 px-1.5 py-0.5 rounded text-xs font-mono border border-orange-500/20">
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-[#0d1117] border border-slate-700/60 rounded-xl p-4 overflow-x-auto mb-4 mt-2">
        <code className="text-xs font-mono text-slate-300 leading-relaxed">{children}</code>
      </pre>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="border-slate-700/60 my-6" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4 rounded-xl border border-slate-700/40">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-800/60">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-slate-800/50">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-slate-800/20 transition-colors">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-slate-300 text-xs">{children}</td>
  ),
  img: ({ src, alt }) => (
    <img src={src} alt={alt} className="max-w-full rounded-xl my-3 border border-slate-700/50" />
  ),
};

// ─── Small reusable modal wrapper ────────────────────────────────────────────
function Dialog({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudyMaterialManager({
  students,
  studyMaterial,
  onSaveStudyMaterial,
  onDeleteStudyMaterial,
}) {
  // ── Selection
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  // ── Dialogs
  const [subjectDialog, setSubjectDialog] = useState({ open: false, name: '', editId: null });
  const [chapterDialog, setChapterDialog] = useState({ open: false, name: '', editId: null });
  const [materialDialog, setMaterialDialog] = useState({
    open: false,
    editId: null,
    title: '',
    type: 'link',
    link: '',
    markdown: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ id: null, type: null, label: '' });
  const [saving, setSaving] = useState(false);

  // ── Derived data
  const subjects = useMemo(
    () =>
      studyMaterial
        .filter((d) => d.type === 'subject' && d.studentId === selectedStudentId)
        .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [studyMaterial, selectedStudentId]
  );

  const chaptersFor = (subjectId) =>
    studyMaterial
      .filter((d) => d.type === 'chapter' && d.subjectId === subjectId)
      .sort((a, b) => a.createdAt?.localeCompare(b.createdAt));

  const materialsForChapter = useMemo(
    () =>
      studyMaterial
        .filter((d) => d.type === 'material' && d.chapterId === selectedChapterId)
        .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [studyMaterial, selectedChapterId]
  );

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const selectedChapter = studyMaterial.find((d) => d.id === selectedChapterId);

  // ── Tree helpers
  const toggleSubject = (subjectId) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
        if (selectedSubjectId === subjectId) {
          setSelectedSubjectId(null);
          setSelectedChapterId(null);
        }
      } else {
        next.add(subjectId);
        setSelectedSubjectId(subjectId);
      }
      return next;
    });
  };

  const selectChapter = (chapterId) => {
    setSelectedChapterId((prev) => (prev === chapterId ? null : chapterId));
  };

  const changeStudent = (id) => {
    setSelectedStudentId(id);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setExpandedSubjects(new Set());
  };

  // ── Save handlers
  const saveSubject = async () => {
    if (!subjectDialog.name.trim() || !selectedStudentId) return;
    setSaving(true);
    const student = students.find((s) => s.id === selectedStudentId);
    try {
      const existing = studyMaterial.find((d) => d.id === subjectDialog.editId);
      await onSaveStudyMaterial({
        ...(subjectDialog.editId ? { id: subjectDialog.editId } : {}),
        type: 'subject',
        studentId: selectedStudentId,
        studentName: student?.name || 'Unknown',
        name: subjectDialog.name.trim(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
      setSubjectDialog({ open: false, name: '', editId: null });
    } finally {
      setSaving(false);
    }
  };

  const saveChapter = async () => {
    if (!chapterDialog.name.trim() || !selectedSubjectId) return;
    setSaving(true);
    const student = students.find((s) => s.id === selectedStudentId);
    try {
      const existing = studyMaterial.find((d) => d.id === chapterDialog.editId);
      await onSaveStudyMaterial({
        ...(chapterDialog.editId ? { id: chapterDialog.editId } : {}),
        type: 'chapter',
        studentId: selectedStudentId,
        studentName: student?.name || 'Unknown',
        subjectId: selectedSubjectId,
        name: chapterDialog.name.trim(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
      setChapterDialog({ open: false, name: '', editId: null });
    } finally {
      setSaving(false);
    }
  };

  const saveMaterial = async () => {
    if (!materialDialog.title.trim() || !selectedChapterId) return;
    setSaving(true);
    const student = students.find((s) => s.id === selectedStudentId);
    try {
      const existing = studyMaterial.find((d) => d.id === materialDialog.editId);
      await onSaveStudyMaterial({
        ...(materialDialog.editId ? { id: materialDialog.editId } : {}),
        type: 'material',
        studentId: selectedStudentId,
        studentName: student?.name || 'Unknown',
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
        title: materialDialog.title.trim(),
        materialType: materialDialog.type,
        link: materialDialog.type === 'link' ? materialDialog.link.trim() : '',
        markdown: materialDialog.type === 'markdown' ? materialDialog.markdown : '',
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
      setMaterialDialog({ open: false, editId: null, title: '', type: 'link', link: '', markdown: '' });
    } finally {
      setSaving(false);
    }
  };

  // ── Cascade delete
  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      if (deleteConfirm.type === 'subject') {
        const chapters = studyMaterial.filter(
          (d) => d.type === 'chapter' && d.subjectId === deleteConfirm.id
        );
        for (const ch of chapters) {
          const mats = studyMaterial.filter(
            (d) => d.type === 'material' && d.chapterId === ch.id
          );
          for (const m of mats) await onDeleteStudyMaterial(m.id);
          await onDeleteStudyMaterial(ch.id);
        }
        if (selectedSubjectId === deleteConfirm.id) {
          setSelectedSubjectId(null);
          setSelectedChapterId(null);
          setExpandedSubjects((prev) => {
            const next = new Set(prev);
            next.delete(deleteConfirm.id);
            return next;
          });
        }
      } else if (deleteConfirm.type === 'chapter') {
        const mats = studyMaterial.filter(
          (d) => d.type === 'material' && d.chapterId === deleteConfirm.id
        );
        for (const m of mats) await onDeleteStudyMaterial(m.id);
        if (selectedChapterId === deleteConfirm.id) setSelectedChapterId(null);
      }
      await onDeleteStudyMaterial(deleteConfirm.id);
    } finally {
      setDeleteConfirm({ id: null, type: null, label: '' });
    }
  };

  const openMaterialEdit = (material) => {
    setMaterialDialog({
      open: true,
      editId: material.id,
      title: material.title,
      type: material.materialType || 'link',
      link: material.link || '',
      markdown: material.markdown || '',
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-violet-600/15 p-2 rounded-xl border border-violet-500/20">
            <Library className="h-5 w-5 text-violet-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Study Materials
          </h2>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Organise subject folders, chapters, links and notes for each student.
        </p>
      </div>

      {/* ── Student Selector */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          <User className="h-3.5 w-3.5" /> Student
        </div>
        <select
          value={selectedStudentId}
          onChange={(e) => changeStudent(e.target.value)}
          className="flex-1 w-full bg-slate-900/60 border border-slate-800 focus:border-violet-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/15 transition-all duration-300 cursor-pointer"
        >
          <option value="" className="bg-slate-950">-- Select a student --</option>
          {students.map((s) => (
            <option key={s.id} value={s.id} className="bg-slate-950">
              {s.name} ({s.studentClass})
            </option>
          ))}
        </select>
      </div>

      {/* ── Main content */}
      {selectedStudentId ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Subject / Chapter Tree */}
          <div className="lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col gap-4 min-h-[400px]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-violet-400" />
                Folders
              </h3>
              <button
                onClick={() => setSubjectDialog({ open: true, name: '', editId: null })}
                className="flex items-center gap-1.5 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1.5 rounded-lg hover:bg-violet-500/20 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> New Subject
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-600">
                <Folder className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs text-center">No subjects yet.<br />Click "+ New Subject" to start.</p>
              </div>
            ) : (
              <div className="space-y-1 flex-1 overflow-y-auto pr-1">
                {subjects.map((subject) => {
                  const isExpanded = expandedSubjects.has(subject.id);
                  const isSelectedSubject = selectedSubjectId === subject.id;
                  const chapters = chaptersFor(subject.id);

                  return (
                    <div key={subject.id}>
                      {/* Subject Row */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl group transition-all border ${
                          isSelectedSubject
                            ? 'bg-violet-500/10 border-violet-500/20'
                            : 'border-transparent hover:bg-slate-800/40'
                        }`}
                      >
                        <button
                          onClick={() => toggleSubject(subject.id)}
                          className="flex items-center gap-2 flex-1 text-left min-w-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          )}
                          <FolderOpen
                            className={`h-4 w-4 flex-shrink-0 ${isExpanded ? 'text-violet-400' : 'text-slate-500'}`}
                          />
                          <span
                            className={`text-sm font-semibold truncate ${
                              isSelectedSubject ? 'text-violet-300' : 'text-slate-300'
                            }`}
                          >
                            {subject.name}
                          </span>
                          <span className="text-[10px] text-slate-600 ml-auto flex-shrink-0">
                            {chapters.length}
                          </span>
                        </button>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() =>
                              setSubjectDialog({ open: true, name: subject.name, editId: subject.id })
                            }
                            className="p-1.5 text-slate-600 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
                            title="Rename"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ id: subject.id, type: 'subject', label: subject.name })
                            }
                            className="p-1.5 text-slate-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Chapters (expanded) */}
                      {isExpanded && (
                        <div className="ml-5 mt-0.5 mb-1 border-l border-slate-800 pl-3 space-y-0.5">
                          {chapters.length === 0 && (
                            <p className="text-[11px] text-slate-700 px-2 py-1.5 italic">No chapters yet</p>
                          )}
                          {chapters.map((chapter) => {
                            const isSelectedChapter = selectedChapterId === chapter.id;
                            return (
                              <div
                                key={chapter.id}
                                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl group transition-all border ${
                                  isSelectedChapter
                                    ? 'bg-indigo-500/10 border-indigo-500/20'
                                    : 'border-transparent hover:bg-slate-800/40'
                                }`}
                              >
                                <button
                                  onClick={() => selectChapter(chapter.id)}
                                  className="flex items-center gap-2 flex-1 text-left min-w-0"
                                >
                                  <FileText
                                    className={`h-3.5 w-3.5 flex-shrink-0 ${
                                      isSelectedChapter ? 'text-indigo-400' : 'text-slate-600'
                                    }`}
                                  />
                                  <span
                                    className={`text-xs font-medium truncate ${
                                      isSelectedChapter ? 'text-indigo-300' : 'text-slate-400'
                                    }`}
                                  >
                                    {chapter.name}
                                  </span>
                                </button>
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={() =>
                                      setChapterDialog({
                                        open: true,
                                        name: chapter.name,
                                        editId: chapter.id,
                                      })
                                    }
                                    className="p-1 text-slate-600 hover:text-blue-400 rounded transition-colors cursor-pointer"
                                    title="Rename"
                                  >
                                    <Pencil className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteConfirm({
                                        id: chapter.id,
                                        type: 'chapter',
                                        label: chapter.name,
                                      })
                                    }
                                    className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {/* Add Chapter button */}
                          <button
                            onClick={() => setChapterDialog({ open: true, name: '', editId: null })}
                            className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-[11px] text-slate-600 hover:text-violet-400 transition-colors cursor-pointer rounded-lg hover:bg-violet-500/5"
                          >
                            <Plus className="h-3 w-3" /> Add Chapter
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Materials Panel */}
          <div className="lg:col-span-3 glass-card p-5 rounded-2xl flex flex-col gap-4 min-h-[400px]">
            {!selectedChapterId ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-600">
                <BookOpen className="h-10 w-10 mb-3 opacity-25" />
                <p className="text-sm font-medium">Select a chapter to view materials</p>
                <p className="text-xs mt-1 opacity-60">Expand a subject → click a chapter</p>
              </div>
            ) : (
              <>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  <span className="text-violet-400 font-semibold">{selectedSubject?.name}</span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className="text-indigo-400 font-semibold">{selectedChapter?.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-300">Chapter Materials</h3>
                  <button
                    onClick={() =>
                      setMaterialDialog({
                        open: true,
                        editId: null,
                        title: '',
                        type: 'link',
                        link: '',
                        markdown: '',
                      })
                    }
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Material
                  </button>
                </div>

                {materialsForChapter.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-600">
                    <p className="text-xs text-center">
                      No materials yet.<br />Add a document link or markdown notes!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                    {materialsForChapter.map((material) => (
                      <div
                        key={material.id}
                        className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden"
                      >
                        {/* Material header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/40 bg-slate-900/40">
                          <div
                            className={`p-1.5 rounded-lg flex-shrink-0 ${
                              material.materialType === 'link'
                                ? 'bg-indigo-500/15'
                                : 'bg-amber-500/15'
                            }`}
                          >
                            {material.materialType === 'link' ? (
                              <LinkIcon className="h-3.5 w-3.5 text-indigo-400" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-amber-400" />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-200 flex-1 truncate">
                            {material.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              material.materialType === 'link'
                                ? 'bg-indigo-500/15 text-indigo-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {material.materialType === 'link' ? 'Link' : 'Notes'}
                          </span>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => openMaterialEdit(material)}
                              className="p-1.5 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  id: material.id,
                                  type: 'material',
                                  label: material.title,
                                })
                              }
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Material content */}
                        <div className="px-4 py-4">
                          {material.materialType === 'link' ? (
                            <a
                              href={material.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/20 transition-colors max-w-full group"
                            >
                              <ExternalLink className="h-3.5 w-3.5 group-hover:scale-110 transition-transform flex-shrink-0" />
                              <span className="truncate">{material.link || 'Open Link'}</span>
                            </a>
                          ) : (
                            <div className="prose-sm">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={mdComponents}
                              >
                                {material.markdown}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-slate-600">
          <Library className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">Select a student above to manage their study materials.</p>
        </div>
      )}

      {/* ═══ DIALOGS ═══ */}

      {/* Subject Dialog */}
      {subjectDialog.open && (
        <Dialog
          title={subjectDialog.editId ? '✏️ Rename Subject' : '📁 New Subject Folder'}
          onClose={() => setSubjectDialog({ open: false, name: '', editId: null })}
        >
          <input
            autoFocus
            type="text"
            value={subjectDialog.name}
            onChange={(e) => setSubjectDialog((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Mathematics, Physics, PYQs..."
            onKeyDown={(e) => e.key === 'Enter' && saveSubject()}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all placeholder:text-slate-600"
          />
          <button
            onClick={saveSubject}
            disabled={!subjectDialog.name.trim() || saving}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : subjectDialog.editId ? 'Update Name' : 'Create Folder'}
          </button>
        </Dialog>
      )}

      {/* Chapter Dialog */}
      {chapterDialog.open && (
        <Dialog
          title={chapterDialog.editId ? '✏️ Rename Chapter' : '📄 New Chapter'}
          onClose={() => setChapterDialog({ open: false, name: '', editId: null })}
        >
          <input
            autoFocus
            type="text"
            value={chapterDialog.name}
            onChange={(e) => setChapterDialog((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Chapter 1, Mechanics, Algebra..."
            onKeyDown={(e) => e.key === 'Enter' && saveChapter()}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all placeholder:text-slate-600"
          />
          <button
            onClick={saveChapter}
            disabled={!chapterDialog.name.trim() || saving}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : chapterDialog.editId ? 'Update Name' : 'Create Chapter'}
          </button>
        </Dialog>
      )}

      {/* Material Dialog (large — side-by-side markdown editor) */}
      {materialDialog.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl animate-fade-in">
            {/* Dialog header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
              <h3 className="text-lg font-bold text-white">
                {materialDialog.editId ? '✏️ Edit Material' : '➕ Add Material'}
              </h3>
              <button
                onClick={() =>
                  setMaterialDialog({
                    open: false,
                    editId: null,
                    title: '',
                    type: 'link',
                    link: '',
                    markdown: '',
                  })
                }
                className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                  Title <span className="text-pink-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={materialDialog.title}
                  onChange={(e) => setMaterialDialog((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Newton's Laws Notes, Chapter 1 Assignment Link..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Type toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMaterialDialog((p) => ({ ...p, type: 'link' }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      materialDialog.type === 'link'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <LinkIcon className="h-4 w-4" /> Document Link
                  </button>
                  <button
                    onClick={() => setMaterialDialog((p) => ({ ...p, type: 'markdown' }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      materialDialog.type === 'markdown'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <FileText className="h-4 w-4" /> Markdown Notes
                  </button>
                </div>
              </div>

              {/* Link input */}
              {materialDialog.type === 'link' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="url"
                      value={materialDialog.link}
                      onChange={(e) => setMaterialDialog((p) => ({ ...p, link: e.target.value }))}
                      placeholder="https://drive.google.com/file/..."
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* Markdown side-by-side editor */}
              {materialDialog.type === 'markdown' && (
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-400">Markdown Content</label>
                    <span className="text-[10px] text-slate-600 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Code className="h-3 w-3" /> Editor
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Live Preview
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 h-72 lg:h-96">
                    {/* Editor pane */}
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                        <Code className="h-2.5 w-2.5" /> Markdown
                      </div>
                      <textarea
                        value={materialDialog.markdown}
                        onChange={(e) =>
                          setMaterialDialog((p) => ({ ...p, markdown: e.target.value }))
                        }
                        placeholder={`# Chapter Title\n\nWrite your notes here...\n\n**Bold text**, *italic*, \`inline code\`\n\n- Bullet list item\n- Another item\n\n> Important note or quote\n\n\`\`\`python\nprint("Hello World")\n\`\`\`\n\n| Column A | Column B |\n|----------|----------|\n| Value 1  | Value 2  |`}
                        className="flex-1 bg-[#0d1117] border border-slate-700/60 text-slate-300 text-xs font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500/40 resize-none placeholder:text-slate-700 leading-relaxed"
                      />
                    </div>
                    {/* Preview pane */}
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5" /> Preview
                      </div>
                      <div className="flex-1 bg-slate-900/40 border border-slate-700/40 rounded-xl px-4 py-3 overflow-y-auto">
                        {materialDialog.markdown ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                            {materialDialog.markdown}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-xs text-slate-700 italic mt-2">
                            Start typing in the editor to see a live preview…
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dialog footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() =>
                  setMaterialDialog({
                    open: false,
                    editId: null,
                    title: '',
                    type: 'link',
                    link: '',
                    markdown: '',
                  })
                }
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveMaterial}
                disabled={!materialDialog.title.trim() || saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : materialDialog.editId ? 'Update Material' : 'Add Material'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm.id && (
        <Dialog
          title="⚠️ Confirm Delete"
          onClose={() => setDeleteConfirm({ id: null, type: null, label: '' })}
        >
          <div className="flex items-start gap-3 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              {deleteConfirm.type === 'subject'
                ? `Deleting "${deleteConfirm.label}" will permanently remove this subject folder, all its chapters, and all their materials.`
                : deleteConfirm.type === 'chapter'
                ? `Deleting "${deleteConfirm.label}" will permanently remove this chapter and all its materials.`
                : `Deleting "${deleteConfirm.label}" will permanently remove this material.`}
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
