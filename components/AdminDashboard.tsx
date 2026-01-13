
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
      name: cat, // Hiển thị đầy đủ tên danh mục
      shortName: cat.length > 10 ? cat.substring(0, 10) + '...' : cat,
      count: reports.filter(r => r.category === cat).length
    }));
  }, [reports]);

  const statusCount = useMemo(() => ({
    pending: reports.filter(r => r.status === IncidentStatus.PENDING).length,
    processing: reports.filter(r => r.status === IncidentStatus.PROCESSING).length,
    resolved: reports.filter(r => r.status === IncidentStatus.RESOLVED).length,
  }), [reports]);

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: 'Cần xử lý', count: statusCount.pending, color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', icon: '⏳' },
          { label: 'Đang giải quyết', count: statusCount.processing, color: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: '🚀' },
          { label: 'Đã hoàn thành', count: statusCount.resolved, color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '✅' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between relative group overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className={`text-3xl sm:text-4xl font-black ${item.text}`}>{item.count}</p>
            </div>
            <div className={`relative z-10 w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-50`}>
               {item.icon}
            </div>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${item.bg} rounded-full opacity-50 transition-transform group-hover:scale-150 duration-700`}></div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          {[
            { value: filterClass, setter: setFilterClass, options: availableClasses, label: 'Lớp', prefix: 'Lớp ' },
            { value: filterCategory, setter: setFilterCategory, options: Object.values(IncidentCategory), label: 'Danh mục' },
            { value: filterStatus, setter: setFilterStatus, options: Object.values(IncidentStatus), label: 'Trạng thái' },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select 
                className="w-full appearance-none px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-bold text-slate-700 cursor-pointer"
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
              >
                <option value="All">Tất cả {f.label}</option>
                {f.options.map(opt => <option key={opt} value={opt}>{f.prefix || ''}{opt}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Biểu đồ phân tích danh mục */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-lg font-black text-slate-900">Phân tích danh mục</h3>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
          <div className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} margin={{top: 10, right: 10, left: -20, bottom: 60}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  fontWeight={800} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b'}} 
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  dy={10}
                />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#cbd5e1'}} fontSize={10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                  itemStyle={{fontWeight: 800, fontSize: '12px', color: '#4f46e5'}}
                  labelStyle={{fontWeight: 900, marginBottom: '4px', color: '#1e293b'}}
                />
                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={32}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Danh sách phản ánh */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Danh sách phản ánh</h3>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">{filteredReports.length} Vụ việc</span>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[500px] sm:max-h-[600px] pr-1 custom-scrollbar">
            {filteredReports.map(report => (
              <div 
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-5 rounded-[1.5rem] border border-white bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 cursor-pointer transition-all duration-300 group active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                    report.status === IncidentStatus.PENDING ? 'bg-amber-100 text-amber-600' :
                    report.status === IncidentStatus.PROCESSING ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {report.status}
                  </div>
                  <span className="text-[10px] font-black text-slate-300">ID: {report.id.slice(-4)}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{report.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 font-medium">{report.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">{report.classGroup[0]}</div>
                    <span className="text-[10px] font-black text-slate-500">Lớp {report.classGroup}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(report.timestamp).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="bg-white p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Không tìm thấy dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
