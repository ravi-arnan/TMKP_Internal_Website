import { createClient } from '@supabase/supabase-js';
import { BorrowingRequest, BorrowingStatus, DashboardStats, FinancialRecord, InventoryCondition, InventoryItem, Member, VerificationRequest } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 
                     import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY).');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

type MemberRow = {
  id: string | number;
  name: string;
  email: string;
  nim: string;
  angkatan: string;
  jurusan: string;
  status: Member['status'];
  photo_url: string | null;
  phone: string | null;
  address: string | null;
  semester: number | null;
  fakultas: string | null;
  prodi: string | null;
  tempat_tanggal_lahir: string | null;
  tahun_lk1: string | null;
  tahun_lk2: string | null;
  tahun_lk3: string | null;
  created_at: string;
};

type FinancialRow = {
  id: string | number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: FinancialRecord['type'];
  created_at: string;
};

type VerificationRow = {
  id: string | number;
  member_id: string;
  document_type: VerificationRequest['document_type'];
  document_url: string;
  status: VerificationRequest['status'];
  created_at: string;
};

const mapMember = (row: MemberRow): Member => ({
  id: String(row.id),
  name: row.name,
  email: row.email,
  nim: row.nim,
  angkatan: row.angkatan,
  jurusan: row.jurusan,
  status: row.status,
  photo_url: row.photo_url ?? undefined,
  phone: row.phone ?? undefined,
  address: row.address ?? undefined,
  semester: row.semester ?? undefined,
  fakultas: row.fakultas ?? undefined,
  prodi: row.prodi ?? undefined,
  tempat_tanggal_lahir: row.tempat_tanggal_lahir ?? undefined,
  tahun_lk1: row.tahun_lk1 ?? undefined,
  tahun_lk2: row.tahun_lk2 ?? undefined,
  tahun_lk3: row.tahun_lk3 ?? undefined,
  created_at: row.created_at,
});

const mapFinancialRecord = (row: FinancialRow): FinancialRecord => ({
  id: String(row.id),
  date: row.date,
  description: row.description,
  category: row.category,
  amount: Number(row.amount),
  type: row.type,
  created_at: row.created_at,
});

const normalizeMemberInsert = (member: Partial<Member>) => ({
  name: member.name,
  email: member.email,
  nim: member.nim,
  angkatan: member.angkatan,
  jurusan: member.jurusan ?? member.prodi,
  status: member.status ?? 'PENDING',
  photo_url: member.photo_url ?? null,
  phone: member.phone ?? null,
  address: member.address ?? null,
  semester: member.semester ?? null,
  fakultas: member.fakultas ?? null,
  prodi: member.prodi ?? member.jurusan ?? null,
  tempat_tanggal_lahir: member.tempat_tanggal_lahir ?? null,
  tahun_lk1: member.tahun_lk1 ?? null,
  tahun_lk2: member.tahun_lk2 ?? null,
  tahun_lk3: member.tahun_lk3 ?? null,
});

const normalizeFinancialInsert = (record: Partial<FinancialRecord>) => ({
  date: record.date,
  description: record.description,
  category: record.category,
  amount: record.amount,
  type: record.type,
});

export const memberService = {
  getMembers: async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as MemberRow[]).map(mapMember);
  },

  getMemberById: async (id: string): Promise<Member | null> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapMember(data as MemberRow) : null;
  },

  createMember: async (member: Partial<Member>): Promise<Member> => {
    const payload = normalizeMemberInsert(member);
    const { data, error } = await supabase.from('members').insert(payload).select('*').single();
    if (error) throw error;
    return mapMember(data as MemberRow);
  },

  updateMember: async (id: string, member: Partial<Member>): Promise<Member> => {
    const payload = normalizeMemberInsert(member);
    const { data, error } = await supabase.from('members').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return mapMember(data as MemberRow);
  },

  bulkInsertMembers: async (members: Partial<Member>[]): Promise<void> => {
    const payload = members.map(normalizeMemberInsert);
    const { error } = await supabase.from('members').insert(payload);
    if (error) throw error;
  },

  deleteMembers: async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;
    const { error } = await supabase.from('members').delete().in('id', ids);
    if (error) throw error;
  },

  updateMembersStatus: async (ids: string[], status: Member['status']): Promise<void> => {
    if (ids.length === 0) return;
    const { error } = await supabase.from('members').update({ status }).in('id', ids);
    if (error) throw error;
  },
};

export const financialService = {
  getRecords: async (): Promise<FinancialRecord[]> => {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data as FinancialRow[]).map(mapFinancialRecord);
  },

  createRecord: async (record: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    const payload = normalizeFinancialInsert(record);
    const { data, error } = await supabase.from('financial_records').insert(payload).select('*').single();
    if (error) throw error;
    return mapFinancialRecord(data as FinancialRow);
  },

  bulkInsertRecords: async (records: Partial<FinancialRecord>[]): Promise<void> => {
    const payload = records.map(normalizeFinancialInsert);
    const { error } = await supabase.from('financial_records').insert(payload);
    if (error) throw error;
  },
};

export const verificationService = {
  createRequest: async (request: Partial<VerificationRequest>): Promise<VerificationRequest> => {
    const payload = {
      member_id: request.member_id,
      document_type: request.document_type,
      document_url: request.document_url,
      status: request.status || 'PENDING',
    };
    const { data, error } = await supabase.from('verification_requests').insert(payload).select('*').single();
    if (error) throw error;
    return {
      id: String(data.id),
      member_id: data.member_id,
      member: {}, 
      document_type: data.document_type,
      document_url: data.document_url,
      status: data.status,
      created_at: data.created_at,
    } as VerificationRequest;
  },

  getRequests: async (): Promise<VerificationRequest[]> => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const requests = data as VerificationRow[];
    const memberIds = [...new Set(requests.map((request) => request.member_id))];

    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .in('id', memberIds);

    if (membersError) throw membersError;
    const membersById = new Map(
      (membersData as MemberRow[]).map((memberRow) => [String(memberRow.id), mapMember(memberRow)]),
    );

    return requests.map((request) => ({
      id: String(request.id),
      member_id: request.member_id,
      member: membersById.get(request.member_id) ?? {},
      document_type: request.document_type,
      document_url: request.document_url,
      status: request.status,
      created_at: request.created_at,
    }));
  },

  updateStatus: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    const { error } = await supabase.from('verification_requests').update({ status }).eq('id', id);
    if (error) throw error;
  },

  getPendingRequests: async (): Promise<VerificationRequest[]> => {
    const requests = await verificationService.getRequests();
    return requests.filter((request) => request.status === 'PENDING');
  },
};

type BorrowingRow = {
  id: string | number;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  requester_affiliation: string | null;
  item_name: string;
  item_id: string | null;
  quantity: number;
  purpose: string;
  borrow_date: string;
  return_date: string;
  notes: string | null;
  status: BorrowingStatus;
  admin_note: string | null;
  created_at: string;
};

const mapBorrowing = (row: BorrowingRow): BorrowingRequest => ({
  id: String(row.id),
  requester_name: row.requester_name,
  requester_email: row.requester_email,
  requester_phone: row.requester_phone ?? undefined,
  requester_affiliation: row.requester_affiliation ?? undefined,
  item_name: row.item_name,
  item_id: row.item_id ?? undefined,
  quantity: Number(row.quantity),
  purpose: row.purpose,
  borrow_date: row.borrow_date,
  return_date: row.return_date,
  notes: row.notes ?? undefined,
  status: row.status,
  admin_note: row.admin_note ?? undefined,
  created_at: row.created_at,
});

export const borrowingService = {
  createRequest: async (request: Partial<BorrowingRequest>): Promise<BorrowingRequest> => {
    const payload = {
      requester_name: request.requester_name,
      requester_email: request.requester_email,
      requester_phone: request.requester_phone ?? null,
      requester_affiliation: request.requester_affiliation ?? null,
      item_name: request.item_name,
      item_id: request.item_id ?? null,
      quantity: request.quantity,
      purpose: request.purpose,
      borrow_date: request.borrow_date,
      return_date: request.return_date,
      notes: request.notes ?? null,
      status: request.status || 'PENDING',
    };
    const { data, error } = await supabase
      .from('borrowing_requests')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return mapBorrowing(data as BorrowingRow);
  },

  getRequests: async (): Promise<BorrowingRequest[]> => {
    const { data, error } = await supabase
      .from('borrowing_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as BorrowingRow[]).map(mapBorrowing);
  },

  updateStatus: async (
    id: string,
    status: BorrowingStatus,
    adminNote?: string,
  ): Promise<void> => {
    // Fetch current request to get item_id, quantity and old status for stock adjustment
    const { data: current, error: fetchErr } = await supabase
      .from('borrowing_requests')
      .select('item_id, quantity, status')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;

    const payload: { status: BorrowingStatus; admin_note?: string | null } = { status };
    if (adminNote !== undefined) payload.admin_note = adminNote || null;

    const { error } = await supabase.from('borrowing_requests').update(payload).eq('id', id);
    if (error) throw error;

    // Adjust inventory stock
    if (current?.item_id) {
      const oldStatus: BorrowingStatus = current.status;
      const qty: number = Number(current.quantity);

      // APPROVED: decrement available stock
      if (status === 'APPROVED' && oldStatus !== 'APPROVED') {
        await supabase.rpc('decrement_inventory_stock', { item_id: current.item_id, qty });
      }
      // RETURNED or REJECTED after APPROVED: increment available stock back
      if ((status === 'RETURNED' || status === 'REJECTED') && oldStatus === 'APPROVED') {
        await supabase.rpc('increment_inventory_stock', { item_id: current.item_id, qty });
      }
    }
  },
};

type InventoryRow = {
  id: string;
  name: string;
  description: string | null;
  total_stock: number;
  available_stock: number;
  category: string | null;
  condition: InventoryCondition;
  created_at: string;
  updated_at: string;
};

const mapInventory = (row: InventoryRow): InventoryItem => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  total_stock: Number(row.total_stock),
  available_stock: Number(row.available_stock),
  category: row.category ?? undefined,
  condition: row.condition,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const inventoryService = {
  getItems: async (): Promise<InventoryItem[]> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data as InventoryRow[]).map(mapInventory);
  },

  createItem: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const payload = {
      name: item.name,
      description: item.description ?? null,
      total_stock: item.total_stock ?? 1,
      available_stock: item.total_stock ?? 1, // on create, available = total
      category: item.category ?? null,
      condition: item.condition ?? 'BAIK',
    };
    const { data, error } = await supabase.from('inventory_items').insert(payload).select('*').single();
    if (error) throw error;
    return mapInventory(data as InventoryRow);
  },

  updateItem: async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (item.name !== undefined) payload.name = item.name;
    if (item.description !== undefined) payload.description = item.description ?? null;
    if (item.total_stock !== undefined) payload.total_stock = item.total_stock;
    if (item.available_stock !== undefined) payload.available_stock = item.available_stock;
    if (item.category !== undefined) payload.category = item.category ?? null;
    if (item.condition !== undefined) payload.condition = item.condition;
    const { data, error } = await supabase.from('inventory_items').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return mapInventory(data as InventoryRow);
  },

  deleteItem: async (id: string): Promise<void> => {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) throw error;
  },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const members = await memberService.getMembers();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const currentWindowStart = now - 30 * oneDay;
    const previousWindowStart = now - 60 * oneDay;

    const totalActive = members.filter((member) => member.status === 'AKTIF').length;
    const totalAlumni = members.filter((member) => member.status === 'ALUMNI').length;
    const newMembers = members.filter((member) => new Date(member.created_at).getFullYear() === new Date().getFullYear()).length;

    const currentActiveWindow = members.filter(
      (member) =>
        member.status === 'AKTIF' &&
        new Date(member.created_at).getTime() >= currentWindowStart,
    ).length;
    const previousActiveWindow = members.filter((member) => {
      const createdAt = new Date(member.created_at).getTime();
      return member.status === 'AKTIF' && createdAt >= previousWindowStart && createdAt < currentWindowStart;
    }).length;

    const activeGrowth =
      previousActiveWindow === 0
        ? (currentActiveWindow > 0 ? 100 : 0)
        : Math.round(((currentActiveWindow - previousActiveWindow) / previousActiveWindow) * 100);

    const attendanceRate = members.length > 0 ? Number(((totalActive / members.length) * 100).toFixed(1)) : 0;

    const { count: monthlyEventsCount, error } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lte('created_at', new Date().toISOString());

    if (error) throw error;

    return {
      totalActive,
      activeGrowth,
      newMembers,
      totalAlumni,
      attendanceRate,
      monthlyEvents: monthlyEventsCount ?? 0,
    };
  },
};

export const settingsService = {
  async getSetting(key: string) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
    return data?.value || null;
  },

  async updateSetting(key: string, value: string) {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
