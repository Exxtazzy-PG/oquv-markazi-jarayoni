import { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';
import { Users, CheckCircle, Clock, XCircle, Search, Calendar, Download, Pencil, X } from 'lucide-react';

const TeacherAttendance = () => {
  const { teachers, groups, teacherAttendance, setTeacherAttendanceRecord } = useData();
  const [statusFilter, setStatusFilter] = useState<'all' | 'kelgan' | 'kelmadi'>('all');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editRecord, setEditRecord] = useState<{
    teacherId: string; arrivedAt: string; leftAt: string;
    status: 'kelgan' | 'kechikkan' | 'kelmagan'; workHours: number; note: string;
  } | null>(null);

  const recordsMap = useMemo(() => {
    return new Map(teacherAttendance.filter(record => record.date === selectedDate).map(record => [record.teacherId, record]));
  }, [selectedDate, teacherAttendance]);

  const getTeacherGroups = (teacherId: string) => groups.filter(g => g.teacherId === teacherId);

  const getRecord = (teacherId: string) => {
    const saved = recordsMap.get(teacherId);
    if (saved) return saved;

    const teacher = teachers.find(item => item.id === teacherId);
    if (!teacher) {
      return {
        teacherId,
        date: selectedDate,
        arrivedAt: '--:--',
        leftAt: '--:--',
        status: 'kelmagan' as const,
        workHours: 0,
        note: '',
      };
    }

    if (teacher.status === 'dam_olishda') {
      return {
        teacherId,
        date: selectedDate,
        arrivedAt: '--:--',
        leftAt: '--:--',
        status: 'kelmagan' as const,
        workHours: 0,
        note: 'Dam olishda',
      };
    }

    return {
      teacherId,
      date: selectedDate,
      arrivedAt: '08:00',
      leftAt: '17:00',
      status: 'kelgan' as const,
      workHours: 9,
      note: 'Avtomatik holat',
    };
  };

  const allRecords = teachers.map(teacher => ({ teacher, record: getRecord(teacher.id) }));

  const filtered = allRecords.filter(({ teacher, record }) => {
    const matchSearch = teacher.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'kelgan'
      ? record.status === 'kelgan' || record.status === 'kechikkan'
      : record.status === 'kelmagan');
    return matchSearch && matchStatus;
  });

  const kelganlar = allRecords.filter(({ record }) => record.status === 'kelgan').length;
  const kechikkanlar = allRecords.filter(({ record }) => record.status === 'kechikkan').length;
  const kelmaganlar = allRecords.filter(({ record }) => record.status === 'kelmagan').length;

  const handleEditSave = () => {
    if (!editRecord) return;

    const nextRecord = editRecord.status === 'kelmagan'
      ? {
          ...editRecord,
          arrivedAt: '--:--',
          leftAt: '--:--',
          workHours: 0,
        }
      : editRecord;

    setTeacherAttendanceRecord({
      teacherId: nextRecord.teacherId,
      date: selectedDate,
      arrivedAt: nextRecord.arrivedAt,
      leftAt: nextRecord.leftAt,
      status: nextRecord.status,
      workHours: nextRecord.workHours,
      note: nextRecord.note,
    });

    const name = teachers.find(t => t.id === nextRecord.teacherId)?.name;
    toast({ title: 'Davomat yangilandi', description: `${name} uchun ${selectedDate} sanasi saqlandi` });
    setEditRecord(null);
  };

  const stats = [
    { label: 'Jami ustozlar', value: teachers.length, sub: `${teachers.length} nafar`, icon: Users, color: 'text-primary', bg: '' },
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
              {['USTOZ', 'FAN', 'GURUHLAR', 'JADVAL', 'KELGAN / KETGAN', 'HOLATI', 'ISH SOATI', 'IZOH', 'AMALLAR'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ teacher, record }) => {
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
                    <p className={`text-sm font-medium ${record.status === 'kelmagan' ? 'text-muted-foreground' : 'text-success'}`}>
                      {record.arrivedAt || '--:--'}
                    </p>
                    <p className="text-xs text-muted-foreground">{record.leftAt || '--:--'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      record.status === 'kelgan' ? 'bg-success/10 text-success' :
                      record.status === 'kechikkan' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        record.status === 'kelgan' ? 'bg-success' : record.status === 'kechikkan' ? 'bg-warning' : 'bg-destructive'
                      }`} />
                      {record.status === 'kelgan' ? 'Kelgan' : record.status === 'kechikkan' ? 'Kechikkan' : 'Kelmagan'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">{record.workHours?.toFixed(2) || '0.00'} s.</td>
                  <td className="p-4 text-sm text-muted-foreground italic max-w-[120px] truncate">{record.note || '-'}</td>
                  <td className="p-4">
                    <button onClick={() => setEditRecord({
                      teacherId: teacher.id,
                      arrivedAt: record.arrivedAt === '--:--' ? '08:00' : record.arrivedAt,
                      leftAt: record.leftAt === '--:--' ? '17:00' : record.leftAt,
                      status: record.status,
                      workHours: record.workHours,
                      note: record.note || '',
                    })} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
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
            const record = getRecord(t.id);
            const colors = ['text-primary', 'text-warning', 'text-success'];
            const msgs = ['ish vaqtini yakunladi', 'kechikib keldi', 'barvaqt keldi'];
            return (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className={`w-2 h-2 rounded-full mt-2 ${colors[i] === 'text-primary' ? 'bg-primary' : colors[i] === 'text-warning' ? 'bg-warning' : 'bg-success'}`} />
                <div>
                  <p className="text-sm text-foreground"><span className="font-medium">{t.name}</span> {msgs[i]}</p>
                  <p className="text-xs text-muted-foreground">{i === 0 ? 'Hozirgina' : `Bugun, ${record.arrivedAt === '--:--' ? '08:00' : record.arrivedAt}`}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editRecord && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setEditRecord(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Davomatni tahrirlash</h2>
              <button onClick={() => setEditRecord(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Holati</label>
                <select value={editRecord.status} onChange={e => setEditRecord(p => p ? {
                  ...p,
                  status: e.target.value as 'kelgan' | 'kechikkan' | 'kelmagan',
                  arrivedAt: e.target.value === 'kelmagan' ? '08:00' : p.arrivedAt,
                  leftAt: e.target.value === 'kelmagan' ? '17:00' : p.leftAt,
                } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option value="kelgan">Kelgan</option>
                  <option value="kechikkan">Kechikkan</option>
                  <option value="kelmagan">Kelmagan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Kelgan vaqti</label>
                  <input type="time" value={editRecord.arrivedAt} disabled={editRecord.status === 'kelmagan'} onChange={e => setEditRecord(p => p ? { ...p, arrivedAt: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Ketgan vaqti</label>
                  <input type="time" value={editRecord.leftAt} disabled={editRecord.status === 'kelmagan'} onChange={e => setEditRecord(p => p ? { ...p, leftAt: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm disabled:opacity-50" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ish soati</label>
                <input type="number" value={editRecord.workHours} disabled={editRecord.status === 'kelmagan'} onChange={e => setEditRecord(p => p ? { ...p, workHours: Number(e.target.value) } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Izoh</label>
                <textarea value={editRecord.note} onChange={e => setEditRecord(p => p ? { ...p, note: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm resize-none" rows={2} />
              </div>
              <button onClick={handleEditSave} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;