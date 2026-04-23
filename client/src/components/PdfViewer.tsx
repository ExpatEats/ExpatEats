import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - use CDN that matches react-pdf's bundled version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
}

export function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("contextmenu", handleContextMenu);
    }

    return () => {
      if (container) {
        container.removeEventListener("contextmenu", handleContextMenu);
      }
    };
  }, []);

  // Fetch PDF with credentials
  useEffect(() => {
    const fetchPdf = async () => {
      if (!pdfUrl) return;

      try {
        console.log('Fetching PDF from:', pdfUrl);
        setLoading(true);
        setError(null);

        const response = await fetch(pdfUrl, {
          credentials: 'include',
        });

        console.log('PDF fetch response:', {
          status: response.status,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
        });

        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('PDF blob created:', {
          size: blob.size,
          type: blob.type,
        });

        const dataUrl = URL.createObjectURL(blob);
        console.log('PDF object URL created:', dataUrl);
        setPdfData(dataUrl);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
        setLoading(false);
      }
    };

    fetchPdf();

    // Cleanup function to revoke object URL
    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }

  function goToPrevPage() {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }

  function goToNextPage() {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full max-w-5xl mx-auto"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      {/* Controls */}
      <Card className="mb-4 p-4 w-full bg-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1 || loading}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>

            <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
              Page {pageNumber} of {numPages || "?"}
            </div>

            <Button
              onClick={goToNextPage}
              disabled={!numPages || pageNumber >= numPages || loading}
              variant="outline"
              size="sm"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button onClick={zoomOut} disabled={loading} variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded min-w-[70px] text-center">
              {Math.round(scale * 100)}%
            </div>
            <Button onClick={zoomIn} disabled={loading} variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* PDF Document */}
      <div className="w-full flex justify-center bg-gray-100 rounded-lg shadow-inner p-4 min-h-[600px] relative">
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 text-red-600">
            <svg
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-lg font-medium mb-2">Error Loading PDF</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : pdfData ? (
          <div className="relative">
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 className="h-12 w-12 animate-spin text-sage mb-4" />
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-sage mb-4" />
            <p className="text-gray-600">Preparing PDF...</p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md w-full">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Protected Content:</span> This guide is for your personal
          use only. Unauthorized distribution or sharing is prohibited.
        </p>
      </div>
    </div>
  );
}
