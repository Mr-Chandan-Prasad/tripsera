// Google Places API Service
const PLACES_API_KEY = 'your_google_places_api_key'; // Get from https://developers.google.com/maps/documentation/places/web-service

export interface Place {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  vicinity: string;
  types: string[];
  photos?: any[];
  price_level?: number;
}

export interface PlacesResponse {
  results: Place[];
  status: string;
}

export class PlacesService {
  static async searchNearbyPlaces(
    lat: number, 
    lon: number, 
    radius: number = 5000,
    type: string = 'tourist_attraction'
  ): Promise<Place[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${PLACES_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Places API request failed');
      }
      
      const data: PlacesResponse = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Places API Error: ${data.status}`);
      }
      
      return data.results;
    } catch (error) {
      console.error('Places API Error:', error);
      throw error;
    }
  }

  static async searchPlacesByText(query: string, location?: string): Promise<Place[]> {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${PLACES_API_KEY}`;
      
      if (location) {
        url += `&location=${location}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Places API request failed');
      }
      
      const data: PlacesResponse = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Places API Error: ${data.status}`);
      }
      
      return data.results;
    } catch (error) {
      console.error('Places API Error:', error);
      throw error;
    }
  }

  static getPlacePhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${PLACES_API_KEY}`;
  }
}
