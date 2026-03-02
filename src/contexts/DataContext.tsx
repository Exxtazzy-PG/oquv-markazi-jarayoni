import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Student, Teacher, Group, AttendanceRecord, TeacherAttendanceRecord, Settings,
  initialStudents, initialTeachers, initialGroups, initialSettings,
} from '@/data/initialData';

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  groups: Group[];
  attendance: AttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
  settings: Settings;
  addStudent: (s: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (t: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  addGroup: (g: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, data: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  setAttendance: (records: AttendanceRecord[]) => void;
  setTeacherAttendanceRecord: (record: TeacherAttendanceRecord) => void;
  updateSettings: (s: Partial<Settings>) => void;
  getCurrencySymbol: () => string;
}

const DataContext = createContext<DataContextType | null>(null);

function loadOrDefault<T>(key: string, def: T): T {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : def;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => loadOrDefault('edu_students', initialStudents));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadOrDefault('edu_teachers', initialTeachers));
  const [groups, setGroups] = useState<Group[]>(() => loadOrDefault('edu_groups', initialGroups));
  const [attendance, setAttendanceState] = useState<AttendanceRecord[]>(() => loadOrDefault('edu_attendance', []));
  const [teacherAttendance, setTeacherAttendanceState] = useState<TeacherAttendanceRecord[]>(() => loadOrDefault('edu_teacher_attendance', generateTeacherAttendance()));
  const [settings, setSettings] = useState<Settings>(() => loadOrDefault('edu_settings', initialSettings));

  useEffect(() => { localStorage.setItem('edu_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('edu_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('edu_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('edu_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('edu_teacher_attendance', JSON.stringify(teacherAttendance)); }, [teacherAttendance]);
  useEffect(() => { localStorage.setItem('edu_settings', JSON.stringify(settings)); }, [settings]);

  const addStudent = (s: Omit<Student, 'id'>) => setStudents(prev => [...prev, { ...s, id: `s${Date.now()}` }]);
  const updateStudent = (id: string, data: Partial<Student>) => setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  const deleteStudent = (id: string) => setStudents(prev => prev.filter(s => s.id !== id));
  const addTeacher = (t: Omit<Teacher, 'id'>) => setTeachers(prev => [...prev, { ...t, id: `t${Date.now()}` }]);
  const updateTeacher = (id: string, data: Partial<Teacher>) => setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const addGroup = (g: Omit<Group, 'id'>) => setGroups(prev => [...prev, { ...g, id: `g${Date.now()}` }]);
  const updateGroup = (id: string, data: Partial<Group>) => setGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  const deleteGroup = (id: string) => setGroups(prev => prev.filter(g => g.id !== id));
  const setAttendance = (records: AttendanceRecord[]) => setAttendanceState(prev => {
    const newKeys = new Set(records.map(r => `${r.groupId}-${r.studentId}-${r.date}`));
    return [...prev.filter(r => !newKeys.has(`${r.groupId}-${r.studentId}-${r.date}`)), ...records];
  });
  const setTeacherAttendanceRecord = (record: TeacherAttendanceRecord) => setTeacherAttendanceState(prev => {
    const key = `${record.teacherId}-${record.date}`;
    const exists = prev.findIndex(r => `${r.teacherId}-${r.date}` === key);
    if (exists >= 0) { const n = [...prev]; n[exists] = record; return n; }
    return [...prev, record];
  });
  const updateSettings = (s: Partial<Settings>) => setSettings(prev => ({ ...prev, ...s }));
  const getCurrencySymbol = () => {
    const map: Record<string, string> = { UZS: "so'm", USD: '$', EUR: '€', RUB: '₽' };
    return map[settings.currency] || settings.currency;
  };

  return (
    <DataContext.Provider value={{
      students, teachers, groups, attendance, teacherAttendance, settings,
      addStudent, updateStudent, deleteStudent, addTeacher, updateTeacher,
      addGroup, updateGroup, deleteGroup, setAttendance, setTeacherAttendanceRecord,
      updateSettings, getCurrencySymbol,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

function generateTeacherAttendance(): TeacherAttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return initialTeachers.map((t, i) => ({
    teacherId: t.id,
    date: today,
    arrivedAt: i === 2 ? '--:--' : `0${8 + (i % 2)}:${i * 5 < 10 ? '0' : ''}${(i * 5) % 60}`,
    leftAt: i === 2 ? '--:--' : `${17 + (i % 2)}:00`,
    status: i === 2 ? 'kelmagan' as const : i === 1 ? 'kechikkan' as const : 'kelgan' as const,
    workHours: i === 2 ? 0 : 6 + (i % 3),
    note: i === 2 ? 'Betob (Kasallik varaqasi)' : i === 1 ? 'Tirbandlik sababli...' : "Izoh yo'q",
  }));
}
