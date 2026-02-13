
import React, { useState } from 'react';
import { IncidentCategory, IncidentStatus, IncidentReport } from '../types';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { signInAnonymously } from 'firebase/auth';

interface Props {
  onSubmit: (data: any) => Promise<void>;
}

const StudentReportForm: React.FC<Props> = ({ onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'track'>('send');
  
  // State cho Form gửi
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: IncidentCategory.OTHERS,
    location: '',
    classGroup: '',
    anonymous: true,
    studentName: '',
    studentContact: '',
  });
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State cho Tra cứu
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<IncidentReport | null>(null);
  const [trackingError, setTrackingError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [isDevError, setIsDevError] = useState(false);

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const code = generateTrackingCode();
    try {
      const reportPayload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        classGroup: formData.classGroup,
        status: IncidentStatus.PENDING,
        anonymous: formData.anonymous,
        trackingCode: code,
        ...(formData.anonymous ? {} : {
          studentName: formData.studentName,
          studentContact: formData.studentContact
        })
      };
      await onSubmit(reportPayload);
      setSubmittedCode(code);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = trackingCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    
    setTrackingLoading(true);
    setTrackingResult(null);
    setTrackingError('');
    setIsDevError(false);

    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        setTrackingError('Lỗi xác thực hệ thống. Vui lòng tải lại trang.');
        setTrackingLoading(false);
        return;
      }
    }

    try {
      const q = query(
        collection(db, "reports"), 
        where("trackingCode", "==", cleanCode),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data() as IncidentReport;
        setTrackingResult(docData);
      } else {
        setTrackingError('Không tìm thấy mã này.');
      }
    } catch (err: any) {
      console.error("Tracking error:", err);
      if (err.code === 'permission-denied') {
        setTrackingError('Lỗi phân quyền (Permission Denied).');
        setIsDevError(true);
      } else {
        setTrackingError('Lỗi kết nối. Vui lòng thử lại.');
      }
    } finally {
      setTrackingLoading(false);
    }
  };

  if (submittedCode) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100 text-center max-w-lg mx-auto border border-white/50 slide-up-fade">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 animate-[bounce_1s_infinite]">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Gửi thành công!</h2>
        <p className="text-slate-500 mb-8 text-sm">Nhà trường sẽ xem xét và xử lý sớm nhất.</p>
        
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl mb-8 relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mã tra cứu của bạn</p>
          <p className="text-4xl font-black text-indigo-600 tracking-wider font-mono">{submittedCode}</p>
        </div>

        <button 
          onClick={() => { 
            setSubmittedCode(null); 
            setFormData({ title: '', description: '', category: IncidentCategory.OTHERS, location: '', classGroup: '', anonymous: true, studentName: '', studentContact: '' }); 
            setActiveTab('track');
          }}
          className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-900 transition-all shadow-lg text-sm"
        >
          Theo dõi tiến độ
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Segmented Control Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200/50 p-1 rounded-2xl inline-flex w-full max-w-xs relative">
           <div className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ${activeTab === 'send' ? 'left-1' : 'left-[50%]'}`}></div>
           <button onClick={() => setActiveTab('send')} className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'send' ? 'text-indigo-700' : 'text-slate-500'}`}>Báo cáo</button>
           <button onClick={() => setActiveTab('track')} className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'track' ? 'text-indigo-700' : 'text-slate-500'}`}>Tra cứu</button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-5 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/60 transition-all duration-500">
        
        {activeTab === 'send' ? (
          /* SEND FORM */
          <form onSubmit={handleSubmit} className="space-y-6 slide-up-fade">
            
            {/* Anonymous Toggle - Modern Card Style */}
            <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100 flex items-center justify-between cursor-pointer" onClick={() => setFormData({...formData, anonymous: !formData.anonymous})}>
               <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.anonymous ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-slate-900">Chế độ ẩn danh</h3>
                   <p className="text-[11px] text-slate-500 font-medium">{formData.anonymous ? 'Danh tính của bạn được bảo mật' : 'Chia sẻ danh tính với thầy cô'}</p>
                 </div>
               </div>
               <div className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.anonymous ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${formData.anonymous ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
            </div>

            <div className="space-y-5">
              {!formData.anonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-2">Họ và tên</label>
                    <input type="text" required className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-semibold text-slate-800" placeholder="Nguyễn Văn A" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-2">Số điện thoại</label>
                    <input type="text" required className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-semibold text-slate-800" placeholder="09xxx..." value={formData.studentContact} onChange={e => setFormData({...formData, studentContact: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-2">Vấn đề gặp phải</label>
                <input type="text" required className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-base font-bold text-slate-900" placeholder="Ví dụ: Bạo lực học đường, Mất đồ..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-500 uppercase ml-2">Lớp</label>
                   <input type="text" required className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-bold text-indigo-600 uppercase" placeholder="9A" value={formData.classGroup} onChange={e => setFormData({...formData, classGroup: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-2">Danh mục</label>
                  <select className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-bold text-slate-800 appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as IncidentCategory})}>
                    {Object.values(IncidentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-2">Chi tiết sự việc</label>
                <textarea required rows={5} className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-3xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-medium text-slate-800 resize-none leading-relaxed" placeholder="Hãy kể lại sự việc một cách chi tiết..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <div className="space-y-1.5 mt-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-2">Địa điểm</label>
                  <input type="text" required className="modern-input w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-bold" placeholder="Tại sân trường, Lớp học..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-5 rounded-3xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3 mt-4 text-base">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Gửi Phản Ánh'}
            </button>
          </form>
        ) : (
          /* TRACKING FORM */
          <div className="slide-up-fade min-h-[400px]">
            <div className="text-center space-y-2 mb-8">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900">Tra cứu kết quả</h3>
              <p className="text-sm text-slate-500 font-medium">Nhập 6 ký tự mã bí mật để xem phản hồi</p>
            </div>

            <form onSubmit={handleTrack} className="flex items-center gap-2 sm:gap-3 mb-8">
              <input 
                type="text" 
                required
                className="modern-input flex-1 min-w-0 px-4 sm:px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-lg font-black text-center uppercase tracking-[0.2em] text-indigo-900 placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400"
                placeholder="Mã số" 
                value={trackingCodeInput} 
                onChange={e => setTrackingCodeInput(e.target.value)}
              />
              <button type="submit" disabled={trackingLoading} className="w-14 sm:w-auto px-0 sm:px-6 py-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex-shrink-0 flex items-center justify-center">
                {trackingLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
              </button>
            </form>

            {trackingError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center text-sm font-bold border border-red-100 animate-in fade-in zoom-in-95">
                 {trackingError}
                 {isDevError && <div className="text-[10px] font-normal mt-1 opacity-70">Admin: Check console for security rules.</div>}
              </div>
            )}

            {trackingResult && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-lg">📝</div>
                     <div>
                       <div className="text-[10px] font-bold uppercase text-slate-400">Trạng thái</div>
                       <div className={`text-xs font-black uppercase ${
                          trackingResult.status === IncidentStatus.PENDING ? 'text-amber-500' :
                          trackingResult.status === IncidentStatus.PROCESSING ? 'text-indigo-500' : 'text-emerald-500'
                       }`}>{trackingResult.status}</div>
                     </div>
                   </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">{trackingResult.title}</h4>
                    <p className="text-xs text-slate-400 font-semibold">{new Date(trackingResult.timestamp).toLocaleDateString('vi-VN')}</p>
                  </div>
                  
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block mb-2">Phản hồi từ nhà trường</span>
                    {trackingResult.adminReply ? (
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">"{trackingResult.adminReply}"</p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center text-[10px]">👨‍🏫</div>
                          <span className="text-[10px] font-bold text-indigo-700">Ban Giám Hiệu</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Đang chờ phản hồi...</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReportForm;
