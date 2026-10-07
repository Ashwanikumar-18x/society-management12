export interface User {
  _id: string;
  name: string;
  email: string;
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

export interface ResidentStats {
  totalComplaints: number;
  inProgress: number;
  resolved: number;
  newNotices: number;
}

export interface AdminStats {
  allComplaints: number;
  needsTriage: number;
  urgentPriority: number;
  assigned: number;
  activeQueue: number;
}
