import type { Application } from "@/lib/api/models/application.model";

interface Props {
  applications: Application[];
}

export default function ApplicationTable({ applications }: Props) {
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
            <th className="p-2 text-left font-semibold">Base Path</th>
            <th className="p-2 text-left font-semibold">URL</th>
            <th className="p-2 text-left font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-t">
              <td className="p-2">{app.name}</td>
              <td className="p-2">{app.code}</td>
              <td className="p-2">{app.basePath}</td>
              <td className="p-2">{app.url}</td>
              <td className="p-2">
                <span
                  className={
                    "inline-block w-3 h-3 rounded-full " +
                    (app.isOnline ? "bg-green-500" : "bg-red-500")
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
