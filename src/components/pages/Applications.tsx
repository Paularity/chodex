import { useEffect, useCallback } from "react";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import ApplicationTable from "../applications/ApplicationTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, RefreshCw, Loader2 } from "lucide-react";
import { ApplicationService } from "@/lib/api/application/service";

export default function ApplicationsPage() {
  const { applications, loading, fetchApplications } = useApplicationStore();
  const { token, tenantId } = useAuthStore();

  const refresh = useCallback(async () => {
    await ApplicationService.refresh(token, tenantId);
    await fetchApplications();
  }, [token, tenantId, fetchApplications]);

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
            <Button size="icon" variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <ApplicationTable applications={applications} loading={loading} />
            {loading && applications.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
