import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Layers, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Dashboard = () => {
  const { students, groups, teachers } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dayFilter, setDayFilter] = useState<'toq' | 'juft'>('toq');

  const activeStudents = students.filter(s => s.status === 'faol').length;
  const activeGroups = groups.filter(g => g.status === 'faol').length;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isOddDay = [1, 3, 5].includes(dayOfWeek); // Dush, Chor, Juma
  const isEvenDay = [2, 4, 6].includes(dayOfWeek); // Sesh, Pay, Shan

  const oddDayGroups = groups.filter(g => g.status === 'faol' && g.days.includes('Dush'));
  const evenDayGroups = groups.filter(g => g.status === 'faol' && g.days.includes('Sesh'));

  const filteredGroups = dayFilter === 'toq' ? oddDayGroups : evenDayGroups;
  const todayLessons = isOddDay ? oddDayGroups.length : isEvenDay ? evenDayGroups.length : 0;

  const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || '';
  const getTeacherInitials = (teacherId: string) => teachers.find(t => t.id === teacherId)?.initials || '';

  const stats = [
    { label: 'TALABALAR', value: activeStudents, sub: 'Umumiy', icon: Users, color: 'text-primary' },
    { label: 'GURUHLAR', value: activeGroups, sub: 'Faol', icon: Layers, color: 'text-warning' },
    { label: 'BUGUNGI DARSLAR', value: todayLessons, sub: `${Math.floor(todayLessons * 0.25)} tasi tugadi`, icon: CalendarCheck, color: 'text-success' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Boshqaruv Paneli</h1>
        <p className="page-subtitle">O'quv markazi faoliyati bo'yicha umumiy ma'lumotlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="data-table">
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Bugungi dars jadvali</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDayFilter('toq')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${dayFilter === 'toq' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              Toq kunlar
            </button>
            <button
              onClick={() => setDayFilter('juft')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${dayFilter === 'juft' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              Juft kunlar
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">VAQT</th>
              <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">GURUH</th>
              <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">KURS</th>
              <th className="text-left text-xs font-semibold text-muted-foreground tracking-wider p-4">O'QITUVCHI</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <span className="badge-active">{group.time}</span>
                </td>
                <td className="p-4 font-medium text-foreground">{group.name}</td>
                <td className="p-4 text-muted-foreground">{group.course}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {getTeacherInitials(group.teacherId)}
                    </div>
                    <span className="text-foreground">{getTeacherName(group.teacherId)}</span>
                  </div>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Bu kun uchun darslar topilmadi</td></tr>
            )}
          </tbody>
        </table>
        <div className="p-4 text-center">
          <button onClick={() => navigate('/groups')} className="text-primary text-sm font-medium hover:underline">
            To'liq jadvalni ko'rish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
