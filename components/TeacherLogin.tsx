
import React, { useState, useEffect } from 'react';
// Fix: Standard modular import for Firebase Auth to resolve export error
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

const TeacherLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_teacher_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Standard modular call for authentication
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem('remembered_teacher_email', email);
      } else {
        localStorage.removeItem('remembered_teacher_email');
      }
    } catch (err: any) {
      setError('Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-50 border border-white">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100 rotate-3">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cổng Giáo viên</h2>
        <p className="text-indigo-600 font-bold mt-2 uppercase">TRƯỜNG PTDTBT THCS THU CÚC</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-center gap-3 animate-in fade-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email nhà trường</label>
          <input 
            type="email" 
            required
            className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            placeholder="gv_nguyenvana@thcsthucuc.edu.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Mật khẩu</label>
          <input 
            type="password" 
            required
            className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
              <svg className="w-4 h-4 text-white absolute left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Ghi nhớ tài khoản</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Phòng máy chủ: PTDTBT THCS THU CÚC
        </p>
      </div>
    </div>
  );
};

export default TeacherLogin;
