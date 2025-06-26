import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { SimpleLineChart } from "@/components/ui/line-chart";
import { SimpleBarChart } from "@/components/ui/bar-chart";
import { SimplePieChart } from "@/components/ui/pie-chart";
import { useAuthStore } from "@/store/authStore";
import {
  HomeIcon,
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  Package,
  LifeBuoy,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ListTodo,
  CheckSquare,
  Table as TableIcon,
  Calendar as CalendarIcon,
  Eye,
  Percent,
} from "lucide-react";

export default function HomePage() {
  const { user, username } = useAuthStore();

  const lineData = [
    { name: "Jan", value: 20 },
    { name: "Feb", value: 30 },
    { name: "Mar", value: 28 },
    { name: "Apr", value: 35 },
    { name: "May", value: 40 },
  ];

  const barData = [
    { name: "A", value: 12 },
    { name: "B", value: 19 },
    { name: "C", value: 7 },
    { name: "D", value: 14 },
    { name: "E", value: 9 },
  ];

  const pieData = [
    { name: "Red", value: 10 },
    { name: "Blue", value: 20 },
    { name: "Green", value: 15 },
  ];

  const tasks = [
    { id: 1, label: "Prepare report" },
    { id: 2, label: "Email clients" },
    { id: 3, label: "Team meeting" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-2xl font-bold mb-4">
        <HomeIcon className="w-6 h-6" />
        Welcome, {user || username || "User"}!
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">123</div>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CardDescription>Past week</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">456</div>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <CardDescription>Currently</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">789</div>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CardDescription>This month</CardDescription>
            </div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">101</div>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <CardDescription>Today</CardDescription>
            </div>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">32</div>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              <CardDescription>Open</CardDescription>
            </div>
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">5</div>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <CardDescription>Today</CardDescription>
            </div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">3.2k</div>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <div>
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <CardDescription>This month</CardDescription>
            </div>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-center">2.4%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="h-64 gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <CardTitle className="text-sm font-medium">Line Graph</CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4">
            <SimpleLineChart data={lineData} className="w-full h-full" />
          </CardContent>
        </Card>
        <Card className="h-64 gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <CardTitle className="text-sm font-medium">Bar Chart</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4">
            <SimpleBarChart data={barData} className="w-full h-full" />
          </CardContent>
        </Card>
        <Card className="h-64 gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <CardTitle className="text-sm font-medium">Pie Chart</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4">
            <SimplePieChart data={pieData} className="w-full h-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <CardTitle className="text-sm font-medium">Mini Table</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4">
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
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 px-4">
            <ul className="text-sm space-y-1">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  {t.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="gap-2 p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 p-2 flex justify-center">
            <Calendar mode="single" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
