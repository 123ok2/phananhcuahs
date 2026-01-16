
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
      <div className="bg-white p-10 sm:p-16 rounded-[3rem] shadow-2xl text-center max-w-xl mx-auto border-4 border-indigo-50 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mb-6 tracking-tight">Cảm ơn bạn đã tin tưởng!</h2>
        <div className="space-y-6 mb-12">
          <p className="text-slate-700 text-base sm:text-lg font-bold leading-relaxed">
            Phản ánh của bạn đã được gửi đến Ban Giám hiệu <b className="text-indigo-700 uppercase">TRƯỜNG PTDTBT THCS THU CÚC</b>.
          </p>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-600 text-sm sm:text-base italic font-bold leading-relaxed">
              "Nhà trường hứa sẽ xem xét và phối hợp giải quyết vấn đề này một cách nhanh chóng, công bằng nhất để bảo vệ môi trường học tập an toàn cho tất cả chúng ta."
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setSubmitted(false); setFormData({ title: '', description: '', category: IncidentCategory.OTHERS, location: '', classGroup: '', anonymous: true, studentName: '', studentContact: '' }); }}
          className="w-full bg-indigo-700 text-white px-8 py-5 rounded-2xl font-black hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-200 active:scale-95 text-lg"
        >
          TIẾP TỤC PHẢN ÁNH KHÁC
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 sm:p-14 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-slate-200 relative overflow-hidden card-shadow">
        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10 relative">
          
          {/* Switch Ẩn danh */}
          <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-all shadow-sm ${formData.anonymous ? 'bg-indigo-700 text-white' : 'bg-slate-300 text-slate-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.72 0 3.347.433 4.774 1.2a10 10 0 011.607 14.333"></path></svg>
              </div>
              <div>
                <p className="text-base font-black text-slate-900">Chế độ Ẩn danh</p>
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em] mt-0.5">{formData.anonymous ? 'Danh tính được bảo mật' : 'Công khai thông tin'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({...formData, anonymous: !formData.anonymous})}
              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all focus:outline-none ${formData.anonymous ? 'bg-indigo-700' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform ${formData.anonymous ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {!formData.anonymous && (
              <>
                <div className="animate-in fade-in duration-500">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Họ và tên của bạn</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-bold text-slate-900" placeholder="Nguyễn Văn A" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                </div>
                <div className="animate-in fade-in duration-500">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Số điện thoại liên hệ</label>
                  <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-bold text-slate-900" placeholder="09xx xxx xxx" value={formData.studentContact} onChange={e => setFormData({...formData, studentContact: e.target.value})} />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Tiêu đề vụ việc</label>
              <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-bold text-slate-900" placeholder="Nêu vắn tắt sự việc để thầy cô dễ nhận biết..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Lớp của bạn</label>
              <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-black text-indigo-700 placeholder:text-slate-400 uppercase" placeholder="VD: 9A, 8C..." value={formData.classGroup} onChange={e => setFormData({...formData, classGroup: e.target.value.toUpperCase()})} />
            </div>

            <div className="relative">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Loại sự cố</label>
              <select className="w-full appearance-none px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-black text-slate-900 cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as IncidentCategory})}>
                {Object.values(IncidentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="absolute right-6 top-[62%] -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Địa điểm xảy ra</label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-bold text-slate-900" placeholder="VD: Sân sau, Nhà đa năng, Cổng trường..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Mô tả chi tiết</label>
              <textarea required rows={6} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-bold text-slate-900 resize-none leading-relaxed" placeholder="Hãy kể rõ sự việc để nhà trường có thể hỗ trợ bạn nhanh nhất có thể..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-700 text-white font-black py-6 rounded-2xl hover:bg-indigo-800 transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 text-lg">
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                GỬI PHẢN ÁNH NGAY
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentReportForm;
