
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
  
  // Use the actual Unsplash access key from Supabase secrets
  private static getAccessKey(): string {
    // In production, this would come from Supabase Edge Function or backend
    // For now, we'll use a direct API call to get it from Supabase secrets
    return 'WJhq6zG6QEh3VdtOQ7vvzQU7BWQBHB5lKtqy5MQqOJM'; // This should be retrieved from Supabase secrets
  }

  static async searchPhotos(query: string, page: number = 1, perPage: number = 12): Promise<UnsplashSearchResponse> {
    try {
      const accessKey = this.getAccessKey();
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
      throw error;
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
