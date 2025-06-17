
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
}

export class UnsplashService {
  private static readonly BASE_URL = 'https://api.unsplash.com';
  
  // This should be handled by a Supabase Edge Function in production
  private static getAccessKey(): string | null {
    // For now, return null to disable Unsplash until proper backend integration
    // In production, this would come from a Supabase Edge Function
    return null;
  }

  static async searchPhotos(query: string, page: number = 1, perPage: number = 12): Promise<UnsplashSearchResponse> {
    const accessKey = this.getAccessKey();
    
    if (!accessKey) {
      // Return empty results when no API key is available
      return {
        results: [],
        total: 0,
        total_pages: 0
      };
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${accessKey}`,
            'Accept-Version': 'v1',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching Unsplash photos:', error);
      // Return empty results on error instead of throwing
      return {
        results: [],
        total: 0,
        total_pages: 0
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
