
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader, AlertCircle } from "lucide-react";
import { UnsplashService } from "@/services/unsplashService";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import the interface from the service to avoid duplication
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

interface UnsplashImageSearchProps {
  recipe: CommunityRecipe;
  onImageSelect: (imageUrl: string, photographerName: string, photographerUrl: string) => void;
}

export function UnsplashImageSearch({ recipe, onImageSelect }: UnsplashImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      console.log('🔍 UnsplashImageSearch: Starting search for:', searchQuery);
      const response = await UnsplashService.searchPhotos(searchQuery, page, 12);
      
      console.log('🔍 UnsplashImageSearch: Search response:', response);
      
      if (page === 1) {
        setPhotos(response.results);
      } else {
        setPhotos(prev => [...prev, ...response.results]);
      }
      
      setCurrentPage(page);
      setHasMore(page < response.total_pages);
    } catch (error) {
      console.error('Unsplash search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = (photo: UnsplashPhoto) => {
    const attribution = UnsplashService.getPhotoAttribution(photo);
    setSelectedPhotoId(photo.id);
    onImageSelect(attribution.imageUrl, attribution.photographerName, attribution.photographerUrl);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      handleSearch(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Search Unsplash for Food Images</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Search for food images (e.g., pasta, salad, cookies)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button
            onClick={() => handleSearch()}
            disabled={isLoading || !searchQuery.trim()}
            variant="outline"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* API Not Configured Alert */}
      {hasSearched && photos.length === 0 && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unsplash API is not currently configured. To enable image search, please configure the Unsplash API key in your backend settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Results Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                  selectedPhotoId === photo.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePhotoSelect(photo)}
              >
                <img
                  src={photo.urls.thumb}
                  alt={photo.alt_description || 'Food photo'}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{photo.user.name}</span>
                    <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
                {selectedPhotoId === photo.id && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      ✓
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Images'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Attribution Notice */}
      <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
        <p className="font-medium mb-1">About Unsplash Images:</p>
        <p>• All images are free to use under the Unsplash License</p>
        <p>• Photographer attribution will be automatically included</p>
        <p>• Images link directly to Unsplash (no download required)</p>
        <p>• API configuration required for search functionality</p>
      </div>
    </div>
  );
}
