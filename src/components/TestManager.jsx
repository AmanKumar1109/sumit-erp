import React, { useState } from 'react';
import { ClipboardList, Save, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';

export default function TestManager({ students, tests, onSaveTest }) {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    totalMarks: '',
    marksScored: '',
    remarks: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subject || !formData.totalMarks || !formData.marksScored) {
      setSavedMsg('⚠️ Please fill all required fields');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }

    setSaving(true);
    const selectedStudent = students.find((s) => s.id === formData.studentId);
    
    try {
      await onSaveTest({
        studentId: formData.studentId,
        studentName: selectedStudent?.name || 'Unknown',
        subject: formData.subject,
        totalMarks: Number(formData.totalMarks),
        marksScored: Number(formData.marksScored),
        remarks: formData.remarks,
        date: formData.date,
        createdAt: new Date().toISOString(),
      });
      setSavedMsg('✅ Test record saved successfully!');
      setFormData({
        ...formData,
        subject: '',
        totalMarks: '',
        marksScored: '',
        remarks: '',
      });
    } catch (error) {
      console.error(error);
      setSavedMsg('❌ Error saving test record');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-indigo-600/15 p-2 rounded-xl border border-indigo-500/20">
            <ClipboardList className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Test Records Manager
          </h2>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Add new test scores and view recent performance records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-white mb-4">Add Test Score</h3>

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
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 cursor-pointer"
              >
                <option value="" className="bg-slate-950">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-950">{s.name} ({s.studentClass})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Subject / Topic <span className="text-pink-500">*</span></label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Science - Chapter 1"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Total Marks <span className="text-pink-500">*</span></label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Marks Scored <span className="text-pink-500">*</span></label>
                <input
                  type="number"
                  name="marksScored"
                  value={formData.marksScored}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Date <span className="text-pink-500">*</span></label>
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 focus-within:border-indigo-500 rounded-xl px-4 py-2.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/15">
                <Calendar className="h-4 w-4 text-slate-500" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark] w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="e.g. Needs improvement in long answers"
                rows={2}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving Record...' : 'Save Test Score'}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            Recent Test Records
          </h3>

          <div className="flex-1 overflow-x-auto rounded-xl border border-slate-800/80">
            {tests.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No tests recorded yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Date & Student</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tests.map((test) => {
                    const percentage = (test.marksScored / test.totalMarks) * 100;
                    let scoreColor = 'text-emerald-400';
                    if (percentage < 40) scoreColor = 'text-rose-400';
                    else if (percentage < 70) scoreColor = 'text-amber-400';

                    return (
                      <tr key={test.id} className="hover:bg-slate-900/30 transition-all duration-200">
                        <td className="py-3 px-4">
                          <div className="text-[10px] text-slate-500 font-semibold mb-0.5">{test.date}</div>
                          <div className="text-sm font-bold text-slate-200">{test.studentName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-semibold text-slate-300">{test.subject}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-base font-extrabold ${scoreColor}`}>
                              {test.marksScored} <span className="text-xs text-slate-500 font-medium">/ {test.totalMarks}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{percentage.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[200px]">
                          <div className="text-xs text-slate-400 truncate" title={test.remarks || 'No remarks'}>
                            {test.remarks || '—'}
                          </div>
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
