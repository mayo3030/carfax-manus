import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Download, FileJson, FileText, ArrowLeft } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface RouteParams {
  id: string;
}

export default function CarfaxReport() {
  const [location, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const id = parseInt(location.split("/report/")[1] || "0");
  const { data: report, isLoading } = trpc.vin.getSubmission.useQuery({ id });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white shadow-sm">
          <div className="container py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Report not found</p>
        </div>
      </div>
    );
  }

  const mockReportData = {
    vehicle: {
      vin: report.vin,
      make: "Honda",
      model: "Accord",
      year: 2018,
      color: "Silver",
      bodyType: "Sedan",
      transmission: "Automatic",
      engine: "2.0L 4-Cylinder",
      mileage: 45230,
    },
    accidents: [
      { date: "2022-03", type: "Minor", severity: "Low", description: "Fender bender" },
      { date: "2021-11", type: "Major", severity: "Medium", description: "Collision" },
    ],
    ownership: [
      { period: "2020-Present", type: "Personal", state: "CA" },
      { period: "2018-2020", type: "Personal", state: "NY" },
    ],
    service: [
      { date: "2024-01", type: "Oil Change", cost: 45 },
      { date: "2023-08", type: "Tire Rotation", cost: 35 },
      { date: "2023-04", type: "Brake Inspection", cost: 0 },
    ],
    mileageHistory: [
      { year: 2018, mileage: 5000 },
      { year: 2019, mileage: 15000 },
      { year: 2020, mileage: 25000 },
      { year: 2021, mileage: 32000 },
      { year: 2022, mileage: 38000 },
      { year: 2023, mileage: 42000 },
      { year: 2024, mileage: 45230 },
    ],
  };

  const accidentStats = [
    { name: "No Accidents", value: 5 },
    { name: "Minor", value: 1 },
    { name: "Major", value: 1 },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{mockReportData.vehicle.year} {mockReportData.vehicle.make} {mockReportData.vehicle.model}</h1>
            <p className="text-muted-foreground font-mono mt-2">{mockReportData.vehicle.vin}</p>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Mileage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockReportData.vehicle.mileage.toLocaleString()} mi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Accident Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockReportData.accidents.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Found in history</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockReportData.ownership.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Previous owners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Service Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockReportData.service.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Documented services</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Report Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accidents">Accidents</TabsTrigger>
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="mileage">Mileage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-semibold">{mockReportData.vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Body Type</p>
                      <p className="font-semibold">{mockReportData.vehicle.bodyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-semibold">{mockReportData.vehicle.transmission}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Engine</p>
                      <p className="font-semibold">{mockReportData.vehicle.engine}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Mileage</p>
                      <p className="font-semibold">{mockReportData.vehicle.mileage.toLocaleString()} miles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accident Summary Chart */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Accident Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accidentStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accidents Tab */}
          <TabsContent value="accidents">
            <Card>
              <CardHeader>
                <CardTitle>Accident History</CardTitle>
                <CardDescription>All reported accidents and incidents</CardDescription>
              </CardHeader>
              <CardContent>
                {mockReportData.accidents.length > 0 ? (
                  <div className="space-y-4">
                    {mockReportData.accidents.map((accident, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{accident.type} - {accident.description}</p>
                            <p className="text-sm text-muted-foreground">{accident.date}</p>
                          </div>
                          <Badge className={accident.severity === "High" ? "bg-red-100 text-red-800" : accident.severity === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {accident.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No accidents reported</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ownership Tab */}
          <TabsContent value="ownership">
            <Card>
              <CardHeader>
                <CardTitle>Ownership History</CardTitle>
                <CardDescription>Previous and current owners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReportData.ownership.map((owner, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{owner.type}</p>
                          <p className="text-sm text-muted-foreground">{owner.period}</p>
                        </div>
                        <Badge variant="outline">{owner.state}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Tab */}
          <TabsContent value="service">
            <Card>
              <CardHeader>
                <CardTitle>Service Records</CardTitle>
                <CardDescription>Documented maintenance and repairs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockReportData.service.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div>
                        <p className="font-semibold">{service.type}</p>
                        <p className="text-sm text-muted-foreground">{service.date}</p>
                      </div>
                      <p className="font-semibold">${service.cost}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mileage Tab */}
          <TabsContent value="mileage">
            <Card>
              <CardHeader>
                <CardTitle>Mileage History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockReportData.mileageHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mileage" stroke="#0066cc" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
