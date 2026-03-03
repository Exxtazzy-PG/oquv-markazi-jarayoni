import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Calendar, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Teachers = () => {
  const { teachers, groups, addTeacher, updateTeacher } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [editTeacher, setEditTeacher] = useState<{ id: string; name: string; phone: string; subject: string } | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [newTeacher, setNewTeacher] = useState({ name: '', phone: '', subject: '' });

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getTeacherGroups = (teacherId: string) => groups.filter(g => g.teacherId === teacherId);
  const selectedT = teachers.find(t => t.id === selectedTeacher);
  const selectedGroups = selectedTeacher ? getTeacherGroups(selectedTeacher) : [];

  const handleAdd = () => {
    if (!newTeacher.name) return;
    addTeacher({
      name: newTeacher.name, initials: newTeacher.name.split(' ').map(n => n[0]).join(''),
      phone: newTeacher.phone, subject: newTeacher.subject, groupIds: [], status: 'faol', photo: '',
    });
    setNewTeacher({ name: '', phone: '', subject: '' });
    setShowAddModal(false);
    toast({ title: "Ustoz qo'shildi", description: `${newTeacher.name} muvaffaqiyatli qo'shildi` });
  };

  const handleEditSave = () => {
    if (!editTeacher) return;
    updateTeacher(editTeacher.id, {
      name: editTeacher.name,
      phone: editTeacher.phone,
      subject: editTeacher.subject,
      initials: editTeacher.name.split(' ').map(n => n[0]).join(''),
    });
    toast({ title: "Ustoz tahrirlandi", description: `${editTeacher.name} ma'lumotlari yangilandi` });
    setEditTeacher(null);
  };

  return (
    <div className="animate-fade-in flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="page-header">
          <div>
            <h1 className="page-title">O'qituvchilar</h1>
            <p className="page-subtitle">Jami: {teachers.length} nafar ustoz</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-input bg-card text-foreground text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ism yoki fan bo'yicha qidirish..." />
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              <Plus className="h-4 w-4" /> Ustoz qo'shish
            </button>
          </div>
        </div>

        <div className="data-table">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['F.I.SH.', "YO'NALISHI", 'GURUHLAR', 'TELEFON', 'HOLATI', 'AMALLAR'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((teacher) => {
                const tGroups = getTeacherGroups(teacher.id);
                const maxGroups = 10;
                const progress = (tGroups.length / maxGroups) * 100;
                return (
                  <tr key={teacher.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <button onClick={() => navigate(`/teacher/${teacher.id}`)} className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {teacher.initials}
                        </div>
                        <div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {teacher.id.replace('t', '')}</p>
                        </div>
                      </button>
                    </td>
                    <td className="p-4"><span className="badge-course">{teacher.subject}</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{tGroups.length}</span>
                        <span className="text-xs text-muted-foreground">ta</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{teacher.phone}</td>
                    <td className="p-4">
                      <span className={teacher.status === 'faol' ? 'badge-active' : 'badge-pending'}>
                        {teacher.status === 'faol' ? 'FAOL' : 'DAM OLISHDA'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button onClick={() => { setSelectedTeacher(teacher.id); setShowSchedule(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditTeacher({ id: teacher.id, name: teacher.name, phone: teacher.phone, subject: teacher.subject })} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 flex items-center justify-between border-t border-border">
            <p className="text-sm text-muted-foreground">1-{Math.min(perPage, filtered.length)} / {filtered.length} TADAN</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${page === p ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {showSchedule && selectedT && (
        <div className="w-80 shrink-0">
          <div className="bg-card rounded-xl border border-border p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Dars jadvali</h3>
              <button onClick={() => setShowSchedule(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{selectedT.initials}</div>
              <div>
                <p className="font-medium text-foreground">{selectedT.name}</p>
                <p className="text-xs text-muted-foreground">{selectedT.subject}</p>
              </div>
            </div>
            <div className="space-y-3">
              {selectedGroups.map(g => (
                <div key={g.id} className="p-3 rounded-lg border-l-4 border-primary bg-muted/50">
                  <span className="text-xs font-semibold text-primary">{g.time}</span>
                  <p className="font-medium text-foreground mt-1">{g.name}</p>
                  <p className="text-xs text-muted-foreground">Guruh: #{g.id.replace('g', '')}</p>
                </div>
              ))}
              {selectedGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Darslar topilmadi</p>}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Yangi ustoz qo'shish</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={newTeacher.name} onChange={e => setNewTeacher(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="To'liq ism" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={newTeacher.phone} onChange={e => setNewTeacher(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="+998" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Fan</label>
                <input value={newTeacher.subject} onChange={e => setNewTeacher(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="Yo'nalish" />
              </div>
              <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTeacher && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setEditTeacher(null)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Ustozni tahrirlash</h2>
              <button onClick={() => setEditTeacher(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Ism</label>
                <input value={editTeacher.name} onChange={e => setEditTeacher(p => p ? { ...p, name: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Telefon</label>
                <input value={editTeacher.phone} onChange={e => setEditTeacher(p => p ? { ...p, phone: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Fan</label>
                <input value={editTeacher.subject} onChange={e => setEditTeacher(p => p ? { ...p, subject: e.target.value } : p)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <button onClick={handleEditSave} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
