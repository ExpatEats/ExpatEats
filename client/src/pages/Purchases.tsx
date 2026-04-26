import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertCircle, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Guide {
  id: number;
  slug: string;
  url: string;
  createdAt: string;
}

interface UserGuidesResponse {
  guides: Guide[];
  isAdmin: boolean;
  message?: string;
}

export default function Purchases() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
      return;
    }

    fetchUserGuides();
  }, [isAuthenticated, setLocation]);

  const fetchUserGuides = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/guides", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch guides");
      }

      const data: UserGuidesResponse = await response.json();
      setGuides(data.guides);
      setIsAdmin(data.isAdmin);
    } catch (err) {
      console.error("Error fetching guides:", err);
      setError("Failed to load your guides. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGuide = (slug: string) => {
    setLocation(`/guides/${slug}`);
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

  return (
    <div className="min-h-screen bg-cream-mid py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-cormorant font-light text-sage mb-2">
            My Guides
          </h1>
          <p className="text-t2 font-outfit">
            Access all your purchased guides in one place
          </p>
          {isAdmin && (
            <div className="mt-4 flex items-center gap-2 text-sage bg-sage/10 px-4 py-2 rounded-lg inline-flex">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">Admin View - Showing all guides</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-bark-pale/20">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : guides.length === 0 ? (
          <Card className="border-bark-pale/20">
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-bark-pale mb-4" />
              <h3 className="text-xl font-medium text-soil font-outfit mb-2">
                No guides yet
              </h3>
              <p className="text-t2 font-outfit mb-6">
                You haven't purchased any guides yet. Browse our guides to get started!
              </p>
              <Button
                onClick={() => setLocation("/resources")}
                className="bg-sage hover:bg-sage/90 text-white"
              >
                Browse Guides
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Card
                key={guide.id}
                className="border-bark-pale/20 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-sage flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {formatGuideName(guide.slug)}
                  </CardTitle>
                  <CardDescription>
                    {guide.createdAt
                      ? `Added ${new Date(guide.createdAt).toLocaleDateString()}`
                      : "PDF Guide"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleViewGuide(guide.slug)}
                    className="w-full bg-bark-lt hover:bg-bark-lt/90 text-white"
                  >
                    View Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
