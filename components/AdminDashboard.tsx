
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

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Welcome & Quick Stats */}
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-2 font-main">Khu vực quản lý</p>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-slate-950 tracking-tight">Hệ thống điều hành</h2>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đợi xử lý</p>
            <p className="text-2xl font-serif font-black text-amber-500">{statusCount.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đang xử lý</p>
            <p className="text-2xl font-serif font-black text-indigo-600">{statusCount.processing}</p>
          </div>
          <div className="bg-indigo-900 p-6 rounded-3xl shadow-xl shadow-indigo-100">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Hoàn thành</p>
            <p className="text-2xl font-serif font-black text-white">{statusCount.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Tìm kiếm sự vụ..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-900 transition-all card-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <select 
          className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-indigo-700 outline-none cursor-pointer appearance-none min-w-[160px] card-shadow"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">Tất cả trạng thái</option>
          {Object.values(IncidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-serif">Danh sách phản ánh</h3>
            <span className="text-[10px] font-bold text-slate-400">{filteredReports.length} kết quả</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all card-shadow group flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-indigo-50 transition-colors">
                  {report.category === IncidentCategory.VIOLENCE ? '🥊' :
                   report.category === IncidentCategory.HEALTH ? '🏥' :
                   report.category === IncidentCategory.INFRASTRUCTURE ? '🏗️' : '🛡️'}
                </div>
                
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      report.status === IncidentStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                      report.status === IncidentStatus.PROCESSING ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Lớp {report.classGroup}</span>
                  </div>
                  <h4 className="text-lg font-serif font-black text-slate-950 group-hover:text-indigo-700 transition-colors leading-tight">
                    {report.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium italic">
                    {report.description}
                  </p>
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy phản ánh nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow sticky top-24">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 font-serif">Thống kê sự vụ</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{top: 0, right: 0, left: -30, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayName" fontSize={9} fontWeight={800} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#cbd5e1'}} fontSize={9} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', radius: 8}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}}
                  />
                  <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={24}>
                    {stats.map((entry, index) => (
                      <Cell key={index} fill={['#1e1b4b', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
               {stats.map((s, idx) => (
                 <div key={idx} className="flex items-center justify-between text-[10px]">
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
