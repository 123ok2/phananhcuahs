
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

const TeacherLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_teacher_email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('remembered_teacher_email', email);
    } catch (err: any) {
      setError('Thông tin đăng nhập không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white/60 slide-up-fade">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900">Cổng Giáo Viên</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Khu vực quản trị</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl text-center border border-red-100">
            {error}
          </div>
        )}
        
        <div className="space-y-1">
          <input 
            type="email" 
            required
            className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-slate-900/10 focus:bg-white text-sm font-bold text-slate-800 placeholder:text-slate-400"
            placeholder="Email giáo viên"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <input 
            type="password" 
            required
            className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-slate-900/10 focus:bg-white text-sm font-bold text-slate-800 placeholder:text-slate-400"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] mt-2"
        >
          {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
        </button>
      </form>
    </div>
  );
};

export default TeacherLogin;
