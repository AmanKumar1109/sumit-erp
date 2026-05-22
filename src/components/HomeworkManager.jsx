import React, { useState } from 'react';
import { BookOpen, Save, Calendar, CheckCircle2, Clock, AlignLeft, Link as LinkIcon, Send } from 'lucide-react';

export default function HomeworkManager({ students, homework, onSaveHomework }) {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    description: '',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Tomorrow default
    referenceLink: '',
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      // WhatsApp redirect logic
      if (selectedStudent?.phone) {
        const message = `Hello ${selectedStudent.name}, you have been assigned new homework: ${formData.subject}. Due date: ${formData.dueDate}. Description: ${formData.description}. ${formData.referenceLink ? `Link: ${formData.referenceLink}` : ''}`;
        window.open(`https://wa.me/${selectedStudent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      }

      setSavedMsg('✅ Homework assigned successfully!');
      setFormData({
        ...formData,
        subject: '',
        description: '',
        referenceLink: '',
      });
    } catch (error) {
      console.error(error);
      setSavedMsg('❌ Error assigning homework');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  const toggleStatus = async (hw) => {
    const newStatus = hw.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await onSaveHomework({ ...hw, status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

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
            <h3 className="text-lg font-bold text-white mb-4">Assign Homework</h3>

            {savedMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                savedMsg.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
              {saving ? 'Assigning...' : 'Assign & Send'}
            </button>
          </form>
        </div>

        {/* Tracker Section */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            Assigned Homework Tracker
          </h3>

          <div className="flex-1 overflow-x-auto rounded-xl border border-slate-800/80">
            {homework.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No homework assigned yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Student & Due Date</th>
                    <th className="py-3 px-4">Subject & Details</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {homework.map((hw) => {
                    const isCompleted = hw.status === 'Completed';
                    
                    return (
                      <tr key={hw.id} className={`hover:bg-slate-900/30 transition-all duration-200 ${isCompleted ? 'opacity-60' : ''}`}>
                        <td className="py-4 px-4 align-top w-1/4">
                          <div className="text-sm font-bold text-slate-200">{hw.studentName}</div>
                          <div className={`text-xs mt-1 font-semibold flex items-center gap-1 ${isCompleted ? 'text-slate-500' : 'text-orange-400'}`}>
                            <Calendar className="h-3 w-3" />
                            {hw.dueDate}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top w-1/2">
                          <div className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg inline-block mb-2">
                            {hw.subject}
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {hw.description}
                          </p>
                          {hw.referenceLink && (
                            <a href={hw.referenceLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 w-fit">
                              <LinkIcon className="h-3 w-3" /> View Attachment
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-4 align-top text-center w-1/4">
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
                                Mark Done
                              </>
                            )}
                          </button>
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
