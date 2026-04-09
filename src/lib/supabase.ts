import { createClient } from '@supabase/supabase-js';
import { Member, DashboardStats, VerificationRequest, FinancialRecord } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const memberService = {
  getMembers: async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Member[]) || [];
  },

  getMemberById: async (id: string): Promise<Member | null> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Member;
  },

  insertMember: async (member: Partial<Member>): Promise<Member> => {
    const { data, error } = await supabase
      .from('members')
      .insert([{ ...member, status: member.status || 'AKTIF' }])
      .select()
      .single();
    if (error) throw error;
    return data as Member;
  },

  bulkInsertMembers: async (members: Partial<Member>[]): Promise<void> => {
    const { error } = await supabase
      .from('members')
      .insert(members.map(m => ({ ...m, status: m.status || 'AKTIF' })));
    if (error) throw error;
  },

  deleteMember: async (id: string): Promise<void> => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  },

  bulkDeleteMembers: async (ids: string[]): Promise<void> => {
    const { error } = await supabase.from('members').delete().in('id', ids);
    if (error) throw error;
  },

  updateMemberStatus: async (id: string, status: Member['status']): Promise<void> => {
    const { error } = await supabase.from('members').update({ status }).eq('id', id);
    if (error) throw error;
  },

  bulkUpdateMemberStatus: async (ids: string[], status: Member['status']): Promise<void> => {
    const { error } = await supabase.from('members').update({ status }).in('id', ids);
    if (error) throw error;
  }
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const [activeResult, newResult, alumniResult] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'AKTIF'),
      supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', yearStart),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'ALUMNI'),
    ]);
    return {
      totalActive: activeResult.count || 0,
      activeGrowth: 12,
      newMembers: newResult.count || 0,
      totalAlumni: alumniResult.count || 0,
      attendanceRate: 88.4,
      monthlyEvents: 8
    };
  }
};

export const verificationService = {
  getRequests: async (): Promise<VerificationRequest[]> => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*, member:members!verification_requests_member_id_fkey(name, nim, jurusan, angkatan, photo_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as VerificationRequest[]) || [];
  },

  getPendingRequests: async (): Promise<VerificationRequest[]> => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*, member:members!verification_requests_member_id_fkey(name, nim, jurusan, angkatan, photo_url)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as VerificationRequest[]) || [];
  },

  updateStatus: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    const { error } = await supabase
      .from('verification_requests')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  }
};

export const financialService = {
  getRecords: async (): Promise<FinancialRecord[]> => {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data as FinancialRecord[]) || [];
  },

  insertRecord: async (record: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    const { data, error } = await supabase
      .from('financial_records')
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data as FinancialRecord;
  },

  bulkInsertRecords: async (records: Partial<FinancialRecord>[]): Promise<void> => {
    const { error } = await supabase.from('financial_records').insert(records);
    if (error) throw error;
  }
};
