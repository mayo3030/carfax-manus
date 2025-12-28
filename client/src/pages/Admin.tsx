import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings, Users, Activity, Loader2, ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [minDelay, setMinDelay] = useState("2000");
  const [maxDelay, setMaxDelay] = useState("5000");
  const [maxDailyVins, setMaxDailyVins] = useState("100");
  const [isSaving, setIsSaving] = useState(false);

  const utils = trpc.useUtils();
  const { data: pendingQueue, isLoading: queueLoading } = trpc.admin.getPendingQueue.useQuery();
  const { data: settings, isLoading: settingsLoading } = trpc.admin.getSettings.useQuery();

  const updateSetting = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      utils.admin.getSettings.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  // Load settings into state
  useEffect(() => {
    if (settings) {
      const minDelaySetting = settings.find(s => s.settingKey === "min_delay");
      const maxDelaySetting = settings.find(s => s.settingKey === "max_delay");
      const maxDailySetting = settings.find(s => s.settingKey === "max_daily_vins");

      if (minDelaySetting) setMinDelay(minDelaySetting.settingValue);
      if (maxDelaySetting) setMaxDelay(maxDelaySetting.settingValue);
      if (maxDailySetting) setMaxDailyVins(maxDailySetting.settingValue);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({ key: "min_delay", value: minDelay });
      await updateSetting.mutateAsync({ key: "max_delay", value: maxDelay });
      await updateSetting.mutateAsync({ key: "max_daily_vins", value: maxDailyVins });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPending = pendingQueue?.length || 0;
  const todaySubmissions = pendingQueue?.filter(
    (sub) => new Date(sub.submittedAt).toDateString() === new Date().toDateString()
  ).length || 0;

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
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage scraping queue and system settings</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Queue</p>
                  <p className="text-3xl font-bold">{totalPending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Submissions</p>
                  <p className="text-3xl font-bold">{todaySubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Daily Limit</p>
                  <p className="text-3xl font-bold">{maxDailyVins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="queue">Pending Queue</TabsTrigger>
            <TabsTrigger value="settings">Scraping Settings</TabsTrigger>
          </TabsList>

          {/* Pending Queue Tab */}
          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle>Pending VIN Queue</CardTitle>
                <CardDescription>VINs waiting to be scraped by the n8n workflow</CardDescription>
              </CardHeader>
              <CardContent>
                {queueLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : pendingQueue && pendingQueue.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingQueue.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>{submission.id}</TableCell>
                          <TableCell className="font-mono">{submission.vin}</TableCell>
                          <TableCell>{submission.userId}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{submission.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending VINs in the queue.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Configuration</CardTitle>
                <CardDescription>
                  Adjust scraping behavior to maintain account safety and avoid rate limiting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="min-delay">Minimum Delay (milliseconds)</Label>
                      <Input
                        id="min-delay"
                        type="number"
                        value={minDelay}
                        onChange={(e) => setMinDelay(e.target.value)}
                        placeholder="2000"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum delay between actions during scraping (e.g., 2000ms = 2 seconds)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-delay">Maximum Delay (milliseconds)</Label>
                      <Input
                        id="max-delay"
                        type="number"
                        value={maxDelay}
                        onChange={(e) => setMaxDelay(e.target.value)}
                        placeholder="5000"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum delay between actions during scraping (e.g., 5000ms = 5 seconds)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-daily">Maximum Daily VINs</Label>
                      <Input
                        id="max-daily"
                        type="number"
                        value={maxDailyVins}
                        onChange={(e) => setMaxDailyVins(e.target.value)}
                        placeholder="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of VINs to scrape per day to avoid account suspicion
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Settings
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold">Account Safety Tips</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Keep delays randomized between min and max values</li>
                        <li>• Monitor daily scraping volume to stay under the limit</li>
                        <li>• Increase delays if you notice any account warnings</li>
                        <li>• Avoid scraping during peak hours (9 AM - 5 PM EST)</li>
                        <li>• The Bright Data Browser API automatically rotates proxies</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
