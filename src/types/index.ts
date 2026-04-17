export type MemberStatus = 'AKTIF' | 'ALUMNI' | 'NON-AKTIF' | 'PENDING';

export interface Member {
  id: string;
  name: string;
  email: string;
  nim: string;
  angkatan: string;
  jurusan: string;
  status: MemberStatus;
  photo_url?: string;
  phone?: string;
  address?: string;
  semester?: number;
  fakultas?: string;
  prodi?: string;
  tempat_tanggal_lahir?: string;
  tahun_lk1?: string;
  tahun_lk2?: string;
  tahun_lk3?: string;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  member_id: string;
  member: Partial<Member>;
  document_type: 'KRS' | 'UKT' | 'KTM';
  document_url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface DashboardStats {
  totalActive: number;
  activeGrowth: number;
  newMembers: number;
  totalAlumni: number;
  attendanceRate: number;
  monthlyEvents: number;
}

export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  created_at: string;
}

export type BorrowingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

export interface BorrowingRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  requester_affiliation?: string;
  item_name: string;
  quantity: number;
  purpose: string;
  borrow_date: string;
  return_date: string;
  notes?: string;
  status: BorrowingStatus;
  admin_note?: string;
  created_at: string;
}
