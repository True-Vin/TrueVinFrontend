import { useState, useEffect } from 'react';
import { Vehicle } from '../types/vehicle';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://p42429x0l5.execute-api.eu-north-1.amazonaws.com/vehicles";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();

        // Filter only those vehicles which have allpagedata_passed
        const filteredData = result.filter(
          (vehicle: Vehicle) => vehicle.allpagedata_passed === true
        );

        // For images use only allpagedata_images
        // For details only use allpagedata_fields
        const formattedData = filteredData.map((vehicle: Vehicle) => ({
          ...vehicle,
          details: vehicle.allpagedata_fields ?? {},
          images: vehicle.allpagedata_images ?? []
        }));

        setVehicles(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return { vehicles, loading };
} 