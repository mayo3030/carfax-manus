"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Upload, History, LogOut, Settings, Loader2, Download, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CarfaxDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [singleVin, setSingleVin] = useState("");
  const [bulkVins, setBulkVins] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchVin, setSearchVin] = useState("");
  const [report, setReport] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const utils = trpc.useUtils();
  const { data: submissions, isLoading: submissionsLoading } = trpc.vin.getMySubmissions.useQuery();

  const submitVin = trpc.vin.submitSingle.useMutation({
    onSuccess: () => {
      toast.success("VIN submitted successfully!");
      setSingleVin("");
      utils.vin.getMySubmissions.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit VIN");
    },
  });

  const handleSingleVinSubmit = async () => {
    if (singleVin.length !== 17) {
      toast.error("VIN must be exactly 17 characters");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitVin.mutateAsync({ vin: singleVin.toUpperCase() });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkVinsSubmit = async () => {
    const vins = bulkVins
      .split(/[\n,]/)
      .map((v) => v.trim().toUpperCase())
      .filter((v) => v.length === 17);

    if (vins.length === 0) {
      toast.error("No valid VINs found (must be 17 characters each)");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const vin of vins) {
        await submitVin.mutateAsync({ vin });
      }
      setBulkVins("");
      toast.success(`${vins.length} VINs submitted successfully!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVin || searchVin.length !== 17) {
      setSearchError('VIN must be exactly 17 characters');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    setReport(null);
    try {
      const response = await fetch(`/report/${searchVin.toUpperCase()}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setSearchError('Could not retrieve report');
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    const link = document.createElement('a');
    link.href = `/pdf/${report.vin}`;
    link.download = `carfax-report-${report.vin}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseJSON = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Carfax Reports</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="instant" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instant">Instant Search</TabsTrigger>
            <TabsTrigger value="submit">Submit VINs</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Instant Search Tab */}
          <TabsContent value="instant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search VINs</CardTitle>
                <CardDescription>Get instant Carfax reports</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInstantSearch} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter 17-character VIN"
                      value={searchVin}
                      onChange={(e) => setSearchVin(e.target.value.toUpperCase())}
                      maxLength={17}
                      className="flex-1 font-mono"
                    />
                    <Button type="submit" disabled={searchLoading} className="gap-2">
                      {searchLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Character count: {searchVin.length}/17
                  </p>
                </form>
              </CardContent>
            </Card>

            {searchError && (
              <Card className="border-destructive bg-destructive/5">
                <CardContent className="pt-6 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Error</p>
                    <p className="text-sm text-destructive/80">{searchError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {report && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="bg-primary/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">
                          {report.year} {report.make} {report.model}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-mono">VIN: {report.vin}</p>
                      </div>
                      <Button onClick={handleDownloadPDF} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-foreground mb-4">Vehicle Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Trim</p>
                            <p className="font-medium">{report.trim}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Color</p>
                            <p className="font-medium">{report.color}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Engine</p>
                            <p className="font-medium">{report.engineType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Transmission</p>
                            <p className="font-medium">{report.transmission}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-4">Condition & Value</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Mileage</p>
                            <p className="font-medium">{report.mileage.toLocaleString()} miles</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Estimated Value</p>
                            <p className="font-medium">${report.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Owners</p>
                            <p className="font-medium">{report.ownerCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Accidents</p>
                            <p className={`font-medium ${report.accidentCount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                              {report.accidentCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!report && !searchLoading && !searchError && (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Enter a VIN to search for vehicle reports</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submit VINs Tab */}
          <TabsContent value="submit" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Single VIN Search</CardTitle>
                  <CardDescription>Enter a single 17-character VIN</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="single-vin" className="text-sm font-medium">
                      Vehicle Identification Number
                    </Label>
                    <Input
                      id="single-vin"
                      placeholder="Enter 17-character VIN"
                      value={singleVin}
                      onChange={(e) => setSingleVin(e.target.value.toUpperCase())}
                      maxLength={17}
                      className="font-mono text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      {singleVin.length}/17 characters
                    </p>
                  </div>
                  <Button
                    onClick={handleSingleVinSubmit}
                    disabled={singleVin.length !== 17 || isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search VIN
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Bulk VIN Search</CardTitle>
                  <CardDescription>Submit multiple VINs at once</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-vins" className="text-sm font-medium">
                      VINs (one per line or comma-separated)
                    </Label>
                    <Textarea
                      id="bulk-vins"
                      placeholder="1HGBH41JXMN109186&#10;2HGBH41JXMN109187&#10;3HGBH41JXMN109188"
                      value={bulkVins}
                      onChange={(e) => setBulkVins(e.target.value)}
                      className="font-mono text-sm min-h-[120px]"
                    />
                  </div>
                  <Button
                    onClick={handleBulkVinsSubmit}
                    disabled={!bulkVins.trim() || isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit VINs
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission History</CardTitle>
                <CardDescription>Your recent VIN submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>VIN</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission: any) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-mono text-sm">{submission.vin}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(submission.status)}>
                                {submission.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No submissions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
