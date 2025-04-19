import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import GoogleAd from '../GoogleAd';
import { VehicleListPageProps } from '../types/vehicle';
import { motion } from 'framer-motion';

// Reference UI inspired by Carvana (https://www.carvana.com)
export function VehicleListPage({
  vehicles,
  loading,
  isMenuOpen,
  setIsMenuOpen,
  searchQuery,
  setSearchQuery,
}: VehicleListPageProps) {
  const safeDisplay = (val: any) => val || 'Not available';

  // Toggle between VIN and Name search
  const [searchMode, setSearchMode] = useState<'VIN' | 'Name'>('VIN');
  const [searchName, setSearchName] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [itemsToShow, setItemsToShow] = useState(15);

  // Filter & sort logic for VIN or Name
  const filtered = useMemo(() => {
    let arr = vehicles.filter(v => v.final_bid && !v.final_bid.includes('N/A'));
    // VIN search mode
    if (searchMode === 'VIN' && searchQuery) {
      const q = searchQuery.trim().toUpperCase();
      if (q.length >= 11) {
        const qFirst11 = q.slice(0, 11);
        const qLast6 = q.slice(-6);
        arr = arr.filter(v => {
          const vinField = (v.allpagedata_fields.VIN || '').toUpperCase();
          const vFirst11 = vinField.slice(0, 11);
          if (vFirst11 !== qFirst11) return false;
          const ocrLast6 = (v.ocr_result || '').slice(-6).toUpperCase();
          let matchCount = 0;
          for (let i = 0; i < 6; i++) {
            if (qLast6[i] === ocrLast6[i]) matchCount++;
          }
          return matchCount >= 2;
        });
      } else {
        // fallback for short query
        arr = arr.filter(v => {
          const vin = ((v.allpagedata_fields.VIN || '') + (v.ocr_result || '')).toUpperCase();
          return vin.includes(q);
        });
      }
    }
    // Name search mode
    if (searchMode === 'Name' && searchName) {
      arr = arr.filter(v =>
        (v.allpagedata_fields.VehicleTitle || '')
          .toLowerCase()
          .includes(searchName.toLowerCase())
      );
    }
    // Clone and sort
    arr = [...arr];
    if (sortOrder === 'Price: Low to High') {
      arr.sort(
        (a, b) =>
          parseFloat(a.final_bid.replace(/[^0-9.]/g, '')) -
          parseFloat(b.final_bid.replace(/[^0-9.]/g, ''))
      );
    } else if (sortOrder === 'Price: High to Low') {
      arr.sort(
        (a, b) =>
          parseFloat(b.final_bid.replace(/[^0-9.]/g, '')) -
          parseFloat(a.final_bid.replace(/[^0-9.]/g, ''))
      );
    } else if (sortOrder === 'Newest') {
      arr.sort((a, b) =>
        (b.timestamp || '').localeCompare(a.timestamp || '')
      );
    }
    return arr;
  }, [vehicles, searchQuery, searchName, searchMode, sortOrder]);

  const fetchMore = () => setTimeout(() => setItemsToShow(prev => prev + 15), 500);
  const displayed = filtered.slice(0, itemsToShow);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {['Buy', 'Sell', 'Auctions', 'Services'].map(item => (
              <a key={item} href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                {item} Vehicles
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hero Search */}
      <section
        className="relative py-20 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&q=80)', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"></div>
        <div className="relative max-w-6xl mx-auto px-6 space-y-6">
          <h1 className="text-5xl font-bold text-white text-center">Search Vehicles</h1>

          {/* Mode Switch */}
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-200 rounded-full p-1">
              {['VIN', 'Name'].map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setSearchMode(mode as 'VIN' | 'Name');
                    if (mode === 'Name') setSearchQuery('');
                    else setSearchName('');
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    searchMode === mode ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
              <input
                type="text"
                placeholder={searchMode === 'VIN' ? 'Search VIN...' : 'Search by Name...'}
                className="w-full rounded-full py-3 pl-14 pr-4 text-gray-800 placeholder-gray-500 shadow-lg"
                value={searchMode === 'VIN' ? searchQuery : searchName}
                onChange={e => searchMode === 'VIN' ? setSearchQuery(e.target.value) : setSearchName(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Google Ad Top */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GoogleAd slot="2521397147" />
      </div>

      {/* Sort */}
      <div className="max-w-6xl mx-auto px-6 py-2 flex justify-end">
        <select
          className="rounded-lg border-gray-300 shadow-sm py-2 px-3"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
        >
          <option>Newest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={displayed.length}
            next={fetchMore}
            hasMore={displayed.length < filtered.length}
            loader={<h4 className="text-center py-4">Loading more...</h4>}
            endMessage={<p className="text-center py-4">All vehicles loaded</p>}
          >
            <motion.div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayed.map(vehicle => {
                const img = vehicle.allpagedata_images[0] || '';
                return (
                  <motion.div
                    key={vehicle.stock_number}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-transform"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link to={`/vehicle/${vehicle.stock_number}`}>                      
                      <div className="relative h-48 overflow-hidden">
                        <img src={img} alt="Vehicle" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{safeDisplay(vehicle.allpagedata_fields.VehicleTitle)}</h3>
                        <p className="text-gray-600">{vehicle.allpagedata_fields.Year} {vehicle.allpagedata_fields.Make} {vehicle.allpagedata_fields.Model}</p>
                        <div className="text-gray-600 break-words text-sm" dangerouslySetInnerHTML={{ __html: vehicle.vin_display || '<em>No VIN info</em>' }} />
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-emerald-600">${safeDisplay(vehicle.final_bid)}</span>
                          <button className="btn-secondary py-1 px-3 text-sm">View</button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </InfiniteScroll>
        )}
      </div>

      {/* Google Ad Bottom */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GoogleAd slot="2521397147" />
      </div>

      <div className="flex-grow">
        {/* Main Content */}
        {/* ... rest of the existing code ... */}
      </div>
      
      <Footer />
    </div>
  );
}
