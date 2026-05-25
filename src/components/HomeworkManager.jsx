import React, { useState, useMemo } from 'react';
import {
  BookOpen, Save, Calendar, CheckCircle2, Clock, AlignLeft,
  Link as LinkIcon, Filter, X, Pencil, Trash2, User
} from 'lucide-react';

export default function HomeworkManager({ students, homework, onSaveHomework, onDeleteHomework }) {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    description: '',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    referenceLink: '',
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters
  const [filterStudent, setFilterStudent] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAttachment, setFilterAttachment] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (hw) => {
    setEditingId(hw.id);
    setFormData({
      studentId: hw.studentId,
      subject: hw.subject,
      description: hw.description,
      dueDate: hw.dueDate,
      referenceLink: hw.referenceLink || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      studentId: '',
      subject: '',
      description: '',
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      referenceLink: '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subject || !formData.description) {
      setSavedMsg('⚠️ Please fill all required fields');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }

    setSaving(true);
    const selectedStudent = students.find((s) => s.id === formData.studentId);

    try {
      if (editingId) {
        const existingHw = homework.find((h) => h.id === editingId);
        await onSaveHomework({
          ...existingHw,
          studentId: formData.studentId,
          studentName: selectedStudent?.name || 'Unknown',
          subject: formData.subject,
          description: formData.description,
          dueDate: formData.dueDate,
          referenceLink: formData.referenceLink,
        });
        setSavedMsg('✅ Homework updated successfully!');
        setEditingId(null);
      } else {
        await onSaveHomework({
          studentId: formData.studentId,
          studentName: selectedStudent?.name || 'Unknown',
          subject: formData.subject,
          description: formData.description,
          dueDate: formData.dueDate,
          referenceLink: formData.referenceLink,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        });

        if (selectedStudent?.phone) {
          const message = `Hello ${selectedStudent.name}, you have been assigned new homework: ${formData.subject}. Due date: ${formData.dueDate}. Description: ${formData.description}. ${formData.referenceLink ? `Link: ${formData.referenceLink}` : ''}`;
          window.open(`https://wa.me/${selectedStudent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        }

        setSavedMsg('✅ Homework assigned successfully!');
      }

      setFormData({
        studentId: '',
        subject: '',
        description: '',
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        referenceLink: '',
      });
    } catch (error) {
      console.error(error);
      setSavedMsg('❌ Error saving homework');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDeleteHomework(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete homework', error);
    }
  };

  const toggleStatus = async (hw) => {
    const newStatus = hw.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await onSaveHomework({ ...hw, status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const clearFilters = () => {
    setFilterStudent('');
    setFilterDay('');
    setFilterMonth('');
    setFilterStatus('');
    setFilterAttachment('');
  };

  const filteredHomework = useMemo(() => {
    return homework.filter((hw) => {
      if (filterStudent && hw.studentId !== filterStudent) return false;
      if (filterDay && hw.dueDate !== filterDay) return false;
      if (filterMonth && !hw.dueDate?.startsWith(filterMonth)) return false;
      if (filterStatus && hw.status !== filterStatus) return false;
      if (filterAttachment === 'yes' && !hw.referenceLink) return false;
      if (filterAttachment === 'no' && hw.referenceLink) return false;
      return true;
    });
  }, [homework, filterStudent, filterDay, filterMonth, filterStatus, filterAttachment]);

  const hasActiveFilters = filterStudent || filterDay || filterMonth || filterStatus || filterAttachment;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-orange-600/15 p-2 rounded-xl border border-orange-500/20">
            <BookOpen className="h-5 w-5 text-orange-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Homework Tracker
          </h2>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Assign written homework to students and track their completion status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-white">
                {editingId ? '✏️ Edit Homework' : 'Assign Homework'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/50 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" /> Cancel
                </button>
              )}
            </div>

            {editingId && (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium">
                Editing existing homework — changes will update the record.
              </div>
            )}

            {savedMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                savedMsg.startsWith('✅')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {savedMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Student <span className="text-pink-500">*</span></label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 text-slate-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition-all duration-300 cursor-pointer"
              >
                <option value="" className="bg-slate-950">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-950">{s.name} ({s.studentClass})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Subject <span className="text-pink-500">*</span></label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition-all duration-300 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Due Date <span className="text-pink-500">*</span></label>
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 focus-within:border-orange-500 rounded-xl px-4 py-2.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/15">
                <Calendar className="h-4 w-4 text-slate-500" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark] w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Homework Details <span className="text-pink-500">*</span></label>
              <div className="relative">
                <AlignLeft className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the homework clearly..."
                  rows={4}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500 text-slate-200 text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition-all duration-300 placeholder:text-slate-600 resize-none"
                ></textarea>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">Reference Link (Optional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="url"
                  name="referenceLink"
                  placeholder="e.g. Google Drive link"
                  value={formData.referenceLink}
                  onChange={handleChange}
                  className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-900/40 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : editingId ? 'Update Homework' : 'Assign & Send'}
            </button>
          </form>
        </div>

        {/* Tracker Section */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-400" />
              Assigned Homework Tracker
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/50 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" /> Clear Filters
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <Filter className="h-3 w-3" /> Filters
            </div>

            {/* Student Filter — full width */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-950">👥 All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-950">
                    {s.name} ({s.studentClass})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Day, Month, Status, Attachment */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Day Filter */}
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  title="Filter by due date"
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs pl-8 pr-1 py-2 rounded-xl focus:outline-none [color-scheme:dark] cursor-pointer transition-all"
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
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs pl-8 pr-1 py-2 rounded-xl focus:outline-none [color-scheme:dark] cursor-pointer transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-950">All Status</option>
                <option value="Pending" className="bg-slate-950">🕐 Pending</option>
                <option value="Completed" className="bg-slate-950">✅ Completed</option>
              </select>

              {/* Attachment Filter */}
              <select
                value={filterAttachment}
                onChange={(e) => setFilterAttachment(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 focus:border-orange-500/50 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-950">All Attachments</option>
                <option value="yes" className="bg-slate-950">📎 With Link</option>
                <option value="no" className="bg-slate-950">🚫 No Link</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {hasActiveFilters && (
            <p className="text-xs text-slate-500 -mt-1">
              Showing <span className="text-orange-400 font-bold">{filteredHomework.length}</span> of {homework.length} records
            </p>
          )}

          {/* Table */}
          <div className="flex-1 overflow-x-auto rounded-xl border border-slate-800/80">
            {filteredHomework.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {homework.length === 0 ? 'No homework assigned yet.' : 'No results match your filters.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Student & Due Date</th>
                    <th className="py-3 px-4">Subject & Details</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredHomework.map((hw) => {
                    const isCompleted = hw.status === 'Completed';
                    const isDeleting = deleteConfirmId === hw.id;

                    return (
                      <tr
                        key={hw.id}
                        className={`hover:bg-slate-900/30 transition-all duration-200 ${isCompleted ? 'opacity-60' : ''}`}
                      >
                        <td className="py-4 px-4 align-top w-1/4">
                          <div className="text-sm font-bold text-slate-200">{hw.studentName}</div>
                          <div className={`text-xs mt-1 font-semibold flex items-center gap-1 ${isCompleted ? 'text-slate-500' : 'text-orange-400'}`}>
                            <Calendar className="h-3 w-3" />
                            {hw.dueDate}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top w-[42%]">
                          <div className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg inline-block mb-2">
                            {hw.subject}
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {hw.description}
                          </p>
                          {hw.referenceLink && (
                            <a
                              href={hw.referenceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 w-fit"
                            >
                              <LinkIcon className="h-3 w-3" /> View Attachment
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-4 align-top text-center">
                          <button
                            onClick={() => toggleStatus(hw)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 text-orange-400" />
                                Pending
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4 align-top text-center">
                          {isDeleting ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <p className="text-[10px] text-rose-400 font-semibold">Delete?</p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(hw.id)}
                                  className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 bg-slate-700/50 text-slate-400 border border-slate-600/50 text-[10px] font-bold rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEdit(hw)}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer hover:scale-110"
                                title="Edit Homework"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(hw.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer hover:scale-110"
                                title="Delete Homework"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
