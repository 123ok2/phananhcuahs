
import React, { useState, useEffect } from 'react';
import { IncidentReport, IncidentStatus, AIAnalysis } from '../types';
import { analyzeIncident } from '../services/geminiService';

interface Props {
  report: IncidentReport;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
  onClose: () => void;
}

const IncidentDetail: React.FC<Props> = ({ report, onUpdateStatus, onClose }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(report.aiAnalysis || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!report.aiAnalysis && !loading) {
      handleAnalyze();
    }
    // Chặn cuộn body khi mở modal
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [report.id]);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeIncident(report);
    setAnalysis(result);
    setLoading(false);
  };

  const urgencyColors = {
    'Thấp': 'bg-slate-100 text-slate-500',
    'Trung bình': 'bg-blue-50 text-blue-600',
    'Cao': 'bg-orange-50 text-orange-600',
    'Khẩn cấp': 'bg-red-50 text-red-600 animate-pulse',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-4xl h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t sm:border border-white animate-in slide-in-from-bottom duration-500">
        
        {/* Mobile Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 sm:hidden" onClick={onClose}></div>

        {/* Modal Header */}
        <div className="px-6 py-4 sm:p-8 border-b border-slate-50 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${report.anonymous ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white'}`}>
                 {report.anonymous ? 'Ẩn danh' : 'Công khai'}
               </span>
               <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{report.category}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">{report.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 sm:p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            
            {/* Left Column: Details */}
            <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Nội dung học sinh gửi</h4>
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                  {report.description}
                </div>
              </section>

              {!report.anonymous && (
                <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                  <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Người phản ánh</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-indigo-300 font-bold uppercase mb-1">Họ tên</p>
                      <p className="font-black text-indigo-900 text-sm">{report.studentName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-indigo-300 font-bold uppercase mb-1">Liên hệ</p>
                      <p className="font-black text-indigo-900 text-sm">{report.studentContact}</p>
                    </div>
                  </div>
                </section>
              )}

              <section className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8">
                {[
                  { label: 'Lớp liên quan', value: `Lớp ${report.classGroup}` },
                  { label: 'Địa điểm', value: report.location || 'Khuôn viên trường' },
                  { label: 'Thời gian', value: new Date(report.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) },
                  { label: 'Trạng thái hiện tại', value: report.status, highlight: true }
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-xs font-bold ${item.highlight ? 'text-indigo-600' : 'text-slate-700'}`}>{item.value}</p>
                  </div>
                ))}
              </section>

              <section className="pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cập nhật trạng thái xử lý</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(IncidentStatus).map(status => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(report.id, status)}
                      className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black transition-all ${
                        report.status === status 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: AI Analysis */}
            <div className="bg-slate-50/50 p-6 sm:p-8 rounded-3xl border border-slate-100 flex flex-col relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h4 className="text-base font-black text-slate-900 tracking-tight">AI Trợ lý học đường</h4>
                {loading && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
              </div>

              {analysis ? (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">Đánh giá rủi ro</span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${urgencyColors[analysis.urgency]}`}>
                        {analysis.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium italic bg-white p-4 rounded-xl border border-slate-100 shadow-sm leading-relaxed">
                      "{analysis.summary}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] block mb-3">Hành động đề xuất</span>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {analysis.suggestedAction}
                    </p>
                  </div>

                  <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-xs text-white font-medium leading-relaxed">
                    <span className="block text-[8px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-2">Tư vấn nhân văn</span>
                    {analysis.educationalNote}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm animate-pulse">
                    <svg className="w-6 h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Đang khởi tạo phân tích thông minh...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer for AI Note */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 hidden sm:block">
          <p className="text-[9px] text-slate-400 font-bold italic text-center uppercase tracking-widest">
            Phân tích bởi AI SchoolSafe - Trường PTDTBT THCS THU CÚC
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
