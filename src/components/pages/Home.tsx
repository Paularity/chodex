import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { HomeIcon } from "lucide-react";

export default function HomePage() {
  const { user, username } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-2xl font-bold mb-4">
        <HomeIcon className="w-6 h-6" />
        Welcome, {user || username || "User"}!
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Statistic A</CardTitle>
            <CardDescription>Placeholder value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">123</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statistic B</CardTitle>
            <CardDescription>Placeholder value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">456</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statistic C</CardTitle>
            <CardDescription>Placeholder value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">789</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statistic D</CardTitle>
            <CardDescription>Placeholder value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">101</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-64">
          <CardHeader>
            <CardTitle>Graph</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Graph Placeholder</div>
          </CardContent>
        </Card>
        <Card className="h-64">
          <CardHeader>
            <CardTitle>Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Chart Placeholder</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mini Table</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left font-semibold">Name</th>
                  <th className="p-2 text-left font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">Item A</td>
                  <td className="p-2">1</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">Item B</td>
                  <td className="p-2">2</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">Item C</td>
                  <td className="p-2">3</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center">
            <div className="text-muted-foreground">Calendar Placeholder</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
