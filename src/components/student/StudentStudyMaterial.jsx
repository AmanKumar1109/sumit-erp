import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Library, FolderOpen, FileText, ChevronRight, ChevronDown,
  ExternalLink, BookOpen, Link as LinkIcon
} from 'lucide-react';

// ─── Notion-style markdown components ────────────────────────────────────────
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
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-amber-300/90">{children}</em>,
  del: ({ children }) => <del className="line-through text-slate-500">{children}</del>,
  ul: ({ children }) => <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-3 ml-1 text-sm text-slate-300">
      {children}
    </ol>
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

// ─────────────────────────────────────────────────────────────────────────────
export default function StudentStudyMaterial({ studyMaterial }) {
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [expandedMaterials, setExpandedMaterials] = useState(new Set());

  // studyMaterial is already filtered to this student in App.jsx
  const subjects = useMemo(
    () =>
      studyMaterial
        .filter((d) => d.type === 'subject')
        .sort((a, b) => a.createdAt?.localeCompare(b.createdAt)),
    [studyMaterial]
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

  const selectedChapter = studyMaterial.find((d) => d.id === selectedChapterId);
  const selectedSubject = subjects.find((s) =>
    chaptersFor(s.id).some((c) => c.id === selectedChapterId)
  );

  const toggleSubject = (id) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMaterial = (id) => {
    setExpandedMaterials((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-violet-600/15 p-2 rounded-xl border border-violet-500/20">
            <Library className="h-5 w-5 text-violet-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Study Materials
          </h2>
        </div>
        <p className="text-sm text-slate-400 mt-1 ml-14">
          Browse your subjects, chapters, and learning resources.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="glass-card p-16 rounded-2xl text-center text-slate-600">
          <Library className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No study materials uploaded yet.</p>
          <p className="text-xs mt-1 opacity-70">Your tutor will add resources here soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Subject / Chapter Tree */}
          <div className="lg:col-span-2 glass-card p-5 rounded-2xl flex flex-col gap-3 min-h-[400px]">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-1">
              <FolderOpen className="h-4 w-4 text-violet-400" />
              Your Subjects
            </h3>

            <div className="space-y-1 overflow-y-auto flex-1 pr-1">
              {subjects.map((subject) => {
                const isExpanded = expandedSubjects.has(subject.id);
                const chapters = chaptersFor(subject.id);

                return (
                  <div key={subject.id}>
                    {/* Subject row */}
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl transition-all border text-left ${
                        expandedSubjects.has(subject.id)
                          ? 'bg-violet-500/10 border-violet-500/20'
                          : 'border-transparent hover:bg-slate-800/40'
                      }`}
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
                        className={`text-sm font-semibold flex-1 text-left truncate ${
                          isExpanded ? 'text-violet-300' : 'text-slate-300'
                        }`}
                      >
                        {subject.name}
                      </span>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">
                        {chapters.length} ch
                      </span>
                    </button>

                    {/* Chapters */}
                    {isExpanded && (
                      <div className="ml-5 mt-0.5 mb-1 border-l border-slate-800 pl-3 space-y-0.5">
                        {chapters.length === 0 && (
                          <p className="text-[11px] text-slate-700 px-2 py-1.5 italic">No chapters yet</p>
                        )}
                        {chapters.map((chapter) => {
                          const isSelected = selectedChapterId === chapter.id;
                          return (
                            <button
                              key={chapter.id}
                              onClick={() => setSelectedChapterId(isSelected ? null : chapter.id)}
                              className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-left transition-all border ${
                                isSelected
                                  ? 'bg-indigo-500/10 border-indigo-500/20'
                                  : 'border-transparent hover:bg-slate-800/40'
                              }`}
                            >
                              <FileText
                                className={`h-3.5 w-3.5 flex-shrink-0 ${
                                  isSelected ? 'text-indigo-400' : 'text-slate-600'
                                }`}
                              />
                              <span
                                className={`text-xs font-medium truncate ${
                                  isSelected ? 'text-indigo-300' : 'text-slate-400'
                                }`}
                              >
                                {chapter.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

                <h3 className="text-sm font-bold text-slate-300">
                  Materials
                  <span className="ml-2 text-xs font-normal text-slate-600">
                    ({materialsForChapter.length} item{materialsForChapter.length !== 1 ? 's' : ''})
                  </span>
                </h3>

                {materialsForChapter.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-600">
                    <p className="text-xs text-center">
                      No materials uploaded for this chapter yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                    {materialsForChapter.map((material) => {
                      const isMarkdownExpanded = expandedMaterials.has(material.id);

                      return (
                        <div
                          key={material.id}
                          className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden"
                        >
                          {/* Header */}
                          <div
                            className={`flex items-center gap-3 px-4 py-3 bg-slate-900/40 ${
                              material.materialType === 'markdown'
                                ? 'cursor-pointer hover:bg-slate-800/40 transition-colors border-b border-slate-800/40'
                                : ''
                            }`}
                            onClick={() =>
                              material.materialType === 'markdown' && toggleMaterial(material.id)
                            }
                          >
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
                            {material.materialType === 'markdown' && (
                              <ChevronDown
                                className={`h-4 w-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${
                                  isMarkdownExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </div>

                          {/* Content */}
                          {material.materialType === 'link' ? (
                            <div className="px-4 py-4">
                              <a
                                href={material.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-sm font-bold rounded-xl border border-indigo-500/20 transition-colors group max-w-full"
                              >
                                <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                                <span className="truncate">Open Document</span>
                              </a>
                            </div>
                          ) : (
                            isMarkdownExpanded && (
                              <div className="px-5 py-4 border-t border-slate-800/40">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                  {material.markdown}
                                </ReactMarkdown>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
