import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../../api/client';
import { JobType } from '../../types';

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
];

export default function CreateJob() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    jobType: 'FULL_TIME' as JobType,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/jobs', form);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <h1>Buat Lowongan Baru</h1>

      <form className="card-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Judul Pekerjaan
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Backend Developer"
          />
        </label>

        <label>
          Deskripsi
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Jelaskan tanggung jawab dan kualifikasi..."
          />
        </label>

        <div className="form-row">
          <label>
            Lokasi
            <input
              required
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Yogyakarta"
            />
          </label>

          <label>
            Salary
            <input
              required
              value={form.salary}
              onChange={(e) => update('salary', e.target.value)}
              placeholder="Rp 5.000.000 - Rp 8.000.000"
            />
          </label>
        </div>

        <label>
          Tipe Pekerjaan
          <select
            value={form.jobType}
            onChange={(e) => update('jobType', e.target.value as JobType)}
          >
            {JOB_TYPES.map((jt) => (
              <option key={jt.value} value={jt.value}>
                {jt.label}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Publikasikan Lowongan'}
        </button>
      </form>
    </div>
  );
}
