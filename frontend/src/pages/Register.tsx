import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ApiResponse, Role, User } from '../types';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'JOB_SEEKER' as Role,
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === 'COMPANY' ? { companyName: form.companyName } : {}),
      };
      const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/register',
        payload,
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
        <h1>Buat Akun Baru</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Daftar sebagai
          <select value={form.role} onChange={(e) => update('role', e.target.value as Role)}>
            <option value="JOB_SEEKER">Job Seeker</option>
            <option value="COMPANY">Company</option>
          </select>
        </label>

        <label>
          Nama {form.role === 'COMPANY' ? 'PIC' : 'Lengkap'}
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Nama Anda"
          />
        </label>

        {form.role === 'COMPANY' && (
          <label>
            Nama Perusahaan
            <input
              required
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="PT Contoh Indonesia"
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="nama@email.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="Minimal 6 karakter"
          />
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Daftar'}
        </button>

        <p className="muted small">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </form>
    </div>
  );
}
