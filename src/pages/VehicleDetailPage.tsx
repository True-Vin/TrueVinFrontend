// src/pages/VehicleDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DynamicMeta } from '../components/DynamicMeta';
import { Custom360Spin } from '../components/Custom360Spin';
import { ArrowLeft, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────── types ──────────────── */
interface Vehicle {
  stock_number: string;

  /* images */
  one_image?: string;
  allpagedata_images?: string[];
  allpagedata_3sixty?: string[];
  html_s3_url?: string;

  /* old‑schema details */
  details?: string;                       // JSON string
  allpagedata_fields?: Record<string, any>;

  /* NEW attribute */
  newdata?: Record<string, string> | Array<Record<string, string>> | string;

  /* misc */
  vin_display?: string;
  ocr_result?: string;
  final_bid?: string;
  timestamp?: string;
}

export function VehicleDetailPage() {
  const { stockNumber } = useParams<{ stockNumber: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [show360, setShow360] = useState(false);

  const API_BASE =
    'https://p42429x0l5.execute-api.eu-north-1.amazonaws.com/prod';

  /* ─────────── load vehicle once ─────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/stocks/${encodeURIComponent(stockNumber!)}`,
          { headers: { 'x-api-key': '<YOUR_API_KEY>' } }
        );
        if (!res.ok) throw new Error('Failed to fetch vehicle');
        const items: Vehicle[] = await res.json();
        const v = items[0] ?? null;
        setVehicle(v);

        /* hero image */
        if (v) {
          const hero =
            v.allpagedata_images?.[0] || v.one_image || v.html_s3_url || '';
          setMainImage(hero);
        }
      } catch (e) {
        console.error(e);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [stockNumber]);

  const safe = (v: any) =>
    v !== undefined && v !== null && v !== '' ? v : 'Not available';

  /* ───── loader / not‑found ───── */
  if (loading) {
    return (
      <div className="flex-grow flex justify-center items-center h-screen">
        Loading…
      </div>
    );
  }
  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isMenuOpen={false} setIsMenuOpen={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Vehicle not found</h1>
            <Link to="/" className="text-indigo-600">
              Back to listings
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ─────────── images ─────────── */
  const images =
    vehicle.allpagedata_images?.length
      ? vehicle.allpagedata_images
      : vehicle.one_image
      ? [vehicle.one_image]
      : vehicle.html_s3_url
      ? [vehicle.html_s3_url]
      : [];

  const spinImages = vehicle.allpagedata_3sixty || [];

  /* ─────────── OLD details merge ─────────── */
  const oldFields: Record<string, any> = {};
  if (
    vehicle.allpagedata_fields &&
    Object.keys(vehicle.allpagedata_fields).length
  ) {
    Object.assign(oldFields, vehicle.allpagedata_fields);
  } else if (vehicle.details) {
    try {
      const arr: Array<Record<string, string>> = JSON.parse(vehicle.details);
      arr.forEach((o) => {
        const k = Object.keys(o)[0];
        oldFields[k] = o[k];
      });
    } catch {}
  }

  /* ─────────── NEW details merge ─────────── */
  const newFields: Record<string, string> = {};
  if (vehicle.newdata) {
    if (Array.isArray(vehicle.newdata)) {
      vehicle.newdata.forEach((o) => Object.assign(newFields, o));
    } else if (typeof vehicle.newdata === 'string') {
      try {
        const parsed = JSON.parse(vehicle.newdata);
        Object.assign(newFields, parsed);
      } catch {
        /* ignore bad JSON */
      }
    } else if (typeof vehicle.newdata === 'object') {
      Object.assign(newFields, vehicle.newdata);
    }
  }

  /* ─────────── title & meta ─────────── */
  const f = { ...oldFields, ...newFields };
  let title = f.VehicleTitle;
  if (!title && f.Year && f.Make && f.Model) {
    title = `${f.Year} ${f.Make} ${f.Model}`;
  }
  if (!title) title = vehicle.stock_number;

  /* VIN parts */
  const vinFirst11 = (f.VIN || '').slice(0, 11);
  const vinLast6 = (vehicle.ocr_result || '').slice(-6);

  return (
    <motion.div
      className="min-h-screen bg-gray-100 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <DynamicMeta
        vehicle={{ ...vehicle, allpagedata_fields: { ...f, VehicleTitle: title } }}
      />
      <Navbar isMenuOpen={false} setIsMenuOpen={() => {}} />

      <div className="flex-grow max-w-5xl mx-auto p-4 space-y-8">
        {/* header */}
        <div>
          <Link
            to="/"
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2" /> Back to listings
          </Link>
          <h1 className="text-3xl font-bold mt-2">{title}</h1>
          <div className="text-sm text-gray-600">
            #{vehicle.stock_number} &nbsp;|&nbsp; VIN: {vinFirst11}
            {vinLast6}
          </div>
        </div>

        {/* images */}
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="relative aspect-video">
            <img
              src={mainImage}
              alt="Vehicle"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = images[0] || '')}
            />
            {spinImages.length > 0 && (
              <button
                onClick={() => setShow360(true)}
                className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <Camera /> <span>360°</span>
              </button>
            )}
          </div>
          <div className="flex space-x-2 overflow-x-auto p-2 bg-gray-50">
            {images.map((src, i) => (
              <button key={i} onClick={() => setMainImage(src)}>
                <img
                  src={src}
                  alt={`thumb-${i}`}
                  className={`w-24 h-24 object-cover rounded ${
                    mainImage === src ? 'ring-2 ring-indigo-500' : ''
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* final bid & VIN display */}
        <div className="flex justify-between bg-white shadow rounded p-4">
          <div>
            <div className="text-sm text-gray-500">Final Bid</div>
            <div className="text-2xl font-bold text-green-600">
              {safe(vehicle.final_bid)}
            </div>
          </div>
          <div
            className="prose text-gray-700"
            dangerouslySetInnerHTML={{
              __html: vehicle.vin_display || '',
            }}
          />
        </div>

        {/* OLD details */}
        {Object.keys(oldFields).length > 0 && (
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(oldFields).map(([k, v]) => (
                <div key={k} className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    {k.replace(/_/g, ' ')}
                  </div>
                  <div className="font-medium">{safe(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW details */}
        {Object.keys(newFields).length > 0 && (
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4">New Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(newFields).map(([k, v]) => (
                <div key={k} className="border rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    {k.replace(/_/g, ' ')}
                  </div>
                  <div className="font-medium">{safe(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {show360 && (
          <Custom360Spin images={spinImages} onClose={() => setShow360(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
