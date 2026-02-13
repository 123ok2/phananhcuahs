
import React, { useState, useEffect } from 'react';
import { IncidentReport, IncidentStatus, AIAnalysis } from '../types';
import { analyzeIncident } from '../services/geminiService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Props {
  report: IncidentReport;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
  onClose: () => void;
}

const IncidentDetail: React.FC<Props> = ({ report, onUpdateStatus, onClose }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(report.aiAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<IncidentStatus | null>(null);
  
  // State for Admin Reply
  const [replyText, setReplyText] = useState(report.adminReply || '');
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [replySaved, setReplySaved] = useState(false);

  useEffect(() => {
    if (!report.aiAnalysis && !loading) {
      handleAnalyze();
    }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [report.id]);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeIncident(report);
    setAnalysis(result);
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setUpdating(newStatus);
    await onUpdateStatus(report.id, newStatus);
    setTimeout(() => setUpdating(null), 800);
  };

  const handleSaveReply = async () => {
    if (!replyText.trim()) return;
    setIsSavingReply(true);
    try {
      const reportRef = doc(db, "reports", report.id);
      await updateDoc(reportRef, { adminReply: replyText });
      setReplySaved(true);
      setTimeout(() => setReplySaved(false), 2000);
    } catch (error) {
      alert("Lỗi khi lưu phản hồi");
    } finally {
      setIsSavingReply(false);
    }
  };

  const urgencyColors: Record<string, string> = {
    'Thấp': 'bg-slate-100 text-slate-600',
    'Trung bình': 'bg-blue-100 text-blue-700',
    'Cao': 'bg-orange-100 text-orange-700',
    'Khẩn cấp': 'bg-red-100 text-red-700 border border-red-200 animate-pulse',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white sm:rounded-[2rem] shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] modal-enter overflow-hidden mobile-full-modal">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-main">
              Chi tiết phản ánh #{report.trackingCode || report.id.slice(-4)}
            </span>
            {report.trackingCode && <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">Tracking: {report.trackingCode}</span>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Info */}
            <div className="lg:col-span-7 space-y-8">
              <header className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide">
                  {report.category}
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 leading-tight">
                  {report.title}
                </h1>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>{report.location}</span>
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{new Date(report.timestamp).toLocaleDateString('vi-VN')}</span>
                </div>
              </header>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-serif">Mô tả vụ việc</h3>
                <div className="p-6 bg-slate-50 rounded-2xl text-slate-800 font-medium leading-relaxed whitespace-pre-wrap border border-slate-100">
                  {report.description}
                </div>
              </div>

              {/* Teacher Reply Section */}
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest font-serif">Phản hồi cho học sinh</h3>
                    {replySaved && <span className="text-[10px] font-bold text-emerald-600 animate-in fade-in">Đã lưu phản hồi!</span>}
                 </div>
                 <div className="relative">
                    <textarea 
                      className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                      rows={3}
                      placeholder="Nhập lời nhắn để học sinh đọc được khi tra cứu (Vd: Thầy đã nhận tin, em hãy yên tâm...)"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button 
                      onClick={handleSaveReply}
                      disabled={isSavingReply || replyText === report.adminReply}
                      className="absolute bottom-3 right-3 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isSavingReply ? '...' : 'Gửi'}
                    </button>
                 </div>
                 <p className="text-[10px] text-slate-400 italic">* Học sinh sẽ thấy nội dung này khi nhập mã tra cứu.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lớp</p>
                  <p className="text-sm font-bold text-indigo-700">{report.classGroup}</p>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Người gửi</p>
                  <p className="text-sm font-bold text-slate-900">{report.anonymous ? 'Ẩn danh' : report.studentName}</p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-serif">Trạng thái xử lý</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {Object.values(IncidentStatus).map((status) => {
                    const isCurrent = report.status === status;
                    const isUpdating = updating === status;
                    
                    let btnClass = "flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ";
                    
                    if (isCurrent) {
                      if (status === IncidentStatus.PENDING) btnClass += "bg-amber-500 text-white shadow-lg shadow-amber-100";
                      else if (status === IncidentStatus.PROCESSING) btnClass += "status-processing text-white shadow-lg shadow-indigo-100";
                      else if (status === IncidentStatus.RESOLVED) btnClass += "bg-emerald-500 text-white shadow-lg shadow-emerald-100";
                    } else {
                      btnClass += "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600";
                    }

                    return (
                      <button 
                        key={status} 
                        onClick={() => handleStatusChange(status)}
                        disabled={isCurrent || !!updating}
                        className={btnClass}
                      >
                        {isUpdating && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: AI Analysis */}
            <div className="lg:col-span-5">
              <div className="bg-indigo-950 rounded-3xl p-8 text-white h-full relative overflow-hidden flex flex-col space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">✨</div>
                  <h4 className="font-serif italic text-xl">Phân tích thông minh</h4>
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 animate-pulse">Đang thẩm định...</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-10 animate-in fade-in duration-700">
                    <div>
                      <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase mb-4 ${urgencyColors[analysis.urgency]}`}>
                        Mức độ: {analysis.urgency}
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-indigo-100 italic">
                        "{analysis.summary}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Đề xuất bước tiếp theo</span>
                      <p className="text-xs font-medium leading-relaxed text-slate-300 bg-white/5 p-5 rounded-2xl border border-white/5">
                        {analysis.suggestedAction}
                      </p>
                    </div>

                    <div className="p-6 bg-indigo-600/30 rounded-2xl border border-indigo-400/20">
                      <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-2 block">Ghi chú sư phạm</span>
                      <p className="text-xs font-bold leading-relaxed">
                        {analysis.educationalNote}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center opacity-30 italic text-sm">Chưa có dữ liệu phân tích</div>
                )}
                
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
