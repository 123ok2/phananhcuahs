
import React, { useState, useEffect } from 'react';
import { UserRole, IncidentReport, IncidentStatus, IncidentCategory } from './types';
import StudentReportForm from './components/StudentReportForm';
import AdminDashboard from './components/AdminDashboard';
import IncidentDetail from './components/IncidentDetail';
import TeacherLogin from './components/TeacherLogin';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut, User, signInAnonymously } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
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
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu trường học...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col w-full">
      {/* Navbar Tối ưu cho Mobile */}
      <nav className="glass-card sticky top-0 z-[60] border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-100">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 leading-none">PTDTBT THCS THU CÚC</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Hệ thống Phản ánh</span>
              </div>
            </div>
            
            <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200">
              <button 
                onClick={() => setRole(UserRole.STUDENT)}
                className={`px-3 sm:px-5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${role === UserRole.STUDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                HỌC SINH
              </button>
              <button 
                onClick={() => setRole(UserRole.TEACHER)}
                className={`px-3 sm:px-5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${role === UserRole.TEACHER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                GV/BGH
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {role === UserRole.STUDENT ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-3 tracking-tight leading-tight px-4">
                Trường <span className="gradient-text">THCS Thu Cúc</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base font-medium max-w-lg mx-auto italic px-4">
                "Vì một môi trường học tập an toàn, thân thiện và hạnh phúc."
              </p>
            </div>
            <StudentReportForm onSubmit={handleNewReport} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {!currentUser?.email ? (
              <TeacherLogin />
            ) : permissionError ? (
              <div className="bg-white border border-red-100 p-8 rounded-3xl text-center shadow-sm">
                <h3 className="text-lg font-black text-red-600 mb-2">Lỗi Quyền Truy Cập</h3>
                <p className="text-slate-500 text-sm">{permissionError}</p>
                <button onClick={handleLogout} className="mt-6 text-sm font-black text-indigo-600 underline">Đăng xuất và thử lại</button>
              </div>
            ) : (
              <AdminDashboard reports={reports} onSelectReport={setSelectedReport} />
            )}
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] sm:text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Hệ thống Phản ánh Sự cố nội bộ</p>
          <p className="text-slate-800 font-black text-sm sm:text-base">Trường PTDTBT THCS THU CÚC</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold italic">© 2024 SchoolSafe - Tiếng nói của bạn luôn được lắng nghe</span>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase">Thiết kế & Vận hành</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <a href="tel:0868640898" className="text-xs font-black text-indigo-600 hover:text-indigo-800">0868.640.898</a>
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

      {/* Nút Đăng xuất nổi cho GV trên Mobile */}
      {currentUser?.email && role === UserRole.TEACHER && (
        <button 
          onClick={handleLogout}
          className="fixed bottom-6 right-6 sm:hidden bg-white/90 backdrop-blur-md border border-red-100 p-4 rounded-2xl shadow-2xl text-red-500 z-[70] active:scale-95 transition-transform"
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
