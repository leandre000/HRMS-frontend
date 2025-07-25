/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManagerPortalLayout } from "@/components/layouts/ManagerPortalLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { updateAttendance, issueWarning, approveOvertime, exportAttendanceReport } from '@/lib/api';

const translations = {
  en: {
    attendance: "Attendance",
    monitor: "Monitor team attendance and working hours",
    viewCalendar: "View Calendar",
    calendar: "Calendar",
    presentToday: "Present Today",
    attendanceRate: "83% attendance",
    lateArrivals: "Late Arrivals",
    lateRate: "8% of team",
    absent: "Absent",
    absentRate: "8% of team",
    avgHours: "Avg Hours",
    hoursPerDay: "Hours per day",
    todaysAttendance: "Today's Attendance",
    realTime: "Real-time attendance tracking for your team",
    noCheckIn: "No check-in",
    hoursWorked: "Hours worked",
    details: "Details",
    weeklyTrends: "Weekly Attendance Trends",
    patterns: "Attendance patterns throughout the week",
    present: "Present",
    late: "Late",
    absentLabel: "Absent",
    attendancePolicies: "Attendance Policies",
    currentPolicies: "Current attendance rules and policies",
    workingHours: "Working Hours",
    standardHours: "• Standard hours: 9:00 AM - 5:30 PM",
    lunchBreak: "• Lunch break: 1 hour",
    gracePeriod: "• Grace period: 15 minutes",
    minimumHours: "• Minimum hours: 8 hours/day",
    leavePolicies: "Leave Policies",
    advanceNotice: "• Advance notice required",
    managerApproval: "• Manager approval needed",
    emergencyLeave: "• Emergency leave allowed",
    documentation: "• Documentation may be required",
    managementActions: "Management Actions",
    tools: "Tools for managing team attendance",
    monthlyReport: "Monthly Report",
    timeAdjustments: "Time Adjustments",
    issueWarnings: "Issue Warnings",
    approveOvertime: "Approve Overtime",
  },
  fr: {
    attendance: "Présence",
    monitor: "Surveillez la présence et les heures de travail de l'équipe",
    viewCalendar: "Voir le calendrier",
    calendar: "Calendrier",
    presentToday: "Présents aujourd'hui",
    attendanceRate: "83% de présence",
    lateArrivals: "Retards",
    lateRate: "8% de l'équipe",
    absent: "Absent",
    absentRate: "8% de l'équipe",
    avgHours: "Moy. heures",
    hoursPerDay: "Heures par jour",
    todaysAttendance: "Présence du jour",
    realTime: "Suivi de présence en temps réel pour votre équipe",
    noCheckIn: "Pas d'enregistrement",
    hoursWorked: "Heures travaillées",
    details: "Détails",
    weeklyTrends: "Tendances de présence hebdomadaire",
    patterns: "Modèles de présence tout au long de la semaine",
    present: "Présent",
    late: "Retard",
    absentLabel: "Absent",
    attendancePolicies: "Politiques de présence",
    currentPolicies: "Règles et politiques de présence actuelles",
    workingHours: "Heures de travail",
    standardHours: "• Heures standard : 9h00 - 17h30",
    lunchBreak: "• Pause déjeuner : 1 heure",
    gracePeriod: "• Période de grâce : 15 minutes",
    minimumHours: "• Heures minimales : 8 heures/jour",
    leavePolicies: "Politiques de congé",
    advanceNotice: "• Préavis requis",
    managerApproval: "• Approbation du manager requise",
    emergencyLeave: "• Congé d'urgence autorisé",
    documentation: "• Documentation peut être requise",
    managementActions: "Actions de gestion",
    tools: "Outils pour gérer la présence de l'équipe",
    monthlyReport: "Rapport mensuel",
    timeAdjustments: "Ajustements d'horaires",
    issueWarnings: "Émettre des avertissements",
    approveOvertime: "Approuver les heures sup.",
  },
};

const Attendance = () => {
  const { language } = useLanguage();
  const t = (key: keyof (typeof translations)["en"]) => translations[language][key];

  // State for each section
  const [overview, setOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [weeklyStatsLoading, setWeeklyStatsLoading] = useState(true);
  const [weeklyStatsError, setWeeklyStatsError] = useState<string | null>(null);

  const { user } = useAuth();
  const managerId = user?._id;

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ employee: '', date: '', checkIn: '', checkOut: '', hours: '' });
  const [warningForm, setWarningForm] = useState({ employee: '', reason: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setOverviewLoading(true);
    setOverviewError(null);
    apiFetch(`/employees/manager/attendance/overview?manager=${managerId}`)
      .then((res) => setOverview(res.data))
      .catch(() => setOverviewError("Failed to load attendance overview."))
      .finally(() => setOverviewLoading(false));

    setAttendanceLoading(true);
    setAttendanceError(null);
    apiFetch(`/employees/manager/attendance/today?manager=${managerId}`)
      .then((res) => setAttendanceData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAttendanceError("Failed to load today's attendance."))
      .finally(() => setAttendanceLoading(false));

    setWeeklyStatsLoading(true);
    setWeeklyStatsError(null);
    apiFetch(`/employees/manager/attendance/weekly-trends?manager=${managerId}`)
      .then((res) => setWeeklyStats(Array.isArray(res.data) ? res.data : []))
      .catch(() => setWeeklyStatsError("Failed to load weekly trends."))
      .finally(() => setWeeklyStatsLoading(false));
  }, [managerId]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await updateAttendance(adjustForm);
      toast({ title: 'Attendance adjusted' });
      setShowAdjustModal(false);
      setAdjustForm({ employee: '', date: '', checkIn: '', checkOut: '', hours: '' });
      // Optionally refetch attendance data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to adjust attendance', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };
  const handleWarningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await issueWarning(warningForm);
      toast({ title: 'Warning issued' });
      setShowWarningModal(false);
      setWarningForm({ employee: '', reason: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to issue warning', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };
  const handleApproveOvertime = async (employeeId: string, date: string) => {
    try {
      await approveOvertime({ employee: employeeId, date });
      toast({ title: 'Overtime approved' });
      // Optionally refetch attendance data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to approve overtime', variant: 'destructive' });
    }
  };
  const handleExportReport = async () => {
    try {
      const blob = await exportAttendanceReport();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast({ title: 'Report exported' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to export report', variant: 'destructive' });
    }
  };

  return (
    <ManagerPortalLayout>
      <div className="space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("attendance")}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("monitor")}
            </p>
          </div>
          <Button className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{t("viewCalendar")}</span>
            <span className="sm:hidden">{t("calendar")}</span>
          </Button>
        </div>

        {/* Attendance Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {overviewLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse h-24" />
            ))
          ) : overviewError ? (
            <div className="col-span-4 text-red-500 text-sm">{overviewError}</div>
          ) : overview ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">{t("presentToday")}</CardTitle>
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-green-600">{overview.presentToday}</div>
                  <p className="text-xs text-muted-foreground">{t("attendanceRate")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">{t("lateArrivals")}</CardTitle>
                  <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-yellow-600">{overview.lateArrivals}</div>
                  <p className="text-xs text-muted-foreground">{t("lateRate")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">{t("absent")}</CardTitle>
                  <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-red-600">{overview.absent}</div>
                  <p className="text-xs text-muted-foreground">{t("absentRate")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">{t("avgHours")}</CardTitle>
                  <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{overview.avgHours}</div>
                  <p className="text-xs text-muted-foreground">{t("hoursPerDay")}</p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{t("todaysAttendance")}</CardTitle>
            <CardDescription className="text-sm">{t("realTime")}</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <div className="animate-pulse h-8 w-full bg-muted rounded" />
            ) : attendanceError ? (
              <div className="text-xs text-red-500">{attendanceError}</div>
            ) : Array.isArray(attendanceData) && attendanceData.length === 0 ? (
              <div className="text-muted-foreground text-sm">No attendance data found.</div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {attendanceData.map((attendance) => (
                  <div key={attendance.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">{attendance.name.split(" ").map((n: string) => n[0]).join("")}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{attendance.name}</h3>
                        <p className="text-sm text-muted-foreground">{attendance.checkIn !== "-" ? `${attendance.checkIn} - ${attendance.checkOut}` : t("noCheckIn")}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium">{attendance.hoursWorked}h</p>
                      <p className="text-xs text-muted-foreground">{t("hoursWorked")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={attendance.status === "Present" ? "default" : attendance.status === "Late" ? "secondary" : "destructive"} className="text-xs">{attendance.status}</Badge>
                      <Button onClick={() => handleApproveOvertime(attendance.employeeId, attendance.date)} variant="outline" size="sm">Approve Overtime</Button>
                      <Button variant="outline" size="sm" className="text-xs">{t("details")}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{t("weeklyTrends")}</CardTitle>
            <CardDescription>{t("patterns")}</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyStatsLoading ? (
              <div className="animate-pulse h-8 w-full bg-muted rounded" />
            ) : weeklyStatsError ? (
              <div className="text-xs text-red-500">{weeklyStatsError}</div>
            ) : Array.isArray(weeklyStats) && weeklyStats.length === 0 ? (
              <div className="text-muted-foreground text-sm">No weekly stats found.</div>
            ) : (
              <div className="space-y-4">
                {weeklyStats.map((day, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="font-medium w-full sm:w-20">{day.day}</div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-8 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">{t("present")}: {day.present}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">{t("late")}: {day.late}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">{t("absentLabel")}: {day.absent}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-right">{Math.round((day.present / (day.present + day.late + day.absent)) * 100)}%</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {t("attendancePolicies")}
            </CardTitle>
            <CardDescription>{t("currentPolicies")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">{t("workingHours")}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t("standardHours")}</li>
                  <li>{t("lunchBreak")}</li>
                  <li>{t("gracePeriod")}</li>
                  <li>{t("minimumHours")}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("leavePolicies")}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t("advanceNotice")}</li>
                  <li>{t("managerApproval")}</li>
                  <li>{t("emergencyLeave")}</li>
                  <li>{t("documentation")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {t("managementActions")}
            </CardTitle>
            <CardDescription>{t("tools")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Calendar className="h-6 w-6" />
                <span className="text-xs text-center">
                  {t("monthlyReport")}
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Clock className="h-6 w-6" />
                <span className="text-xs text-center">
                  {t("timeAdjustments")}
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <AlertTriangle className="h-6 w-6" />
                <span className="text-xs text-center">
                  {t("issueWarnings")}
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-xs text-center">
                  {t("approveOvertime")}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Time Adjustment</DialogTitle></DialogHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-3">
            <div>
              <label className="block font-medium mb-1">Employee</label>
              <Input value={adjustForm.employee} onChange={e => setAdjustForm(f => ({ ...f, employee: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-medium mb-1">Date</label>
              <Input type="date" value={adjustForm.date} onChange={e => setAdjustForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-medium mb-1">Check In</label>
              <Input value={adjustForm.checkIn} onChange={e => setAdjustForm(f => ({ ...f, checkIn: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-medium mb-1">Check Out</label>
              <Input value={adjustForm.checkOut} onChange={e => setAdjustForm(f => ({ ...f, checkOut: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-medium mb-1">Hours</label>
              <Input value={adjustForm.hours} onChange={e => setAdjustForm(f => ({ ...f, hours: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>{formLoading ? 'Submitting...' : 'Submit'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Warning</DialogTitle></DialogHeader>
          <form onSubmit={handleWarningSubmit} className="space-y-3">
            <div>
              <label className="block font-medium mb-1">Employee</label>
              <Input value={warningForm.employee} onChange={e => setWarningForm(f => ({ ...f, employee: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-medium mb-1">Reason</label>
              <Input value={warningForm.reason} onChange={e => setWarningForm(f => ({ ...f, reason: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>{formLoading ? 'Submitting...' : 'Submit'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ManagerPortalLayout>
  );
};

export default Attendance;
