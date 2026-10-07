import { Router, Request, Response } from 'express';
import { db, generateTicketId } from './db.js';
import { analyzeComplaintWithAI } from './ai.js';

export const apiRouter = Router();

// Auth routes
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, flatNumber, wing } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const user = db.createUser({
    name,
    email,
    password,
    phone: phone || '',
    flatNumber: flatNumber || 'Flat A-101',
    wing: wing || 'Wing A',
    role: 'resident',
  });

  const { password: _, ...safeUser } = user;
  res.status(201).json({ user: safeUser, message: 'Account registered successfully.' });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  // If Admin role requested or admin email provided
  if (role === 'admin' || (email && email.toLowerCase().includes('admin'))) {
    const adminUser = db.findUserByEmail('admin@society.com') || {
      _id: 'user_admin_1',
      name: 'Society Administrator',
      email: 'admin@society.com',
      password: 'Admin@123',
      phone: '+91 98000 11223',
      flatNumber: 'Management Office',
      wing: 'Admin Block',
      role: 'admin' as const,
      createdAt: '2026-09-01T08:00:00Z',
    };
    const { password: _, ...safeAdmin } = adminUser;
    res.json({ user: safeAdmin, message: 'Signed in successfully as Admin.' });
    return;
  }

  // Resident role
  const targetEmail = (email && email.trim()) || 'resident.1789882182@example.com';
  let user = db.findUserByEmail(targetEmail);

  if (!user) {
    // If not found, seamlessly auto-provision resident account
    const derivedName = targetEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    user = db.createUser({
      name: derivedName || 'Resident',
      email: targetEmail,
      password: password || 'Resident@123',
      phone: '+91 98765 43210',
      flatNumber: 'Flat C-110',
      wing: 'Wing C',
      role: 'resident',
    });
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, message: 'Signed in successfully.' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ error: 'No active session' });
    return;
  }
  const user = db.findUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

apiRouter.patch('/users/profile', (req: Request, res: Response) => {
  const { userId, name, phone, flatNumber, wing } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  const updated = db.updateUser(userId, {
    ...(name ? { name } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(flatNumber ? { flatNumber } : {}),
    ...(wing ? { wing } : {}),
  });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { password: _, ...safeUser } = updated;
  res.json({ user: safeUser });
});

// Complaints routes
apiRouter.get('/complaints', (req: Request, res: Response) => {
  const { userId, priority, status, search } = req.query as {
    userId?: string;
    priority?: string;
    status?: string;
    search?: string;
  };

  const complaints = db.getComplaints({ userId, priority, status, search });
  res.json({ complaints });
});

apiRouter.get('/complaints/:id', (req: Request, res: Response) => {
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found' });
    return;
  }
  res.json({ complaint });
});

apiRouter.post('/complaints', async (req: Request, res: Response) => {
  const {
    title,
    description,
    category: specifiedCategory,
    location,
    preferredTimingSlot,
    userId,
  } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required.' });
    return;
  }

  const user = (userId ? db.findUserById(userId) : null) || db.findUserByEmail('resident.1789882182@example.com');
  const userName = user?.name || 'Resident';
  const userEmail = user?.email || 'resident@society.com';
  const userPhone = user?.phone || '';
  const flatNumber = user?.flatNumber || 'Flat C-110';
  const wing = user?.wing || 'Wing C';

  // Run AI analysis through backend
  const aiAnalysis = await analyzeComplaintWithAI(
    title,
    description,
    location || `${flatNumber}, ${wing}`
  );

  const finalCategory = specifiedCategory && specifiedCategory !== 'Auto-detect'
    ? specifiedCategory
    : aiAnalysis.category;

  const ticketId = generateTicketId();

  const newComplaint = db.createComplaint({
    ticketId,
    userId: user?._id || 'user_guest',
    userName,
    userEmail,
    userPhone,
    flatNumber,
    wing,
    title,
    description,
    category: finalCategory,
    location: location || `${flatNumber}, ${wing}`,
    preferredTimingSlot: preferredTimingSlot || 'Any time / Preferred',
    status: 'Submitted',
    priority: aiAnalysis.priority,
    aiAnalysis: {
      ...aiAnalysis,
      category: finalCategory,
    },
    assignedHandlerId: null,
    assignedHandlerName: null,
  });

  res.status(201).json({ complaint: newComplaint });
});

apiRouter.patch('/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    status,
    priority,
    assignedHandlerId,
    assignedHandlerName,
    adminNotes,
  } = req.body;

  const updates: Record<string, any> = {};

  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (adminNotes !== undefined) updates.adminNotes = adminNotes;

  if (assignedHandlerId !== undefined) {
    updates.assignedHandlerId = assignedHandlerId || null;
    if (assignedHandlerId) {
      const handler = db.getHandlerById(assignedHandlerId);
      updates.assignedHandlerName = handler ? handler.name : (assignedHandlerName || null);
      if (!updates.status || updates.status === 'Submitted' || updates.status === 'Needs Triage') {
        updates.status = 'Assigned';
      }
    } else {
      updates.assignedHandlerName = null;
    }
  }

  const updated = db.updateComplaint(id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Complaint not found' });
    return;
  }

  res.json({ complaint: updated });
});

// Stats endpoint
apiRouter.get('/stats', (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const all = db.getComplaints();
  const notices = db.getNotices();

  if (userId) {
    const userComplaints = all.filter(c => c.userId === userId);
    const inProgress = userComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const resolved = userComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    res.json({
      totalComplaints: userComplaints.length,
      inProgress,
      resolved,
      newNotices: notices.length,
    });
    return;
  }

  // Admin stats matching screenshot 2
  const needsTriage = all.filter(c => c.status === 'Needs Triage' || c.status === 'Submitted').length;
  const urgentPriority = all.filter(c => c.priority === 'Urgent').length;
  const assigned = all.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length;
  const activeQueue = all.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;

  res.json({
    allComplaints: all.length,
    needsTriage,
    urgentPriority,
    assigned,
    activeQueue,
  });
});

// Handlers endpoint
apiRouter.get('/handlers', (_req: Request, res: Response) => {
  res.json({ handlers: db.getHandlers() });
});

// Houses endpoint
apiRouter.get('/houses', (_req: Request, res: Response) => {
  res.json({ houses: db.getHouses() });
});

apiRouter.post('/houses', (req: Request, res: Response) => {
  const { flatNumber, wing, floor, ownerName, ownerContact, occupiedBy, status } = req.body;
  if (!flatNumber || !wing || !ownerName) {
    res.status(400).json({ error: 'Flat number, wing, and owner name are required' });
    return;
  }
  const house = db.createHouse({
    flatNumber,
    wing,
    floor: Number(floor) || 1,
    ownerName,
    ownerContact: ownerContact || '',
    occupiedBy: occupiedBy || ownerName,
    status: status || 'Occupied',
  });
  res.status(201).json({ house });
});

// Notices endpoint
apiRouter.get('/notices', (_req: Request, res: Response) => {
  res.json({ notices: db.getNotices() });
});

apiRouter.post('/notices', (req: Request, res: Response) => {
  const { title, content, category, priority, publishedBy } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const notice = db.createNotice({
    title,
    content,
    category: category || 'General',
    priority: priority || 'Normal',
    publishedBy: publishedBy || 'Society Management Office',
  });
  res.status(201).json({ notice });
});

apiRouter.delete('/notices/:id', (req: Request, res: Response) => {
  const deleted = db.deleteNotice(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Notice not found' });
    return;
  }
  res.json({ success: true, message: 'Notice deleted successfully' });
});
