import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Car, Upload, Loader2, CheckCircle2, XCircle, Clock, Search, Download, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [singleVin, setSingleVin] = useState("");
  const [bulkVins, setBulkVins] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchVin, setSearchVin] = useState("");
  const [report, setReport] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const utils = trpc.useUtils();
  const { data: submissions, isLoading: submissionsLoading } = trpc.vin.getMySubmissions.useQuery();
  
  const submitSingle = trpc.vin.submitSingle.useMutation({
    onSuccess: () => {
      toast.success("VIN submitted successfully!");
      setSingleVin("");
      utils.vin.getMySubmissions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit VIN");
    },
  });

  const submitBulk = trpc.vin.submitBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.submissionIds.length} VINs submitted successfully!`);
      setBulkVins("");
      utils.vin.getMySubmissions.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit VINs");
    },
  });

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (singleVin.length !== 17) {
      toast.error("VIN must be exactly 17 characters");
      return;
    }
    setIsSubmitting(true);
    await submitSingle.mutateAsync({ vin: singleVin });
    setIsSubmitting(false);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vins = bulkVins
      .split(/[\\n,]+/)
      .map(v => v.trim().toUpperCase())
      .filter(v => v.length === 17);
    
    if (vins.length === 0) {
      toast.error("No valid VINs found");
      return;
    }
    
    setIsSubmitting(true);
    await submitBulk.mutateAsync({ vins });
    setIsSubmitting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkVins(text);
    };
    reader.readAsText(file);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Carfax Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm">Admin Panel</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList>
            <TabsTrigger value="search">Instant Search</TabsTrigger>
            <TabsTrigger value="submit">Submit VINs</TabsTrigger>
            <TabsTrigger value="history">Submission History</TabsTrigger>
          </TabsList>

          {/* Instant Search Tab */}
          <TabsContent value="search" className="space-y-6">
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

                <Card>
                  <CardHeader>
                    <CardTitle>Service History ({report.serviceRecordCount} records)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {parseJSON(report.serviceHistory).length > 0 ? (
                      <div className="space-y-3">
                        {parseJSON(report.serviceHistory).map((service: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded">
                            <div>
                              <p className="font-medium text-foreground">{service.type}</p>
                              <p className="text-sm text-muted-foreground">{service.date}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{service.mileage?.toLocaleString()} mi</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No service records available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accident History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {parseJSON(report.accidentHistory).length > 0 ? (
                      <div className="space-y-3">
                        {parseJSON(report.accidentHistory).map((accident: any, idx: number) => (
                          <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded">
                            <p className="font-medium text-orange-900 dark:text-orange-100">{accident.type}</p>
                            <p className="text-sm text-orange-800 dark:text-orange-200">{accident.date}</p>
                            {accident.description && (
                              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">{accident.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-green-900 dark:text-green-100 font-medium">✓ No accidents reported</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ownership History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {parseJSON(report.ownershipHistory).map((owner: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded">
                          <div>
                            <p className="font-medium text-foreground">{owner.type}</p>
                            <p className="text-sm text-muted-foreground">{owner.period}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{owner.location}</p>
                        </div>
                      ))}
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
              {/* Single VIN Submission */}
              <Card>
                <CardHeader>
                  <CardTitle>Single VIN</CardTitle>
                  <CardDescription>Submit one VIN for scraping</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="single-vin">Vehicle Identification Number</Label>
                      <Input
                        id="single-vin"
                        placeholder="Enter 17-character VIN"
                        value={singleVin}
                        onChange={(e) => setSingleVin(e.target.value.toUpperCase())}
                        maxLength={17}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        {singleVin.length}/17 characters
                      </p>
                    </div>
                    <Button type="submit" disabled={isSubmitting || singleVin.length !== 17} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit VIN"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Bulk VIN Submission */}
              <Card>
                <CardHeader>
                  <CardTitle>Bulk VINs</CardTitle>
                  <CardDescription>Submit multiple VINs at once</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-vins">VINs (one per line or comma-separated)</Label>
                      <textarea
                        id="bulk-vins"
                        placeholder="1HGBH41JXMN109186&#10;2HGBH41JXMN109187&#10;3HGBH41JXMN109188"
                        value={bulkVins}
                        onChange={(e) => setBulkVins(e.target.value)}
                        className="w-full min-h-[120px] px-3 py-2 border rounded-md font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Or upload a file</Label>
                      <div className="flex gap-2">
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".txt,.csv"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting || !bulkVins.trim()} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Bulk VINs
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submission History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Submission History</CardTitle>
                <CardDescription>View all your VIN submissions and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>VIN</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-mono">{submission.vin}</TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            {submission.completedAt
                              ? new Date(submission.completedAt).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {submission.status === "completed" ? (
                              <Link href={`/report/${submission.id}`}>
                                <Button variant="outline" size="sm">View Report</Button>
                              </Link>
                            ) : submission.status === "failed" ? (
                              <span className="text-xs text-destructive">{submission.errorMessage}</span>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No submissions yet. Submit your first VIN to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
