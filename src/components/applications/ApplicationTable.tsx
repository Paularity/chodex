import type { Application } from "@/lib/api/models/application.model";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Loader2 } from "lucide-react";

interface Props {
  applications: Application[];
  loading: boolean;
}

export default function ApplicationTable({ applications, loading }: Props) {
  if (!applications.length) {
    return <p>No applications found.</p>;
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border">
        <thead className="bg-muted">
        <tr>
          <th className="p-2 text-left font-semibold">Name</th>
          <th className="p-2 text-left font-semibold">Code</th>
          <th className="p-2 text-left font-semibold">Description</th>
          <th className="p-2 text-left font-semibold">Base Path</th>
          <th className="p-2 text-left font-semibold">URL</th>
          <th className="p-2 text-left font-semibold">Last Checked</th>
          <th className="p-2 font-semibold text-center w-[20px]">Status</th>
        </tr>
        </thead>
        <tbody>
        {applications.map((app) => (
            <tr key={app.id} className="border-t">
              <td className="p-2">{app.name}</td>
              <td className="p-2">{app.code}</td>
              <td className="p-2">{app.description}</td>
              <td className="p-2">{app.basePath}</td>
              <td className="p-2">
                <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                >
                  {app.url}
                </a>
              </td>
              <td className="p-2">{new Date(app.lastChecked).toLocaleString()}</td>
              <td className="p-2 text-center">
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin mx-auto text-muted-foreground" />
                ) : (
                  <Tooltip>
                    <TooltipTrigger>
                      <span
                        className={
                          "inline-block w-3 h-3 rounded-full " +
                          (app.isOnline ? "bg-green-500" : "bg-red-500")
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {app.isOnline ? "Online" : "Offline"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </td>
            </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
