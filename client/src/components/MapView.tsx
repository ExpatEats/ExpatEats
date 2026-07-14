import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import type { Place } from "@shared/schema";
import { getTagsFromPlace } from "@/lib/tagUtils";

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
        const color = hasAddress ? "#2C1F0F" : "#9CA3AF"; // Dark brown (soil) for valid, gray for no address
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

    // Navigation helper functions
    const openGoogleMaps = (place: Place) => {
        if (place.latitude && place.longitude) {
            const lat = parseFloat(String(place.latitude));
            const lng = parseFloat(String(place.longitude));
            if (!isNaN(lat) && !isNaN(lng)) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                return;
            }
        }
        const fullAddress = `${place.address}, ${place.city}, ${place.country}`;
        const encodedAddress = encodeURIComponent(fullAddress);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    const openWaze = (place: Place) => {
        if (place.latitude && place.longitude) {
            const lat = parseFloat(String(place.latitude));
            const lng = parseFloat(String(place.longitude));
            if (!isNaN(lat) && !isNaN(lng)) {
                window.open(`https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
                return;
            }
        }
        const fullAddress = `${place.address}, ${place.city}, ${place.country}`;
        window.open(`https://www.waze.com/ul?q=${encodeURIComponent(fullAddress)}`, '_blank');
    };

    // Set up global functions for popup buttons
    useEffect(() => {
        (window as any).viewStoreDetails = (placeId: number) => {
            const place = places.find(p => p.id === placeId);
            if (place && onPlaceClick) {
                onPlaceClick(place);
            }
        };

        (window as any).openGoogleMapsFromPopup = (placeId: number) => {
            const place = places.find(p => p.id === placeId);
            if (place) {
                openGoogleMaps(place);
            }
        };

        (window as any).openWazeFromPopup = (placeId: number) => {
            const place = places.find(p => p.id === placeId);
            if (place) {
                openWaze(place);
            }
        };

        return () => {
            delete (window as any).viewStoreDetails;
            delete (window as any).openGoogleMapsFromPopup;
            delete (window as any).openWazeFromPopup;
        };
    }, [places, onPlaceClick]);

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

                        // Validate parsed coordinates are valid numbers and within valid ranges
                        // Latitude: -90 to 90, Longitude: -180 to 180
                        if (
                            !isNaN(lat) && !isNaN(lng) &&
                            lat >= -90 && lat <= 90 &&
                            lng >= -180 && lng <= 180
                        ) {
                            coordinates = [lng, lat];
                            hasValidAddress = true;
                        } else if (!isNaN(lat) && !isNaN(lng)) {
                            // Log invalid coordinates for debugging
                            console.warn(`Invalid coordinates for ${place.name}: lat=${lat}, lng=${lng}`);
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
                 class="text-xs text-bark hover:text-bark font-medium"
               >
                 📷 Instagram
               </a>
             </div>`
                    : "";

                const placeTags = getTagsFromPlace(place);
                const popupContent = `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-sm mb-1">${place.name}</h3>
            <div class="flex flex-wrap gap-1 mb-2">
              ${placeTags
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
            <div class="flex gap-2 mb-2">
              <button
                onclick="window.openGoogleMapsFromPopup(${place.id})"
                class="flex-1 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs py-2 px-2 rounded transition-colors flex items-center justify-center gap-1"
                title="Open in Google Maps"
              >
                <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 9.5C17.096 9.5 11.5 15.096 11.5 22C11.5 30.5 24 42.5 24 42.5C24 42.5 36.5 30.5 36.5 22C36.5 15.096 30.904 9.5 24 9.5Z" fill="#EA4335"/>
                  <circle cx="24" cy="22" r="7" fill="#FBBC04"/>
                  <path d="M24 15C20.134 15 17 18.134 17 22C17 25.866 20.134 29 24 29C27.866 29 31 25.866 31 22C31 18.134 27.866 15 24 15ZM24 26C21.791 26 20 24.209 20 22C20 19.791 21.791 18 24 18C26.209 18 28 19.791 28 22C28 24.209 26.209 26 24 26Z" fill="white"/>
                  <circle cx="24" cy="22" r="2.5" fill="#4285F4"/>
                </svg>
                Google Maps
              </button>
              <button
                onclick="window.openWazeFromPopup(${place.id})"
                class="flex-1 bg-[#33CCFF] hover:bg-[#00B8FF] text-white text-xs py-2 px-2 rounded transition-colors flex items-center justify-center gap-1"
                title="Open in Waze"
              >
                <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M36.5 23.5C36.5 23.5 35.8 22.3 34.2 21.7C33.9 21.6 33.6 21.5 33.3 21.5C32.7 21.5 32.2 21.7 31.8 22C31.3 22.4 31 23 31 23.7C31 24 31.1 24.3 31.2 24.6C31.5 25.3 32.1 25.8 32.9 26C33.1 26.1 33.3 26.1 33.5 26.1C34.3 26.1 35 25.6 35.3 24.9C35.4 24.7 35.5 24.4 35.5 24.2C35.5 23.9 35.5 23.7 35.4 23.5H36.5ZM16.5 23.5C16.5 23.5 15.8 22.3 14.2 21.7C13.9 21.6 13.6 21.5 13.3 21.5C12.7 21.5 12.2 21.7 11.8 22C11.3 22.4 11 23 11 23.7C11 24 11.1 24.3 11.2 24.6C11.5 25.3 12.1 25.8 12.9 26C13.1 26.1 13.3 26.1 13.5 26.1C14.3 26.1 15 25.6 15.3 24.9C15.4 24.7 15.5 24.4 15.5 24.2C15.5 23.9 15.5 23.7 15.4 23.5H16.5Z" fill="white"/>
                  <path d="M24 8C15.2 8 8 14.8 8 23.1C8 27.3 9.8 31.1 12.7 33.8C13.1 37.2 11.5 39.5 11.5 39.5C11.5 39.5 15.8 39.8 18.9 37.3C20.5 37.8 22.2 38 24 38C32.8 38 40 31.4 40 23.1C40 14.8 32.8 8 24 8Z" fill="white"/>
                  <circle cx="15" cy="24" r="1.5" fill="#000"/>
                  <circle cx="33" cy="24" r="1.5" fill="#000"/>
                  <path d="M24 30C20.7 30 18 28.2 17 26H31C30 28.2 27.3 30 24 30Z" fill="#000" opacity="0.2"/>
                </svg>
                Waze
              </button>
            </div>
            <button
              onclick="window.viewStoreDetails(${place.id})"
              class="w-full bg-bark text-white text-xs py-2 px-2 rounded hover:bg-bark transition-colors"
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

                // Marker click will automatically show popup
                // "View Details" button in popup will call window.viewStoreDetails()

                markers.current.push(marker);

                // Always extend bounds for all markers, not just valid addresses
                // This ensures all markers are visible on the map
                bounds.extend(coordinates);
                validCoordinates = true;
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bark mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading map...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
