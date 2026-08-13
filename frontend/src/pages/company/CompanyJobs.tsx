import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../../api/client';
import { ApiResponse, Job } from '../../types';

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export default function CompanyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await apiClient.get<ApiResponse<Job[]>>('/jobs/company/mine');
        setJobs(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Lowongan Saya</h1>
        <Link to="/company/create-job" className="btn btn-primary">
          + Buat Lowongan
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Memuat...</p>}
      {!loading && jobs.length === 0 && (
        <p className="muted">Anda belum membuat lowongan. Klik "Buat Lowongan" untuk memulai.</p>
      )}

      <div className="job-grid">
        {jobs.map((job) => (
          <Link to={`/company/jobs/${job.id}/candidates`} key={job.id} className="job-card">
            <h3>{job.title}</h3>
            <div className="job-meta">
              <span>📍 {job.location}</span>
              <span className="tag">{JOB_TYPE_LABEL[job.jobType] || job.jobType}</span>
              <span className="tag tag-muted">{job._count?.applications ?? 0} pelamar</span>
            </div>
            {!job.isActive && <span className="badge badge-rejected">Nonaktif</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
