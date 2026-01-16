
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, IncidentReport, IncidentStatus, IncidentCategory } from './types';
import StudentReportForm from './components/StudentReportForm';
import AdminDashboard from './components/AdminDashboard';
import IncidentDetail from './components/IncidentDetail';
import TeacherLogin from './components/TeacherLogin';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const HeartAnimation: React.FC = () => {
  const hearts = useMemo(() => {
    const colors = [
      'rgba(244, 63, 94, 0.7)',  // rose - sáng hơn
      'rgba(129, 140, 248, 0.7)', // indigo - sáng hơn
      'rgba(34, 197, 94, 0.7)',   // green - sáng hơn
      'rgba(245, 158, 11, 0.7)',  // amber - sáng hơn
      'rgba(168, 85, 247, 0.7)',  // purple - sáng hơn
    ];
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 20 + 15}px`, // Kích thước tối thiểu lớn hơn một chút
      duration: `${Math.random() * 15 + 20}s`,
      delay: `${Math.random() * 20}s`,
      color: colors[i % colors.length]
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map(heart => (
        <svg
          key={heart.id}
          className="floating-heart"
          style={{
            left: heart.left,
            width: heart.size,
            height: heart.size,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
            fill: heart.color,
            filter: 'drop-shadow(0 0 5px white)' // Thêm hào quang trắng để sáng rõ hơn
          }}
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user as User | null);
      setAuthLoading(false);
      
      if (user) {
        if (user.email) {
          setRole(UserRole.TEACHER);
        } else {
          setRole(UserRole.STUDENT);
        }
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error: any) {
          setRole(UserRole.STUDENT);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.email && role === UserRole.TEACHER) {
      setPermissionError(null);
      const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
      
      const unsubscribeSnap = onSnapshot(q, (snapshot) => {
        const loadedReports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as IncidentReport[];
        setReports(loadedReports);
      }, (error: any) => {
        if (error.code === 'permission-denied') {
          setPermissionError("Bạn không có quyền truy cập dữ liệu.");
        }
      });
      
      return () => unsubscribeSnap();
    } else {
      setReports([]);
    }
  }, [currentUser, role]);

  const handleNewReport = async (reportData: any) => {
    try {
      await addDoc(collection(db, "reports"), {
        ...reportData,
        timestamp: Date.now(),
        serverTime: serverTimestamp(),
        createdBy: currentUser?.uid || 'anonymous_guest',
        schoolName: "PTDTBT THCS THU CÚC"
      });
    } catch (error: any) {
      alert("Lỗi khi gửi dữ liệu.");
      throw error;
    }
  };

  const handleUpdateStatus = async (id: string, status: IncidentStatus) => {
    try {
      const reportRef = doc(db, "reports", id);
      await updateDoc(reportRef, { status });
    } catch (error) {
      alert("Lỗi cập nhật trạng thái.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRole(UserRole.STUDENT);
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="w-16 h-16 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-900 font-black text-sm tracking-label uppercase">Khởi tạo hệ thống an toàn...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col w-full relative">
      <HeartAnimation />

      {/* Navbar */}
      <nav className="glass-card sticky top-0 z-[60] border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-indigo-700 p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-indigo-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-950 leading-none font-serif uppercase">PTDTBT THCS THU CÚC</span>
                <span className="text-[9px] sm:text-[10px] font-black text-indigo-700 uppercase tracking-label mt-1">Cổng phản ánh an toàn</span>
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setRole(UserRole.STUDENT)}
                className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all ${role === UserRole.STUDENT ? 'bg-white text-indigo-700 shadow-sm scale-105' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                HỌC SINH
              </button>
              <button 
                onClick={() => setRole(UserRole.TEACHER)}
                className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all ${role === UserRole.TEACHER ? 'bg-white text-indigo-700 shadow-sm scale-105' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                GIÁO VIÊN
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 z-10">
        {role === UserRole.STUDENT ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="text-center mb-12 sm:mb-20">
              <h1 className="text-4xl sm:text-7xl font-black text-slate-950 mb-6 tracking-tight leading-none px-4 font-serif">
                <span className="gradient-text italic">PTDTBT THCS THU CÚC</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-xl font-medium max-w-2xl mx-auto px-4 leading-relaxed">
                Nơi mỗi học sinh đều có tiếng nói. Hãy cùng chúng tôi xây dựng một môi trường học tập hạnh phúc và không bạo lực.
              </p>
              <div className="w-24 h-1.5 bg-indigo-200 mx-auto mt-10 rounded-full opacity-30"></div>
            </div>
            <StudentReportForm onSubmit={handleNewReport} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {!currentUser?.email ? (
              <TeacherLogin />
            ) : permissionError ? (
              <div className="bg-white border-2 border-red-50 p-12 rounded-[3rem] text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight font-serif uppercase">Lỗi Quyền Truy Cập</h3>
                <p className="text-base text-slate-500 font-medium mb-8 max-sm-mx-auto">{permissionError}</p>
                <button onClick={handleLogout} className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-slate-200">Đăng xuất</button>
              </div>
            ) : (
              <AdminDashboard reports={reports} onSelectReport={setSelectedReport} />
            )}
          </div>
        )}
      </main>

      <footer className="py-10 sm:py-16 border-t border-slate-200 bg-white mt-12 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="text-center sm:text-left">
              <p className="text-slate-950 font-black text-lg sm:text-xl tracking-tight mb-2 uppercase font-serif">PTDTBT THCS THU CÚC</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-label">Công nghệ bảo vệ học đường SchoolSafe v2.0</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <a href="tel:0868640898" className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all group">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                <span className="text-xs font-black text-indigo-700 tracking-wider">HOTLINE: 0868.640.898</span>
              </a>
              <p className="text-xs text-slate-400 font-bold italic">© 2024 Ban Giám Hiệu THU CÚC School</p>
            </div>
          </div>
        </div>
      </footer>

      {selectedReport && (
        <IncidentDetail 
          report={selectedReport} 
          onUpdateStatus={handleUpdateStatus} 
          onClose={() => setSelectedReport(null)} 
        />
      )}

      {currentUser?.email && role === UserRole.TEACHER && (
        <button 
          onClick={handleLogout}
          className="fixed bottom-8 right-8 bg-slate-950 text-white p-5 rounded-3xl shadow-2xl z-[70] hover:scale-110 active:scale-95 transition-all group"
          title="Đăng xuất"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;
