import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError("Login yoki parol noto'g'ri");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card rounded-2xl shadow-lg border border-border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">EDU CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">O'quv markazi boshqaruv tizimi</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Login</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="admin yoki telefon raqam"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Parol</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                placeholder="••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Kirish
          </button>
        </form>
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <p className="text-xs font-medium text-muted-foreground mb-2">Test akkauntlar:</p>
          <p className="text-xs text-muted-foreground">Admin: <span className="font-mono text-foreground">admin / admin123</span></p>
          <p className="text-xs text-muted-foreground">Ustoz: <span className="font-mono text-foreground">998901234567 / 998901234567</span></p>
          <p className="text-xs text-muted-foreground mt-1 italic">O'qituvchi login = telefon raqamidagi raqamlar</p>
        </div>
      </div>
    </div>
  );
};

export default Login;