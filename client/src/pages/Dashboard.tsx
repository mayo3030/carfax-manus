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
import { Car, Upload, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [singleVin, setSingleVin] = useState("");
  const [bulkVins, setBulkVins] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">Submit VINs</TabsTrigger>
            <TabsTrigger value="history">Submission History</TabsTrigger>
          </TabsList>

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
