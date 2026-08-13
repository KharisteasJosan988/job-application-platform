import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ApiResponse, User } from '../types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/login',
        { email, password },
      );
      login(res.data.data.user, res.data.data.token);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Masuk ke IndoKerja.id</h1>
        <p className="muted">Temukan pekerjaan impianmu atau kandidat terbaikmu.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </button>

        <p className="muted small">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>

        <div className="hint-box">
          <strong>Akun demo (setelah seed):</strong>
          <div>Company: hr@techcorp.id / password123</div>
          <div>Job Seeker: jobseeker@example.com / password123</div>
        </div>
      </form>
    </div>
  );
}
