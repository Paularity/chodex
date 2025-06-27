import { useEffect } from "react";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationTable from "../applications/ApplicationTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function ApplicationsPage() {
  const { applications, loading, fetchApplications } = useApplicationStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-2xl font-bold mb-4">
        <Package className="w-6 h-6" />
        Applications
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registered Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : <ApplicationTable applications={applications} />}
        </CardContent>
      </Card>
    </div>
  );
}
