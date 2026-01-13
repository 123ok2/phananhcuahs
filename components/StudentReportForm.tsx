
import React, { useState } from 'react';
import { IncidentCategory, IncidentStatus } from '../types';

interface Props {
  onSubmit: (data: any) => Promise<void>;
}

const StudentReportForm: React.FC<Props> = ({ onSubmit }) => {
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reportPayload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        classGroup: formData.classGroup,
        status: IncidentStatus.PENDING,
        anonymous: formData.anonymous,
        ...(formData.anonymous ? {} : {
          studentName: formData.studentName,
          studentContact: formData.studentContact
        })
      };
      await onSubmit(reportPayload);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-50 text-center max-w-lg mx-auto border border-white animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner rotate-3">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">Cảm ơn bạn đã tin tưởng!</h2>
        <div className="space-y-4 mb-10">
          <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
            Phản ánh của bạn đã được gửi đến Ban Giám hiệu trường <b className="text-indigo-600">PTDTBT THCS Thu Cúc</b>.
          </p>
          <p className="text-slate-500 text-xs sm:text-sm italic font-medium">
            "Nhà trường hứa sẽ xem xét và phối hợp giải quyết vấn đề này một cách nhanh chóng, công bằng nhất để bảo vệ môi trường học tập an toàn cho tất cả chúng ta."
          </p>
        </div>
        <button 
          onClick={() => { setSubmitted(false); setFormData({ title: '', description: '', category: IncidentCategory.OTHERS, location: '', classGroup: '', anonymous: true, studentName: '', studentContact: '' }); }}
          className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          TIẾP TỤC PHẢN ÁNH KHÁC
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-indigo-50/50 border border-white relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative">
          
          {/* Switch Ẩn danh */}
          <div className="flex items-center justify-between bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-all ${formData.anonymous ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.72 0 3.347.433 4.774 1.2a10 10 0 011.607 14.333"></path></svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">Chế độ Ẩn danh</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formData.anonymous ? 'Danh tính được bảo vệ' : 'Công khai thông tin'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({...formData, anonymous: !formData.anonymous})}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.anonymous ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {!formData.anonymous && (
              <>
                <div className="animate-in fade-in slide-in-from-left-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Họ và tên của bạn</label>
                  <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-medium" placeholder="Nguyễn Văn A" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                </div>
                <div className="animate-in fade-in slide-in-from-right-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Số điện thoại liên hệ</label>
                  <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-medium" placeholder="09xx xxx xxx" value={formData.studentContact} onChange={e => setFormData({...formData, studentContact: e.target.value})} />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tiêu đề vụ việc</label>
              <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-medium" placeholder="Nêu vắn tắt sự việc..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Lớp của bạn</label>
              <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold" placeholder="VD: 9A, 8C..." value={formData.classGroup} onChange={e => setFormData({...formData, classGroup: e.target.value.toUpperCase()})} />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Loại sự cố</label>
              <select className="w-full appearance-none px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold text-slate-700" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as IncidentCategory})}>
                {Object.values(IncidentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="absolute right-5 top-[60%] -translate-y-1/2 pointer-events-none text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Địa điểm xảy ra</label>
              <input type="text" className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-medium" placeholder="VD: Sân sau, Nhà đa năng, Cổng trường..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mô tả chi tiết</label>
              <textarea required rows={5} className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-medium resize-none" placeholder="Hãy kể rõ sự việc để nhà trường có thể hỗ trợ bạn nhanh nhất có thể..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'GỬI PHẢN ÁNH NGAY'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentReportForm;
