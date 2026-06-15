/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeProfile, CustomRole, SalaryStatus } from './types';
import LoginScreen from './components/LoginScreen';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';

// Define preloaded system mock templates as absolute local fallbacks
const DEFAULT_ROLES: CustomRole[] = [
  { id: '1', roleName: 'Developer', description: 'Engineers system integrations and codes company modules.', createdAt: new Date().toISOString() },
  { id: '2', roleName: 'Manager', description: 'Coordinates client objectives and reports operational statistics.', createdAt: new Date().toISOString() },
  { id: '3', roleName: 'Sysops Designer', description: 'Configures cloud server clusters, EKS, and Jenkins CI pipelines.', createdAt: new Date().toISOString() },
  { id: '4', roleName: 'Employee', description: 'General operational workload execution role.', createdAt: new Date().toISOString() },
];

const DEFAULT_EMPLOYEES: EmployeeProfile[] = [
  {
    uid: 'admin-root-001',
    name: 'Master HR Admin',
    email: 'myname@1.com',
    role: 'Admin',
    salary: 15000,
    salaryStatus: SalaryStatus.PAID,
    joinedAt: new Date('2025-10-01').toISOString(),
    isAdmin: true
  },
  {
    uid: 'emp-dev-432',
    name: 'Jane Austin',
    email: 'jane@corp-domain.com',
    role: 'Developer',
    salary: 8500,
    salaryStatus: SalaryStatus.PROCESSING,
    joinedAt: new Date('2026-02-12').toISOString(),
    isAdmin: false
  },
  {
    uid: 'emp-mgr-981',
    name: 'Sam Billings',
    email: 'sam@corp-domain.com',
    role: 'Manager',
    salary: 9200,
    salaryStatus: SalaryStatus.PENDING,
    joinedAt: new Date('2026-04-18').toISOString(),
    isAdmin: false
  }
];

export default function App() {
  // Application Data States
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  
  // Auth Session States
  const [currentUser, setCurrentUser] = useState<EmployeeProfile | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  // Load and Synchronize Data from our backend API Router
  useEffect(() => {
    async function loadData() {
      let loadedEmployees: EmployeeProfile[] = [];
      let loadedRoles: CustomRole[] = [];

      // 1. Fetch Custom Roles from dynamic Express API
      try {
        const res = await fetch('/api/roles');
        if (res.ok) {
          loadedRoles = await res.json();
        } else {
          throw new Error('Non-ok response code from backend Server');
        }
      } catch (err) {
        console.warn("Could not fetch roles from backend API, loading local fallbacks:", err);
        const cache = localStorage.getItem('roles_cache');
        loadedRoles = cache ? JSON.parse(cache) : [...DEFAULT_ROLES];
      }

      // 2. Fetch Employee profiles from dynamic Express API
      try {
        const res = await fetch('/api/employees');
        if (res.ok) {
          loadedEmployees = await res.json();
        } else {
          throw new Error('Non-ok listing code from backend Server');
        }
      } catch (err) {
        console.warn("Could not fetch employees from backend API, loading local fallbacks:", err);
        const cache = localStorage.getItem('employees_cache');
        loadedEmployees = cache ? JSON.parse(cache) : [...DEFAULT_EMPLOYEES];
      }

      // Sync local states
      setEmployees(loadedEmployees);
      setRoles(loadedRoles);
      localStorage.setItem('roles_cache', JSON.stringify(loadedRoles));
      localStorage.setItem('employees_cache', JSON.stringify(loadedEmployees));
      setBootstrapping(false);
    }
    loadData();
  }, []);

  // Handle User login verifying against unified API state
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    // 1. Specialized local credential checking for Admin Root
    if (email.toLowerCase() === 'myname@1.com' && pass === '12345') {
      const adminProfile = employees.find(e => e.email.toLowerCase() === 'myname@1.com');
      if (adminProfile) {
        setCurrentUser(adminProfile);
        return true;
      } else {
        // Create Admin profile through API
        try {
          const res = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Master HR Admin',
              email: 'myname@1.com',
              role: 'Admin',
              salary: 15000
            })
          });
          if (res.ok) {
            const adminData = await res.json();
            setEmployees(prev => [adminData, ...prev]);
            setCurrentUser(adminData);
            return true;
          }
        } catch (e) {
          console.warn("Failed seeding Master Admin account on backend:", e);
        }

        const fallbackAdmin: EmployeeProfile = {
          uid: 'admin-root-001',
          name: 'Master HR Admin',
          email: 'myname@1.com',
          role: 'Admin',
          salary: 15000,
          salaryStatus: SalaryStatus.PAID,
          joinedAt: new Date().toISOString(),
          isAdmin: true
        };
        setCurrentUser(fallbackAdmin);
        return true;
      }
    }

    // 2. Standard Employee backend profile verification
    try {
      const res = await fetch(`/api/employees/me?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const profile = await res.json();
        setCurrentUser(profile);
        return true;
      }
    } catch (err) {
      console.warn("Failed fetching user profile via API, applying local schema check:", err);
    }

    // Local state fallback scanner for offline preview cases
    const localProfile = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (localProfile) {
      setCurrentUser(localProfile);
      return true;
    }

    return false;
  };

  // Public signup registration of a new employee
  const handleRegisterEmployee = async (
    name: string, 
    email: string, 
    roleName: string, 
    expectedSalary: number
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/employees/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role: roleName,
          salary: expectedSalary
        })
      });

      if (res.ok) {
        const signedUpEmp = await res.json();
        const updated = [...employees, signedUpEmp];
        setEmployees(updated);
        localStorage.setItem('employees_cache', JSON.stringify(updated));
        return true;
      }
    } catch (error) {
      console.warn("Failed registering new user through API, attempting memory fallback:", error);
    }

    // Fallback logic
    if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    const newUid = 'emp-' + Math.random().toString(36).substr(2, 9);
    const newEmp: EmployeeProfile = {
      uid: newUid,
      name,
      email,
      role: roleName,
      salary: expectedSalary,
      salaryStatus: SalaryStatus.PENDING,
      joinedAt: new Date().toISOString(),
      isAdmin: false
    };

    const updatedList = [...employees, newEmp];
    setEmployees(updatedList);
    localStorage.setItem('employees_cache', JSON.stringify(updatedList));
    return true;
  };

  // Log Out active session
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // ADMIN ACTION: Change payroll disbursement status of an employee
  const handleUpdateSalaryStatus = async (uid: string, newStatus: SalaryStatus): Promise<boolean> => {
    const updated = employees.map(emp => {
      if (emp.uid === uid) {
        return { ...emp, salaryStatus: newStatus };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('employees_cache', JSON.stringify(updated));

    try {
      const res = await fetch(`/api/employees/${uid}/salary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaryStatus: newStatus })
      });
      return res.ok;
    } catch (error) {
      console.warn("Backend salary status update failed. Local values processed.", error);
      return true;
    }
  };

  // ADMIN ACTION: Modify structural base salary amount of an employee
  const handleUpdateEmployeeSalary = async (uid: string, amount: number): Promise<boolean> => {
    const updated = employees.map(emp => {
      if (emp.uid === uid) {
        return { ...emp, salary: amount };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('employees_cache', JSON.stringify(updated));

    try {
      const res = await fetch(`/api/employees/${uid}/salary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: amount })
      });
      return res.ok;
    } catch (error) {
      console.warn("Backend salary amount update failed. Local values processed.", error);
      return true;
    }
  };

  // ADMIN ACTION: Add employee profile directly
  const handleAddEmployeeDirectly = async (
    name: string, 
    email: string, 
    role: string, 
    salary: number
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, salary })
      });

      if (res.ok) {
        const addedEmp = await res.json();
        const updated = [...employees, addedEmp];
        setEmployees(updated);
        localStorage.setItem('employees_cache', JSON.stringify(updated));
        return true;
      }
    } catch (error) {
      console.warn("Add employee direct API failed. Using local storage.", error);
    }

    if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    const newUid = 'emp-' + Math.random().toString(36).substr(2, 9);
    const newEmp: EmployeeProfile = {
      uid: newUid,
      name,
      email,
      role,
      salary,
      salaryStatus: SalaryStatus.PENDING,
      joinedAt: new Date().toISOString(),
      isAdmin: false
    };

    const updatedList = [...employees, newEmp];
    setEmployees(updatedList);
    localStorage.setItem('employees_cache', JSON.stringify(updatedList));
    return true;
  };

  // ADMIN ACTION: Delete employee record
  const handleDeleteEmployee = async (uid: string): Promise<boolean> => {
    const updated = employees.filter(emp => emp.uid !== uid);
    setEmployees(updated);
    localStorage.setItem('employees_cache', JSON.stringify(updated));

    try {
      const res = await fetch(`/api/employees/${uid}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (error) {
      console.warn("API Delete statement failed. Continuing in local state.", error);
      return true;
    }
  };

  // ADMIN ACTION: Register and Create a New Org Custom Role
  const handleCreateRole = async (roleName: string, description: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName, description })
      });

      if (res.ok) {
        const addedRole = await res.json();
        const updated = [...roles, addedRole];
        setRoles(updated);
        localStorage.setItem('roles_cache', JSON.stringify(updated));
        return true;
      }
    } catch (error) {
      console.warn("API Custom role registration failed. Using localized memory storage.", error);
    }

    if (roles.some(r => r.roleName.toLowerCase() === roleName.toLowerCase())) {
      return false;
    }

    const newId = 'role-' + Date.now().toString(36);
    const newRole: CustomRole = {
      id: newId,
      roleName,
      description,
      createdAt: new Date().toISOString()
    };

    const updatedList = [...roles, newRole];
    setRoles(updatedList);
    localStorage.setItem('roles_cache', JSON.stringify(updatedList));
    return true;
  };

  // State Bootloader Screen
  if (bootstrapping) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6" id="app-bootloading">
        <div className="text-center relative">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-mono tracking-wide">Syncing Corporate Ledger Security Panels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between" id="app-core-interface">
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {!currentUser ? (
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <LoginScreen 
                onLogin={handleLogin}
                onRegister={handleRegisterEmployee}
                availableRoles={roles}
              />
            </motion.div>
          ) : currentUser.isAdmin ? (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminDashboard 
                employeesList={employees}
                rolesList={roles}
                userProfile={currentUser}
                onLogout={handleLogout}
                onUpdateSalaryStatus={handleUpdateSalaryStatus}
                onUpdateEmployeeSalary={handleUpdateEmployeeSalary}
                onAddEmployee={handleAddEmployeeDirectly}
                onDeleteEmployee={handleDeleteEmployee}
                onCreateRole={handleCreateRole}
              />
            </motion.div>
          ) : (
            <motion.div
              key="emp-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmployeeDashboard 
                userProfile={currentUser}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
