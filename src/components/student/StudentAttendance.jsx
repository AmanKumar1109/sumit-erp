import React, { useState, useMemo } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, AlertCircle, Filter, BarChart3, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getExpectedDates(startDateStr, weeklyDays) {
  if (!weeklyDays || weeklyDays.length === 0 || !startDateStr) return [];
  const expected = [];
  
  // Use local time for start date and today
  let currentDate = new Date(startDateStr);
  currentDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (currentDate <= today) {
    const dayName = DAYS_OF_WEEK[currentDate.getDay()];
    if (weeklyDays.includes(dayName)) {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      expected.push(`${yyyy}-${mm}-${dd}`);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return expected;
}

export default function StudentAttendance({ attendance, student }) {
  
  // 1. Compute massive list of all records + auto-absents
  const computedAttendance = useMemo(() => {
    if (!student) return attendance;
    
    // Get array of YYYY-MM-DD
    const expectedDates = getExpectedDates(student.createdAt, student.weeklyDays);
    
    // Map of actual records for quick lookup
    const actualMap = new Map();
    attendance.forEach(a => actualMap.set(a.date, a));

    const finalRecords = [...attendance]; // start with actual (covers extra classes too)

    // Add auto-absents
    expectedDates.forEach(dateStr => {
      if (!actualMap.has(dateStr)) {
        finalRecords.push({
          id: `auto_${dateStr}`,
          date: dateStr,
          status: 'Absent',
          note: 'Auto-marked absent (No record)',
          isAuto: true
        });
      }
    });

    // Sort descending by date
    finalRecords.sort((a, b) => b.date.localeCompare(a.date));
    return finalRecords;
  }, [attendance, student]);

  // 2. Extract unique months
  const availableMonths = useMemo(() => {
    const months = new Set();
    computedAttendance.forEach(a => {
      if (a.date) {
        const monthPrefix = a.date.substring(0, 7);
        months.add(monthPrefix);
      }
    });
    return Array.from(months).sort().reverse(); 
  }, [computedAttendance]);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || 'all');

  React.useEffect(() => {
    if (availableMonths.length > 0 && selectedMonth === 'all' && !availableMonths.includes('all')) {
        // 'all' is always valid
    }
  }, [availableMonths, selectedMonth]);

  // 3. Filter by month
  const filteredAttendance = useMemo(() => {
    if (selectedMonth === 'all') return computedAttendance;
    return computedAttendance.filter(a => a.date && a.date.startsWith(selectedMonth));
  }, [computedAttendance, selectedMonth]);

  // 4. Calculate stats
  const totalClasses = filteredAttendance.length;
  const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'Absent').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'Late').length;

  // Chart Data
  const chartData = [
    { name: 'Present', value: presentCount, color: '#34d399' }, 
    { name: 'Absent', value: absentCount, color: '#fb7185' },  
    { name: 'Late', value: lateCount, color: '#fbbf24' }       
  ].filter(d => d.value > 0);

  const formatMonth = (yyyyMm) => {
    if (yyyyMm === 'all') return 'All Time';
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (!student) return null;

  return (
    <div className="animate-fade-in flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            My Attendance
          </h2>
          <p className="text-sm text-slate-400 mt-1">Review your class attendance and auto-calculated missing days.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <Filter className="h-4 w-4 text-indigo-400 ml-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-200 outline-none pr-2 cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Time</option>
            {availableMonths.map(m => (
              <option key={m} value={m} className="bg-slate-900">{formatMonth(m)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Stats & Chart */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-center flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total Classes</p>
              <p className="text-sm font-medium text-slate-400 mt-0.5">Held in this period</p>
            </div>
            <p className="text-3xl font-extrabold text-indigo-300">{totalClasses}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-4 rounded-2xl text-center border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Present</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">{presentCount}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-rose-500/20 bg-rose-500/5">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Absent</p>
              <p className="text-2xl font-extrabold text-rose-400 mt-1">{absentCount}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-amber-500/20 bg-amber-500/5">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Late</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{lateCount}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex-1 flex flex-col min-h-[300px]">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Attendance Ratio
            </h3>
            
            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
                No classes occurred yet
              </div>
            ) : (
              <div className="flex-1 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: '#475569', strokeWidth: 1 }}
                    >
                      {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Table */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="font-bold text-white mb-6">
            Records for {formatMonth(selectedMonth)}
          </h3>
          
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <CalendarCheck className="h-16 w-16 mx-auto mb-4 opacity-20 text-indigo-400" />
              <p>No records found for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAttendance.map((record) => {
                    let statusBadge = '';
                    let Icon = CheckCircle2;
                    if (record.status === 'Present') {
                      statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      Icon = CheckCircle2;
                    } else if (record.status === 'Absent') {
                      statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                      Icon = XCircle;
                    } else {
                      statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      Icon = AlertCircle;
                    }

                    return (
                      <tr key={record.id} className={`transition-all duration-200 ${record.isAuto ? 'bg-rose-500/[0.02] hover:bg-rose-500/[0.05]' : 'hover:bg-slate-900/30'}`}>
                        <td className="py-3 px-4 text-sm font-bold text-slate-200">
                          {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${statusBadge}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 flex items-center gap-1.5">
                          {record.isAuto && <Clock className="h-3 w-3 text-rose-500" />}
                          {record.note || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
