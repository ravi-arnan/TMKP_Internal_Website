import { createClient } from '@supabase/supabase-js';
import { Member, DashboardStats, VerificationRequest, FinancialRecord } from '../types';

// ... (rest of imports)

export const financialService = {
  getRecords: async (): Promise<FinancialRecord[]> => {
    // TODO: replace with Supabase query
    return [
      {
        id: 'f1',
        date: '2024-03-01',
        description: 'Iuran Anggota Maret',
        category: 'Iuran',
        amount: 500000,
        type: 'INCOME',
        created_at: new Date().toISOString()
      },
      {
        id: 'f2',
        date: '2024-03-05',
        description: 'Sewa Gedung Rapat',
        category: 'Operasional',
        amount: 200000,
        type: 'EXPENSE',
        created_at: new Date().toISOString()
      },
      {
        id: 'f3',
        date: '2024-03-10',
        description: 'Sponsorship Event LK1',
        category: 'Sponsorship',
        amount: 1500000,
        type: 'INCOME',
        created_at: new Date().toISOString()
      },
      {
        id: 'f4',
        date: '2024-03-12',
        description: 'Konsumsi Rapat Pleno',
        category: 'Konsumsi',
        amount: 350000,
        type: 'EXPENSE',
        created_at: new Date().toISOString()
      }
    ];
  },

  bulkInsertRecords: async (records: Partial<FinancialRecord>[]): Promise<void> => {
    // TODO: replace with real Supabase bulk insert
    console.log('Bulk inserting records:', records);
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// Mock Supabase Client
// TODO: Replace with real Supabase credentials
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Mock Data Services
export const memberService = {
  getMembers: async (): Promise<Member[]> => {
    // TODO: replace with Supabase query
    return [
      {
        id: '1',
        name: 'Ahmad Syarifuddin',
        email: 'ahmad.s@hmitmkp.org',
        nim: '04211840000012',
        angkatan: '2021',
        jurusan: 'Teknik Perkapalan',
        status: 'AKTIF',
        phone: '081234567890',
        address: 'Jl. Tembalang No. 1, Semarang',
        fakultas: 'Teknik',
        prodi: 'Teknik Perkapalan',
        tempat_tanggal_lahir: 'Semarang, 15 Januari 2001',
        tahun_lk1: '2021',
        tahun_lk2: '-',
        tahun_lk3: '-',
        semester: 4,
        photo_url: 'https://picsum.photos/seed/ahmad/200',
        created_at: new Date('2023-01-15').toISOString()
      },
      {
        id: '2',
        name: 'Dinda Nurul Ain',
        email: 'dinda.na@hmitmkp.org',
        nim: '04211740000045',
        angkatan: '2020',
        jurusan: 'Teknik Mesin',
        status: 'ALUMNI',
        phone: '089876543210',
        address: 'Jl. Prof. Sudarto No. 13, Semarang',
        fakultas: 'Teknik',
        prodi: 'Teknik Mesin',
        tempat_tanggal_lahir: 'Jakarta, 20 Agustus 2000',
        tahun_lk1: '2020',
        tahun_lk2: '2022',
        tahun_lk3: '-',
        semester: 8,
        photo_url: 'https://picsum.photos/seed/dinda/200',
        created_at: new Date('2022-08-20').toISOString()
      },
      {
        id: '3',
        name: 'Rizki Pratama',
        email: 'rizki.p@hmitmkp.org',
        nim: '04211940000028',
        angkatan: '2022',
        jurusan: 'Sistem Perkapalan',
        status: 'AKTIF',
        phone: '085544332211',
        address: 'Jl. Banjarsari No. 5, Semarang',
        fakultas: 'Teknik',
        prodi: 'Sistem Perkapalan',
        tempat_tanggal_lahir: 'Solo, 10 Februari 2002',
        tahun_lk1: '2022',
        tahun_lk2: '-',
        tahun_lk3: '-',
        semester: 2,
        photo_url: 'https://picsum.photos/seed/rizki/200',
        created_at: new Date('2024-02-10').toISOString()
      },
      {
        id: '4',
        name: 'Farah Maulida',
        email: 'farah.m@hmitmkp.org',
        nim: '04212140000072',
        angkatan: '2021',
        jurusan: 'Teknik Perkapalan',
        status: 'NON-AKTIF',
        phone: '081122334455',
        address: 'Jl. Sirojudin No. 10, Semarang',
        fakultas: 'Teknik',
        prodi: 'Teknik Perkapalan',
        tempat_tanggal_lahir: 'Yogyakarta, 5 September 2001',
        tahun_lk1: '2021',
        tahun_lk2: '-',
        tahun_lk3: '-',
        semester: 6,
        photo_url: 'https://picsum.photos/seed/farah/200',
        created_at: new Date('2023-09-05').toISOString()
      }
    ];
  },

  getMemberById: async (id: string): Promise<Member | null> => {
    // TODO: replace with Supabase query
    const members = await memberService.getMembers();
    return members.find(m => m.id === id) || null;
  },

  bulkInsertMembers: async (members: Partial<Member>[]): Promise<void> => {
    // TODO: replace with real Supabase bulk insert
    console.log('Bulk inserting members:', members);
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    // TODO: replace with Supabase query
    return {
      totalActive: 1248,
      activeGrowth: 12,
      newMembers: 312,
      totalAlumni: 2840,
      attendanceRate: 88.4,
      monthlyEvents: 8
    };
  }
};

export const verificationService = {
  getRequests: async (): Promise<VerificationRequest[]> => {
    // TODO: replace with Supabase query
    return [
      {
        id: 'v1',
        member_id: 'm1',
        member: {
          name: 'Ahmad Maulana',
          nim: '21090119130045',
          jurusan: 'Teknik Mesin',
          angkatan: '2021'
        },
        document_type: 'UKT',
        document_url: 'https://picsum.photos/seed/doc1/600/800',
        status: 'PENDING',
        created_at: new Date().toISOString()
      },
      {
        id: 'v2',
        member_id: 'm2',
        member: {
          name: 'Siti Sarah',
          nim: '21090120140012',
          jurusan: 'Arsitektur',
          angkatan: '2020'
        },
        document_type: 'KRS',
        document_url: 'https://picsum.photos/seed/doc2/600/800',
        status: 'PENDING',
        created_at: new Date().toISOString()
      },
      {
        id: 'v3',
        member_id: 'm3',
        member: {
          name: 'Budi Santoso',
          nim: '21090121150088',
          jurusan: 'Teknik Sipil',
          angkatan: '2021'
        },
        document_type: 'KTM',
        document_url: 'https://picsum.photos/seed/doc3/600/800',
        status: 'APPROVED',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'v4',
        member_id: 'm4',
        member: {
          name: 'Dewi Lestari',
          nim: '21090118120033',
          jurusan: 'Teknik Elektro',
          angkatan: '2018'
        },
        document_type: 'KRS',
        document_url: 'https://picsum.photos/seed/doc4/600/800',
        status: 'REJECTED',
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  },
  getPendingRequests: async (): Promise<VerificationRequest[]> => {
    const requests = await verificationService.getRequests();
    return requests.filter(r => r.status === 'PENDING');
  }
};
