import { useAuth } from "@/_core/hooks/useAuth";
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
import { Search, Upload, History, LogOut, Settings, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function CarfaxDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [singleVin, setSingleVin] = useState("");
  const [bulkVins, setBulkVins] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container py-4 flex items-center justify-between">
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
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search VINs
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Single VIN Card */}
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

              {/* Bulk VINs Card */}
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
                      className="font-mono text-sm h-32"
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
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Search History</CardTitle>
                <CardDescription>Your recent VIN searches and reports</CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2">
                          <TableHead className="font-bold">VIN</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="font-bold">Submitted</TableHead>
                          <TableHead className="font-bold">Completed</TableHead>
                          <TableHead className="font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions?.map((submission: any) => (
                          <TableRow key={submission.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono font-semibold">{submission.vin}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(submission.status)} border-0`}>
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {submission.completedAt
                                ? new Date(submission.completedAt).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {submission.status === "completed" ? (
                                <Link href={`/report/${submission.id}`}>
                                  <Button variant="outline" size="sm">
                                    View Report
                                  </Button>
                                </Link>
                              ) : (
                                <span className="text-xs text-muted-foreground">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No search history yet. Start by searching for a VIN.</p>
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
