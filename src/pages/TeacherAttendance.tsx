import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Users, CheckCircle, Clock, XCircle, Search, Calendar, Download, Filter } from 'lucide-react';

const TeacherAttendance = () => {
  const { teachers, groups, teacherAttendance, setTeacherAttendanceRecord } = useData();
  const [statusFilter, setStatusFilter] = useState<'all' | 'kelgan' | 'kelmadi'>('all');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayRecords = teacherAttendance.filter(r => r.date === selectedDate);
  const getRecord = (teacherId: string) => todayRecords.find(r => r.teacherId === teacherId);

  const filtered = teachers.filter(t => {
    const record = getRecord(t.id);
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'kelgan' ? record?.status === 'kelgan' || record?.status === 'kechikkan' : record?.status === 'kelmagan');
    return matchSearch && matchStatus;
  });

  const kelganlar = todayRecords.filter(r => r.status === 'kelgan').length;
  const kechikkanlar = todayRecords.filter(r => r.status === 'kechikkan').length;
  const kelmaganlar = todayRecords.filter(r => r.status === 'kelmagan').length;

  const getTeacherGroups = (teacherId: string) => groups.filter(g => g.teacherId === teacherId);

  const stats = [
    { label: 'Jami ustozlar', value: teachers.length, sub: '+2 yangi', icon: Users, color: 'text-primary', bg: '' },
    { label: 'Kelganlar', value: kelganlar, sub: `${teachers.length > 0 ? Math.round((kelganlar / teachers.length) * 100) : 0}%`, icon: CheckCircle, color: 'text-success', bg: 'bg-success/5 border-success/20' },
    { label: 'Kechikkanlar', value: kechikkanlar, sub: `${teachers.length > 0 ? Math.round((kechikkanlar / teachers.length) * 100) : 0}%`, icon: Clock, color: 'text-warning', bg: 'bg-warning/5 border-warning/20' },
    { label: 'Kelmaganlar', value: kelmaganlar, sub: `${teachers.length > 0 ? Math.round((kelmaganlar / teachers.length) * 100) : 0}%`, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card flex items-center justify-between ${stat.bg}`}>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs ${stat.color}`}>{stat.sub}</span>
              </div>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
          </div>
        ))}
      </div>

      <div className="filter-bar mb-6">
        <h2 className="text-lg font-bold text-foreground mr-4">Ustozlar Davomati</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Ustoz ismini qidiring..." />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'kelgan', 'kelmadi'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'}`}>
              {f === 'all' ? 'Barchasi' : f === 'kelgan' ? 'Kelgan' : 'Kelmadi'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm" />
        </div>
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Download className="h-4 w-4" /> Excel
        </button>
      </div>

      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['USTOZ', 'FAN', 'GURUHLAR', 'JADVAL', 'KELGAN / KETGAN', 'HOLATI', 'ISH SOATI', 'IZOH'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((teacher) => {
              const record = getRecord(teacher.id);
              const tGroups = getTeacherGroups(teacher.id);
              return (
                <tr key={teacher.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{teacher.initials}</div>
                      <div>
                        <p className="font-medium text-foreground">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">ID: #UST-{teacher.id.replace('t', '')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{teacher.subject}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {tGroups.slice(0, 2).map(g => (
                        <span key={g.id} className="text-xs font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">{g.id.replace('g', 'G')}</span>
                      ))}
                      {tGroups.length > 2 && <span className="text-xs text-muted-foreground">+{tGroups.length - 2}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground">{tGroups[0]?.time || '-'}</td>
                  <td className="p-4">
                    <p className={`text-sm font-medium ${record?.status === 'kelmagan' ? 'text-muted-foreground' : 'text-success'}`}>
                      {record?.arrivedAt || '--:--'}
                    </p>
                    <p className="text-xs text-muted-foreground">{record?.leftAt || '--:--'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      record?.status === 'kelgan' ? 'bg-success/10 text-success' :
                      record?.status === 'kechikkan' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        record?.status === 'kelgan' ? 'bg-success' : record?.status === 'kechikkan' ? 'bg-warning' : 'bg-destructive'
                      }`} />
                      {record?.status === 'kelgan' ? 'Kelgan' : record?.status === 'kechikkan' ? 'Kechikkan' : 'Kelmagan'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">{record?.workHours?.toFixed(2) || '0.00'} s.</td>
                  <td className="p-4 text-sm text-muted-foreground italic">{record?.note || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 data-table p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">So'nggi harakatlar</h3>
          <button className="text-primary text-sm font-medium hover:underline">Hammasini ko'rish</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teachers.slice(0, 3).map((t, i) => {
            const r = getRecord(t.id);
            const colors = ['text-primary', 'text-warning', 'text-success'];
            const msgs = ['ish vaqtini yakunladi', 'kechikib keldi', 'barvaqt keldi'];
            return (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className={`w-2 h-2 rounded-full mt-2 ${colors[i] === 'text-primary' ? 'bg-primary' : colors[i] === 'text-warning' ? 'bg-warning' : 'bg-success'}`} />
                <div>
                  <p className="text-sm text-foreground"><span className="font-medium">{t.name}</span> {msgs[i]}</p>
                  <p className="text-xs text-muted-foreground">{i === 0 ? 'Hozirgina' : `Bugun, ${r?.arrivedAt || '08:00'}`}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
