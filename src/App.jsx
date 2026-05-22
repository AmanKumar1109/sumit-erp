import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Components
import Sidebar from './components/Sidebar.jsx';
import DashboardOverview from './components/DashboardOverview.jsx';
import AddStudent from './components/AddStudent.jsx';
import StudentList from './components/StudentList.jsx';
import AttendanceManager from './components/AttendanceManager.jsx';
import TestManager from './components/TestManager.jsx';
import PaymentManager from './components/PaymentManager.jsx';
import HomeworkManager from './components/HomeworkManager.jsx';
import TimeTableManager from './components/TimeTableManager.jsx';
import StudentProfile from './components/StudentProfile.jsx';

// Shared Components
import LoginPage from './components/LoginPage.jsx';

// Student Components
import StudentSidebar from './components/student/StudentSidebar.jsx';
import StudentDashboard from './components/student/StudentDashboard.jsx';
import StudentAttendance from './components/student/StudentAttendance.jsx';
import StudentTests from './components/student/StudentTests.jsx';
import StudentPayments from './components/student/StudentPayments.jsx';
import StudentHomework from './components/student/StudentHomework.jsx';
import StudentTimeTable from './components/student/StudentTimeTable.jsx';

// Firebase Imports
import { db, auth } from './firebase.js';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc, orderBy, getDocs, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'student' | null
  const [authChecking, setAuthChecking] = useState(true);

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tests, setTests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [homework, setHomework] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication & Role Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Check if user is an admin
        const adminsRef = collection(db, 'admin');
        const q = query(adminsRef, where('email', '==', user.email));
        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUserRole('admin');
          } else {
            setUserRole('student');
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setUserRole('student'); // Fallback
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setStudents([]);
        setAttendance([]);
        setTests([]);
        setPayments([]);
        setHomework([]);
        setTimetable([]);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Synchronize Firestore Data (Only when logged in)
  useEffect(() => {
    if (!currentUser || !userRole) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Students
    const studentsUnsub = onSnapshot(query(collection(db, 'students'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        // Admin sees all, Student sees only themselves
        if (userRole === 'admin' || item.id === currentUser.uid) {
          data.push(item);
        }
      });
      setStudents(data);
    });

    // 2. Attendance
    const attendanceUnsub = onSnapshot(query(collection(db, 'attendance'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (userRole === 'admin' || item.studentId === currentUser.uid) data.push(item);
      });
      setAttendance(data);
    });

    // 3. Tests
    const testsUnsub = onSnapshot(query(collection(db, 'tests'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (userRole === 'admin' || item.studentId === currentUser.uid) data.push(item);
      });
      setTests(data);
    });

    // 4. Payments
    const paymentsUnsub = onSnapshot(query(collection(db, 'payments'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (userRole === 'admin' || item.studentId === currentUser.uid) data.push(item);
      });
      setPayments(data);
    });

    // 5. Homework
    const homeworkUnsub = onSnapshot(query(collection(db, 'homework'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (userRole === 'admin' || item.studentId === currentUser.uid) data.push(item);
      });
      setHomework(data);
    });

    // 6. Time Table
    const timetableUnsub = onSnapshot(query(collection(db, 'timetable'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (userRole === 'admin' || item.studentId === currentUser.uid) data.push(item);
      });
      setTimetable(data);
      setLoading(false);
    });

    return () => {
      studentsUnsub();
      attendanceUnsub();
      testsUnsub();
      paymentsUnsub();
      homeworkUnsub();
      timetableUnsub();
    };
  }, [currentUser, userRole]);

  // Handlers (Only admins will be able to trigger these forms realistically)
  const handleAddStudent = async (newStudent) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      newStudent.email,
      newStudent.password
    );
    const uid = userCredential.user.uid;
    const studentDoc = {
      ...newStudent,
      id: uid, 
    };
    await setDoc(doc(db, 'students', uid), studentDoc);
  };

  const handleSaveAttendance = async (record) => {
    const docId = `${record.studentId}_${record.date}`;
    await setDoc(doc(db, 'attendance', docId), { ...record, id: docId });
  };

  const handleSaveTest = async (record) => {
    const docRef = doc(collection(db, 'tests'));
    await setDoc(docRef, { ...record, id: docRef.id });
  };

  const handleSavePayment = async (record) => {
    const docRef = doc(collection(db, 'payments'));
    await setDoc(docRef, { ...record, id: docRef.id });
  };

  const handleSaveHomework = async (record) => {
    if (record.id) {
      const docRef = doc(db, 'homework', record.id);
      await setDoc(docRef, record, { merge: true });
    } else {
      const docRef = doc(collection(db, 'homework'));
      await setDoc(docRef, { ...record, id: docRef.id });
    }
  };

  const handleSaveTimeTable = async (record) => {
    if (record.id) {
      const docRef = doc(db, 'timetable', record.id);
      await setDoc(docRef, record, { merge: true });
    } else {
      const docRef = doc(collection(db, 'timetable'));
      await setDoc(docRef, { ...record, id: docRef.id });
    }
  };

  const handleDeleteTimeTable = async (id) => {
    await deleteDoc(doc(db, 'timetable', id));
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen bg-[#090d16] text-slate-100 items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
      </div>
    );
  }

  // Not Logged In -> Show Login
  if (!currentUser) {
    return <LoginPage />;
  }

  // Loading Data after login
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#090d16] text-slate-100 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-sm font-bold text-indigo-400 animate-pulse tracking-wide">
            Loading {userRole === 'admin' ? 'Tuition Database' : 'Your Profile'}...
          </p>
        </div>
      </div>
    );
  }

  // Admin Layout
  if (userRole === 'admin') {
    return (
      <Router>
        <div className="flex flex-col md:flex-row min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-600/40">
          <Sidebar />
          <main className="flex-1 p-4 md:p-10 overflow-y-auto max-w-[1400px] w-full">
            <Routes>
              <Route path="/" element={<DashboardOverview students={students} payments={payments} />} />
              <Route path="/add-student" element={<AddStudent onAddStudent={handleAddStudent} />} />
              <Route path="/students" element={<StudentList students={students} onDeleteStudent={handleDeleteStudent} />} />
              <Route path="/attendance" element={<AttendanceManager students={students} attendance={attendance} onSaveAttendance={handleSaveAttendance} />} />
              <Route path="/tests" element={<TestManager students={students} tests={tests} onSaveTest={handleSaveTest} />} />
              <Route path="/payments" element={<PaymentManager students={students} payments={payments} onSavePayment={handleSavePayment} />} />
              <Route path="/homework" element={<HomeworkManager students={students} homework={homework} onSaveHomework={handleSaveHomework} />} />
              <Route path="/timetable" element={<TimeTableManager students={students} timetable={timetable} onSave={handleSaveTimeTable} onDelete={handleDeleteTimeTable} />} />
              <Route path="/student/:id" element={<StudentProfile students={students} attendance={attendance} tests={tests} payments={payments} homework={homework} timetable={timetable} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }

  // Student Layout
  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#090d16] text-slate-100 selection:bg-pink-600/40">
        <StudentSidebar />
        <main className="flex-1 p-4 md:p-10 overflow-y-auto max-w-[1400px] w-full">
          <Routes>
            <Route path="/" element={<StudentDashboard student={students[0]} homework={homework} />} />
            <Route path="/attendance" element={<StudentAttendance attendance={attendance} student={students[0]} />} />
            <Route path="/tests" element={<StudentTests tests={tests} />} />
            <Route path="/payments" element={<StudentPayments payments={payments} />} />
            <Route path="/homework" element={<StudentHomework homework={homework} />} />
            <Route path="/timetable" element={<StudentTimeTable timetable={timetable} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
