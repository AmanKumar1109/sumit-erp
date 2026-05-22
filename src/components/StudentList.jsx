import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, Calendar, Phone, Mail, GraduationCap, School, XCircle } from 'lucide-react';

const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'UP Board', 'Bihar Board', 'Other'];

export default function StudentList({ students, onDeleteStudent }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedBoard, setSelectedBoard] = useState('All');

  // Filter students based on search and dropdown selections
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile.includes(searchTerm);

    const matchesClass = selectedClass === 'All' || student.studentClass === selectedClass;
    const matchesBoard = selectedBoard === 'All' || student.board === selectedBoard;

    return matchesSearch && matchesClass && matchesBoard;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('All');
    setSelectedBoard('All');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            Student Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Manage, search, and filter the list of all registered students here.
          </p>
        </div>
        <div className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-4 py-2 rounded-xl font-bold self-start md:self-auto">
          Total: {filteredStudents.length} Students
        </div>
      </div>

      {/* Search and Filters Panel */}
      <div className="glass-card p-4 rounded-2xl gap-4 flex flex-col md:flex-row md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Name, Mobile, or School..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-slate-300 text-xs py-1.5 focus:outline-none cursor-pointer pr-4"
            >
              <option value="All" className="bg-slate-950">All Classes</option>
              {CLASSES.map((c) => (
                <option key={c} value={c} className="bg-slate-950">{c}</option>
              ))}
            </select>
          </div>

          {/* Board Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="bg-transparent text-slate-300 text-xs py-1.5 focus:outline-none cursor-pointer pr-4"
            >
              <option value="All" className="bg-slate-950">All Boards</option>
              {BOARDS.map((b) => (
                <option key={b} value={b} className="bg-slate-950">{b}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm !== '' || selectedClass !== 'All' || selectedBoard !== 'All') && (
            <button
              onClick={clearFilters}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
        <div className="overflow-x-auto">
          {filteredStudents.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Student & School</th>
                  <th className="py-4 px-6">Class & Board</th>
                  <th className="py-4 px-6">Contact details</th>
                  <th className="py-4 px-6">Weekly Tuition Days</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/30 transition-all duration-200 text-slate-300">
                    {/* Column 1: Name and School */}
                    <td className="py-4.5 px-6">
                      <div className="font-extrabold text-white text-sm tracking-wide">{student.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <School className="h-3 w-3 text-slate-500" />
                        {student.school}
                      </div>
                    </td>

                    {/* Column 2: Class & Board */}
                    <td className="py-4.5 px-6">
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-md font-semibold">
                        {student.studentClass}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 font-semibold">{student.board}</div>
                    </td>

                    {/* Column 3: Contact */}
                    <td className="py-4.5 px-6 space-y-1">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-500" />
                        {student.mobile}
                      </div>
                      {student.email && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate max-w-[180px]">
                          <Mail className="h-3 w-3 text-slate-500" />
                          {student.email}
                        </div>
                      )}
                    </td>

                    {/* Column 4: Weekly Days */}
                    <td className="py-4.5 px-6">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {student.weeklyDays?.map((day) => (
                          <span
                            key={day}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1"
                          >
                            <Calendar className="h-2.5 w-2.5 text-purple-400" />
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Column 5: Actions */}
                    <td className="py-4.5 px-6 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${student.name}?`)) {
                            onDeleteStudent(student.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-pink-400 hover:bg-pink-500/10 border border-transparent hover:border-pink-500/20 transition-all duration-300 cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                <XCircle className="h-10 w-10 text-slate-600" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-white">No Students Found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {students.length === 0
                    ? "You haven't registered any students yet. Add new students to get started."
                    : "No records matched your active search or filter queries. Please reset and try again."}
                </p>
              </div>
              <div className="pt-2">
                {students.length === 0 ? (
                  <button
                    onClick={() => navigate('/add-student')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Add Your First Student
                  </button>
                ) : (
                  <button
                    onClick={clearFilters}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
