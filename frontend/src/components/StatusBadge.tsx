import { ApplicationStatus } from '../types';

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  ACCEPTED: 'Accepted',
};

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  APPLIED: 'badge-applied',
  REVIEWING: 'badge-reviewing',
  SHORTLISTED: 'badge-shortlisted',
  REJECTED: 'badge-rejected',
  ACCEPTED: 'badge-accepted',
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}
