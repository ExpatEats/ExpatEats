import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

interface Place {
    id: number;
    uniqueId?: string;
    name: string;
    description: string;
    address: string;
    city: string;
    region?: string;
    country: string;
    category: string;
    tags: string[];
    latitude?: string;
    longitude?: string;

    // Contact Information
    phone?: string;
    email?: string;

    // Social Media
    instagram?: string;
    website?: string;

    imageUrl?: string;
    averageRating?: number;
    createdAt?: string;
}

interface MapViewProps {
    places: Place[];
    onPlaceClick?: (place: Place) => void;
}

// City center coordinates for fallback
const CITY_CENTERS: { [key: string]: [number, number] } = {
    lisbon: [-9.1393, 38.7223],
    cascais: [-9.4214, 38.6979],
    oeiras: [-9.3128, 38.6872],
    sintra: [-9.3876, 38.8029],
    portugal: [-8.2245, 39.3999], // Portugal center
};

export function MapView({ places, onPlaceClick }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create custom shopping basket icon SVG
    const createCustomMarker = (hasAddress: boolean = true) => {
        const color = hasAddress ? "#E07A5F" : "#9CA3AF"; // Orange for valid, gray for no address
        const el = document.createElement("div");
        el.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2"/>
        <!-- Shopping Basket Icon -->
        <path d="M5.5 8L7 16h10l1.5-8H5.5z" fill="white" stroke="white" stroke-width="0.5"/>
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="white" stroke-width="1.2" fill="none"/>
        <path d="M8 12h8" stroke="${color}" stroke-width="1"/>
        <circle cx="8.5" cy="18.5" r="1" fill="white"/>
        <circle cx="15.5" cy="18.5" r="1" fill="white"/>
      </svg>
    `;
        el.style.cursor = "pointer";
        el.style.transform = "translate(-50%, -100%)";
        return el;
    };

    const getCityCenter = (cityName: string): [number, number] => {
        const city = cityName.toLowerCase();
        return CITY_CENTERS[city] || CITY_CENTERS["lisbon"];
    };

    const geocodeAddress = async (
        address: string,
        city: string,
    ): Promise<[number, number] | null> => {
        try {
            const token =
                import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
                (window as any).VITE_MAPBOX_ACCESS_TOKEN ||
                "pk.eyJ1IjoibWljaGFlbGVrIiwiYSI6ImNtYzBja3R5MzAwdDQya29kODdrNnNyYXQifQ._51Nw5m36McY40ID6SdWhQ";

            // Use Mapbox Geocoding API
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    `${address}, ${city}, Portugal`,
                )}.json?access_token=${token}&country=PT&limit=1`,
            );

            if (!response.ok) {
                throw new Error("Geocoding failed");
            }

            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                return [lng, lat];
            }
            return null;
        } catch (error) {
            console.warn("Geocoding failed for address:", address, error);
            return null;
        }
    };

    useEffect(() => {
        const token =
            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
            (window as any).VITE_MAPBOX_ACCESS_TOKEN ||
            "pk.eyJ1IjoibWljaGFlbGVrIiwiYSI6ImNtYzBja3R5MzAwdDQya29kODdrNnNyYXQifQ._51Nw5m36McY40ID6SdWhQ";

        if (!token) {
            console.error("Mapbox access token is required");
            setIsLoading(false);
            return;
        }

        if (!mapContainer.current) return;

        mapboxgl.accessToken = token;

        // Initialize map
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: getCityCenter(
                places.length > 0 ? places[0].city : "lisbon",
            ),
            zoom: 11,
        });

        map.current.on("load", () => {
            setIsLoading(false);
        });

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current || isLoading) return;

        // Clear existing markers
        markers.current.forEach((marker) => marker.remove());
        markers.current = [];

        const addMarkersToMap = async () => {
            const bounds = new mapboxgl.LngLatBounds();
            let validCoordinates = false;

            for (const place of places) {
                let coordinates: [number, number] | null = null;
                let hasValidAddress = false;

                // Check if place already has coordinates
                if (place.latitude && place.longitude) {
                    // Convert to string and validate
                    const latStr = String(place.latitude).trim();
                    const lngStr = String(place.longitude).trim();

                    if (latStr !== "" && lngStr !== "") {
                        const lat = parseFloat(latStr);
                        const lng = parseFloat(lngStr);

                        // Validate parsed coordinates are valid numbers
                        if (!isNaN(lat) && !isNaN(lng)) {
                            coordinates = [lng, lat];
                            hasValidAddress = true;
                        }
                    }
                }

                // If no valid coordinates, use city center
                if (!coordinates) {
                    coordinates = getCityCenter(place.city);
                    hasValidAddress = false;
                }

                // Create marker
                const markerElement = createCustomMarker(hasValidAddress);
                const marker = new mapboxgl.Marker(markerElement)
                    .setLngLat(coordinates)
                    .addTo(map.current!);

                // Create popup content
                const contactInfo =
                    place.phone || place.email
                        ? `<div class="mb-2">
               ${place.phone ? `<p class="text-xs text-gray-600">📞 ${place.phone}</p>` : ""}
               ${place.email ? `<p class="text-xs text-gray-600">✉️ ${place.email}</p>` : ""}
             </div>`
                        : "";

                const instagramLink = place.instagram
                    ? `<div class="mb-2">
               <a
                 href="${place.instagram.startsWith("http") ? place.instagram : `https://instagram.com/${place.instagram.replace("@", "")}`}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="text-xs text-[#E07A5F] hover:text-[#d06851] font-medium"
               >
                 📷 Instagram
               </a>
             </div>`
                    : "";

                const popupContent = `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-sm mb-1">${place.name}</h3>
            <div class="flex flex-wrap gap-1 mb-2">
              ${place.tags
                  .slice(0, 3)
                  .map(
                      (tag) =>
                          `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">${tag}</span>`,
                  )
                  .join("")}
            </div>
            <p class="text-xs text-gray-600 mb-2">${place.address || "Address not provided"}</p>
            ${contactInfo}
            ${instagramLink}
            ${
                !hasValidAddress
                    ? '<p class="text-xs text-orange-600 mb-2">📍 Approximate location - exact address not available</p>'
                    : ""
            }
            <button
              onclick="window.viewStoreDetails(${place.id})"
              class="w-full bg-[#E07A5F] text-white text-xs py-1 px-2 rounded hover:bg-[#d06851] transition-colors"
            >
              View Details
            </button>
          </div>
        `;

                const popup = new mapboxgl.Popup({
                    offset: 25,
                    className: "custom-popup",
                }).setHTML(popupContent);

                marker.setPopup(popup);

                // Add click handler
                markerElement.addEventListener("click", () => {
                    if (onPlaceClick) {
                        onPlaceClick(place);
                    }
                });

                markers.current.push(marker);

                if (hasValidAddress || places.length === 1) {
                    bounds.extend(coordinates);
                    validCoordinates = true;
                }
            }

            // Fit map to bounds if we have valid coordinates
            if (validCoordinates && markers.current.length > 1) {
                map.current!.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: 15,
                });
            } else if (markers.current.length === 1) {
                // For single marker, center on it
                let centerCoords: [number, number];

                // Use same validation as marker placement
                if (places[0].latitude && places[0].longitude) {
                    const latStr = String(places[0].latitude).trim();
                    const lngStr = String(places[0].longitude).trim();

                    if (latStr !== "" && lngStr !== "") {
                        const lat = parseFloat(latStr);
                        const lng = parseFloat(lngStr);

                        if (!isNaN(lat) && !isNaN(lng)) {
                            centerCoords = [lng, lat];
                        } else {
                            centerCoords = getCityCenter(places[0].city);
                        }
                    } else {
                        centerCoords = getCityCenter(places[0].city);
                    }
                } else {
                    centerCoords = getCityCenter(places[0].city);
                }

                map.current!.setCenter(centerCoords);
                map.current!.setZoom(14);
            }
        };

        addMarkersToMap();
    }, [places, isLoading, onPlaceClick]);

    const token =
        import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
        (window as any).VITE_MAPBOX_ACCESS_TOKEN ||
        "pk.eyJ1IjoibWljaGFlbGVrIiwiYSI6ImNtYzBja3R5MzAwdDQya29kODdrNnNyYXQifQ._51Nw5m36McY40ID6SdWhQ";

    if (!token) {
        return (
            <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                        Map functionality requires Mapbox configuration
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-full overflow-hidden">
            <div
                ref={mapContainer}
                className="h-[400px] sm:h-[500px] w-full max-w-full rounded-lg overflow-hidden"
                style={{ minHeight: "400px", maxWidth: "100%" }}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F] mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading map...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
