import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, Users, Settings, Plus, Trash2, ShieldAlert, BadgeCheck, Clock, RefreshCw, 
  Terminal, Layers, DollarSign, Download, Copy, Search, Eye, Filter, BarChart3, ChevronUp, ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { EmployeeProfile, CustomRole, SalaryStatus, OperationType } from '../types';

interface AdminDashboardProps {
  employeesList: EmployeeProfile[];
  rolesList: CustomRole[];
  userProfile: EmployeeProfile;
  onLogout: () => void;
  onUpdateSalaryStatus: (uid: string, newStatus: SalaryStatus) => Promise<boolean>;
  onUpdateEmployeeSalary: (uid: string, amount: number) => Promise<boolean>;
  onAddEmployee: (name: string, email: string, role: string, salary: number) => Promise<boolean>;
  onDeleteEmployee: (uid: string) => Promise<boolean>;
  onCreateRole: (roleName: string, description: string) => Promise<boolean>;
}

// Stored configurations for Code Export tab
const EXPORT_FILES = [
  {
    name: 'docker-compose.yml',
    language: 'yaml',
    description: 'Binds MySQL 8.0, Spring Boot app, and Nginx reverse proxy together dynamically.',
    content: `version: '3.8'

services:
  # 1. MySQL Database Service
  mysql-db:
    image: mysql:8.0
    container_name: ems-mysql-db
    restart: unless-stopped
    ports:
      - "\${DB_HOST_PORT:-3306}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: \${MYSQL_DATABASE:-employee_db}
      MYSQL_USER: \${MYSQL_USER:-ems_user}
      MYSQL_PASSWORD: \${MYSQL_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - ems-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Java Spring Boot Full-Stack Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ems-java-backend
    restart: unless-stopped
    ports:
      - "\${BACKEND_PORT:-8080}:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/\${MYSQL_DATABASE:-employee_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=\${MYSQL_USER:-ems_user}
      - SPRING_DATASOURCE_PASSWORD=\${MYSQL_PASSWORD}
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
      - ADMIN_EMAIL=\${ADMIN_EMAIL:-myname@1.com}
      - ADMIN_PASSWORD=\${ADMIN_PASSWORD:-12345}
    depends_on:
      mysql-db:
        condition: service_healthy
    networks:
      - ems-network

  # 3. Nginx and React Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ems-nginx-frontend
    restart: unless-stopped
    ports:
      - "\${FRONTEND_PORT:-80}:80"
    depends_on:
      - backend
    networks:
      - ems-network

volumes:
  mysql-data:
    driver: local

networks:
  ems-network:
    driver: bridge`
  },
  {
    name: 'backend/Dockerfile',
    language: 'dockerfile',
    description: 'Compiles Java dependencies in Maven environment, packaging into execution runtime.',
    content: `FROM maven:3.8.8-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]`
  },
  {
    name: 'frontend/Dockerfile',
    language: 'dockerfile',
    description: 'Installs dependencies, builds Static SPA with Vite, and configures static Nginx server.',
    content: `FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`
  },
  {
    name: 'nginx.conf',
    language: 'nginx',
    description: 'Reverse Proxy that intercepts Nginx requests, proxies api paths, and loads SPA routing.',
    content: `server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}`
  },
  {
    name: 'Jenkinsfile',
    language: 'groovy',
    description: 'Declarative CI Pipeline: parses clean checks, builds docker containers, pushes to ECR registry, and triggers rolling rollout.',
    content: `pipeline {
    agent any
    environment {
        DOCKER_REGISTRY = 'your-registry-id.dkr.ecr.us-east-1.amazonaws.com'
        BACKEND_IMAGE_NAME = 'ems-backend'
        FRONTEND_IMAGE_NAME = 'ems-frontend'
        IMAGE_TAG = "v\${env.BUILD_NUMBER}"
        KUBECONFIG_CREDENTIAL_ID = 'aws-eks-kubeconfig'
        AWS_CREDENTIALS_ID = 'aws-credentials'
    }
    stages {
        stage('Checkout Source') {
            steps { checkout scm }
        }
        stage('Run Code Quality & Unit Tests') {
            parallel {
                stage('Backend Java Test Suite') {
                    steps {
                        dir('backend') { sh 'mvn clean test' }
                    }
                }
                stage('Frontend React Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }
        stage('Build & Push Container Images') {
            steps {
                script {
                    sh "docker build -t \${DOCKER_REGISTRY}/\${BACKEND_IMAGE_NAME}:\${IMAGE_TAG} ./backend"
                    sh "docker build -t \${DOCKER_REGISTRY}/\${FRONTEND_IMAGE_NAME}:\${IMAGE_TAG} ./frontend"
                    withCredentials([[\$class: 'AmazonWebServicesCredentialsBinding', credentialsId: AWS_CREDENTIALS_ID]]) {
                        sh "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin \${DOCKER_REGISTRY}"
                        sh "docker push \${DOCKER_REGISTRY}/\${BACKEND_IMAGE_NAME}:\${IMAGE_TAG}"
                        sh "docker push \${DOCKER_REGISTRY}/\${FRONTEND_IMAGE_NAME}:\${IMAGE_TAG}"
                    }
                }
            }
        }
        stage('Deploy Rollout to AWS EKS') {
            steps {
                script {
                    withKubeConfig([credentialsId: KUBECONFIG_CREDENTIAL_ID]) {
                        sh "sed -i 's|ems-backend:latest|\${DOCKER_REGISTRY}/\${BACKEND_IMAGE_NAME}:\${IMAGE_TAG}|g' eks-deployment.yaml"
                        sh "sed -i 's|ems-frontend:latest|\${DOCKER_REGISTRY}/\${FRONTEND_IMAGE_NAME}:\${IMAGE_TAG}|g' eks-deployment.yaml"
                        sh "kubectl apply -f eks-deployment.yaml"
                    }
                }
            }
        }
    }
}`
  },
  {
    name: 'eks-deployment.yaml',
    language: 'yaml',
    description: 'EKS cluster topology manifest (Stateful DB layers, Pod replica scale, secrets, routing & auto-scalers).',
    content: `apiVersion: v1
kind: Namespace
metadata:
  name: ems-prod
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ems-config
  namespace: ems-prod
data:
  MYSQL_DATABASE: "employee_db"
  MYSQL_USER: "ems_user"
  BACKEND_URL: "http://ems-backend-svc:8080/api/"
---
apiVersion: v1
kind: Secret
metadata:
  name: ems-secrets
  namespace: ems-prod
type: Opaque
data:
  MYSQL_ROOT_PASSWORD: c3VwZXJzZWN1cmVfcm9vdF9wYXNzXzk5Nw==
  MYSQL_PASSWORD: c2VjdXJlX2Vtc19wYXNzXzMxMg==
  ADMIN_PASSWORD: MTIzNDU=
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pv-claim
  namespace: ems-prod
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests: { storage: 10Gi }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ems-mysql
  namespace: ems-prod
spec:
  replicas: 1
  selector:
    matchLabels: { app: ems-mysql }
  template:
    metadata:
      labels: { app: ems-mysql }
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom: { secretKeyRef: { name: ems-secrets, key: MYSQL_ROOT_PASSWORD } }
            - name: MYSQL_DATABASE
              valueFrom: { configMapKeyRef: { name: ems-config, key: MYSQL_DATABASE } }
          ports: [{ containerPort: 3306, name: mysql }]
          volumeMounts: [{ name: mysql-persistent-storage, mountPath: /var/lib/mysql }]
      volumes:
        - name: mysql-persistent-storage
          persistentVolumeClaim: { claimName: mysql-pv-claim }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ems-backend-deploy
  namespace: ems-prod
spec:
  replicas: 2
  selector:
    matchLabels: { app: ems-backend }
  template:
    metadata:
      labels: { app: ems-backend }
    spec:
      containers:
        - name: backend
          image: ems-backend:latest
          ports: [{ containerPort: 8080 }]
          env:
            - name: SPRING_DATASOURCE_URL
              value: "jdbc:mysql://mysql-db:3306/employee_db"
            - name: ADMIN_EMAIL
              value: "myname@1.com"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: ems-prod
spec:
  ports: [{ port: 8080, targetPort: 8080 }]
  selector: { app: ems-backend }
---
apiVersion: v1
kind: Service
metadata:
  name: ems-public-entry
  namespace: ems-prod
spec:
  type: LoadBalancer
  ports: [{ port: 80, targetPort: 80 }]
  selector: { app: ems-frontend }`
  },
  {
    name: 'EmployeeController.java',
    language: 'java',
    description: 'The JVM Controller mapping database procedures to enterprise network endpoints.',
    content: `package com.example.ems.controller;

import com.example.ems.model.Employee;
import com.example.ems.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody Employee employee) {
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email exists."));
        }
        employee.setIsAdmin(false);
        employee.setSalaryStatus("Pending");
        return new ResponseEntity<>(employeeRepository.save(employee), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employeeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}`
  }
];

export default function AdminDashboard({
  employeesList,
  rolesList,
  userProfile,
  onLogout,
  onUpdateSalaryStatus,
  onUpdateEmployeeSalary,
  onAddEmployee,
  onDeleteEmployee,
  onCreateRole
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'roles' | 'devops'>('roster');
  const [showChart, setShowChart] = useState(true);

  // Roll up salary analytics per role
  const chartData = React.useMemo(() => {
    const dataMap: Record<string, { total: number; count: number; min: number; max: number }> = {};
    
    // Group active employees by role
    employeesList.forEach(emp => {
      const roleName = emp.role || 'Unassigned';
      if (!dataMap[roleName]) {
        dataMap[roleName] = { total: 0, count: 0, min: Infinity, max: -Infinity };
      }
      dataMap[roleName].total += emp.salary;
      dataMap[roleName].count += 1;
      if (emp.salary < dataMap[roleName].min) dataMap[roleName].min = emp.salary;
      if (emp.salary > dataMap[roleName].max) dataMap[roleName].max = emp.salary;
    });

    // Transform to chart-friendly array
    return Object.entries(dataMap).map(([roleName, stats]) => ({
      role: roleName,
      average: Math.round(stats.total / stats.count),
      total: stats.total,
      headcount: stats.count,
      min: stats.min === Infinity ? 0 : stats.min,
      max: stats.max === -Infinity ? 0 : stats.max,
    })).sort((a, b) => b.average - a.average); // Sort by highest average salary first
  }, [employeesList]);

  // Roster Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState('60000');
  const [editingSalaryId, setEditingSalaryId] = useState<string | null>(null);
  const [editingSalaryVal, setEditingSalaryVal] = useState('');

  // Role Creator Controls
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');

  // DevOps File Viewer State
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedState, setCopiedState] = useState(false);

  // Stats Counters
  const totalPayroll = employeesList.reduce((acc, curr) => acc + curr.salary, 0);
  const paidCount = employeesList.filter(e => e.salaryStatus === SalaryStatus.PAID).length;
  const totalCount = employeesList.length;
  const percentPaid = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  // Search/Filter matching Logic
  const filteredEmployees = employeesList.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === '' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Export filtered employee salary data as a downloadable CSV file
  const handleExportCSV = () => {
    try {
      const csvHeaders = ['Employee ID', 'Name', 'Email', 'Role', 'Monthly Salary ($)', 'Status', 'Joined Date', 'Administrative'];
      const csvRows = filteredEmployees.map(emp => [
        `"${emp.uid}"`,
        `"${emp.name.replace(/"/g, '""')}"`,
        `"${emp.email.replace(/"/g, '""')}"`,
        `"${(emp.role || 'Unassigned').replace(/"/g, '""')}"`,
        emp.salary,
        `"${emp.salaryStatus}"`,
        `"${emp.joinedAt || ''}"`,
        `"${emp.isAdmin ? 'Yes' : 'No'}"`
      ]);
      
      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `payroll_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Error exporting CSV:', err);
    }
  };

  // Handle Salary Change triggers
  const handleToggleState = async (uid: string, current: SalaryStatus) => {
    let next: SalaryStatus = SalaryStatus.PENDING;
    if (current === SalaryStatus.PENDING) next = SalaryStatus.PROCESSING;
    else if (current === SalaryStatus.PROCESSING) next = SalaryStatus.PAID;
    await onUpdateSalaryStatus(uid, next);
  };

  const handleSaveSalaryChange = async (uid: string) => {
    const amt = Number(editingSalaryVal);
    if (!isNaN(amt) && amt >= 0) {
      await onUpdateEmployeeSalary(uid, amt);
    }
    setEditingSalaryId(null);
  };

  const startEditingSalary = (uid: string, currentAmt: number) => {
    setEditingSalaryId(uid);
    setEditingSalaryVal(currentAmt.toString());
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpRole) return;
    const ok = await onAddEmployee(newEmpName, newEmpEmail, newEmpRole, Number(newEmpSalary));
    if (ok) {
      setShowAddModal(false);
      setNewEmpName('');
      setNewEmpEmail('');
      setNewEmpRole('');
      setNewEmpSalary('60000');
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleError('');
    setRoleSuccess('');
    if (!newRoleName) {
      setRoleError('Role name is required.');
      return;
    }
    const ok = await onCreateRole(newRoleName, newRoleDesc);
    if (ok) {
      setRoleSuccess(`Role "${newRoleName}" registered and added to listings successfully!`);
      setNewRoleName('');
      setNewRoleDesc('');
    } else {
      setRoleError('A role with this exact name already exists.');
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName.split('/').pop() || fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 w-full" id="admin-dashboard-root">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-medium tracking-wide">HR ADMINISTRATOR PANEL</span>
            <h2 className="text-2xl font-bold tracking-tight">Corporate Command & Payroll Console</h2>
          </div>
          <div className="flex items-center gap-3">
            <span id="active-admin-tag" className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono uppercase font-semibold">
              ADMIN SECURE SESSION
            </span>
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white py-1.5 px-3.5 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Stat Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-sans uppercase font-medium">Headcount Directory</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight font-mono">{totalCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Total active on-boarded employees</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-sans uppercase font-medium">Monthly Payroll Expense</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight font-mono">
              ${totalPayroll.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Cumulative payroll settlement volume</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-sans uppercase font-medium">Custom Systems Roles</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight font-mono">{rolesList.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Departments and custom operational tiers</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-sans uppercase font-medium">Ledger Settlement Ratio</span>
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>{paidCount} Paid</span>
                <span>{percentPaid}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percentPaid}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Navigator */}
        <div className="flex border-b border-slate-800 gap-1.5">
          <button
            id="tab-roster-btn"
            onClick={() => setActiveTab('roster')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'roster' 
                ? 'border-emerald-500 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Employee Roster Directory
          </button>
          <button
            id="tab-roles-btn"
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'roles' 
                ? 'border-emerald-500 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Role Configurator
          </button>
          <button
            id="tab-devops-btn"
            onClick={() => setActiveTab('devops')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'devops' 
                ? 'border-emerald-500 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            DevOps & EKS Export
          </button>
        </div>

        {/* Tab 1: Employee Directory */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            
            {/* Salary Analysis Chart Section */}
            <div className="bg-slate-900 border border-slate-800/85 rounded-2xl p-5 shadow-xl overflow-hidden" id="admin-salary-chart-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">Corporate Salary Allocation Analysis</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Average monthly payroll value dynamically aggregated by internal operational departments</p>
                  </div>
                </div>
                <button
                  id="toggle-salary-chart-btn"
                  onClick={() => setShowChart(!showChart)}
                  className="flex items-center gap-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer font-mono"
                >
                  {showChart ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      HIDE ANALYTICS
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      SHOW ANALYTICS
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence initial={false}>
                {showChart && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {chartData.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No operational roles or employees registered to display salary analytics.
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="w-full h-80 min-h-[320px] pt-2" id="salary-chart-container">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData}
                              margin={{ top: 10, right: 10, left: 15, bottom: 20 }}
                            >
                              <defs>
                                <linearGradient id="salaryBarGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                  <stop offset="100%" stopColor="#059669" stopOpacity={0.12} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis
                                dataKey="role"
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                              />
                              <YAxis
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dx={-5}
                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-slate-950/95 border border-slate-800 p-4 rounded-xl shadow-2xl space-y-2 font-sans backdrop-blur-md">
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">{label}</p>
                                        <div className="h-px bg-slate-800 my-1.5" />
                                        <div className="space-y-1">
                                          <p className="text-[11px] text-slate-400 flex justify-between gap-6">
                                            <span>Headcount:</span>
                                            <span className="font-mono text-emerald-400 font-semibold">{data.headcount} {data.headcount === 1 ? 'employee' : 'employees'}</span>
                                          </p>
                                          <p className="text-[11px] text-slate-400 flex justify-between gap-6">
                                            <span>Average Salary:</span>
                                            <span className="font-mono text-white font-semibold">${data.average.toLocaleString()}</span>
                                          </p>
                                          <p className="text-[11px] text-slate-400 flex justify-between gap-6">
                                            <span>Salary Range:</span>
                                            <span className="font-mono text-slate-300">${data.min.toLocaleString()} - ${data.max.toLocaleString()}</span>
                                          </p>
                                        </div>
                                        <div className="border-t border-slate-850 pt-1.5 mt-1.5">
                                          <p className="text-[10px] text-slate-500 font-mono text-right">
                                            Role Payroll Volume: ${data.total.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                                cursor={{ fill: '#1e293b', opacity: 0.25 }}
                              />
                              <Bar dataKey="average" radius={[4, 4, 0, 0]} maxBarSize={45}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill="url(#salaryBarGradient)" />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Summary metrics overlay */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/30 p-3.5 border border-slate-850 rounded-xl" id="chart-summary-overlay">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Top Remunerated Tier</span>
                            <div className="text-xs font-semibold text-white truncate">
                              {chartData[0]?.role || 'N/A'}
                            </div>
                            <div className="text-[10px] font-mono text-emerald-400">
                              Avg. ${chartData[0]?.average.toLocaleString() || 0}/mo
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Entry Remunerated Tier</span>
                            <div className="text-xs font-semibold text-white truncate">
                              {chartData[chartData.length - 1]?.role || 'N/A'}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              Avg. ${chartData[chartData.length - 1]?.average.toLocaleString() || 0}/mo
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Operational Divisions</span>
                            <div className="text-xs font-semibold text-white">
                              {chartData.length} distinct departments
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Accounting classification
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Ledger Synchronization</span>
                            <div className="text-xs font-semibold text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active Telemetry
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Reflecting roster updates
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter and Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/30 p-4 border border-slate-800/60 rounded-xl">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    id="roster-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employees by name or email..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-sans"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    id="roster-role-filter"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-400 focus:outline-none focus:border-slate-700"
                  >
                    <option value="">All Tiers</option>
                    {rolesList.map(type => (
                      <option key={type.id} value={type.roleName}>{type.roleName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="roster-export-csv-btn"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white py-1.8 px-3.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  title="Export current filtered roster as CSV"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Export CSV
                </button>

                <button
                  id="roster-add-btn"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white py-1.8 px-3.5 rounded-lg text-xs font-semibold border border-slate-700 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee Record
                </button>
              </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="roster-table-view">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                    <th className="py-4 px-5">Personnel Name & Email</th>
                    <th className="py-4 px-5">Appointed Role</th>
                    <th className="py-4 px-5">Salary Rate (Monthly)</th>
                    <th className="py-4 px-5">Disbursement State (Click status to transition)</th>
                    <th className="py-4 px-5 text-right">Administrative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                        No employees found matching filter criteria. Register new accounts in sign-up pane or press "Add Employee".
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr id={`emp-row-${emp.uid}`} key={emp.uid} className="hover:bg-slate-900/35 transition duration-100">
                        <td className="py-3 px-5">
                          <div className="font-semibold text-white">{emp.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.email}</div>
                        </td>
                        <td className="py-3 px-5">
                          <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded font-medium border border-slate-700/55">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3 px-5 font-mono">
                          {editingSalaryId === emp.uid ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">$</span>
                              <input
                                id={`edit-salary-box-${emp.uid}`}
                                type="number"
                                value={editingSalaryVal}
                                onChange={(e) => setEditingSalaryVal(e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded py-0.5 px-1.5 text-xs text-white"
                              />
                              <button
                                id={`save-salary-btn-${emp.uid}`}
                                onClick={() => handleSaveSalaryChange(emp.uid)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-1 px-2 rounded cursor-pointer font-sans font-semibold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>${emp.salary.toLocaleString()}</span>
                              <button
                                id={`trigger-edit-salary-${emp.uid}`}
                                onClick={() => startEditingSalary(emp.uid, emp.salary)}
                                className="text-[10px] text-slate-500 hover:text-emerald-400 underline font-sans"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-5">
                          <button
                            id={`status-toggle-btn-${emp.uid}`}
                            onClick={() => handleToggleState(emp.uid, emp.salaryStatus)}
                            className="text-left group focus:outline-none"
                            title="Click to transition to next stage"
                          >
                            {emp.salaryStatus === SalaryStatus.PAID && (
                              <div className="inline-flex items-center gap-1 cursor-pointer px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-[11px] font-semibold transition group-hover:bg-emerald-500/20">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                Paid
                              </div>
                            )}
                            {emp.salaryStatus === SalaryStatus.PROCESSING && (
                              <div className="inline-flex items-center gap-1 cursor-pointer px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md text-[11px] font-semibold transition group-hover:bg-blue-500/20">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Processing
                              </div>
                            )}
                            {emp.salaryStatus === SalaryStatus.PENDING && (
                              <div className="inline-flex items-center gap-1 cursor-pointer px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md text-[11px] font-semibold transition group-hover:bg-amber-500/20">
                                <Clock className="w-3.5 h-3.5" />
                                Pending
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <button
                            id={`delete-emp-btn-${emp.uid}`}
                            onClick={() => onDeleteEmployee(emp.uid)}
                            disabled={emp.isAdmin}
                            className="inline-flex items-center p-1.5 bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-900/30 duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={emp.isAdmin ? "Admins cannot be deleted" : "Delete record"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Helper */}
            <div className="text-[11px] text-slate-500 font-sans text-center">
              💡 Tip: Click on any employee's <b>Disbursement State</b> badge to cycle it through: <span className="text-amber-500 font-semibold">Pending</span> ➔ <span className="text-blue-400 font-semibold">Processing</span> ➔ <span className="text-emerald-400 font-semibold">Paid</span>.
            </div>

          </div>
        )}

        {/* Tab 2: Custom Role Configurator */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Role Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
              <h3 className="text-sm font-bold text-white mb-4">Register New System Role</h3>
              <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
                {roleError && (
                  <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-400 text-xs flex gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{roleError}</span>
                  </div>
                )}
                {roleSuccess && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs flex gap-2">
                    <BadgeCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{roleSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Role Display Code name
                  </label>
                  <input
                    id="new-role-name-input"
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => { setNewRoleName(e.target.value); setRoleError(''); setRoleSuccess(''); }}
                    placeholder="E.g. Lead Devops Architect"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Functional Responsibilities (Description)
                  </label>
                  <textarea
                    id="new-role-desc-input"
                    rows={3}
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Brief scope of responsibilities for custom category..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-600 resize-none"
                  />
                </div>

                <button
                  id="create-role-submit-btn"
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-xs border border-slate-700 shadow cursor-pointer transition transform active:scale-95"
                >
                  Register Profile Role Category
                </button>
              </form>
            </div>

            {/* Existing Roles List */}
            <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Active System Roles Directory</h3>
                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px] rounded">
                  {rolesList.length} Total
                </span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
                {rolesList.map((role) => (
                  <div key={role.id} className="p-4 bg-slate-950/15 hover:bg-slate-950/30 transition flex items-start gap-4">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-400">
                      <Layers className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white">{role.roleName}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        {role.description || "No description provided for organizational template."}
                      </p>
                      <span className="text-[9px] text-slate-600 font-mono mt-2 block uppercase">
                        Role Registered on: {new Date(role.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: DevOps & Export */}
        {activeTab === 'devops' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            
            {/* Left Nav menu of Code Files */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">DevOps Configurations</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Production deployment manifests requested for full stack Java/Spring + MySQL docker integration.
                </p>
              </div>
              <div className="space-y-1.5 flex flex-col">
                {EXPORT_FILES.map((file, idx) => (
                  <button
                    id={`select-export-file-${idx}`}
                    key={file.name}
                    onClick={() => { setSelectedFileIndex(idx); setCopiedState(false); }}
                    className={`text-left text-xs py-2.5 px-3.5 rounded-lg border font-mono transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      selectedFileIndex === idx
                        ? 'bg-slate-850 border-emerald-500/40 text-emerald-400 font-semibold'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{file.name}</span>
                    <span className="text-[10px] text-slate-600 uppercase font-sans font-medium">/{file.language}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Display area Container with Code syntax look */}
            <div className="col-span-1 lg:col-span-3 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden h-[500px]">
              
              {/* File Title Bar */}
              <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-850 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white font-mono break-all">{EXPORT_FILES[selectedFileIndex].name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{EXPORT_FILES[selectedFileIndex].description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    id="copy-code-btn"
                    onClick={() => handleCopyCode(EXPORT_FILES[selectedFileIndex].content)}
                    className="p-1.8 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedState ? (
                      <>
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <button
                    id="download-code-btn"
                    onClick={() => handleDownloadFile(EXPORT_FILES[selectedFileIndex].name, EXPORT_FILES[selectedFileIndex].content)}
                    className="p-1.8 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/35 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Code viewer workspace */}
              <div className="flex-1 overflow-auto p-5 text-slate-300 font-mono text-xs leading-relaxed selection:bg-emerald-600/30 whitespace-pre">
                {EXPORT_FILES[selectedFileIndex].content}
              </div>

            </div>

          </div>
        )}

        {/* Modal: Add Employee */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50Close mb-10"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl"
              >
                <h3 className="text-sm font-bold text-white mb-4">Add Employee Record</h3>
                <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                    <input
                      id="modal-emp-name"
                      type="text"
                      required
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      placeholder="Jane Austin"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                    <input
                      id="modal-emp-email"
                      type="email"
                      required
                      value={newEmpEmail}
                      onChange={(e) => setNewEmpEmail(e.target.value)}
                      placeholder="jane@corp-domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Appointed Role</label>
                    <select
                      id="modal-emp-role"
                      required
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
                    >
                      <option value="">-- Choose Assigned Role --</option>
                      {rolesList.map(item => (
                        <option id={`modal-role-opt-${item.id}`} key={item.id} value={item.roleName}>{item.roleName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Monthly Salary Rate (USD)</label>
                    <input
                      id="modal-emp-salary"
                      type="number"
                      required
                      min="0"
                      value={newEmpSalary}
                      onChange={(e) => setNewEmpSalary(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-slate-600 font-mono"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      id="modal-cancel-btn"
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold py-2 rounded-lg text-xs border border-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="modal-submit-btn"
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-xs border border-emerald-500 shadow transition cursor-pointer"
                    >
                      Add Profile Record
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
