import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface CoordinateMapPreviewProps {
    latitude: string;
    longitude: string;
    placeName: string;
    address: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Mapbox access token
const MAPBOX_TOKEN =
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
    (window as any).VITE_MAPBOX_ACCESS_TOKEN ||
    "pk.eyJ1IjoibWljaGFlbGVrIiwiYSI6ImNtYzBja3R5MzAwdDQya29kODdrNnNyYXQifQ._51Nw5m36McY40ID6SdWhQ";

export function CoordinateMapPreview({
    latitude,
    longitude,
    placeName,
    address,
    onConfirm,
    onCancel,
}: CoordinateMapPreviewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Set Mapbox access token
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Initialize map centered on the coordinates
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [lng, lat],
            zoom: 16, // Zoomed in for validation
        });

        // Create custom marker element
        const el = document.createElement("div");
        el.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="#E07A5F" stroke="white" stroke-width="2"/>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
            </svg>
        `;
        el.style.cursor = "pointer";
        el.style.transform = "translate(-50%, -100%)";

        // Add marker
        marker.current = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                    `
                    <div class="p-2">
                        <h3 class="font-semibold text-sm">${placeName}</h3>
                        <p class="text-xs text-gray-600">${address}</p>
                    </div>
                    `
                )
            )
            .addTo(map.current);

        // Show popup by default
        marker.current.togglePopup();

        // Clean up on unmount
        return () => {
            marker.current?.remove();
            map.current?.remove();
            map.current = null;
        };
    }, [latitude, longitude, placeName, address]);

    return (
        <div className="space-y-4">
            {/* Map Container */}
            <div className="border rounded-lg overflow-hidden shadow-sm">
                <div ref={mapContainer} className="h-[300px] w-full" />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-blue-900">
                    Verify this location is correct
                </p>
                <p className="text-xs text-blue-700">
                    <span className="font-medium">Coordinates:</span> {latitude},{" "}
                    {longitude}
                </p>
                <p className="text-xs text-blue-600">
                    The marker shows where this location will appear on maps. If it
                    looks wrong, you can edit the address and try again.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1"
                >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    This Looks Wrong
                </Button>
                <Button
                    onClick={onConfirm}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Looks Good, Approve
                </Button>
            </div>
        </div>
    );
}
