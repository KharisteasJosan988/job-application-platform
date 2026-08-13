export type Role = 'JOB_SEEKER' | 'COMPANY';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';

export type ApplicationStatus =
  | 'APPLIED'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'ACCEPTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyName: string | null;
}

export interface CompanyInfo {
  id: string;
  name: string;
  companyName: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  jobType: JobType;
  isActive: boolean;
  createdAt: string;
  companyId: string;
  company?: CompanyInfo;
  _count?: { applications: number };
}

export interface ApplicationHistoryEntry {
  id: string;
  status: ApplicationStatus;
  note?: string | null;
  changedAt: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  jobId: string;
  jobSeekerId: string;
  job?: Job;
  jobSeeker?: { id: string; name: string; email: string };
  history?: ApplicationHistoryEntry[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
