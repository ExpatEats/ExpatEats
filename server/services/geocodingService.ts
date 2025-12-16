import type { Place } from "../../shared/schema";

/**
 * Geoapify Geocoding Service
 *
 * Provides geocoding capabilities using the Geoapify API
 * Free tier: 3,000 requests/day
 * Documentation: https://www.geoapify.com/geocoding-api
 */

export interface GeocodeResult {
  success: boolean;
  coordinates?: { latitude: string; longitude: string };
  confidence?: number;
  formattedAddress?: string;
  error?: string;
}

export interface BatchGeocodeResult {
  placeId: number;
  placeName: string;
  success: boolean;
  coordinates?: { latitude: string; longitude: string };
  error?: string;
}

export class GeocodingService {
  private static readonly API_KEY = process.env.GEOAPIFY_API_KEY;
  private static readonly BASE_URL = "https://api.geoapify.com/v1/geocode/search";

  // Portugal geographic bounds for validation
  private static readonly PORTUGAL_BOUNDS = {
    mainland: {
      minLat: 36.95,
      maxLat: 42.15,
      minLng: -9.5,
      maxLng: -6.2,
    },
    azores: {
      minLat: 36.8,
      maxLat: 39.8,
      minLng: -31.5,
      maxLng: -24.5,
    },
    madeira: {
      minLat: 32.3,
      maxLat: 33.2,
      minLng: -17.3,
      maxLng: -16.2,
    },
  };

  /**
   * Geocode a single address using Geoapify API
   *
   * @param address - Street address
   * @param city - City name
   * @param region - Optional region/district
   * @param country - Country (default: Portugal)
   * @returns GeocodeResult with coordinates or error
   */
  static async geocodeAddress(
    address: string,
    city: string,
    region?: string,
    country: string = "Portugal"
  ): Promise<GeocodeResult> {
    if (!this.API_KEY) {
      console.error("GEOAPIFY_API_KEY is not configured");
      return {
        success: false,
        error: "Geocoding service is not configured. Please contact support.",
      };
    }

    try {
      const formattedAddress = this.formatAddress(address, city, region, country);
      const url = `${this.BASE_URL}?text=${encodeURIComponent(formattedAddress)}&apiKey=${this.API_KEY}&filter=countrycode:pt&limit=1`;

      console.log(`Geocoding address: ${formattedAddress}`);

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Geoapify API authentication failed");
          return {
            success: false,
            error: "Geocoding service authentication failed. Please check API key.",
          };
        }

        if (response.status === 429) {
          console.error("Geoapify API rate limit exceeded");
          return {
            success: false,
            error: "Geocoding rate limit exceeded. Please try again later.",
          };
        }

        throw new Error(`Geoapify API returned status ${response.status}`);
      }

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        console.warn(`No geocoding results found for: ${formattedAddress}`);
        return {
          success: false,
          error: "No coordinates found for this address. The address may be too vague or incorrect.",
        };
      }

      const feature = data.features[0];
      const [lng, lat] = feature.geometry.coordinates;
      const confidence = feature.properties?.rank?.confidence || 0;

      // Validate confidence score
      if (confidence < 0.5) {
        console.warn(`Low confidence geocoding result (${confidence}) for: ${formattedAddress}`);
        return {
          success: false,
          error: "Geocoding result has low confidence. Please provide a more specific address.",
        };
      }

      // Validate coordinates are within Portugal
      if (!this.validatePortugalCoordinates(lat, lng)) {
        console.warn(`Coordinates outside Portugal bounds: ${lat}, ${lng}`);
        return {
          success: false,
          error: "Geocoded coordinates are outside Portugal. Please verify the address.",
        };
      }

      const coordinates = {
        latitude: lat.toFixed(7),
        longitude: lng.toFixed(7),
      };

      console.log(`Successfully geocoded: ${formattedAddress} -> ${coordinates.latitude}, ${coordinates.longitude}`);

      return {
        success: true,
        coordinates,
        confidence,
        formattedAddress: feature.properties?.formatted || formattedAddress,
      };

    } catch (error) {
      console.error("Geocoding error:", error);

      // Retry once on network failure
      try {
        console.log("Retrying geocoding after error...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay before retry

        const formattedAddress = this.formatAddress(address, city, region, country);
        const url = `${this.BASE_URL}?text=${encodeURIComponent(formattedAddress)}&apiKey=${this.API_KEY}&filter=countrycode:pt&limit=1`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Retry failed with status ${response.status}`);

        const data = await response.json();
        if (!data.features || data.features.length === 0) {
          return {
            success: false,
            error: "No coordinates found for this address.",
          };
        }

        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        const confidence = feature.properties?.rank?.confidence || 0;

        if (confidence < 0.5 || !this.validatePortugalCoordinates(lat, lng)) {
          return {
            success: false,
            error: "Geocoding result quality is insufficient.",
          };
        }

        const coordinates = {
          latitude: lat.toFixed(7),
          longitude: lng.toFixed(7),
        };

        console.log(`Retry successful: ${coordinates.latitude}, ${coordinates.longitude}`);

        return {
          success: true,
          coordinates,
          confidence,
          formattedAddress: feature.properties?.formatted || formattedAddress,
        };

      } catch (retryError) {
        console.error("Retry also failed:", retryError);
        return {
          success: false,
          error: "Geocoding service is temporarily unavailable. Please try again later.",
        };
      }
    }
  }

  /**
   * Batch geocode multiple places with rate limiting
   *
   * @param places - Array of Place objects to geocode
   * @returns Array of BatchGeocodeResult
   */
  static async geocodeBatch(places: Place[]): Promise<BatchGeocodeResult[]> {
    const results: BatchGeocodeResult[] = [];

    console.log(`Starting batch geocoding for ${places.length} places`);

    for (let i = 0; i < places.length; i++) {
      const place = places[i];

      console.log(`Geocoding ${i + 1}/${places.length}: ${place.name}`);

      const result = await this.geocodeAddress(
        place.address,
        place.city,
        place.region || undefined,
        place.country
      );

      results.push({
        placeId: place.id,
        placeName: place.name,
        success: result.success,
        coordinates: result.coordinates,
        error: result.error,
      });

      // Rate limiting: 200ms delay between requests
      // This ensures we don't exceed API rate limits
      if (i < places.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Batch geocoding complete: ${successful} successful, ${failed} failed`);

    return results;
  }

  /**
   * Validate that coordinates are within Portugal's geographic bounds
   * Includes mainland, Azores, and Madeira
   *
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns true if coordinates are within Portugal, false otherwise
   */
  static validatePortugalCoordinates(lat: number, lng: number): boolean {
    const { mainland, azores, madeira } = this.PORTUGAL_BOUNDS;

    // Check mainland Portugal
    if (
      lat >= mainland.minLat &&
      lat <= mainland.maxLat &&
      lng >= mainland.minLng &&
      lng <= mainland.maxLng
    ) {
      return true;
    }

    // Check Azores
    if (
      lat >= azores.minLat &&
      lat <= azores.maxLat &&
      lng >= azores.minLng &&
      lng <= azores.maxLng
    ) {
      return true;
    }

    // Check Madeira
    if (
      lat >= madeira.minLat &&
      lat <= madeira.maxLat &&
      lng >= madeira.minLng &&
      lng <= madeira.maxLng
    ) {
      return true;
    }

    return false;
  }

  /**
   * Format address components into a single string for geocoding
   *
   * @param address - Street address
   * @param city - City name
   * @param region - Optional region/district
   * @param country - Country name
   * @returns Formatted address string
   */
  private static formatAddress(
    address: string,
    city: string,
    region?: string,
    country: string = "Portugal"
  ): string {
    const parts = [address, city];

    if (region) {
      parts.push(region);
    }

    parts.push(country);

    return parts.filter(Boolean).join(", ");
  }
}
