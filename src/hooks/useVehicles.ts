// src/hooks/useVehicles.ts
import { useState, useEffect } from 'react';
import { Vehicle } from '../types/vehicle';

/**
 * Fetches the /vehicles feed and returns an array of Vehicle objects plus
 * a loading flag.
 *
 * ✱ Keeps every row that has either  allpagedata_passed  OR  newdata_passed
 * ✱ DOES NOT overwrite existing   details / images / newdata
 * ✱ Falls back to allpagedata_* if those props are missing
 * ✱ Logs the raw API payload and the final list length so you can debug
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading,  setLoading]  = useState(true);

  const API_URL =
    'https://p42429x0l5.execute-api.eu-north-1.amazonaws.com/vehicles';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error(`Fetch failed (${resp.status})`);
        const result: Vehicle[] = await resp.json();

        /* ───── raw payload for inspection ───── */
        console.log('[useVehicles] raw API result:', result);

        /* ───── keep rows that passed either pipeline ───── */
        const filtered = result.filter(
          v => v.allpagedata_passed === true || v.newdata_passed === true
        );

        /* ───── normalise but never clobber existing attrs ───── */
        const formatted = filtered.map(v => ({
          ...v,
          details: v.details ?? v.allpagedata_fields ?? {},
          images : v.images  ?? v.allpagedata_images ?? [],
        }));

        console.log(
          `[useVehicles] after filtering/formatting => ${formatted.length} rows`
        );

        setVehicles(formatted);
      } catch (err) {
        console.error('[useVehicles] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { vehicles, loading };
}
