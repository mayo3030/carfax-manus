import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { ArrowLeft, Car, Loader2, Calendar, Gauge, DollarSign, Palette, Wrench, Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const submissionId = parseInt(id || "0");
  
  const { data: report, isLoading } = trpc.reports.getBySubmissionId.useQuery({ submissionId });
  const exportJson = trpc.export.json.useQuery({ submissionId }, { enabled: false });
  const exportCsv = trpc.export.csv.useQuery({ submissionId }, { enabled: false });

  const handleExportJson = async () => {
    const result = await exportJson.refetch();
    if (result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carfax_${report?.vin}_${Date.now()}.json`;
      a.click();
      toast.success("Report exported as JSON");
    }
  };

  const handleExportCsv = async () => {
    const result = await exportCsv.refetch();
    if (result.data) {
      const blob = new Blob([result.data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      a.click();
      toast.success("Report exported as CSV");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">The report you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse JSON data
  const accidentHistory = report.accidentHistory ? JSON.parse(report.accidentHistory) : [];
  const serviceHistory = report.serviceHistory ? JSON.parse(report.serviceHistory) : [];
  const ownershipHistory = report.ownershipHistory ? JSON.parse(report.ownershipHistory) : [];

  // Chart data
  const summaryData = [
    { name: "Accidents", value: report.accidentCount || 0, color: "#ef4444" },
    { name: "Owners", value: report.ownerCount || 0, color: "#3b82f6" },
    { name: "Service Records", value: report.serviceRecordCount || 0, color: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">
                  {report.year} {report.make} {report.model}
                </h1>
                <p className="text-muted-foreground font-mono">{report.vin}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportJson}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={handleExportCsv}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-6">
        {/* Vehicle Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="text-2xl font-bold">{report.year}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gauge className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="text-2xl font-bold">{report.mileage?.toLocaleString() || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">
                    {report.price ? `$${report.price.toLocaleString()}` : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Palette className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="text-2xl font-bold">{report.color || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Make</p>
                <p className="font-semibold">{report.make || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-semibold">{report.model || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trim</p>
                <p className="font-semibold">{report.trim || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Engine</p>
                <p className="font-semibold">{report.engineType || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transmission</p>
                <p className="font-semibold">{report.transmission || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Summary Chart */}
        <Card>
          <CardHeader>
            <CardTitle>History Summary</CardTitle>
            <CardDescription>Overview of vehicle history records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Accident History */}
        {accidentHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Accident History ({report.accidentCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accidentHistory.map((accident: any, index: number) => (
                  <div key={index} className="border-l-4 border-destructive pl-4 py-2">
                    <p className="font-semibold">{accident.date}</p>
                    <p className="text-sm text-muted-foreground">{accident.description}</p>
                    {accident.severity && (
                      <p className="text-sm font-medium text-destructive">Severity: {accident.severity}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service History */}
        {serviceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Service History ({report.serviceRecordCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceHistory.map((service: any, index: number) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{service.date}</p>
                      <p className="text-sm text-muted-foreground">{service.mileage}</p>
                    </div>
                    <p className="text-sm">{service.description}</p>
                    {service.shop && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Wrench className="w-3 h-3" />
                        {service.shop}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ownership History */}
        {ownershipHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ownership History ({report.ownerCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ownershipHistory.map((owner: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-semibold">Owner {owner.ownerNumber}</p>
                    <p className="text-sm text-muted-foreground">Years: {owner.years}</p>
                    <p className="text-sm">Type: {owner.type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
