
import React, { useMemo, useState } from 'react';
import { IncidentReport, IncidentStatus, IncidentCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  reports: IncidentReport[];
  onSelectReport: (report: IncidentReport) => void;
}

const AdminDashboard: React.FC<Props> = ({ reports, onSelectReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'All' || report.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [reports, searchTerm, filterStatus]);

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

  const toggleFilter = (status: string) => {
    setFilterStatus(prev => prev === status ? 'All' : status);
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Welcome Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-1 font-main">Khu vực quản lý</p>
        <h2 className="text-3xl sm:text-5xl font-serif font-black text-slate-950 tracking-tight">Hệ thống điều hành</h2>
      </div>

      {/* Compact Quick Stats - Interactive */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <button 
          onClick={() => toggleFilter(IncidentStatus.PENDING)}
          className={`px-4 py-3 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 group
            ${filterStatus === IncidentStatus.PENDING 
              ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20 shadow-inner' 
              : 'bg-white border-slate-100 card-shadow hover:border-amber-200'}`}
        >
          <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none transition-colors
            ${filterStatus === IncidentStatus.PENDING ? 'text-amber-700' : 'text-slate-400 group-hover:text-amber-600'}`}>
            Đợi xử lý
          </span>
          <span className={`text-lg sm:text-2xl font-serif font-black leading-none transition-transform group-active:scale-90
            ${filterStatus === IncidentStatus.PENDING ? 'text-amber-600' : 'text-amber-500'}`}>
            {statusCount.pending}
          </span>
        </button>

        <button 
          onClick={() => toggleFilter(IncidentStatus.PROCESSING)}
          className={`px-4 py-3 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 group
            ${filterStatus === IncidentStatus.PROCESSING 
              ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20 shadow-inner' 
              : 'bg-white border-slate-100 card-shadow hover:border-indigo-200'}`}
        >
          <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none transition-colors
            ${filterStatus === IncidentStatus.PROCESSING ? 'text-indigo-700' : 'text-slate-400 group-hover:text-indigo-600'}`}>
            Đang xử lý
          </span>
          <span className={`text-lg sm:text-2xl font-serif font-black leading-none transition-transform group-active:scale-90
            ${filterStatus === IncidentStatus.PROCESSING ? 'text-indigo-700' : 'text-indigo-600'}`}>
            {statusCount.processing}
          </span>
        </button>

        <button 
          onClick={() => toggleFilter(IncidentStatus.RESOLVED)}
          className={`px-4 py-3 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 group
            ${filterStatus === IncidentStatus.RESOLVED 
              ? 'bg-emerald-600 ring-4 ring-emerald-500/20' 
              : 'bg-indigo-900 shadow-lg shadow-indigo-100 hover:bg-slate-950'}`}
        >
          <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none transition-colors
            ${filterStatus === IncidentStatus.RESOLVED ? 'text-emerald-50' : 'text-indigo-300'}`}>
            Hoàn thành
          </span>
          <span className="text-lg sm:text-2xl font-serif font-black text-white leading-none transition-transform group-active:scale-90">
            {statusCount.resolved}
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Tìm kiếm sự vụ..."
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-900 transition-all card-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <div className="relative">
          <select 
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest text-indigo-700 outline-none cursor-pointer appearance-none min-w-[140px] card-shadow"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            {Object.values(IncidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* List */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest font-serif flex items-center gap-2">
              Danh sách phản ánh
              {filterStatus !== 'All' && (
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] normal-case font-bold tracking-normal animate-in fade-in slide-in-from-left-2">
                  Đang lọc: {filterStatus}
                </span>
              )}
            </h3>
            <span className="text-[9px] font-bold text-slate-400">{filteredReports.length} kết quả</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all card-shadow group flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg group-hover:bg-indigo-50 transition-colors">
                  {report.category === IncidentCategory.VIOLENCE ? '🥊' :
                   report.category === IncidentCategory.HEALTH ? '🏥' :
                   report.category === IncidentCategory.INFRASTRUCTURE ? '🏗️' : '🛡️'}
                </div>
                
                <div className="flex-grow space-y-1.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                      report.status === IncidentStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                      report.status === IncidentStatus.PROCESSING ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400">Lớp {report.classGroup}</span>
                  </div>
                  <h4 className="text-base font-serif font-black text-slate-950 group-hover:text-indigo-700 transition-colors leading-tight truncate">
                    {report.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 font-medium italic">
                    {report.description}
                  </p>
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="py-16 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy phản ánh nào</p>
                {filterStatus !== 'All' && (
                  <button 
                    onClick={() => setFilterStatus('All')}
                    className="mt-2 text-[9px] font-black text-indigo-600 uppercase underline"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 card-shadow sticky top-24">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 font-serif">Thống kê sự vụ</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{top: 0, right: 0, left: -30, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayName" fontSize={8} fontWeight={800} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#cbd5e1'}} fontSize={8} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', radius: 8}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.06)'}}
                  />
                  <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={20}>
                    {stats.map((entry, index) => (
                      <Cell key={index} fill={['#1e1b4b', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-2">
               {stats.map((s, idx) => (
                 <div key={idx} className="flex items-center justify-between text-[9px]">
                    <span className="font-bold text-slate-500">{s.name}</span>
                    <span className="font-black text-slate-900">{s.count}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
