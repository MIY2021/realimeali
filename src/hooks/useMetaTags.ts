
import { useEffect } from 'react';

export interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  author?: string;
  keywords?: string;
}

export const useMetaTags = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'RealiMeali',
  author,
  keywords
}: MetaTagsProps) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Get current URL if not provided
    const currentUrl = url || window.location.href;
    
    // Default image fallback
    const defaultImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center';
    const metaImage = image || defaultImage;

    // Define all meta tags to update
    const metaTags = [
      // Primary Meta Tags
      { name: 'description', content: description },
      
      // Open Graph Meta Tags
      { property: 'og:type', content: type },
      { property: 'og:url', content: currentUrl },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: metaImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'en_US' },
      
      // Twitter Card Meta Tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: currentUrl },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: metaImage },
    ];

    // Add optional meta tags
    if (author) {
      metaTags.push({ name: 'author', content: author });
    }
    
    if (keywords) {
      metaTags.push({ name: 'keywords', content: keywords });
    }

    // Function to update or create meta tag
    const updateMetaTag = (tagData: { name?: string; property?: string; content: string }) => {
      const selector = tagData.name ? `meta[name="${tagData.name}"]` : `meta[property="${tagData.property}"]`;
      let metaTag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (tagData.name) {
          metaTag.setAttribute('name', tagData.name);
        } else if (tagData.property) {
          metaTag.setAttribute('property', tagData.property);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', tagData.content);
    };

    // Apply all meta tags
    metaTags.forEach(updateMetaTag);

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

  }, [title, description, image, url, type, siteName, author, keywords]);
};
