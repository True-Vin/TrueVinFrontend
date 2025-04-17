import { useEffect } from 'react';
import { Vehicle } from '../types/vehicle';

interface DynamicMetaProps {
  vehicle: Vehicle;
}

export function DynamicMeta({ vehicle }: DynamicMetaProps) {
  useEffect(() => {
    if (!vehicle) return;

    const title = vehicle.allpagedata_fields.VehicleTitle || 'Vehicle Detail';
    const description = `${vehicle.allpagedata_fields.Year} ${vehicle.allpagedata_fields.Make} ${vehicle.allpagedata_fields.Model} - Stock #${vehicle.stock_number}`;
    const image = vehicle.allpagedata_images[0] || '/og-image.html';

    // Update meta tags
    document.title = `${title} | TrueVin`;
    
    // Update Open Graph meta tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': window.location.href,
    };

    // Update Twitter meta tags
    const twitterTags = {
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    };

    // Update all meta tags
    Object.entries({ ...ogTags, ...twitterTags }).forEach(([property, content]) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    });

    // Cleanup function
    return () => {
      document.title = 'TrueVin - Vehicle Marketplace';
      // Reset meta tags to default values
      const defaultTags = {
        'og:title': 'TrueVin - Vehicle Marketplace',
        'og:description': 'Your trusted vehicle marketplace. Browse, buy, and sell vehicles with confidence.',
        'og:image': '/og-image.html',
        'og:url': 'https://truevin.com',
        'twitter:title': 'TrueVin - Vehicle Marketplace',
        'twitter:description': 'Your trusted vehicle marketplace. Browse, buy, and sell vehicles with confidence.',
        'twitter:image': '/og-image.html',
      };

      Object.entries(defaultTags).forEach(([property, content]) => {
        const element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (element) {
          element.setAttribute('content', content);
        }
      });
    };
  }, [vehicle]);

  return null;
} 