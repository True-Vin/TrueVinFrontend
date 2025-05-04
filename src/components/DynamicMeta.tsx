// src/components/DynamicMeta.tsx
import { useEffect } from 'react';
import { Vehicle } from '../types/vehicle';

interface DynamicMetaProps {
  vehicle: Vehicle | null;
}

export function DynamicMeta({ vehicle }: DynamicMetaProps) {
  useEffect(() => {
    if (!vehicle) return;

    // 1) Flatten old vs new schema into a single `fields` object
    const fields: Record<string, any> = {};
    if (vehicle.allpagedata_fields && Object.keys(vehicle.allpagedata_fields).length) {
      Object.assign(fields, vehicle.allpagedata_fields);
    } else if (vehicle.details) {
      try {
        const arr: Array<Record<string, string>> = JSON.parse(vehicle.details);
        arr.forEach(obj => {
          const key = Object.keys(obj)[0];
          fields[key] = obj[key];
        });
      } catch {
        // ignore parse errors
      }
    }

    // 2) Compute a title
    let title =
      fields.VehicleTitle ||
      (fields.Year && fields.Make && fields.Model
        ? `${fields.Year} ${fields.Make} ${fields.Model}`
        : vehicle.stock_number);
    const pageTitle = `${title} | TrueVin`;

    // 3) Compute full VIN
    const vin =
      (fields.VIN || '').toString().trim() ||
      (vehicle.ocr_result || '').toString().trim();
    const vinMetaContent = vin || '';

    // 4) Compute description
    const description = `${fields.Year ?? ''} ${fields.Make ?? ''} ${fields.Model ?? ''}`
      .trim()
      .concat(vinMetaContent ? ` – VIN: ${vinMetaContent}` : '');

    // 5) Pick image
    const image =
      (Array.isArray(vehicle.allpagedata_images) && vehicle.allpagedata_images[0]) ||
      vehicle.one_image ||
      vehicle.html_s3_url ||
      '/og-image.html';

    // 6) Prepare tag maps
    const ogTags: Record<string, string> = {
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': window.location.href,
      'og:type': 'article',
    };
    const twitterTags: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    };

    // 7) Apply document title
    document.title = pageTitle;

    // 8) Insert or update VIN meta
    let vinMeta = document.head.querySelector('meta[name="vehicle:vin"]');
    if (!vinMeta) {
      vinMeta = document.createElement('meta');
      vinMeta.setAttribute('name', 'vehicle:vin');
      document.head.appendChild(vinMeta);
    }
    vinMeta.setAttribute('content', vinMetaContent);

    // 9) Helper to upsert meta by attr
    function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
      const selector = `meta[${attrName}="${attrValue}"]`;
      let el: HTMLMetaElement | null = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    // 10) Apply OG tags and Twitter tags
    Object.entries(ogTags).forEach(([property, content]) =>
      upsertMeta('property', property, content)
    );
    Object.entries(twitterTags).forEach(([name, content]) =>
      upsertMeta('name', name, content)
    );

    // cleanup on unmount or next update
    return () => {
      // reset title
      document.title = 'TrueVin - Vehicle Marketplace';

      // reset VIN meta
      const existingVin = document.head.querySelector('meta[name="vehicle:vin"]');
      if (existingVin) document.head.removeChild(existingVin);

      // reset OG and Twitter tags to defaults
      const defaultOg: Record<string, string> = {
        'og:title': 'TrueVin - Vehicle Marketplace',
        'og:description': 'Your trusted vehicle marketplace. Browse, buy, and sell vehicles with confidence.',
        'og:image': '/og-image.html',
        'og:url': 'https://truevin.com',
        'og:type': 'website',
      };
      const defaultTwitter: Record<string, string> = {
        'twitter:card': 'summary',
        'twitter:title': 'TrueVin - Vehicle Marketplace',
        'twitter:description': 'Your trusted vehicle marketplace. Browse, buy, and sell vehicles with confidence.',
        'twitter:image': '/og-image.html',
      };
      Object.entries(defaultOg).forEach(([prop, content]) =>
        upsertMeta('property', prop, content)
      );
      Object.entries(defaultTwitter).forEach(([name, content]) =>
        upsertMeta('name', name, content)
      );
    };
  }, [vehicle]);

  return null;
}
