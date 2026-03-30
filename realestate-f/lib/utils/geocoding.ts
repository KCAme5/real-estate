/**
 * Geocoding utility using OpenStreetMap's Nominatim API
 * Converts addresses to latitude/longitude coordinates
 */

interface GeocodeResult {
    latitude: number;
    longitude: number;
    displayName: string;
}

interface NominatimResponse {
    lat: string;
    lon: string;
    display_name: string;
}

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim
 * @param address - The address to geocode
 * @returns Promise with latitude, longitude, and display name
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
            {
                headers: {
                    'User-Agent': 'TugaiRealtorsRealEstate/1.0',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }

        const data: NominatimResponse[] = await response.json();

        if (data.length === 0) {
            return null;
        }

        return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
            displayName: data[0].display_name,
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Reverse geocode coordinates to an address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with display name address
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    'User-Agent': 'TugaiRealtorsRealEstate/1.0',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Reverse geocoding request failed');
        }

        const data = await response.json();

        return data.display_name || null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

/**
 * Batch geocode multiple addresses
 * @param addresses - Array of addresses to geocode
 * @returns Promise with array of geocode results
 */
export async function batchGeocode(addresses: string[]): Promise<(GeocodeResult | null)[]> {
    // Add delay between requests to respect Nominatim usage policy
    const results: (GeocodeResult | null)[] = [];

    for (const address of addresses) {
        const result = await geocodeAddress(address);
        results.push(result);

        // Wait 1 second between requests to respect rate limit
        if (addresses.indexOf(address) < addresses.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    return results;
}
