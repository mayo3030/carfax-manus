import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Streamdown } from 'streamdown';

/**
 * All content in this page are only for example, replace with your own feature implementation
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container max-w-4xl text-center space-y-6 px-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Carfax Vehicle History Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Automate Carfax report scraping and manage vehicle history data with ease.
            Submit VINs, track scraping progress, and view detailed reports in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Automated Scraping</h3>
            <p className="text-gray-600">
              Submit single or bulk VINs and let the system automatically scrape Carfax reports.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Real-time Tracking</h3>
            <p className="text-gray-600">
              Monitor scraping progress with real-time status updates for each VIN submission.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Visual Reports</h3>
            <p className="text-gray-600">
              View detailed vehicle history with interactive charts and organized data displays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
