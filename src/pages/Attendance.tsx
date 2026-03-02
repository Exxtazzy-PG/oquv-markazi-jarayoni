import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, Save, Download, CheckCircle, XCircle, AlertCircle, MoreVertical } from 'lucide-react';

type AttStatus = 'present' | 'absent' | 'excused';

const Attendance = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups, students, teachers, attendance, setAttendance } = useData();
  const [tab, setTab] = useState<'jurnal' | 'statistika'>('jurnal');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [menuOpen, setMenuOpen] = useState(false);

  const group = groups.find(g => g.id === groupId);
  const groupStudents = students.filter(s => s.groupId === groupId);
  const teacher = teachers.find(t => t.id === group?.teacherId);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('uz-UZ', { month: 'long' });

  // Build local attendance state
  const [localAtt, setLocalAtt] = useState<Record<string, AttStatus>>(() => {
    const map: Record<string, AttStatus> = {};
    attendance.filter(a => a.groupId === groupId).forEach(a => {
      map[`${a.studentId}-${a.date}`] = a.status;
    });
    // Pre-fill with random data for demo
    groupStudents.forEach(s => {
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const key = `${s.id}-${date}`;
        if (!map[key]) {
          const rand = Math.random();
          map[key] = rand > 0.15 ? 'present' : rand > 0.05 ? 'absent' : 'excused';
        }
      }
    });
    return map;
  });

  const toggleStatus = (studentId: string, day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${studentId}-${date}`;
    const current = localAtt[key] || 'present';
    const next: AttStatus = current === 'present' ? 'absent' : current === 'absent' ? 'excused' : 'present';
    setLocalAtt(prev => ({ ...prev, [key]: next }));
  };

  const handleSave = () => {
    const records = Object.entries(localAtt).map(([key, status]) => {
      const [studentId, date] = [key.split('-')[0], key.split('-').slice(1).join('-')];
      return { groupId: groupId!, studentId, date, status };
    });
    setAttendance(records);
  };

  const getStudentTotal = (studentId: string) => {
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (localAtt[`${studentId}-${date}`] === 'present') total++;
    }
    return total;
  };

  // Show only ~26 days for display purposes
  const displayDays = Array.from({ length: Math.min(daysInMonth, 26) }, (_, i) => i + 1);

  if (!group) return <div className="p-8 text-center text-muted-foreground">Guruh topilmadi</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">Davomat Jurnali</h1>
          <div className="text-sm text-primary font-semibold">{group.name} ({group.time})</div>
          <div className="flex items-center gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{new Date(2024, i).toLocaleDateString('uz-UZ', { month: 'long' })}</option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm">
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setTab('jurnal')} className={`px-4 py-1.5 text-sm font-medium ${tab === 'jurnal' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>Jurnal</button>
            <button onClick={() => setTab('statistika')} className={`px-4 py-1.5 text-sm font-medium ${tab === 'statistika' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>Statistika</button>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Save className="h-4 w-4" /> Saqlash
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg border border-border hover:bg-muted"><MoreVertical className="h-4 w-4" /></button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg py-1 z-10 w-40">
                <button onClick={() => { navigate(-1); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground">Orqaga</button>
                <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground">Tahrirlash</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-success" /> Keldi</span>
        <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-destructive" /> Kelmadi</span>
        <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 text-warning" /> Sababli (S)</span>
        <span className="ml-auto">Jami: {groupStudents.length} talaba</span>
      </div>

      {tab === 'jurnal' ? (
        <div className="data-table overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground sticky left-0 bg-card z-10 min-w-[180px]">F.I.SH.</th>
                {displayDays.map(d => (
                  <th key={d} className="p-2 text-center text-xs text-muted-foreground min-w-[32px]">
                    <div>{['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'][new Date(year, month, d).getDay()]}</div>
                    <div className="font-bold text-foreground">{d}</div>
                  </th>
                ))}
                <th className="p-3 text-center text-xs font-semibold text-muted-foreground min-w-[50px]">JAMI</th>
              </tr>
            </thead>
            <tbody>
              {groupStudents.map((student, idx) => (
                <tr key={student.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.status === 'faol' ? 'ACTIVE' : 'INACTIVE'}</p>
                      </div>
                    </div>
                  </td>
                  {displayDays.map(d => {
                    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const status = localAtt[`${student.id}-${date}`];
                    const dayOfWeek = new Date(year, month, d).getDay();
                    const isOff = dayOfWeek === 0;
                    return (
                      <td key={d} className={`p-1 text-center ${isOff ? 'bg-muted/50' : ''}`}>
                        {isOff ? (
                          <span className="w-6 h-6 inline-block" />
                        ) : (
                          <button onClick={() => toggleStatus(student.id, d)} className="w-6 h-6 inline-flex items-center justify-center">
                            {status === 'present' && <CheckCircle className="h-5 w-5 text-success" />}
                            {status === 'absent' && <XCircle className="h-5 w-5 text-destructive" />}
                            {status === 'excused' && <span className="text-warning font-bold text-xs">S</span>}
                            {!status && <span className="w-5 h-5 rounded-full border border-border" />}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-bold text-foreground">{getStudentTotal(student.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-table p-6">
          <h3 className="font-semibold text-foreground mb-4">Oy statistikasi - {monthName} {year}</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(() => {
              let present = 0, absent = 0, excused = 0;
              Object.values(localAtt).forEach(s => { if (s === 'present') present++; else if (s === 'absent') absent++; else excused++; });
              return [
                { label: 'Keldi', value: present, color: 'text-success', bg: 'bg-success/10' },
                { label: 'Kelmadi', value: absent, color: 'text-destructive', bg: 'bg-destructive/10' },
                { label: 'Sababli', value: excused, color: 'text-warning', bg: 'bg-warning/10' },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl ${s.bg}`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ));
            })()}
          </div>
          <div className="space-y-2">
            {groupStudents.map(s => {
              const total = getStudentTotal(s.id);
              const pct = Math.round((total / daysInMonth) * 100);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-40 truncate">{s.name}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>● Tizim holati: OK &nbsp;|&nbsp; Oxirgi tahrir: Bugun, {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')} (Admin)</span>
        <span>Qo'llanma &nbsp; Texnik yordam &nbsp; © 2024</span>
      </div>
    </div>
  );
};

export default Attendance;
