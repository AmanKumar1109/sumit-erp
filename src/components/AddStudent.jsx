import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, School, ShieldAlert, Award, Eye, EyeOff, CheckCircle } from 'lucide-react';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'UP Board', 'Bihar Board', 'Other'];

export default function AddStudent({ onAddStudent }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    studentClass: 'Class 10',
    board: 'CBSE',
    school: '',
    password: '',
  });

  const [weeklyDays, setWeeklyDays] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle day selection
  const handleDayToggle = (day) => {
    if (weeklyDays.includes(day)) {
      setWeeklyDays(weeklyDays.filter((d) => d !== day));
    } else {
      setWeeklyDays([...weeklyDays, day]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Student name is required';
    if (!formData.school.trim()) newErrors.school = 'School name is required';
    if (!formData.password.trim()) newErrors.password = 'Student password is required';
    
    // Email regex (Mandatory)
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    // Mobile validation (10 digits)
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.mobile.trim())) {
        newErrors.mobile = 'Mobile must be a valid 10-digit number';
      }
    }

    if (weeklyDays.length === 0) {
      newErrors.weeklyDays = 'Please select at least 1 tuition day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    if (errors.submit) {
      setErrors({ ...errors, submit: '' });
    }

    const studentRecord = {
      ...formData,
      weeklyDays,
      createdAt: new Date().toISOString(),
    };

    try {
      await onAddStudent(studentRecord);
      setSuccess(true);

      // Reset Form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        studentClass: 'Class 10',
        board: 'CBSE',
        school: '',
        password: '',
      });
      setWeeklyDays([]);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already in use by another student.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      setErrors({ ...errors, submit: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UserPlus className="h-5 w-5" />
          </div>
          Register New Student
        </h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Add core details, class details, and weekly tuition timings for the student here.
        </p>
      </div>

      {success && (
        <div className="glass-panel border-emerald-500/20 bg-emerald-950/20 p-4 rounded-xl flex items-start gap-3.5 text-emerald-300">
          <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Student Registered Successfully!</p>
            <p className="text-xs text-slate-300 mt-0.5">
              New student has been registered in the database and authentication profile.
            </p>
            <button
              onClick={() => navigate('/students')}
              className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Go to Student Directory
            </button>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="glass-panel border-pink-500/20 bg-pink-950/20 p-4 rounded-xl flex items-start gap-3.5 text-pink-300">
          <ShieldAlert className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Registration Failed</p>
            <p className="text-xs text-slate-300 mt-0.5">{errors.submit}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              Full Name <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sumit Sharma"
              className={`w-full bg-slate-900/60 border ${
                errors.name ? 'border-pink-500/50 focus:border-pink-500' : 'border-slate-800 focus:border-indigo-500'
              } text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${
                errors.name ? 'focus:ring-pink-500/10' : 'focus:ring-indigo-500/15'
              } transition-all duration-300 placeholder:text-slate-600`}
            />
            {errors.name && (
              <p className="text-[11px] text-pink-500 font-medium flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-indigo-400" />
              Email Address <span className="text-pink-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. sumit@example.com"
              className={`w-full bg-slate-900/60 border ${
                errors.email ? 'border-pink-500/50 focus:border-pink-500' : 'border-slate-800 focus:border-indigo-500'
              } text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${
                errors.email ? 'focus:ring-pink-500/10' : 'focus:ring-indigo-500/15'
              } transition-all duration-300 placeholder:text-slate-600`}
            />
            {errors.email && (
              <p className="text-[11px] text-pink-500 font-medium flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-indigo-400" />
              Mobile Number <span className="text-pink-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className={`w-full bg-slate-900/60 border ${
                errors.mobile ? 'border-pink-500/50 focus:border-pink-500' : 'border-slate-800 focus:border-indigo-500'
              } text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${
                errors.mobile ? 'focus:ring-pink-500/10' : 'focus:ring-indigo-500/15'
              } transition-all duration-300 placeholder:text-slate-600`}
            />
            {errors.mobile && (
              <p className="text-[11px] text-pink-500 font-medium flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Class / Standard Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-indigo-400" />
              Class / Standard
            </label>
            <select
              name="studentClass"
              value={formData.studentClass}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 cursor-pointer"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c} className="bg-slate-950 text-slate-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Board Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-indigo-400" />
              Board
            </label>
            <select
              name="board"
              value={formData.board}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 cursor-pointer"
            >
              {BOARDS.map((b) => (
                <option key={b} value={b} className="bg-slate-950 text-slate-200">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* School Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <School className="h-3.5 w-3.5 text-indigo-400" />
              School Name <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="e.g. St. Xavier High School"
              className={`w-full bg-slate-900/60 border ${
                errors.school ? 'border-pink-500/50 focus:border-pink-500' : 'border-slate-800 focus:border-indigo-500'
              } text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 ${
                errors.school ? 'focus:ring-pink-500/10' : 'focus:ring-indigo-500/15'
              } transition-all duration-300 placeholder:text-slate-600`}
            />
            {errors.school && (
              <p className="text-[11px] text-pink-500 font-medium flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {errors.school}
              </p>
            )}
          </div>

          {/* Password (for Student Portal Access) */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-indigo-400" />
              Student Portal Password <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Set a secure password for this student"
                className={`w-full bg-slate-900/60 border ${
                  errors.password ? 'border-pink-500/50 focus:border-pink-500' : 'border-slate-800 focus:border-indigo-500'
                } text-slate-200 text-sm pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 ${
                  errors.password ? 'focus:ring-pink-500/10' : 'focus:ring-indigo-500/15'
                } transition-all duration-300 placeholder:text-slate-600`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-pink-500 font-medium flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Weekly Tuition Days Interactive Selector */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-slate-300 flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
              Tuition Weekly Days <span className="text-pink-500">*</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal mt-0.5">
              Select the days of the week the student will attend tuition (Multiple selections allowed).
            </span>
          </label>

          <div className="flex flex-wrap gap-2.5">
            {WEEK_DAYS.map((day) => {
              const isSelected = weeklyDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-600/15 scale-105'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                  {day}
                </button>
              );
            })}
          </div>
          {errors.weeklyDays && (
            <p className="text-[11px] text-pink-500 font-medium flex items-center gap-1 mt-1">
              <ShieldAlert className="h-3 w-3" />
              {errors.weeklyDays}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5'
            } text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-300 cursor-pointer text-center text-sm shadow-md`}
          >
            {isSubmitting ? 'Registering Student...' : 'Register Student'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate('/students')}
            className={`px-6 py-3.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
