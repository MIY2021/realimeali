
import { supabase } from "@/integrations/supabase/client";

interface UnsplashPhoto {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
  alt_description?: string;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
  error?: string;
}

export class UnsplashService {
  static async searchPhotos(query: string, page: number = 1, perPage: number = 12): Promise<UnsplashSearchResponse> {
    try {
      console.log('🔍 UnsplashService: Searching via Edge Function for:', query);
      
      const { data, error } = await supabase.functions.invoke('unsplash-search', {
        body: {
          query,
          page,
          perPage
        }
      });

      if (error) {
        console.error('🔍 UnsplashService: Edge function error:', error);
        return {
          results: [],
          total: 0,
          total_pages: 0,
          error: 'Failed to search images'
        };
      }

      console.log('🔍 UnsplashService: Search response:', data);
      return data as UnsplashSearchResponse;
    } catch (error) {
      console.error('🔍 UnsplashService: Search failed:', error);
      return {
        results: [],
        total: 0,
        total_pages: 0,
        error: 'Search failed'
      };
    }
  }

  static getPhotoAttribution(photo: UnsplashPhoto): {
    photographerName: string;
    photographerUrl: string;
    imageUrl: string;
  } {
    return {
      photographerName: photo.user.name,
      photographerUrl: photo.user.links.html,
      imageUrl: photo.urls.regular,
    };
  }
}
