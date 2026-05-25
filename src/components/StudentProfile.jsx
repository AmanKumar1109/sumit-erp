import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Printer, User, Phone, Mail, MapPin, Calendar, School, 
  CheckCircle2, XCircle, FileText, IndianRupee, BookOpen, CalendarCheck, ExternalLink
} from 'lucide-react';

export default function StudentProfile({ students, attendance, tests, payments, homework, timetable }) {
  const { id } = useParams();
  
  const student = students.find(s => s.id === id);
  
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <User className="h-16 w-16 opacity-20 mb-4" />
        <p>Student not found or loading...</p>
        <Link to="/students" className="mt-4 text-indigo-400 hover:underline">Back to Student List</Link>
      </div>
    );
  }

  // Filter Data
  const studentAttendance = attendance.filter(a => a.studentId === id);
  const studentTests = tests.filter(t => t.studentId === id);
  const studentPayments = payments.filter(p => p.studentId === id);
  const studentHomework = homework.filter(h => h.studentId === id);
  const studentSchedule = timetable.filter(t => t.studentId === id);

  // Stats Calculations
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const absentCount = studentAttendance.filter(a => a.status === 'Absent').length;
  const totalFeesPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const avgTestScore = studentTests.length > 0 
    ? (studentTests.reduce((sum, t) => sum + (t.marksScored/t.totalMarks)*100, 0) / studentTests.length).toFixed(1)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-6xl mx-auto pb-10 print:bg-white print:text-black">
      
      {/* Header Actions (Hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/students" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-lg shadow-indigo-500/20"
        >
          <Printer className="h-4 w-4" /> Print Report
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden print:shadow-none print:border-slate-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none print:hidden"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          {/* Avatar Area */}
          <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center shrink-0 w-48 h-48 print:border-slate-300 print:bg-slate-100">
            <User className="h-20 w-20 text-indigo-400 print:text-indigo-600 mb-2" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">Student ID</span>
            <span className="text-xs font-mono text-slate-500 truncate w-full text-center mt-1 print:text-slate-600">{student.id.slice(0,8)}</span>
          </div>
          
          {/* Details Area */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-extrabold text-white print:text-black mb-1">{student.name}</h1>
                <p className="text-lg text-indigo-400 print:text-indigo-600 font-bold">{student.studentClass} • {student.board}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-slate-900/60 rounded-lg border border-slate-800 text-xs font-bold text-slate-300 print:border-slate-300 print:text-black print:bg-white">
                  Joined: {new Date(student.createdAt).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs font-bold text-emerald-400 print:border-emerald-300 print:text-emerald-700">
                  Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex items-center gap-3 text-slate-300 print:text-slate-800">
                <Phone className="h-4 w-4 text-slate-500 print:text-slate-600" /> {student.mobile || student.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-3 text-slate-300 print:text-slate-800">
                <Mail className="h-4 w-4 text-slate-500 print:text-slate-600" /> {student.email}
              </div>
              <div className="flex items-center gap-3 text-slate-300 print:text-slate-800">
                <School className="h-4 w-4 text-slate-500 print:text-slate-600" /> {student.school || student.schoolName || 'N/A'}
              </div>
              <div className="flex items-center gap-3 text-slate-300 print:text-slate-800">
                <MapPin className="h-4 w-4 text-slate-500 print:text-slate-600" /> {student.address || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center print:border-slate-300">
          <CalendarCheck className="h-6 w-6 text-emerald-400 mx-auto mb-2 print:text-emerald-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest print:text-slate-600">Present</p>
          <p className="text-2xl font-extrabold text-white mt-1 print:text-black">{presentCount} <span className="text-sm font-medium text-slate-500">days</span></p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center print:border-slate-300">
          <XCircle className="h-6 w-6 text-rose-400 mx-auto mb-2 print:text-rose-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest print:text-slate-600">Absent</p>
          <p className="text-2xl font-extrabold text-white mt-1 print:text-black">{absentCount} <span className="text-sm font-medium text-slate-500">days</span></p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center print:border-slate-300">
          <IndianRupee className="h-6 w-6 text-amber-400 mx-auto mb-2 print:text-amber-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest print:text-slate-600">Fees Paid</p>
          <p className="text-2xl font-extrabold text-white mt-1 print:text-black">₹{totalFeesPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center print:border-slate-300">
          <FileText className="h-6 w-6 text-blue-400 mx-auto mb-2 print:text-blue-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest print:text-slate-600">Avg Test Score</p>
          <p className="text-2xl font-extrabold text-white mt-1 print:text-black">{avgTestScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Homework Section */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 print:border-slate-300">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 print:text-black">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            Recent Homework
          </h3>
          <div className="space-y-3">
            {studentHomework.length === 0 ? <p className="text-sm text-slate-500">No homework records.</p> : 
              studentHomework.slice(0, 5).map(hw => (
                <div key={hw.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 flex justify-between items-center print:border-slate-200">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200 print:text-black flex items-center gap-2">
                      {hw.subject}
                      {hw.referenceLink && (
                        <a href={hw.referenceLink} target="_blank" rel="noopener noreferrer" title="View Attachment" className="text-indigo-400 hover:text-indigo-300 print:hidden">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">Due: {hw.dueDate}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${hw.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {hw.status}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Tests Section */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 print:border-slate-300">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 print:text-black">
            <FileText className="h-5 w-5 text-pink-400" />
            Recent Tests
          </h3>
          <div className="space-y-3">
            {studentTests.length === 0 ? <p className="text-sm text-slate-500">No test records.</p> : 
              studentTests.slice(0, 5).map(test => {
                const percentage = ((test.marksScored / test.totalMarks) * 100).toFixed(0);
                return (
                  <div key={test.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 flex justify-between items-center print:border-slate-200">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200 print:text-black">{test.subject}</h4>
                      <p className="text-xs text-slate-500">{test.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-sm text-emerald-400 print:text-emerald-700">{test.marksScored}/{test.totalMarks}</div>
                      <div className="text-[10px] font-bold text-slate-500">{percentage}%</div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

      </div>
    </div>
  );
}
