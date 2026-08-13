import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/client';
import { ApiResponse, Job } from '../types';

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchJobs() {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get<ApiResponse<Job[]>>('/jobs', {
        params: search ? { search } : {},
      });
      setJobs(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchJobs();
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Lowongan Pekerjaan</h1>
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input
            placeholder="Cari judul pekerjaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Cari
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Memuat lowongan...</p>}

      {!loading && jobs.length === 0 && <p className="muted">Belum ada lowongan tersedia.</p>}

      <div className="job-grid">
        {jobs.map((job) => (
          <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
            <h3>{job.title}</h3>
            <p className="job-company">{job.company?.companyName || job.company?.name}</p>
            <div className="job-meta">
              <span>📍 {job.location}</span>
              <span>💰 {job.salary}</span>
              <span className="tag">{JOB_TYPE_LABEL[job.jobType] || job.jobType}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
