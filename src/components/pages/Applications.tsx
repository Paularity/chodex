import { useEffect, useCallback, useState, useMemo } from "react";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import ApplicationTable from "../applications/ApplicationTable";
import ApplicationForm from "../applications/ApplicationForm";
import type { ApplicationFormData } from "../applications/ApplicationForm";
import type { Application } from "@/lib/api/models/application.model";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Package, RefreshCw, Plus, Loader2 } from "lucide-react";
import { ApplicationService } from "@/lib/api/application/service";

export default function ApplicationsPage() {
  const {
    applications,
    loading,
    fetchApplications,
    setLoading,
    createApplication,
    updateApplication,
    deleteApplication,
  } = useApplicationStore();
  const { token, tenantId } = useAuthStore();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "online" | "offline">("all");
  const [sort, setSort] = useState<"name:asc" | "name:desc" | "code:asc" | "code:desc" | "lastChecked:asc" | "lastChecked:desc">("name:asc");
  const [editing, setEditing] = useState<ApplicationFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null);

  const visibleApps = useMemo(() => {
    const term = search.toLowerCase();
    const [field, dir] = sort.split(":") as ["name" | "code" | "lastChecked", "asc" | "desc"];

    return [...applications]
      .filter((a) =>
        term
          ? a.name.toLowerCase().includes(term) || a.code.toLowerCase().includes(term)
          : true
      )
      .filter((a) =>
        status === "all" ? true : status === "online" ? a.isOnline : !a.isOnline
      )
      .sort((a, b) => {
        let va: string | number;
        let vb: string | number;
        if (field === "name" || field === "code") {
          va = a[field];
          vb = b[field];
        } else if (field === "lastChecked") {
          va = new Date(a.lastChecked).getTime();
          vb = new Date(b.lastChecked).getTime();
        } else {
          va = 0;
          vb = 0;
        }
        if (va < vb) return dir === "asc" ? -1 : 1;
        if (va > vb) return dir === "asc" ? 1 : -1;
        return 0;
      });
  }, [applications, search, status, sort]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await ApplicationService.refresh(token, tenantId);
      await fetchApplications();
    } finally {
      setLoading(false);
    }
  }, [token, tenantId, fetchApplications, setLoading]);

  useEffect(() => {
    const load = async () => {
      await fetchApplications();
      await refresh();
    };
    load();
  }, [fetchApplications, refresh]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-bold mb-4">
        <Package className="w-6 h-6" />
        Applications
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Registered Applications</CardTitle>
          <CardAction>
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                setEditing({
                  id: crypto.randomUUID(),
                  name: "",
                  code: "",
                  basePath: "",
                  url: "",
                  description: "",
                  isOnline: false,
                  lastChecked: new Date().toISOString(),
                  version: null,
                  tags: null,
                  owner: null,
                })
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Dialog
            open={!!editing}
            onOpenChange={(open: boolean) => {
              if (!open) setEditing(null)
            }}
          >
            <DialogContent>
              {editing && (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      {applications.find((a) => a.id === editing.id) ? "Edit Application" : "Create Application"}
                    </DialogTitle>
                  </DialogHeader>
                  <ApplicationForm
                    defaultValues={editing}
                    onSubmit={async (data) => {
                      setSaving(true);
                      try {
                        if (applications.find((a) => a.id === data.id)) {
                          await updateApplication(data);
                          toast.success("Application updated");
                        } else {
                          await createApplication(data);
                          toast.success("Application created");
                        }
                        setEditing(null);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    loading={saving}
                    submitLabel={applications.find((a) => a.id === editing.id) ? "Update" : "Create"}
                    onCancel={() => setEditing(null)}
                  />
                </>
              )}
            </DialogContent>
          </Dialog>
          <Dialog
            open={!!confirmDelete}
            onOpenChange={(open: boolean) => {
              if (!open) setConfirmDelete(null)
            }}
          >
            <DialogContent>
              {confirmDelete && (
                <>
                  <DialogHeader>
                    <DialogTitle>Delete Application</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to delete "{confirmDelete.name}"?</p>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setConfirmDelete(null)}
                      disabled={deletingId !== null}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (!confirmDelete) return
                        setDeletingId(confirmDelete.id)
                        try {
                          await deleteApplication(confirmDelete.id)
                          toast.success("Application deleted")
                          setConfirmDelete(null)
                        } finally {
                          setDeletingId(null)
                        }
                      }}
                      disabled={deletingId !== null}
                      className="flex items-center gap-2"
                    >
                      {deletingId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <Input
              placeholder="Search by name or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-1/3"
            />
            <Select value={status} onValueChange={(v) => setStatus(v as "all" | "online" | "offline")}>
              <SelectTrigger className="md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name:asc">Name ↑</SelectItem>
                <SelectItem value="name:desc">Name ↓</SelectItem>
                <SelectItem value="code:asc">Code ↑</SelectItem>
                <SelectItem value="code:desc">Code ↓</SelectItem>
                <SelectItem value="lastChecked:asc">Last Checked ↑</SelectItem>
                <SelectItem value="lastChecked:desc">Last Checked ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <ApplicationTable
              applications={visibleApps}
              loading={loading}
              onEdit={(app) =>
                setEditing({
                  id: app.id,
                  name: app.name,
                  code: app.code,
                  basePath: app.basePath,
                  url: app.url,
                  description: app.description,
                  isOnline: app.isOnline,
                  lastChecked: app.lastChecked,
                  version: app.version,
                  tags: app.tags,
                  owner: app.owner,
                })
              }
              onDelete={(app) => {
                setConfirmDelete(app);
              }}
              deletingId={deletingId}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// test