import { useEffect } from "react";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationTable from "../applications/ApplicationTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, RefreshCw } from "lucide-react";

export default function ApplicationsPage() {
  const { applications, loading, refreshApplications } = useApplicationStore();

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-bold mb-4">
        <Package className="w-6 h-6" />
        Applications
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registered Applications</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshApplications}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : <ApplicationTable applications={applications} />}
        </CardContent>
      </Card>
    </div>
  );
}
