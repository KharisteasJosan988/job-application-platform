import { useEffect, useState } from 'react';
import { apiClient, getErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { ApiResponse, Application, ApplicationHistoryEntry } from '../types';

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, ApplicationHistoryEntry[]>>({});

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await apiClient.get<ApiResponse<Application[]>>('/applications/mine');
        setApplications(res.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  async function toggleHistory(applicationId: string) {
    if (expandedId === applicationId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(applicationId);
    if (!history[applicationId]) {
      try {
        const res = await apiClient.get<ApiResponse<ApplicationHistoryEntry[]>>(
          `/applications/${applicationId}/history`,
        );
        setHistory((h) => ({ ...h, [applicationId]: res.data.data }));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
  }

  return (
    <div className="container">
      <h1>Lamaran Saya</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Memuat...</p>}
      {!loading && applications.length === 0 && (
        <p className="muted">Anda belum melamar pekerjaan apa pun.</p>
      )}

      <div className="app-list">
        {applications.map((app) => (
          <div className="app-card" key={app.id}>
            <div className="app-card-main">
              <div>
                <h3>{app.job?.title}</h3>
                <p className="job-company">
                  {app.job?.company?.companyName || app.job?.company?.name} · {app.job?.location}
                </p>
                <p className="muted small">
                  Dilamar pada {new Date(app.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="app-card-status">
                <StatusBadge status={app.status} />
                <button className="btn-link" onClick={() => toggleHistory(app.id)}>
                  {expandedId === app.id ? 'Sembunyikan riwayat' : 'Lihat riwayat'}
                </button>
              </div>
            </div>

            {expandedId === app.id && (
              <div className="history-timeline">
                {(history[app.id] || []).map((h) => (
                  <div className="history-item" key={h.id}>
                    <StatusBadge status={h.status} />
                    <span className="muted small">
                      {new Date(h.changedAt).toLocaleString('id-ID')}
                    </span>
                    {h.note && <span className="muted small">— {h.note}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
