
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
      <div className="bg-white p-10 sm:p-20 rounded-[3rem] shadow-2xl text-center max-w-xl mx-auto border border-indigo-50 animate-in zoom-in duration-700">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-4xl font-serif font-black text-slate-950 mb-6 italic">Cảm ơn bạn!</h2>
        <div className="space-y-6 mb-12">
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            Phản ánh đã được gửi tới Ban Giám hiệu <b className="text-indigo-700 font-serif">PTDTBT THCS THU CÚC</b>.
          </p>
          <p className="text-sm italic text-indigo-800 bg-indigo-50 p-6 rounded-2xl">
            "Chúng mình luôn lắng nghe và bảo vệ bạn. Mọi thông tin sẽ được xử lý bảo mật."
          </p>
        </div>
        <button 
          onClick={() => { setSubmitted(false); setFormData({ title: '', description: '', category: IncidentCategory.OTHERS, location: '', classGroup: '', anonymous: true, studentName: '', studentContact: '' }); }}
          className="w-full bg-indigo-900 text-white px-8 py-5 rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-indigo-100 text-lg font-serif"
        >
          TIẾP TỤC GỬI PHẢN ÁNH
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 card-shadow">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all ${formData.anonymous ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.72 0 3.347.433 4.774 1.2a10 10 0 011.607 14.333"></path></svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 font-serif italic uppercase">Gửi ẩn danh</p>
                <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-tight">{formData.anonymous ? 'Danh tính được bảo mật' : 'Thông tin sẽ hiển thị'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({...formData, anonymous: !formData.anonymous})}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${formData.anonymous ? 'bg-indigo-900' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${formData.anonymous ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {!formData.anonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                <input type="text" required className="px-6 py-4 bg-slate-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold" placeholder="Tên của bạn" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                <input type="text" required className="px-6 py-4 bg-slate-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold" placeholder="SĐT liên hệ" value={formData.studentContact} onChange={e => setFormData({...formData, studentContact: e.target.value})} />
              </div>
            )}

            <input type="text" required className="w-full px-6 py-4 bg-slate-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-base font-bold text-slate-900" placeholder="Tiêu đề vụ việc..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required className="px-6 py-4 bg-slate-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-black text-indigo-700 uppercase" placeholder="Lớp (Vd: 9A...)" value={formData.classGroup} onChange={e => setFormData({...formData, classGroup: e.target.value.toUpperCase()})} />
              <select className="px-6 py-4 bg-slate-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-800" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as IncidentCategory})}>
                {Object.values(IncidentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <input type="text" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold" placeholder="Địa điểm xảy ra (Sân trường, lớp học...)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />

            <textarea required rows={5} className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-medium text-slate-800 resize-none leading-relaxed" placeholder="Mô tả chi tiết sự việc..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-900 text-white font-black py-6 rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-50 active:scale-[0.98] flex items-center justify-center gap-4 text-lg font-serif uppercase tracking-widest">
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Gửi phản ánh an toàn'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentReportForm;
