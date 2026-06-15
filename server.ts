import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// Firebase Admin SDK Initialization (Server-Side)
// ==========================================
if (getApps().length === 0) {
  initializeApp({
    projectId: firebaseConfig.projectId
  });
}
const firestoreDb = getFirestore(firebaseConfig.firestoreDatabaseId);

// Pre-seeded system mock data if collections are empty
const DEFAULT_ROLES = [
  { id: '1', roleName: 'Developer', description: 'Engineers system integrations and codes company modules.', createdAt: new Date().toISOString() },
  { id: '2', roleName: 'Manager', description: 'Coordinates client objectives and reports operational statistics.', createdAt: new Date().toISOString() },
  { id: '3', roleName: 'Sysops Designer', description: 'Configures cloud server clusters, EKS, and Jenkins CI pipelines.', createdAt: new Date().toISOString() },
  { id: '4', roleName: 'Employee', description: 'General operational workload execution role.', createdAt: new Date().toISOString() },
];

const DEFAULT_EMPLOYEES = [
  {
    uid: 'admin-root-001',
    name: 'Master HR Admin',
    email: 'myname@1.com',
    role: 'Admin',
    salary: 15000,
    salaryStatus: 'Paid',
    joinedAt: new Date('2025-10-01').toISOString(),
    isAdmin: true
  },
  {
    uid: 'emp-dev-432',
    name: 'Jane Austin',
    email: 'jane@corp-domain.com',
    role: 'Developer',
    salary: 8500,
    salaryStatus: 'Processing',
    joinedAt: new Date('2026-02-12').toISOString(),
    isAdmin: false
  },
  {
    uid: 'emp-mgr-981',
    name: 'Sam Billings',
    email: 'sam@corp-domain.com',
    role: 'Manager',
    salary: 9200,
    salaryStatus: 'Pending',
    joinedAt: new Date('2026-04-18').toISOString(),
    isAdmin: false
  }
];

let useLocalPersistence = false;
let localDb = {
  roles: [...DEFAULT_ROLES],
  employees: [...DEFAULT_EMPLOYEES]
};

const DB_FILE_PATH = path.join(__dirname, 'db-store.json');

function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      localDb = JSON.parse(content);
    } else {
      saveLocalDb();
    }
  } catch (err: any) {
    console.warn('[Database Service] Could not read local DB file:', err.message);
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[Database Service] Could not write local DB file:', err.message);
  }
}

// Helper to check and seed Firestore (or local db as fallback)
async function verifyFirestoreAccess() {
  try {
    // Force REST transport if allowed, and test roles read
    firestoreDb.settings({ preferRest: true });
    const rolesSnap = await firestoreDb.collection('roles').get();
    
    if (rolesSnap.empty) {
      console.log('[Database Service] Seeding server-side roles to Firestore...');
      for (const r of DEFAULT_ROLES) {
        await firestoreDb.collection('roles').doc(r.id).set(r);
      }
    }

    const usersSnap = await firestoreDb.collection('users').get();
    if (usersSnap.empty) {
      console.log('[Database Service] Seeding server-side employees to Firestore...');
      for (const emp of DEFAULT_EMPLOYEES) {
        await firestoreDb.collection('users').doc(emp.uid).set(emp);
      }
    }
    console.log('[Database Service] Firestore connection verified and seed check successful.');
    useLocalPersistence = false;
  } catch (err: any) {
    console.info('[Database Service] Note: Firestore is currently restricted or inaccessible in this container. Switching seamlessly to local persistence engine.');
    useLocalPersistence = true;
    loadLocalDb();
  }
}

// ==========================================
// API Handlers (REST Router Mapping)
// ==========================================

// Log incoming API calls
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API Service] ${req.method} ${req.url}`);
  }
  next();
});

// 1. Get All Corporate Roles
app.get('/api/roles', async (req, res) => {
  if (useLocalPersistence) {
    return res.json(localDb.roles);
  }
  try {
    const snap = await firestoreDb.collection('roles').get();
    const result: any[] = [];
    snap.forEach(docSnap => {
      result.push(docSnap.data());
    });
    
    if (result.length === 0) {
      return res.json(DEFAULT_ROLES);
    }
    res.json(result);
  } catch (err) {
    res.json(DEFAULT_ROLES);
  }
});

// 2. Create Dynamic Custom Roles (Admin action)
app.post('/api/roles', async (req, res) => {
  const { roleName, description } = req.body;
  if (!roleName) {
    return res.status(400).json({ message: 'Error: roleName is a required field.' });
  }

  const id = `role-${Date.now().toString(36)}`;
  const createdAt = new Date().toISOString();
  const newRole = { id, roleName, description: description || '', createdAt };

  if (useLocalPersistence) {
    localDb.roles.push(newRole);
    saveLocalDb();
    return res.status(201).json(newRole);
  }

  try {
    await firestoreDb.collection('roles').doc(id).set(newRole);
    res.status(201).json(newRole);
  } catch (err) {
    console.error('Save roles failed:', err);
    res.status(500).json({ message: 'Failed to record custom role.' });
  }
});

// 3. Employee Signing-Up (Public request)
app.post('/api/employees/signup', async (req, res) => {
  const { name, email, role, salary } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Error: Name and email are required fields.' });
  }

  const expectedSalary = parseFloat(salary) || 0.0;
  const uid = `emp-${Math.random().toString(36).substring(2, 11)}`;
  const joinedAt = new Date().toISOString();
  const isAdmin = false;
  const salaryStatus = 'Pending';
  
  const newEmp = { uid, name, email, role: role || 'Employee', salary: expectedSalary, salaryStatus, joinedAt, isAdmin };

  if (useLocalPersistence) {
    const duplicate = localDb.employees.some(e => e.email.toLowerCase() === email.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ message: 'Error: Email is already registered in the system.' });
    }
    localDb.employees.push(newEmp);
    saveLocalDb();
    return res.status(201).json(newEmp);
  }

  try {
    // Check duplication
    const existingSnap = await firestoreDb.collection('users').where('email', '==', email.toLowerCase()).get();
    if (!existingSnap.empty) {
      return res.status(400).json({ message: 'Error: Email is already registered in the system.' });
    }

    await firestoreDb.collection('users').doc(uid).set(newEmp);
    res.status(201).json(newEmp);
  } catch (err) {
    console.error('Signup profile writing failed:', err);
    res.status(500).json({ message: 'Authentication registry failed.' });
  }
});

// 4. Admin Fetch All Employees
app.get('/api/employees', async (req, res) => {
  if (useLocalPersistence) {
    return res.json(localDb.employees);
  }
  try {
    const snap = await firestoreDb.collection('users').get();
    const result: any[] = [];
    snap.forEach(docSnap => {
      result.push(docSnap.data());
    });

    if (result.length === 0) {
      return res.json(DEFAULT_EMPLOYEES);
    }
    res.json(result);
  } catch (err) {
    res.json(DEFAULT_EMPLOYEES);
  }
});

// 5. Admin: Create/Add Employee Directly
app.post('/api/employees', async (req, res) => {
  const { name, email, role, salary } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Error: Name and email are required fields.' });
  }

  const expectedSalary = parseFloat(salary) || 0.0;
  const uid = `emp-${Math.random().toString(36).substring(2, 11)}`;
  const joinedAt = new Date().toISOString();
  const isAdmin = email.toLowerCase() === 'myname@1.com';
  const salaryStatus = 'Pending';

  const newEmp = { uid, name, email, role: role || 'Employee', salary: expectedSalary, salaryStatus, joinedAt, isAdmin };

  if (useLocalPersistence) {
    const duplicate = localDb.employees.some(e => e.email.toLowerCase() === email.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ message: 'Error: Email is already registered in the system.' });
    }
    localDb.employees.push(newEmp);
    saveLocalDb();
    return res.status(201).json(newEmp);
  }

  try {
    await firestoreDb.collection('users').doc(uid).set(newEmp);
    res.status(201).json(newEmp);
  } catch (err) {
    console.error('Direct employee write failed:', err);
    res.status(500).json({ message: 'Enterprise registry write failed.' });
  }
});

// 6. Admin Update Salary & Status
app.put('/api/employees/:id/salary', async (req, res) => {
  const { id } = req.params;
  const { salary, salaryStatus } = req.body;

  if (useLocalPersistence) {
    const emp = localDb.employees.find(e => e.uid === id);
    if (!emp) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    if (salary !== undefined) emp.salary = parseFloat(salary);
    if (salaryStatus !== undefined) emp.salaryStatus = salaryStatus;
    saveLocalDb();
    return res.json(emp);
  }

  try {
    const updatePayload: Record<string, any> = {};
    if (salary !== undefined) updatePayload.salary = parseFloat(salary);
    if (salaryStatus !== undefined) updatePayload.salaryStatus = salaryStatus;

    await firestoreDb.collection('users').doc(id).update(updatePayload);
    res.json({ uid: id, ...updatePayload });
  } catch (err) {
    console.error('Update salary failed:', err);
    res.status(500).json({ message: 'Failed to commit salary modifications.' });
  }
});

// 7. Admin Delete Employee Account
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;

  if (useLocalPersistence) {
    const index = localDb.employees.findIndex(e => e.uid === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    localDb.employees.splice(index, 1);
    saveLocalDb();
    return res.json({ message: 'Employee record deleted successfully' });
  }

  try {
    await firestoreDb.collection('users').doc(id).delete();
    res.json({ message: 'Employee record deleted successfully' });
  } catch (err) {
    console.error('Delete employee failed:', err);
    res.status(500).json({ message: 'Server failed to delete employee.' });
  }
});

// 8. Find Single Profile (by query email)
app.get('/api/employees/me', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Missing email query parameter.' });
  }

  if (useLocalPersistence) {
    const emp = localDb.employees.find(e => e.email.toLowerCase() === String(email).toLowerCase());
    if (!emp) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    return res.json(emp);
  }

  try {
    const snap = await firestoreDb.collection('users').where('email', '==', String(email).toLowerCase()).get();
    
    if (snap.empty) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    let result = null;
    snap.forEach(docSnap => {
      result = docSnap.data();
    });

    res.json(result);
  } catch (err) {
    console.error('Me query profile failed:', err);
    res.status(500).json({ message: 'Database profile lookup failed.' });
  }
});

// Initialize database seed check and setup
verifyFirestoreAccess();

// ==========================================
// Vite Dev Integration Core Middleware
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development.');
  } else {
    // Serve static frontend assets compiled during client build phases
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static distribution serving mounted.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application started. Full-Stack server running on http://localhost:${PORT}`);
  });
}

startServer();
