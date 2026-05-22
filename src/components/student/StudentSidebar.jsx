import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, FileText, IndianRupee, BookOpen, Menu, X, GraduationCap, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.js';

export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/tests', label: 'My Tests', icon: FileText },
    { to: '/payments', label: 'My Fees', icon: IndianRupee },
    { to: '/homework', label: 'My Homework', icon: BookOpen },
    { to: '/timetable', label: 'My Time Table', icon: CalendarCheck },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="bg-pink-600/20 p-1.5 rounded-lg border border-pink-500/30 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-pink-400" />
          </div>
          <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mt-0.5">
            STUDENT PORTAL
          </h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-[280px] md:w-64 glass-panel border-r border-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out bg-[#090d16]/95 md:bg-transparent
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Desktop Header */}
        <div className="hidden md:flex p-6 border-b border-slate-800/80 items-center gap-3">
          <div className="bg-pink-600/20 p-2.5 rounded-xl border border-pink-500/30 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-pink-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              STUDENT
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
              Portal Access
            </p>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden p-5 border-b border-slate-800/80 flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-300">
             <span className="font-bold text-sm tracking-widest uppercase">Navigation Menu</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600/20 to-purple-600/20 text-pink-300 border-l-4 border-pink-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? 'text-pink-400' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="font-medium text-sm tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-slate-800/80">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-bold text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
