
import React, { useState, useEffect } from 'react';
import { UserRole, IncidentReport, IncidentStatus } from './types';
import StudentReportForm from './components/StudentReportForm';
import AdminDashboard from './components/AdminDashboard';
import IncidentDetail from './components/IncidentDetail';
import TeacherLogin from './components/TeacherLogin';
import { auth, db } from './services/firebase';
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
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex flex-col w-full overflow-hidden">
      {/* Mesh Background */}
      <div className="mesh-bg"></div>

      {/* Header Mobile & Desktop */}
      <header className="sticky top-0 z-50 w-full px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-panel rounded-full px-2 py-2 sm:px-4 sm:py-3 shadow-lg shadow-indigo-900/5 flex justify-between items-center">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 pl-2">
              <div className="bg-indigo-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide leading-tight">THCS Thu Cúc</span>
                <span className="text-[10px] font-semibold text-indigo-600">SchoolSafe</span>
              </div>
            </div>

            {/* Role Switcher Pill */}
            <div className="bg-slate-100/50 p-1 rounded-full flex relative">
              <div 
                className={`absolute inset-y-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${
                  role === UserRole.STUDENT ? 'left-1 w-[calc(50%-4px)]' : 'left-[50%] w-[calc(50%-4px)]'
                }`}
              ></div>
              <button 
                onClick={() => setRole(UserRole.STUDENT)}
                className={`relative z-10 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-colors ${role === UserRole.STUDENT ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Học sinh
              </button>
              <button 
                onClick={() => setRole(UserRole.TEACHER)}
                className={`relative z-10 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-colors ${role === UserRole.TEACHER ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Giáo viên
              </button>
            </div>

          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 pb-20 pt-6 sm:pt-10 z-10">
        {role === UserRole.STUDENT ? (
          <div className="slide-up-fade">
            <div className="text-center mb-10 sm:mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Cổng thông tin trực tuyến
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Lắng nghe & <span className="text-indigo-600">Hành động</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-base font-medium max-w-lg mx-auto">
                Chia sẻ vấn đề của bạn một cách an toàn và bảo mật. Nhà trường luôn ở đây để lắng nghe và hỗ trợ bạn.
              </p>
            </div>
            <StudentReportForm onSubmit={handleNewReport} />
          </div>
        ) : (
          <div className="slide-up-fade">
            {!currentUser?.email ? (
              <TeacherLogin />
            ) : permissionError ? (
              <div className="bg-white/80 backdrop-blur-md border border-red-100 p-8 rounded-[2rem] text-center shadow-xl max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Giới hạn truy cập</h3>
                <p className="text-sm text-slate-500 mb-6">{permissionError}</p>
                <button onClick={handleLogout} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all">Đăng xuất</button>
              </div>
            ) : (
              <AdminDashboard reports={reports} onSelectReport={setSelectedReport} />
            )}
          </div>
        )}
      </main>

      {/* Footer minimal */}
      <footer className="py-6 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest z-10">
        © 2024 PTDTBT THCS THU CÚC
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
          className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl z-[60] hover:scale-110 transition-transform"
          title="Đăng xuất"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      )}
    </div>
  );
};

export default App;
