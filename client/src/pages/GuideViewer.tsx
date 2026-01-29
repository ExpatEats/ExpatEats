import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useRoute } from "wouter";
import { PdfViewer } from "@/components/PdfViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Lock, Loader2 } from "lucide-react";

interface AccessResponse {
  hasAccess: boolean;
  guide?: {
    id: number;
    slug: string;
  };
  viewUrl?: string;
  expiresAt?: string;
  message?: string;
}

export default function GuideViewer() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/guides/:slug");
  const slug = params?.slug;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }

    if (!slug) {
      setError("Invalid guide");
      setLoading(false);
      return;
    }

    checkAccessAndFetchPdf();
  }, [isAuthenticated, slug, setLocation]);

  const checkAccessAndFetchPdf = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      // Check access and get signed URL
      const response = await fetch(`/api/guides/${slug}/access`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          setHasAccess(false);
          setError("You don't have access to this guide. Please purchase it first.");
          setLoading(false);
          return;
        }
        throw new Error("Failed to check guide access");
      }

      const data: AccessResponse = await response.json();

      if (!data.hasAccess || !data.viewUrl) {
        setHasAccess(false);
        setError(data.message || "You don't have access to this guide");
        setLoading(false);
        return;
      }

      setHasAccess(true);
      setPdfUrl(data.viewUrl);
      setLoading(false);
    } catch (err) {
      console.error("Error checking guide access:", err);
      setError("Failed to load guide. Please try again later.");
      setLoading(false);
    }
  };

  const formatGuideName = (slug: string): string => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center">
        <Card className="border-[#DDB892]/20">
          <CardContent className="pt-6 pb-6 px-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#94AF9F]" />
              <p className="text-gray-600">Loading guide...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !hasAccess) {
    return (
      <div className="min-h-screen bg-[#F9F5F0] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Button
            onClick={() => setLocation("/purchases")}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Guides
          </Button>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center text-center gap-4">
                {hasAccess ? (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                ) : (
                  <Lock className="h-16 w-16 text-red-500" />
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-red-800 mb-2">
                    {hasAccess ? "Error Loading Guide" : "Access Denied"}
                  </h2>
                  <p className="text-red-600 mb-6">{error}</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => setLocation("/purchases")}
                      variant="outline"
                    >
                      View My Guides
                    </Button>
                    {!hasAccess && (
                      <Button
                        onClick={() => setLocation("/services")}
                        className="bg-[#94AF9F] hover:bg-[#94AF9F]/90 text-white"
                      >
                        Browse Services
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Button
            onClick={() => setLocation("/purchases")}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Guides
          </Button>

          <h1 className="text-2xl md:text-3xl font-montserrat font-light text-[#94AF9F]">
            {slug ? formatGuideName(slug) : "Guide"}
          </h1>

          <div className="w-[120px]" /> {/* Spacer for layout */}
        </div>

        {/* PDF Viewer */}
        {pdfUrl && (
          <PdfViewer
            pdfUrl={pdfUrl}
            userEmail={user?.email}
            userName={user?.name || user?.username}
          />
        )}
      </div>
    </div>
  );
}
