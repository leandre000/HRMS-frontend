/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPortalLayout } from "@/components/layouts/AdminPortalLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Download, Filter, Search, Calendar } from "lucide-react";
import { getAllAuditLogs } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { getUser } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const translations = {
  en: {
    auditLogs: "Audit Logs",
    auditLogsDesc: "Complete user activity logging for compliance auditing",
    exportLogs: "Export Logs",
    export: "Export",
    totalEvents: "Total Events",
    last30Days: "Last 30 days",
    failedActions: "Failed Actions",
    failureRate: "0.8% failure rate",
    uniqueUsers: "Unique Users",
    activeUsers: "Active users",
    complianceScore: "Compliance Score",
    gdprCompliant: "GDPR compliant",
    filterAuditLogs: "Filter Audit Logs",
    filterDesc: "Search and filter audit logs by various criteria",
    searchLogs: "Search logs...",
    allActions: "All Actions",
    loginLogout: "Login/Logout",
    userManagement: "User Management",
    settingsChanges: "Settings Changes",
    dataExport: "Data Export",
    allUsers: "All Users",
    administrators: "Administrators",
    hrManagers: "HR Managers",
    managers: "Managers",
    auditLogEntries: "Audit Log Entries",
    auditLogEntriesDesc:
      "Detailed log of all system activities and user actions",
    timestamp: "Timestamp",
    user: "User",
    action: "Action",
    details: "Details",
    ipAddress: "IP Address",
    status: "Status",
    gdprPrivacy: "GDPR & Privacy Compliance",
    gdprPrivacyDesc: "Data privacy tools and compliance monitoring",
    dataEncryption: "Data Encryption",
    dataEncryptionDesc: "All data encrypted at rest",
    accessControls: "Access Controls",
    accessControlsDesc: "Role-based permissions",
    auditTrail: "Audit Trail",
    auditTrailDesc: "Complete activity logging",
    dataSubjectRequests: "Data Subject Requests",
    dataRequests: "Data Requests",
    privacyImpactAssessment: "Privacy Impact Assessment",
    privacyAssessment: "Privacy Assessment",
    complianceReport: "Compliance Report",
    ip: "IP",
  },
  fr: {
    auditLogs: "Journaux d'audit",
    auditLogsDesc: "Journalisation complète des activités pour la conformité",
    exportLogs: "Exporter les journaux",
    export: "Exporter",
    totalEvents: "Événements totaux",
    last30Days: "30 derniers jours",
    failedActions: "Actions échouées",
    failureRate: "Taux d'échec 0,8%",
    uniqueUsers: "Utilisateurs uniques",
    activeUsers: "Utilisateurs actifs",
    complianceScore: "Score de conformité",
    gdprCompliant: "Conforme RGPD",
    filterAuditLogs: "Filtrer les journaux d'audit",
    filterDesc: "Recherchez et filtrez les journaux d'audit par critères",
    searchLogs: "Rechercher dans les journaux...",
    allActions: "Toutes les actions",
    loginLogout: "Connexion/Déconnexion",
    userManagement: "Gestion des utilisateurs",
    settingsChanges: "Modifications des paramètres",
    dataExport: "Exportation de données",
    allUsers: "Tous les utilisateurs",
    administrators: "Administrateurs",
    hrManagers: "Responsables RH",
    managers: "Managers",
    auditLogEntries: "Entrées du journal d'audit",
    auditLogEntriesDesc: "Journal détaillé de toutes les activités et actions",
    timestamp: "Horodatage",
    user: "Utilisateur",
    action: "Action",
    details: "Détails",
    ipAddress: "Adresse IP",
    status: "Statut",
    gdprPrivacy: "Conformité RGPD & confidentialité",
    gdprPrivacyDesc: "Outils de confidentialité et suivi de conformité",
    dataEncryption: "Chiffrement des données",
    dataEncryptionDesc: "Toutes les données sont chiffrées au repos",
    accessControls: "Contrôles d'accès",
    accessControlsDesc: "Permissions basées sur les rôles",
    auditTrail: "Piste d'audit",
    auditTrailDesc: "Journalisation complète des activités",
    dataSubjectRequests: "Demandes de personnes concernées",
    dataRequests: "Demandes de données",
    privacyImpactAssessment: "Évaluation d'impact sur la vie privée",
    privacyAssessment: "Évaluation de la vie privée",
    complianceReport: "Rapport de conformité",
    ip: "IP",
  },
};

const AuditLogs = () => {
  const { language } = useLanguage();
  const t = (key: keyof (typeof translations)["en"]) =>
    translations[language][key];
  const navigate = useNavigate();

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const userFetchQueue = useRef<Set<string>>(new Set());

  const [pagination, setPagination] = useState<any>({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchLogs = (page = 1) => {
    setLoading(true);
    getAllAuditLogs({ page, limit: pagination.limit }).then((res: any) => {
      setAuditLogs(res.logs || []);
      setPagination(res.pagination || { page, limit: pagination.limit, total: 0, pages: 0 });
      // Find all user ids that need fetching
      const idsToFetch = new Set<string>();
      (res.logs || []).forEach((log: any) => {
        if (log.user && typeof log.user === 'object' && log.user._id && !log.user.name && !log.user.email && !userMap[log.user._id]) {
          idsToFetch.add(log.user._id);
        }
      });
      idsToFetch.forEach((id) => {
        getUser(id).then((user) => {
          setUserMap((prev) => ({ ...prev, [id]: user }));
        });
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchLogs(newPage);
  };

  // Helper to get display name for a user
  const getUserDisplay = (user: any) => {
    if (!user) return 'System';
    // Support both 'name'/'email' and 'Names'/'Email' fields
    const name = user.name || user.Names;
    const email = user.email || user.Email;
    if (name) return email ? `${name} (${email})` : name;
    if (email) return email;
    if (user._id && userMap[user._id]) {
      const u = userMap[user._id];
      const uname = u.name || u.Names;
      const uemail = u.email || u.Email;
      if (uname) return uemail ? `${uname} (${uemail})` : uname;
      if (uemail) return uemail;
    }
    if (user._id && userMap[user._id] === undefined) return 'Loading...';
    return 'System';
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("auditLogs")}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("auditLogsDesc")}
            </p>
            <Button className="mt-2" onClick={() => navigate('/admin-portal/succession-planning')}>
              Manage Succession Plans
            </Button>
          </div>
          <Button className="flex items-center gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t("exportLogs")}</span>
            <span className="sm:hidden">{t("export")}</span>
          </Button>
        </div>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {t("auditLogEntries")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("auditLogEntriesDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-sm">
                          {t("timestamp")}
                        </th>
                        <th className="text-left p-4 font-medium text-sm">
                          {t("user")}
                        </th>
                        <th className="text-left p-4 font-medium text-sm">
                          {t("action")}
                        </th>
                        <th className="text-left p-4 font-medium text-sm">
                          {t("details")}
                        </th>
                        <th className="text-left p-4 font-medium text-sm">
                          {t("ipAddress")}
                        </th>
                        <th className="text-left p-4 font-medium text-sm">
                          {t("status")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-4 text-muted-foreground"
                          >
                            No audit logs found.
                          </td>
                        </tr>
                      )}
                      {auditLogs.map((log: any) => (
                        <tr
                          key={log._id || log.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4 text-sm">{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</td>
                          <td className="p-4 text-sm">{getUserDisplay(log.user)}</td>
                          <td className="p-4 text-sm font-medium">{log.action}</td>
                          <td className="p-4 text-sm text-muted-foreground">{
                            typeof log.details === 'object' && log.details !== null
                              ? JSON.stringify(log.details)
                              : log.details || ''
                          }</td>
                          <td className="p-4 text-sm">{log.ip || log.ipAddress || ''}</td>
                          <td className="p-4">
                            {/* Optionally show status if present */}
                            {log.status ? (
                              <Badge
                                variant={log.status === "Success" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {log.status}
                              </Badge>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards view */}
                <div className="md:hidden space-y-4">
                  {auditLogs.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No audit logs found.
                    </div>
                  )}
                  {auditLogs.map((log: any) => (
                    <div
                      key={log._id || log.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        {log.status ? (
                          <Badge
                            variant={log.status === "Success" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {log.status}
                          </Badge>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {getUserDisplay(log.user)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {typeof log.details === 'object' && log.details !== null
                          ? JSON.stringify(log.details)
                          : log.details || ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("ip")}: {log.ip || log.ipAddress || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{`Page ${pagination.page} of ${pagination.pages} | Total: ${pagination.total}`}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page === 1 || loading} onClick={() => handlePageChange(pagination.page - 1)}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={pagination.page === pagination.pages || loading} onClick={() => handlePageChange(pagination.page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPortalLayout>
  );
};

export default AuditLogs;