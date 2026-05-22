import React from 'react';
import { IndianRupee } from 'lucide-react';

export default function StudentPayments({ payments }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
          My Fee Payments
        </h2>
        <p className="text-sm text-slate-400 mt-1">Track your past fee records and receipts.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        {payments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-3 px-4">Date & Month</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-900/30 transition-all duration-200">
                    <td className="py-3 px-4">
                      <div className="text-sm font-bold text-slate-200">{payment.monthName}</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{payment.date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-semibold text-slate-300">{payment.paymentMode}</div>
                      {payment.remarks && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{payment.remarks}</div>
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
          </div>
        )}
      </div>
    </div>
  );
}
