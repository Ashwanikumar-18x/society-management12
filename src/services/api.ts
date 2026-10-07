import type {
  User,
  Complaint,
  House,
  ComplaintHandler,
  Notice,
  ResidentStats,
  AdminStats,
} from '../types/society';

const BASE_URL = '/api';

export const api = {
  // Auth
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    flatNumber: string;
    wing: string;
  }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register account');
    }
    return res.json();
  },

  async login(credentials: {
    email: string;
    password: string;
    role?: 'resident' | 'admin';
  }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sign in');
    }
    return res.json();
  },

  async updateProfile(data: {
    userId: string;
    name?: string;
    phone?: string;
    flatNumber?: string;
    wing?: string;
  }): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  // Complaints
  async getComplaints(filter?: {
    userId?: string;
    priority?: string;
    status?: string;
    search?: string;
  }): Promise<{ complaints: Complaint[] }> {
    const params = new URLSearchParams();
    if (filter?.userId) params.set('userId', filter.userId);
    if (filter?.priority && filter.priority !== 'All' && filter.priority !== 'All priority') {
      params.set('priority', filter.priority);
    }
    if (filter?.status && filter.status !== 'All' && filter.status !== 'All statuses') {
      params.set('status', filter.status);
    }
    if (filter?.search) params.set('search', filter.search);

    const res = await fetch(`${BASE_URL}/complaints?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async getComplaint(id: string): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${BASE_URL}/complaints/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch complaint details');
    return res.json();
  },

  async createComplaint(data: {
    title: string;
    description: string;
    category?: string;
    location?: string;
    preferredTimingSlot?: string;
    userId: string;
  }): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit complaint');
    }
    return res.json();
  },

  async updateComplaint(
    id: string,
    updates: {
      status?: string;
      priority?: string;
      assignedHandlerId?: string | null;
      assignedHandlerName?: string | null;
      adminNotes?: string;
    }
  ): Promise<{ complaint: Complaint }> {
    const res = await fetch(`${BASE_URL}/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update complaint');
    }
    return res.json();
  },

  // Stats
  async getResidentStats(userId: string): Promise<ResidentStats> {
    const res = await fetch(`${BASE_URL}/stats?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch resident stats');
    return res.json();
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  // Handlers
  async getHandlers(): Promise<{ handlers: ComplaintHandler[] }> {
    const res = await fetch(`${BASE_URL}/handlers`);
    if (!res.ok) throw new Error('Failed to fetch staff handlers');
    return res.json();
  },

  // Houses
  async getHouses(): Promise<{ houses: House[] }> {
    const res = await fetch(`${BASE_URL}/houses`);
    if (!res.ok) throw new Error('Failed to fetch houses data');
    return res.json();
  },

  async createHouse(data: Partial<House>): Promise<{ house: House }> {
    const res = await fetch(`${BASE_URL}/houses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create house entry');
    return res.json();
  },

  // Notices
  async getNotices(): Promise<{ notices: Notice[] }> {
    const res = await fetch(`${BASE_URL}/notices`);
    if (!res.ok) throw new Error('Failed to fetch notices');
    return res.json();
  },

  async createNotice(data: {
    title: string;
    content: string;
    category: string;
    priority: string;
    publishedBy?: string;
  }): Promise<{ notice: Notice }> {
    const res = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to publish notice');
    }
    return res.json();
  },

  async deleteNotice(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/notices/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete notice');
    return res.json();
  },
};
