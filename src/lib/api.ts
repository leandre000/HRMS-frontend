/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Add axios interceptor to always include Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth');
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear local/session storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally, redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path: string, options: any = {}) {
  try {
    const method = options.method ? options.method.toLowerCase() : 'get';
    const url = `${API_BASE_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    let response;
    if (method === 'get') {
      response = await axios.get(url, { headers, params: options.params });
    } else if (method === 'delete') {
      response = await axios.delete(url, { headers });
    } else {
      response = await axios[method](url, options.body, { headers });
    }
    return response.data;
  } catch (err: any) {
    // Try to throw a consistent error object
    if (err.response && err.response.data) {
      throw err.response.data;
    }
    throw err;
  }
}

//--Employee api--
export const getEmployees = () => apiFetch("/employees");

export const addEmployee = (data: any) =>
  apiFetch("/employees", { method: "POST", body: JSON.stringify(data) });
export const updateEmployee = (id: string, data: any) =>
  apiFetch(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEmployee = (id: string) =>
  apiFetch(`/employees/${id}`, { method: "DELETE" });
export const getTeamMembers = (managerId: string) => apiFetch(`/employees?manager=${managerId}`);

// --- Users API ---
export const getUsers = () => apiFetch("/users");
export const getUser = (id: string) => apiFetch(`/users/${id}`);
//export const addUser = (data: any) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (id: string, data: any) => apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteUser = (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" });



// --- Leave API ---
export const getLeaves = () => apiFetch("/leave");
export const requestLeave = (data: any) =>
  apiFetch("/leave/request", { method: "POST", body: JSON.stringify(data) });
export const approveLeave = (id: string) =>
  apiFetch(`/leave/${id}/approve`, { method: "PUT" });
export const rejectLeave = (id: string) =>
  apiFetch(`/leave/${id}/reject`, { method: "PUT" });
export const getMyLeaves = () => apiFetch("/leave/my-requests");
export const getMyLeaveRequests = () => apiFetch('/leave/my-requests');

// --- Payroll API ---
export const getPayrolls = () => apiFetch("/payroll");
export const getPayroll = (id: string) => apiFetch(`/payroll/${id}`);
export const addPayroll = (data: any) =>
  apiFetch("/payroll", { method: "POST", body: JSON.stringify(data) });
export const updatePayroll = (id: string, data: any) =>
  apiFetch(`/payroll/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePayroll = (id: string) =>
  apiFetch(`/payroll/${id}`, { method: "DELETE" });
export const disbursePayroll = (id: string) =>
  apiFetch(`/payroll/${id}/disburse`, { method: "POST" });
export const getPayslips = (userId: string) => apiFetch(`/payroll/employee/${userId}`);
export const getEmployeePayroll = (userId: string) => apiFetch(`/payroll/employee/${userId}`);
export const simulatePayroll = (params: Record<string, any>) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/payroll/simulate?${query}`);
};

// Add similar functions for payroll, leave, announcements, etc. as needed.

// --- Announcements API ---
export const getAnnouncements = () => apiFetch("/announcements");
export const getAnnouncement = (id: string) => apiFetch(`/announcements/${id}`);
export const addAnnouncement = (data: any) =>
  apiFetch("/announcements", { method: "POST", body: JSON.stringify(data) });
export const deleteAnnouncement = (id: string) =>
  apiFetch(`/announcements/${id}`, { method: "DELETE" });

// --- Training API ---
export const getCourses = () => apiFetch("/training/courses");
export const addCourse = (data: any) =>
  apiFetch("/training/courses", { method: "POST", body: JSON.stringify(data) });
export const updateCourse = (id: string, data: any) =>
  apiFetch(`/training/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCourse = (id: string) =>
  apiFetch(`/training/courses/${id}`, { method: "DELETE" });
export const enrollInCourse = (data: any) =>
  apiFetch("/training/enroll", { method: "POST", body: JSON.stringify(data) });
export const getEnrollments = () => apiFetch("/training/enrollments");
export const updateProgress = (id: string, data: any) =>
  apiFetch(`/training/progress/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const getTrainingStats = () => apiFetch("/training/stats");

// --- Performance Review API ---
export const getReviews = () => apiFetch("/performance-review");
export const addReview = (data: any) =>
  apiFetch("/performance-review", { method: "POST", body: JSON.stringify(data) });
export const updateReview = (id: string, data: any) =>
  apiFetch(`/performance-review/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteReview = (id: string) =>
  apiFetch(`/performance-review/${id}`, { method: "DELETE" });

// --- Survey API ---
export const getSurveys = () => apiFetch("/surveys");
export const submitSurvey = (data: any) =>
  apiFetch("/survey", { method: "POST", body: JSON.stringify(data) });

// --- Messages API ---
export const getMessages = () => apiFetch("/messages");
export const getMessage = (id: string) => apiFetch(`/messages/${id}`);
export const sendMessage = (data: any) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(data) });
export const deleteMessage = (id: string) => apiFetch(`/messages/${id}`, { method: 'DELETE' });

// --- Threads API ---
export const getThreads = () => apiFetch('/threads');
export const getThread = (id: string) => apiFetch(`/threads/${id}`);
export const createThread = (data: any) => apiFetch('/threads', { method: 'POST', body: JSON.stringify(data) });
export const updateThread = (id: string, data: any) => apiFetch(`/threads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteThread = (id: string) => apiFetch(`/threads/${id}`, { method: 'DELETE' });

// --- Reports API ---
export const getReports = () => apiFetch('/reports');
export const createReport = (data: any) => apiFetch('/reports', { method: 'POST', body: JSON.stringify(data) });
export const getHiringReport = () => apiFetch('/reports/hiring');
export const getTurnoverReport = () => apiFetch('/reports/turnover');
export const getPayrollSummaryReport = () => apiFetch('/reports/payroll-summary');
export const getDiversityReport = () => apiFetch('/reports/diversity');
export const getCustomReport = (params: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/reports/custom${query}`);
};
export const exportReportPDF = (data: any) => apiFetch('/reports/export/pdf', { method: 'POST', body: JSON.stringify(data) });
export const exportReportExcel = (data: any) => apiFetch('/reports/export/excel', { method: 'POST', body: JSON.stringify(data) });

// --- Activity Log API ---
export const getActivityLogs = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/activity-log${query}`);
};
export const getSystemStats = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/activity-log/system/stats${query}`);
};
export const getRecentSystemActivities = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/activity-log/system/recent${query}`);
};
export const getSystemActivityByResource = (resource: string, params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/activity-log/system/resource/${resource}${query}`);
};
// --- Performance Review API (already exists, but add for clarity) ---
export const getPerformanceReviews = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/performance-review${query}`);
};
export const addPerformaceReview = (data: any) => apiFetch("/performance-review", { method: "POST", body: JSON.stringify(data) });
export const updatePerformaceReview = (id: string, data: any) => apiFetch(`/performance-review/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePerformaceReview = (id: string) => apiFetch(`/performance-review/${id}`, { method: "DELETE" });

// --- Training Enrollments API ---
export const getTrainingEnrollments = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/training/enrollments${query}`);
};



// --- Employee Documents API ---
export const getEmployeeDocuments = (employeeId: string) => apiFetch(`/employees/${employeeId}/documents`);
export const uploadEmployeeDocuments = (employeeId: string, formData: FormData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_BASE_URL}/employees/${employeeId}/documents`, formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(response => response.data);
};
export const listEmployeeDocuments = (employeeId: string) => apiFetch(`/employees/${employeeId}/documents`);
// For download, just fetch the fileUrl provided in the document object
export const deleteEmployeeDocument = (employeeId: string, documentId: string) => apiFetch(`/employees/${employeeId}/documents/${documentId}`, { method: 'DELETE' });

// --- Succession Planning API ---
export const getSuccessionPlans = () => apiFetch('/succession');
export const getSuccessionPlan = (id: string) => apiFetch(`/succession/${id}`);
export const createSuccessionPlan = (data: any) => apiFetch('/succession', { method: 'POST', body: JSON.stringify(data) });
export const updateSuccessionPlan = (id: string, data: any) => apiFetch(`/succession/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSuccessionPlan = (id: string) => apiFetch(`/succession/${id}`, { method: 'DELETE' });
export const addSuccessionCandidate = (id: string, data: any) => apiFetch(`/succession/${id}/add-candidate`, { method: 'POST', body: JSON.stringify(data) });
export const removeSuccessionCandidate = (id: string, data: any) => apiFetch(`/succession/${id}/remove-candidate`, { method: 'POST', body: JSON.stringify(data) });

// --- Notifications API ---
export const getNotifications = () => apiFetch('/notifications');
export const createNotification = (data: any) => apiFetch('/notifications', { method: 'POST', body: JSON.stringify(data) });
export const markNotificationRead = (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
export const deleteNotification = (id: string) => apiFetch(`/notifications/${id}`, { method: 'DELETE' });

export const getJobPostings = () => apiFetch('/jobs');
export const getApplications = () => apiFetch('/applications');

export const getInterviews = () => apiFetch('/interviews');

// --- Offer Management API ---
export const getOffers = () => apiFetch('/offers');
export const createOffer = (data: any) => apiFetch('/offers', { method: 'POST', body: JSON.stringify(data) });
export const updateOffer = (id: string, data: any) => apiFetch(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const withdrawOffer = (id: string) => apiFetch(`/offers/${id}`, { method: 'DELETE' });

// --- Compliance API ---
export const getPolicies = () => apiFetch('/compliance/policies');
export const getPolicy = (id: string) => apiFetch(`/compliance/policies/${id}`);
export const createPolicy = (data: any) => apiFetch('/compliance/policies', { method: 'POST', body: JSON.stringify(data) });
export const updatePolicy = (id: string, data: any) => apiFetch(`/compliance/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePolicy = (id: string) => apiFetch(`/compliance/policies/${id}`, { method: 'DELETE' });

export const getAudits = () => apiFetch('/compliance/audits');
export const getAudit = (id: string) => apiFetch(`/compliance/audits/${id}`);
export const createAudit = (data: any) => apiFetch('/compliance/audits', { method: 'POST', body: JSON.stringify(data) });
export const updateAudit = (id: string, data: any) => apiFetch(`/compliance/audits/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAudit = (id: string) => apiFetch(`/compliance/audits/${id}`, { method: 'DELETE' });

export const getIncidents = () => apiFetch('/compliance/incidents');
export const getIncident = (id: string) => apiFetch(`/compliance/incidents/${id}`);
export const createIncident = (data: any) => apiFetch('/compliance/incidents', { method: 'POST', body: JSON.stringify(data) });
export const updateIncident = (id: string, data: any) => apiFetch(`/compliance/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteIncident = (id: string) => apiFetch(`/compliance/incidents/${id}`, { method: 'DELETE' });

// --- Benefits API ---
export const getBenefits = (employeeId?: string) => apiFetch(employeeId ? `/benefits?employee=${employeeId}` : '/benefits');
export const getBenefit = (id: string) => apiFetch(`/benefits/${id}`);
export const createBenefit = (data: any) => apiFetch('/benefits', { method: 'POST', body: JSON.stringify(data) });
export const updateBenefit = (id: string, data: any) => apiFetch(`/benefits/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBenefit = (id: string) => apiFetch(`/benefits/${id}`, { method: 'DELETE' });

// --- Risk Assessment API ---
export const getRiskAssessments = () => apiFetch('/risk-assessments');
export const getRiskAssessment = (id: string) => apiFetch(`/risk-assessments/${id}`);
export const createRiskAssessment = (data: any) => apiFetch('/risk-assessments', { method: 'POST', body: JSON.stringify(data) });
export const updateRiskAssessment = (id: string, data: any) => apiFetch(`/risk-assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRiskAssessment = (id: string) => apiFetch(`/risk-assessments/${id}`, { method: 'DELETE' });

// --- Analytics API ---
// Example: Get analytics summary (users, payroll, leave, etc.)
export const getAnalyticsSummary = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/analytics/summary${query}`);
};

// --- Audit Logs API ---
// Get all audit logs (with optional filters)
export const getAllAuditLogs = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/activity-log${query}`);
};

// Get audit log stats (total events, failed actions, unique users, etc.)
export const getAuditLogStats = (params?: any) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/activity-log/stats${query}`);
};

// --- Backup API ---
export const getBackups = () => apiFetch('/backups');
export const createBackup = (data: any) => apiFetch('/backups', { method: 'POST', body: JSON.stringify(data) });
export const restoreBackup = (id: string) => apiFetch(`/backups/${id}/restore`, { method: 'POST' });
export const deleteBackup = (id: string) => apiFetch(`/backups/${id}`, { method: 'DELETE' });

export async function attritionCheck(employeeData: any, token: string) {
  const res = await axios.post(
    `${API_BASE_URL}/ai/attrition`,
    { employeeData },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function chatAssistant(message: string, token: string) {
  const res = await axios.post(
    `${API_BASE_URL}/ai/chat`,
    { message },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function resumeMatch(resume: string, jobDescription: string, token: string) {
  const res = await axios.post(
    `${API_BASE_URL}/ai/resume-match`,
    { resume, jobDescription },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function sentimentAnalysis(text: string, token: string) {
  const res = await axios.post(
    `${API_BASE_URL}/ai/sentiment`,
    { text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function trainingRecommend(employeeData: any, token: string) {
  const res = await axios.post(
    `${API_BASE_URL}/ai/training`,
    { employeeData },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// Centralized logout function
export function logout() {
  localStorage.removeItem('auth');
  localStorage.removeItem('user');
}
