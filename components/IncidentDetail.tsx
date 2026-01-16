
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
    'Thấp': 'bg-slate-100 text-slate-700',
    'Trung bình': 'bg-blue-100 text-blue-800 border-blue-200',
    'Cao': 'bg-orange-100 text-orange-800 border-orange-200',
    'Khẩn cấp': 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-200',
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-5xl h-[94vh] sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border-t-2 sm:border-2 border-white animate-in slide-in-from-bottom duration-500">
        
        {/* Mobile Handle Bar */}
        <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto my-4 sm:hidden" onClick={onClose}></div>

        {/* Modal Header */}
        <div className="px-8 py-6 sm:px-12 sm:py-8 border-b-2 border-slate-50 flex justify-between items-start bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm ${report.anonymous ? 'bg-slate-800 text-white' : 'bg-indigo-700 text-white'}`}>
                 {report.anonymous ? 'Ẩn danh' : 'Công khai'}
               </span>
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em]">{report.category}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">{report.title}</h2>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-90">
            <svg className="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-10">
              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-1">Nội dung chi tiết</h4>
                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 text-slate-900 leading-relaxed text-lg font-medium whitespace-pre-wrap card-shadow">
                  {report.description}
                </div>
              </section>

              {!report.anonymous && (
                <section className="bg-indigo-50 p-8 rounded-[2rem] border-2 border-indigo-100 shadow-xl shadow-indigo-50/50">
                  <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-[0.3em] mb-5">Người phản ánh</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">Họ tên học sinh</p>
                      <p className="font-black text-slate-950 text-base">{report.studentName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">Thông tin liên hệ</p>
                      <p className="font-black text-indigo-700 text-base">{report.studentContact}</p>
                    </div>
                  </div>
                </section>
              )}

              <section className="grid grid-cols-2 gap-6 pt-10 border-t-2 border-slate-100">
                {[
                  { label: 'Lớp liên quan', value: `Lớp ${report.classGroup}`, icon: '🏫' },
                  { label: 'Địa điểm', value: report.location || 'Khuôn viên trường', icon: '📍' },
                  { label: 'Thời gian', value: new Date(report.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }), icon: '⏰' },
                  { label: 'Trạng thái', value: report.status, highlight: true, icon: '🛡️' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">{item.icon}</div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
                      <p className={`text-sm font-black ${item.highlight ? 'text-indigo-700' : 'text-slate-900'}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="pt-6">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-5 ml-1">Cập nhật tiến độ xử lý</p>
                <div className="flex flex-wrap gap-3">
                  {Object.values(IncidentStatus).map(status => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(report.id, status)}
                      className={`flex-1 min-w-[140px] px-6 py-4 rounded-2xl text-[11px] font-black tracking-widest transition-all ${
                        report.status === status 
                        ? 'bg-slate-950 text-white shadow-2xl' 
                        : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-indigo-600 hover:text-indigo-700'
                      }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: AI Analysis */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] border-t-4 border-indigo-500 shadow-2xl flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                   <svg className="w-32 h-32 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path></svg>
                </div>

                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/50">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white tracking-tight">AI Trợ lý học đường</h4>
                    {loading && <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest animate-pulse mt-1">Đang suy luận...</div>}
                  </div>
                </div>

                {analysis ? (
                  <div className="space-y-10 relative z-10">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Đánh giá rủi ro</span>
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 ${urgencyColors[analysis.urgency]}`}>
                          {analysis.urgency}
                        </span>
                      </div>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-inner">
                        <p className="text-sm text-slate-300 font-bold italic leading-relaxed">
                          "{analysis.summary}"
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-4">Hành động đề xuất</span>
                      <p className="text-sm text-slate-400 font-bold leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">
                        {analysis.suggestedAction}
                      </p>
                    </div>

                    <div className="bg-indigo-700 p-8 rounded-3xl shadow-2xl shadow-indigo-900/50 text-sm text-white font-bold leading-relaxed border-t-4 border-indigo-400">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🤝</div>
                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em]">Tư vấn nhân văn</span>
                      </div>
                      {analysis.educationalNote}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 animate-bounce">
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-3.464 0L9.14 15.818a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-1.571 1.571a2 2 0 002.828 2.828l1.571-1.571"></path></svg>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Đang khởi tạo phân tích thông minh...</p>
                  </div>
                )}
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100 flex items-center gap-4">
                <div className="text-2xl">🌱</div>
                <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest leading-tight">
                  Mọi thông tin phản ánh được bảo vệ tuyệt đối theo quy định nhà trường.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
