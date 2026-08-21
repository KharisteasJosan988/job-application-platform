import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient, getErrorMessage } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { ApiResponse, Application, ApplicationStatus, Job } from "../../types";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "APPLIED",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "ACCEPTED",
];

export default function JobCandidates() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [togglingJob, setTogglingJob] = useState(false);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        apiClient.get<ApiResponse<Job>>(`/jobs/${jobId}`),
        apiClient.get<ApiResponse<Application[]>>(`/applications/job/${jobId}`),
      ]);
      setJob(jobRes.data.data);
      setApplications(appsRes.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function handleStatusChange(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    setUpdatingId(applicationId);
    setError("");
    try {
      await apiClient.patch(`/applications/${applicationId}/status`, {
        status,
      });
      setApplications((apps) =>
        apps.map((a) => (a.id === applicationId ? { ...a, status } : a)),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleActive() {
    if (!job) return;
    setTogglingJob(true);
    setError("");
    try {
      const res = await apiClient.patch<ApiResponse<Job>>(`/jobs/${job.id}`, {
        isActive: !job.isActive,
      });
      setJob(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingJob(false);
    }
  }

  return (
    <div className="container">
      <button className="btn-link" onClick={() => navigate("/")}>
        ← Kembali ke Lowongan Saya
      </button>

      <div className="page-header">
        <div>
          <h1>Kandidat Pelamar</h1>
          {job && <p className="muted">{job.title}</p>}
        </div>
        {job && (
          <button
            className={job.isActive ? "btn btn-outline" : "btn btn-primary"}
            onClick={handleToggleActive}
            disabled={togglingJob}
          >
            {togglingJob
              ? "Memproses..."
              : job.isActive
                ? "Nonaktifkan Lowongan"
                : "Aktifkan Kembali"}
          </button>
        )}
      </div>

      {job && !job.isActive && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          Lowongan ini sedang nonaktif — Job Seeker tidak bisa melihat atau
          melamar lowongan ini.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Memuat...</p>}
      {!loading && applications.length === 0 && (
        <p className="muted">Belum ada kandidat yang melamar lowongan ini.</p>
      )}

      <div className="candidate-table">
        {applications.map((app) => (
          <div className="candidate-row" key={app.id}>
            <div className="candidate-info">
              <strong>{app.jobSeeker?.name}</strong>
              <span className="muted small">{app.jobSeeker?.email}</span>
              <span className="muted small">
                Melamar {new Date(app.createdAt).toLocaleDateString("id-ID")}
              </span>
            </div>

            <div className="candidate-actions">
              <StatusBadge status={app.status} />
              <select
                value={app.status}
                disabled={updatingId === app.id}
                onChange={(e) =>
                  handleStatusChange(
                    app.id,
                    e.target.value as ApplicationStatus,
                  )
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
