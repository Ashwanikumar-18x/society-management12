import fs from 'node:fs';
import path from 'node:path';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  flatNumber: string;
  wing: string;
  role: 'resident' | 'admin';
  createdAt: string;
}

export interface ComplaintAIAnalysis {
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reason: string;
  confidence: number;
}

export interface Complaint {
  _id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  flatNumber: string;
  wing: string;
  title: string;
  description: string;
  category: string;
  location: string;
  preferredTimingSlot: string;
  status: 'Submitted' | 'Needs Triage' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  aiAnalysis: ComplaintAIAnalysis;
  assignedHandlerId: string | null;
  assignedHandlerName: string | null;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface House {
  _id: string;
  flatNumber: string;
  wing: string;
  floor: number;
  ownerName: string;
  ownerContact: string;
  occupiedBy: string;
  status: 'Occupied' | 'Vacant' | 'Rented';
}

export interface ComplaintHandler {
  _id: string;
  name: string;
  specialty: string;
  phone: string;
  status: 'Available' | 'Busy' | 'Off-duty';
  activeTasks: number;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Maintenance' | 'Water' | 'Power' | 'Security' | 'Event';
  priority: 'Normal' | 'High' | 'Urgent';
  publishedBy: string;
  createdAt: string;
}

export interface SocietyDB {
  users: User[];
  complaints: Complaint[];
  houses: House[];
  complaintHandlers: ComplaintHandler[];
  notices: Notice[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'society_db.json');

function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export function generateTicketId(): string {
  const chars = '0123456789ABCDEF';
  let result = '#';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function getInitialData(): SocietyDB {
  return {
    users: [
      {
        _id: 'user_admin_1',
        name: 'Society Administrator',
        email: 'admin@society.com',
        password: 'Admin@123',
        phone: '+91 98000 11223',
        flatNumber: 'Management Office',
        wing: 'Admin Block',
        role: 'admin',
        createdAt: '2026-09-01T08:00:00Z',
      },
      {
        _id: 'user_resident_1',
        name: 'Smoke Resident',
        email: 'resident.1789882182@example.com',
        password: 'Resident@123',
        phone: '+91 98765 43210',
        flatNumber: 'Flat C-110',
        wing: 'Wing C',
        role: 'resident',
        createdAt: '2026-09-15T09:00:00Z',
      },
      {
        _id: 'user_resident_ashwani',
        name: 'Ashwani Kumar',
        email: 'ashwanikumar171827@gmail.com',
        password: 'Admin@123',
        phone: '+91 98765 43210',
        flatNumber: 'Flat C-110',
        wing: 'Wing C',
        role: 'resident',
        createdAt: '2026-09-15T09:00:00Z',
      },
      {
        _id: 'user_resident_2',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        password: 'Resident@123',
        phone: '+91 98111 22334',
        flatNumber: 'Flat B-302',
        wing: 'Wing B',
        role: 'resident',
        createdAt: '2026-09-16T10:00:00Z',
      },
      {
        _id: 'user_resident_3',
        name: 'Priya Nair',
        email: 'priya.nair@example.com',
        password: 'Resident@123',
        phone: '+91 98333 44556',
        flatNumber: 'Flat A-104',
        wing: 'Wing A',
        role: 'resident',
        createdAt: '2026-09-17T11:00:00Z',
      },
    ],
    complaintHandlers: [
      {
        _id: 'handler_1',
        name: 'Arjun Mehta',
        specialty: 'Plumbing',
        phone: '+91 98201 11223',
        status: 'Busy',
        activeTasks: 2,
      },
      {
        _id: 'handler_2',
        name: 'Ramesh Kumar',
        specialty: 'Sanitation',
        phone: '+91 98202 22334',
        status: 'Available',
        activeTasks: 1,
      },
      {
        _id: 'handler_3',
        name: 'Sunil Verma',
        specialty: 'Electrical',
        phone: '+91 98203 33445',
        status: 'Available',
        activeTasks: 0,
      },
      {
        _id: 'handler_4',
        name: 'Pooja Sharma',
        specialty: 'Elevator',
        phone: '+91 98204 44556',
        status: 'Available',
        activeTasks: 0,
      },
      {
        _id: 'handler_5',
        name: 'Vikram Singh',
        specialty: 'Security & Systems',
        phone: '+91 98205 55667',
        status: 'Available',
        activeTasks: 0,
      },
      {
        _id: 'handler_6',
        name: 'Kailash Meena',
        specialty: 'Carpentry',
        phone: '+91 98206 66778',
        status: 'Available',
        activeTasks: 0,
      },
    ],
    complaints: [
      {
        _id: 'complaint_1',
        ticketId: '#1ADF54',
        userId: 'user_resident_1',
        userName: 'Resident',
        userEmail: 'resident.1789882182@example.com',
        userPhone: '+91 98765 43210',
        flatNumber: 'Flat C-110',
        wing: 'Wing C',
        title: 'Elevator stopping between floors',
        description: 'The elevator is stuck between floors and residents cannot safely use it.',
        category: 'Elevator',
        location: 'Wing C Passenger Lift',
        preferredTimingSlot: 'Immediate / Urgent',
        status: 'Submitted',
        priority: 'Urgent',
        aiAnalysis: {
          category: 'Elevator',
          priority: 'Urgent',
          reason: 'Elevator stoppage between floors poses severe safety and entrapment hazards for society residents.',
          confidence: 98,
        },
        assignedHandlerId: null,
        assignedHandlerName: null,
        createdAt: '2026-09-20T08:15:00Z',
        updatedAt: '2026-09-20T08:15:00Z',
      },
      {
        _id: 'complaint_2',
        ticketId: '#54187D',
        userId: 'user_resident_1',
        userName: 'Smoke Resident',
        userEmail: 'resident.1789882182@example.com',
        userPhone: '+91 98765 43210',
        flatNumber: 'Flat B-304',
        wing: 'Wing B',
        title: 'Water leak near lobby',
        description: 'There is a visible water leak near the lobby entrance and the floor is becoming unsafe.',
        category: 'Plumbing',
        location: 'Wing B Lobby Entrance',
        preferredTimingSlot: 'Morning (09:00 AM - 12:00 PM)',
        status: 'Assigned',
        priority: 'High',
        aiAnalysis: {
          category: 'Plumbing',
          priority: 'High',
          reason: 'Visible water leak near the lobby indicates a plumbing-related issue, and the wet floor near an entrance creates a safety hazard that requires prompt attention.',
          confidence: 96,
        },
        assignedHandlerId: 'handler_1',
        assignedHandlerName: 'Arjun Mehta',
        adminNotes: 'Assigned to senior plumber Arjun Mehta for urgent pressure line check.',
        createdAt: '2026-09-20T05:29:00Z',
        updatedAt: '2026-09-20T06:10:00Z',
      },
      {
        _id: 'complaint_3',
        ticketId: '#914B7F',
        userId: 'user_resident_2',
        userName: 'Aarav Sharma',
        userEmail: 'aarav.sharma@example.com',
        userPhone: '+91 98111 22334',
        flatNumber: 'Flat B-302',
        wing: 'Wing B',
        title: 'Main corridor light flickering and sparking',
        description: 'The corridor light fixture in Wing B 3rd floor is sparking when switched on.',
        category: 'Electrical',
        location: 'Wing B, 3rd Floor Corridor',
        preferredTimingSlot: 'Immediate / Urgent',
        status: 'Needs Triage',
        priority: 'Urgent',
        aiAnalysis: {
          category: 'Electrical',
          priority: 'Urgent',
          reason: 'Active sparking in electrical fixtures represents immediate fire hazards and electric shock risks.',
          confidence: 97,
        },
        assignedHandlerId: null,
        assignedHandlerName: null,
        createdAt: '2026-09-20T07:45:00Z',
        updatedAt: '2026-09-20T07:45:00Z',
      },
      {
        _id: 'complaint_4',
        ticketId: '#82C10E',
        userId: 'user_resident_3',
        userName: 'Priya Nair',
        userEmail: 'priya.nair@example.com',
        userPhone: '+91 98333 44556',
        flatNumber: 'Flat A-104',
        wing: 'Wing A',
        title: 'Basement parking drain clogged with debris',
        description: 'Water accumulating in parking slot P-14 due to heavy rain and leaves blocking the drain.',
        category: 'Sanitation',
        location: 'Basement 1, Parking P-14',
        preferredTimingSlot: 'Afternoon (01:00 PM - 04:00 PM)',
        status: 'In Progress',
        priority: 'Urgent',
        aiAnalysis: {
          category: 'Sanitation',
          priority: 'Urgent',
          reason: 'Severe drain blockage causing rapid flooding in basement car parking near power distribution boxes.',
          confidence: 95,
        },
        assignedHandlerId: 'handler_2',
        assignedHandlerName: 'Ramesh Kumar',
        adminNotes: 'Sanitation team notified to clear basement drainage grates.',
        createdAt: '2026-09-19T14:30:00Z',
        updatedAt: '2026-09-20T09:00:00Z',
      },
      {
        _id: 'complaint_5',
        ticketId: '#33F90A',
        userId: 'user_resident_1',
        userName: 'Smoke Resident',
        userEmail: 'resident.1789882182@example.com',
        userPhone: '+91 98765 43210',
        flatNumber: 'Flat C-110',
        wing: 'Wing C',
        title: 'Main security gate boom barrier motor jamming',
        description: 'The automatic RFID barrier is not opening smoothly for residents entering Wing C gate.',
        category: 'Security',
        location: 'Main Security Gate C',
        preferredTimingSlot: 'Evening (05:00 PM - 08:00 PM)',
        status: 'Needs Triage',
        priority: 'Urgent',
        aiAnalysis: {
          category: 'Security',
          priority: 'Urgent',
          reason: 'Main perimeter security boom barrier motor failure preventing emergency vehicle access.',
          confidence: 94,
        },
        assignedHandlerId: null,
        assignedHandlerName: null,
        createdAt: '2026-09-18T16:20:00Z',
        updatedAt: '2026-09-18T16:20:00Z',
      },
    ],
    houses: [
      {
        _id: 'house_1',
        flatNumber: 'C-110',
        wing: 'Wing C',
        floor: 1,
        ownerName: 'Smoke Resident',
        ownerContact: '+91 98765 43210',
        occupiedBy: 'Smoke Resident',
        status: 'Occupied',
      },
      {
        _id: 'house_2',
        flatNumber: 'B-304',
        wing: 'Wing B',
        floor: 3,
        ownerName: 'Smoke Resident',
        ownerContact: '+91 98765 43210',
        occupiedBy: 'Smoke Resident',
        status: 'Occupied',
      },
      {
        _id: 'house_3',
        flatNumber: 'B-302',
        wing: 'Wing B',
        floor: 3,
        ownerName: 'Aarav Sharma',
        ownerContact: '+91 98111 22334',
        occupiedBy: 'Aarav Sharma',
        status: 'Occupied',
      },
      {
        _id: 'house_4',
        flatNumber: 'A-104',
        wing: 'Wing A',
        floor: 1,
        ownerName: 'Priya Nair',
        ownerContact: '+91 98333 44556',
        occupiedBy: 'Priya Nair',
        status: 'Occupied',
      },
      {
        _id: 'house_5',
        flatNumber: 'C-401',
        wing: 'Wing C',
        floor: 4,
        ownerName: 'Vikram Malhotra',
        ownerContact: '+91 98444 55667',
        occupiedBy: 'Vikram Malhotra',
        status: 'Occupied',
      },
      {
        _id: 'house_6',
        flatNumber: 'A-201',
        wing: 'Wing A',
        floor: 2,
        ownerName: 'Meera Joshi',
        ownerContact: '+91 98555 66778',
        occupiedBy: 'Rented Tenant',
        status: 'Rented',
      },
      {
        _id: 'house_7',
        flatNumber: 'B-102',
        wing: 'Wing B',
        floor: 1,
        ownerName: 'Kabir Patel',
        ownerContact: '+91 98666 77889',
        occupiedBy: 'None',
        status: 'Vacant',
      },
    ],
    notices: [
      {
        _id: 'notice_1',
        title: 'Overhead tank valves are serviced',
        content: 'Scheduled maintenance of the overhead water storage tanks for Wing B and Wing C has been completed. Water pressure is restored.',
        category: 'Maintenance',
        priority: 'Normal',
        publishedBy: 'Society Management Office',
        createdAt: '2026-09-20T10:00:00Z',
      },
      {
        _id: 'notice_2',
        title: 'Complaint registered and triaged',
        content: 'Our automated AI triage system is actively screening all reported issues to ensure rapid response by on-duty technicians.',
        category: 'General',
        priority: 'Normal',
        publishedBy: 'Society Management Office',
        createdAt: '2026-09-20T08:00:00Z',
      },
      {
        _id: 'notice_3',
        title: 'Fire safety equipment periodic inspection',
        content: 'Society management will conduct preventive checks of all corridor hydrants and alarms this weekend.',
        category: 'Security',
        priority: 'High',
        publishedBy: 'Society Management Office',
        createdAt: '2026-09-19T09:30:00Z',
      },
    ],
  };
}

class SocietyDatabase {
  private data: SocietyDB;

  constructor() {
    this.data = this.load();
  }

  private load(): SocietyDB {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load DB file, initializing default:', e);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: SocietyDB) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing database to disk:', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // Users collection
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u._id === id);
  }

  createUser(user: Omit<User, '_id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      _id: generateId('user'),
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // Complaints collection
  getComplaints(filter?: { userId?: string; priority?: string; status?: string; search?: string }): Complaint[] {
    let list = [...this.data.complaints];

    if (filter?.userId) {
      list = list.filter(c => c.userId === filter.userId);
    }

    if (filter?.priority && filter.priority !== 'All' && filter.priority !== 'All priority') {
      list = list.filter(c => c.priority.toLowerCase() === filter.priority!.toLowerCase());
    }

    if (filter?.status && filter.status !== 'All' && filter.status !== 'All statuses') {
      list = list.filter(c => c.status.toLowerCase() === filter.status!.toLowerCase());
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.ticketId.toLowerCase().includes(q) ||
        c.userName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.flatNumber.toLowerCase().includes(q) ||
        c.wing.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getComplaintById(id: string): Complaint | undefined {
    return this.data.complaints.find(c => c._id === id || c.ticketId.toUpperCase() === id.toUpperCase());
  }

  createComplaint(complaint: Omit<Complaint, '_id' | 'createdAt' | 'updatedAt'>): Complaint {
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      ...complaint,
      _id: generateId('complaint'),
      createdAt: now,
      updatedAt: now,
    };
    this.data.complaints.unshift(newComplaint);
    this.persist();
    return newComplaint;
  }

  updateComplaint(id: string, updates: Partial<Complaint>): Complaint | null {
    const idx = this.data.complaints.findIndex(c => c._id === id || c.ticketId.toUpperCase() === id.toUpperCase());
    if (idx === -1) return null;
    this.data.complaints[idx] = {
      ...this.data.complaints[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.complaints[idx];
  }

  // Handlers collection
  getHandlers(): ComplaintHandler[] {
    return [...this.data.complaintHandlers];
  }

  getHandlerById(id: string): ComplaintHandler | undefined {
    return this.data.complaintHandlers.find(h => h._id === id);
  }

  // Houses collection
  getHouses(): House[] {
    return [...this.data.houses];
  }

  createHouse(house: Omit<House, '_id'>): House {
    const newHouse: House = {
      ...house,
      _id: generateId('house'),
    };
    this.data.houses.push(newHouse);
    this.persist();
    return newHouse;
  }

  // Notices collection
  getNotices(): Notice[] {
    return [...this.data.notices].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createNotice(notice: Omit<Notice, '_id' | 'createdAt'>): Notice {
    const newNotice: Notice = {
      ...notice,
      _id: generateId('notice'),
      createdAt: new Date().toISOString(),
    };
    this.data.notices.unshift(newNotice);
    this.persist();
    return newNotice;
  }

  deleteNotice(id: string): boolean {
    const lenBefore = this.data.notices.length;
    this.data.notices = this.data.notices.filter(n => n._id !== id);
    if (this.data.notices.length !== lenBefore) {
      this.persist();
      return true;
    }
    return false;
  }
}

export const db = new SocietyDatabase();
