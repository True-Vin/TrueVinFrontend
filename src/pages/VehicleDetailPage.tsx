import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { VehicleDetailPageProps } from '../types/vehicle';
import { Custom360Spin } from '../components/Custom360Spin';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DynamicMeta } from '../components/DynamicMeta';
import { ArrowLeft, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function VehicleDetailPage({ vehicles }: VehicleDetailPageProps) {
  const { stockNumber } = useParams();
  const vehicle = vehicles.find((v) => v.stock_number === stockNumber);
  const [mainImage, setMainImage] = useState('');
  const [show360, setShow360] = useState(false);

  useEffect(() => {
    if (vehicle?.allpagedata_images?.length) setMainImage(vehicle.allpagedata_images[0]);
  }, [vehicle]);

  if (!vehicle) return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      <Navbar isMenuOpen={false} setIsMenuOpen={() => {}} />
      <div className="flex-grow">
        <motion.div className="flex flex-col items-center justify-center mt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">Vehicle not found</h1>
          <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-800 transition">
            <ArrowLeft className="mr-2" size={24} />Back to listings
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );

  const { allpagedata_images = [], allpagedata_fields = {}, vin_display = '', final_bid, allpagedata_3sixty = [] } = vehicle;
  const ocrVinLast6 = (vehicle.ocr_result || '').slice(-6);
  const allFieldsVinFirst11 = (allpagedata_fields.VIN || '').slice(0, 11);
  const title = allpagedata_fields.VehicleTitle || 'Vehicle Detail';
  const safeDisplay = (val: any) => val || 'Not available';

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
    >
      <DynamicMeta vehicle={vehicle} />
      <Navbar isMenuOpen={false} setIsMenuOpen={() => {}} />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
          {/* Header */}
          <motion.header className="space-y-2" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Link to="/" className="flex items-center text-gray-700 hover:text-gray-900 transition">
              <ArrowLeft size={20} /><span className="ml-2">Back to Listings</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                #{vehicle.stock_number}
              </span>
              <span className="text-gray-700 text-sm">VIN: {allFieldsVinFirst11}{ocrVinLast6}</span>
            </div>
          </motion.header>

          {/* Images & 360 */}
          <motion.section className="bg-white shadow-lg rounded-2xl overflow-hidden" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="relative aspect-video overflow-hidden">
              <motion.img
                key={mainImage}
                src={mainImage || allpagedata_images[0]}
                alt="Main Vehicle"
                className="w-full h-full object-cover"
                initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                onError={(e:any) => { e.target.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80'; }}
              />
              {allpagedata_3sixty.length > 0 && (
                <motion.button
                  onClick={() => setShow360(true)}
                  className="absolute bottom-5 right-5 bg-gradient-to-r from-emerald-600 to-amber-500 text-white px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg hover:shadow-xl hover:from-emerald-500 hover:to-amber-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  animate={{ scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Camera size={20} /><span className="font-semibold tracking-wide">View 360°</span>
                </motion.button>
              )}
            </div>
            <div className="flex space-x-2 overflow-x-auto p-4 bg-gray-50">
              {allpagedata_images.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border-2 transition ${mainImage===img ? 'border-emerald-500 scale-105' : 'border-gray-300 hover:scale-105'}`}
                  whileHover={{ scale: 1.1 }}
                >
                  <img src={img} alt={`Thumb ${idx+1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
            <div className="p-6 flex items-center justify-between bg-white border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Final Bid</p>
                <p className="text-3xl font-extrabold text-emerald-600 animate-pulse">${safeDisplay(final_bid)}</p>
              </div>
              <div className="text-gray-700 prose max-w-md" dangerouslySetInnerHTML={{ __html: vin_display }} />
            </div>
          </motion.section>

          {/* Vehicle Details (Below Images) */}
          <motion.section className="bg-white shadow-lg rounded-2xl overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 relative inline-block">
                Vehicle Details
                <span className="absolute -bottom-1 left-0 w-24 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"></span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(allpagedata_fields).map(([key, value]) => (
                  <motion.div
                    key={key}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow hover:shadow-md transition-transform"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="block text-xs uppercase text-gray-600 mb-2 tracking-wide">
                      {key.replace(/_/g,' ')}
                    </span>
                    <span className="block text-lg font-semibold text-gray-800">{safeDisplay(value)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
      <Footer />

      <AnimatePresence>
        {show360 && <Custom360Spin images={allpagedata_3sixty} onClose={() => setShow360(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
