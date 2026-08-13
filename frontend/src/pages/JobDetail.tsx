import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/client';
import { ApiResponse, Job } from '../types';

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      try {
        const res = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
        setJob(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  async function handleApply() {
    setApplying(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/applications', { jobId: id });
      setSuccess('Lamaran berhasil dikirim! Cek status di halaman "Lamaran Saya".');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <div className="container">Memuat...</div>;
  if (!job) return <div className="container">Lowongan tidak ditemukan.</div>;

  return (
    <div className="container narrow">
      <button className="btn-link" onClick={() => navigate(-1)}>
        ← Kembali
      </button>

      <div className="detail-card">
        <h1>{job.title}</h1>
        <p className="job-company">{job.company?.companyName || job.company?.name}</p>

        <div className="job-meta">
          <span>📍 {job.location}</span>
          <span>💰 {job.salary}</span>
          <span className="tag">{JOB_TYPE_LABEL[job.jobType] || job.jobType}</span>
        </div>

        <h3>Deskripsi Pekerjaan</h3>
        <p className="job-description">{job.description}</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!success && (
          <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
            {applying ? 'Mengirim lamaran...' : 'Apply Sekarang'}
          </button>
        )}
      </div>
    </div>
  );
}
