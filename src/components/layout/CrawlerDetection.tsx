
import { useEffect } from 'react';

interface CrawlerDetectionProps {
  children: React.ReactNode;
}

export const CrawlerDetection = ({ children }: CrawlerDetectionProps) => {
  useEffect(() => {
    // Check if this is likely a social media crawler
    const userAgent = navigator.userAgent?.toLowerCase() || '';
    const isCrawler = userAgent.includes('facebookexternalhit') || 
                     userAgent.includes('twitterbot') || 
                     userAgent.includes('linkedinbot') || 
                     userAgent.includes('slackbot') || 
                     userAgent.includes('whatsapp') ||
                     userAgent.includes('telegram') ||
                     userAgent.includes('discord');

    // If it's a crawler and we're not already on the crawler endpoint
    if (isCrawler && !window.location.pathname.startsWith('/_crawler')) {
      // Redirect to crawler endpoint
      const crawlerUrl = `/_crawler${window.location.pathname}${window.location.search}`;
      window.location.href = crawlerUrl;
      return;
    }
  }, []);

  return <>{children}</>;
};
