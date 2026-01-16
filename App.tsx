
import React, { useState, useEffect } from 'react';
import { UserRole, IncidentReport, IncidentStatus, IncidentCategory } from './types';
import StudentReportForm from './components/StudentReportForm';
import AdminDashboard from './components/AdminDashboard';
import IncidentDetail from './components/IncidentDetail';
import TeacherLogin from './components/TeacherLogin';
import { auth, db } from './services/firebase';
// Fix: Split type and value imports for Firebase Auth to resolve "no exported member" errors
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    // Standard modular listener for authentication state
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
        schoolName: "TRƯỜNG PTDTBT THCS THU CÚC"
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
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="w-12 h-12 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-900 font-black text-sm uppercase tracking-widest">Đang kết nối trường học...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col w-full">
      {/* Navbar */}
      <nav className="glass-card sticky top-0 z-[60] border-b border-slate-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="bg-indigo-700 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-xl font-black tracking-tight text-slate-950 leading-none uppercase">PTDTBT THCS THU CÚC</span>
                <span className="text-[8px] sm:text-[11px] font-black text-indigo-700 uppercase tracking-widest mt-1">Hệ thống Phản ánh</span>
              </div>
            </div>
            
            <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setRole(UserRole.STUDENT)}
                className={`px-3 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all ${role === UserRole.STUDENT ? 'bg-white text-indigo-700 shadow-md scale-105' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                HỌC SINH
              </button>
              <button 
                onClick={() => setRole(UserRole.TEACHER)}
                className={`px-3 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all ${role === UserRole.TEACHER ? 'bg-white text-indigo-700 shadow-md scale-105' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                GV/BGH
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {role === UserRole.STUDENT ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-6xl font-black text-slate-950 mb-3 tracking-tight leading-tight px-4">
                Trường <span className="gradient-text">PTDTBT THCS Thu Cúc</span>
              </h1>
              <p className="text-slate-600 text-xs sm:text-lg font-bold max-w-lg mx-auto italic px-4 leading-relaxed">
                "Vì một môi trường học tập an toàn và hạnh phúc."
              </p>
              <div className="w-16 h-1 primary-gradient mx-auto mt-6 rounded-full"></div>
            </div>
            <StudentReportForm onSubmit={handleNewReport} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {!currentUser?.email ? (
              <TeacherLogin />
            ) : permissionError ? (
              <div className="bg-white border border-red-200 p-8 rounded-[2.5rem] text-center shadow-xl">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Lỗi Quyền Truy Cập</h3>
                <p className="text-sm text-slate-600 font-medium mb-6">{permissionError}</p>
                <button onClick={handleLogout} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black hover:bg-black transition-all">Đăng xuất</button>
              </div>
            ) : (
              <AdminDashboard reports={reports} onSelectReport={setSelectedReport} />
            )}
          </div>
        )}
      </main>

      {/* Footer Tinh gọn */}
      <footer className="py-6 sm:py-8 border-t border-slate-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-slate-950 font-black text-sm sm:text-base tracking-tight mb-1 uppercase">TRƯỜNG PTDTBT THCS THU CÚC</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hệ thống bảo vệ học đường SchoolSafe</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <a href="tel:0868640898" className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors group">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                <span className="text-[11px] font-black text-indigo-700">0868.640.898</span>
              </a>
              <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></span>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold italic">© 2024 Thu Cuc School</p>
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

      {/* Nút Đăng xuất nổi */}
      {currentUser?.email && role === UserRole.TEACHER && (
        <button 
          onClick={handleLogout}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl z-[70] hover:scale-110 active:scale-95 transition-all group"
          title="Đăng xuất"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;
