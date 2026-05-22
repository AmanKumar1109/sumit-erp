import React, { useState } from 'react';
import { IndianRupee, Save, Calendar, CheckCircle, CreditCard } from 'lucide-react';

export default function PaymentManager({ students, payments, onSavePayment }) {
  const [formData, setFormData] = useState({
    studentId: '',
    monthYear: new Date().toISOString().slice(0, 7), // YYYY-MM
    amount: '',
    paymentMode: 'Cash',
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
    if (!formData.studentId || !formData.monthYear || !formData.amount) {
      setSavedMsg('⚠️ Please fill all required fields');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }

    setSaving(true);
    const selectedStudent = students.find((s) => s.id === formData.studentId);
    
    // Formatting month string (e.g. "2026-05" -> "May 2026")
    const dateObj = new Date(formData.monthYear + '-01T00:00:00');
    const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    try {
      await onSavePayment({
        studentId: formData.studentId,
        studentName: selectedStudent?.name || 'Unknown',
        monthYearRaw: formData.monthYear,
        monthName: monthName,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        remarks: formData.remarks,
        date: formData.date,
        createdAt: new Date().toISOString(),
      });
      setSavedMsg('✅ Payment recorded successfully!');
      setFormData({
        ...formData,
        amount: '',
        remarks: '',
      });
    } catch (error) {
      console.error(error);
      setSavedMsg('❌ Error saving payment record');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  // Group payments by monthYearRaw for easier tracking in summary
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-emerald-600/15 p-2 rounded-xl border border-emerald-500/20">
            <IndianRupee className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Fee Payment Manager
          </h2>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Record student tuition fee payments and view monthly collections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-white mb-4">Mark Fee Payment</h3>

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
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 cursor-pointer"
              >
                <option value="" className="bg-slate-950">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-950">{s.name} ({s.studentClass})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Fee Month <span className="text-pink-500">*</span></label>
                <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 focus-within:border-emerald-500 rounded-xl px-3 py-2.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500/15">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <input
                    type="month"
                    name="monthYear"
                    value={formData.monthYear}
                    onChange={handleChange}
                    className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark] w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Payment Date</label>
                <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 focus-within:border-emerald-500 rounded-xl px-3 py-2.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500/15">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark] w-full"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount (₹) <span className="text-pink-500">*</span></label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mode <span className="text-pink-500">*</span></label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 cursor-pointer"
                >
                  <option value="Cash" className="bg-slate-950">Cash</option>
                  <option value="UPI" className="bg-slate-950">UPI</option>
                  <option value="Bank Transfer" className="bg-slate-950">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="e.g. Half payment, rest next week"
                rows={2}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 text-slate-200 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 placeholder:text-slate-600 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Record Payment'}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-400" />
            Recent Fee Collections
          </h3>

          <div className="flex-1 overflow-x-auto rounded-xl border border-slate-800/80">
            {payments.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <IndianRupee className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No payments recorded yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Date & Student</th>
                    <th className="py-3 px-4">Fee Month</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-900/30 transition-all duration-200">
                      <td className="py-3 px-4">
                        <div className="text-[10px] text-slate-500 font-semibold mb-0.5">{payment.date}</div>
                        <div className="text-sm font-bold text-slate-200">{payment.studentName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg inline-block">
                          {payment.monthName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-semibold text-slate-300">{payment.paymentMode}</div>
                        {payment.remarks && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]" title={payment.remarks}>
                            {payment.remarks}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-base font-extrabold text-emerald-400">
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
