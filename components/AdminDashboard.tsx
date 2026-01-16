
import React, { useMemo, useState } from 'react';
import { IncidentReport, IncidentStatus, IncidentCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  reports: IncidentReport[];
  onSelectReport: (report: IncidentReport) => void;
}

const AdminDashboard: React.FC<Props> = ({ reports, onSelectReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [showGuide, setShowGuide] = useState(false);

  const availableClasses = useMemo(() => {
    const classes = reports.map(r => r.classGroup).filter(Boolean);
    return Array.from(new Set(classes)).sort();
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'All' || report.category === filterCategory;
      const matchStatus = filterStatus === 'All' || report.status === filterStatus;
      const matchClass = filterClass === 'All' || report.classGroup === filterClass;
      return matchSearch && matchCategory && matchStatus && matchClass;
    });
  }, [reports, searchTerm, filterCategory, filterStatus, filterClass]);

  const stats = useMemo(() => {
    return Object.values(IncidentCategory).map(cat => ({
      name: cat,
      displayName: cat.split(' ')[0],
      count: reports.filter(r => r.category === cat).length
    }));
  }, [reports]);

  const statusCount = useMemo(() => ({
    pending: reports.filter(r => r.status === IncidentStatus.PENDING).length,
    processing: reports.filter(r => r.status === IncidentStatus.PROCESSING).length,
    resolved: reports.filter(r => r.status === IncidentStatus.RESOLVED).length,
  }), [reports]);

  const GuideModal = () => (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Hướng dẫn xử lý sự cố</h3>
          </div>
          <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-white rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-black text-indigo-700 uppercase tracking-widest">1. Đối với Bạo lực học đường</h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 space-y-2">
              <p>• <b>Bước 1:</b> Tách riêng các bên liên quan để làm việc độc lập.</p>
              <p>• <b>Bước 2:</b> Phối hợp với nhân viên y tế nếu có thương tích.</p>
              <p>• <b>Bước 3:</b> Liên lạc với PHHS ngay trong buổi học.</p>
              <p>• <b>Bước 4:</b> Lập biên bản và đề xuất AI phân tích tâm lý.</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest">2. Đối với Cơ sở vật chất</h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 space-y-2">
              <p>• <b>Bước 1:</b> Kiểm tra hiện trạng thực tế (chụp ảnh lưu lại).</p>
              <p>• <b>Bước 2:</b> Đánh giá mức độ nguy hiểm (niêm phong khu vực nếu cần).</p>
              <p>• <b>Bước 3:</b> Chuyển yêu cầu sửa chữa cho bộ phận Kế toán/Hậu cần.</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-black text-amber-700 uppercase tracking-widest">3. Đối với Sức khỏe & Vệ sinh</h4>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 space-y-2">
              <p>• <b>Bước 1:</b> Đưa học sinh xuống phòng y tế hoặc trung tâm y tế gần nhất.</p>
              <p>• <b>Bước 2:</b> Rà soát nguyên nhân (vệ sinh ATTP hoặc dịch bệnh).</p>
              <p>• <b>Bước 3:</b> Thông báo cho PHHS và theo dõi tình hình sức khỏe học sinh.</p>
            </div>
          </div>
          <div className="p-6 bg-indigo-900 rounded-2xl text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60">Lưu ý quan trọng</p>
            <p className="text-sm font-bold italic">"Luôn giữ thái độ lắng nghe, công bằng và tuyệt đối không tiết lộ danh tính học sinh phản ánh nếu họ chọn chế độ ẩn danh."</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {showGuide && <GuideModal />}
      
      {/* Header & Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">Quản lý phản ánh</h2>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Trung tâm điều hành PTDTBT THCS Thu Cúc</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-grow sm:flex-grow-0">
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              className="w-full sm:w-64 pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-600 outline-none text-sm font-bold text-slate-900 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border-2 border-slate-200 shadow-sm">
             <span className="text-[10px] font-black text-slate-400 px-3 uppercase tracking-tighter">Bộ lọc</span>
             <select 
               className="bg-transparent border-0 text-xs font-black text-indigo-700 outline-none pr-4"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="All">Tất cả trạng thái</option>
               {Object.values(IncidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* MAIN AREA: Incident List (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden card-shadow">
            <div className="px-8 py-6 border-b-2 border-slate-50 flex items-center justify-between bg-slate-50/50">
               <h3 className="font-black text-slate-900 flex items-center gap-3">
                 <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                 Danh sách vụ việc
               </h3>
               <span className="bg-indigo-700 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">
                 {filteredReports.length} Kết quả
               </span>
            </div>
            
            <div className="divide-y-2 divide-slate-50 max-h-[800px] overflow-y-auto custom-scrollbar">
              {filteredReports.map(report => (
                <div 
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="p-6 sm:p-8 hover:bg-indigo-50/30 cursor-pointer transition-all group flex flex-col sm:flex-row gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-white group-hover:shadow-md transition-all">
                    {report.category === IncidentCategory.VIOLENCE ? '🥊' :
                     report.category === IncidentCategory.INFRASTRUCTURE ? '🏗️' :
                     report.category === IncidentCategory.HEALTH ? '🏥' :
                     report.category === IncidentCategory.HARASSMENT ? '⚠️' : '❓'}
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                        report.status === IncidentStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                        report.status === IncidentStatus.PROCESSING ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lớp {report.classGroup}</span>
                      <span className="text-[10px] font-black text-slate-300 ml-auto">#{report.id.slice(-4).toUpperCase()}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-950 group-hover:text-indigo-700 transition-colors leading-tight">
                      {report.title}
                    </h4>
                    <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {report.location || 'Khuôn viên trường'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {new Date(report.timestamp).toLocaleDateString('vi-VN')}
                      </div>
                      {report.anonymous && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          Ẩn danh
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex self-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <div className="w-10 h-10 bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                </div>
              ))}
              {filteredReports.length === 0 && (
                <div className="py-32 text-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                   </div>
                   <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Không có phản ánh phù hợp</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR: Stats & Charts (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-600 p-5 rounded-3xl text-white shadow-lg shadow-amber-100 hover-lift cursor-default">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Cần xử lý</p>
              <p className="text-3xl font-black">{statusCount.pending}</p>
            </div>
            <div className="bg-indigo-700 p-5 rounded-3xl text-white shadow-lg shadow-indigo-100 hover-lift cursor-default">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Hoàn thành</p>
              <p className="text-3xl font-black">{statusCount.resolved}</p>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl card-shadow">
            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                Phân tích dữ liệu
              </h3>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{top: 0, right: 0, left: -35, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayName" 
                    fontSize={10} 
                    fontWeight={900} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b'}}
                  />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#cbd5e1'}} fontSize={10} fontWeight={800} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                    labelStyle={{fontWeight: 900, color: '#0f172a', fontSize: '11px'}}
                  />
                  <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={28}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#4338ca', '#059669', '#d97706', '#dc2626', '#7c3aed'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
               {stats.map((s, idx) => (
                 <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-red-600', 'bg-violet-600'][idx % 5]}`}></div>
                       <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{s.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900">{s.count}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Quick Help Section */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-sm font-black uppercase tracking-widest mb-3 text-indigo-400">Trợ giúp nhanh</h4>
              <ul className="text-xs font-medium text-slate-400 leading-relaxed mb-6 space-y-3">
                <li className="flex gap-2">
                  <span className="text-indigo-500">▶</span>
                  Ưu tiên các vụ việc có mức độ khẩn cấp "Cao" từ phân tích AI.
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-500">▶</span>
                  Sử dụng bộ lọc theo "Lớp" để GVCN nắm bắt tình hình lớp mình.
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-500">▶</span>
                  Luôn cập nhật trạng thái "Đang xử lý" để học sinh an tâm.
                </li>
              </ul>
              <button 
                onClick={() => setShowGuide(true)}
                className="w-full bg-indigo-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-900/40"
              >
                Xem quy trình xử lý chuẩn
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
