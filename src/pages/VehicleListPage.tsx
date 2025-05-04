// src/pages/VehicleListPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import GoogleAd from '../GoogleAd';
import { VehicleListPageProps } from '../types/vehicle';
import { motion } from 'framer-motion';

export function VehicleListPage({
  vehicles,
  loading,
  isMenuOpen,
  setIsMenuOpen,
  searchQuery,
  setSearchQuery,
}: VehicleListPageProps) {
  /* -------------------- constants & helpers -------------------- */
  const passesFlag = (v: any) =>
    v.newdata_passed === true ||
    v.newdata_passed === 'true' ||
    v.allpagedata_passed === true ||
    v.allpagedata_passed === 'true';

  const safeDisplay = (val: any) =>
    val !== undefined && val !== null && val !== '' ? val : 'Not available';

  const API_BASE =
    'https://p42429x0l5.execute-api.eu-north-1.amazonaws.com/prod';

  /* --------------------------- state --------------------------- */
  const [searchMode, setSearchMode] = useState<'Stock' | 'VIN' | 'Name'>(
    'Stock'
  );
  const [searchName, setSearchName] = useState('');
  const [vinInput, setVinInput] = useState('');
  const [list, setList] = useState(vehicles);
  const [sortOrder, setSortOrder] = useState('Newest');
  const [itemsToShow, setItemsToShow] = useState(15);

  /* -------------------- when vehicles prop changes ------------- */
  useEffect(() => setList(vehicles), [vehicles]);

  /* ------------------------- search logic ----------------------- */
  useEffect(() => {
    const doSearch = async () => {
      let q = '';
      if (searchMode === 'Stock') {
        q = searchQuery.trim();
      } else if (searchMode === 'VIN') {
        // always take first 11 characters
        q = vinInput.trim().slice(0, 11);
      } else {
        q = searchName.trim();
      }

      if (!q) {
        setList(vehicles);
        setItemsToShow(15);
        return;
      }

      let url = '';
      if (searchMode === 'Stock') {
        url = `${API_BASE}/stocks/${encodeURIComponent(q)}`;
      } else if (searchMode === 'VIN') {
        url = `${API_BASE}/stocks/ocr?vin=${encodeURIComponent(q)}`;
      } else {
        const parts = q.split(/\s+/);
        if (parts.length < 3 || !/^\d{4}$/.test(parts[2])) {
          setList([]);
          return;
        }
        let [make, model, year] = parts;
        make = make.toUpperCase();
        model = model.toUpperCase();
        url = `${API_BASE}/stocks/search?make=${encodeURIComponent(
          make
        )}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`;
      }

      try {
        const resp = await fetch(url, {
          headers: { 'x-api-key': '<YOUR_API_KEY>' },
        });
        if (!resp.ok) throw new Error(`Search failed (${resp.status})`);
        const data = await resp.json();
        setList(data);
        setItemsToShow(15);
      } catch (err) {
        console.error('Search error:', err);
        setList([]);
      }
    };

    doSearch();
  }, [
    searchMode,
    searchQuery,
    searchName,
    vinInput,
    vehicles,
    API_BASE,
  ]);

  /* ------------------------- sorting --------------------------- */
  const filtered = useMemo(() => {
    const arr = list.filter(
      v => passesFlag(v) && v.final_bid && !v.final_bid.includes('N/A')
    );

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
    } else {
      arr.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
    }
    return arr;
  }, [list, sortOrder]);

  const fetchMore = () =>
    setTimeout(() => setItemsToShow(prev => prev + 15), 500);
  const displayed = filtered.slice(0, itemsToShow);

  /* ============ JSX ============ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {['Buy', 'Sell', 'Auctions', 'Services'].map(item => (
              <a
                key={item}
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {item} Vehicles
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ HERO + SEARCH ------------------ */}
      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&q=80)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
        <div className="relative max-w-6xl mx-auto px-6 space-y-6">
          <h1 className="text-5xl font-bold text-white text-center">
            Search Vehicles
          </h1>

          <div className="flex justify-center">
            <div className="inline-flex bg-gray-200 rounded-full p-1">
              {['Stock', 'VIN', 'Name'].map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setSearchMode(mode as any);
                    setSearchQuery('');
                    setSearchName('');
                    setVinInput('');
                  }}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    searchMode === mode
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            {searchMode === 'VIN' ? (
              <div className="relative w-full max-w-lg">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={24}
                />
                <input
                  type="text"
                  placeholder="Enter VIN "
                  className="w-full rounded-full py-3 pl-14 pr-4 text-gray-800 placeholder-gray-500 shadow-lg"
                  value={vinInput}
                  onChange={e => setVinInput(e.target.value.toUpperCase())}
                />
              </div>
            ) : (
              <div className="relative w-full max-w-lg">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={24}
                />
                <input
                  type="text"
                  placeholder={
                    searchMode === 'Stock'
                      ? 'Enter Stock Number...'
                      : 'Make Model Year...'
                  }
                  className="w-full rounded-full py-3 pl-14 pr-4 text-gray-800 placeholder-gray-500 shadow-lg"
                  value={searchMode === 'Name' ? searchName : searchQuery}
                  onChange={e =>
                    searchMode === 'Name'
                      ? setSearchName(e.target.value)
                      : setSearchQuery(e.target.value)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------ ADS / SORT / LIST ------------------ */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GoogleAd slot="2521397147" />
      </div>
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

      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading && displayed.length === 0 ? (
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
              {displayed.map(v => {
                /* -------- merge schemas & details -------- */
                const fields: Record<string, any> = {};
                if (
                  v.allpagedata_fields &&
                  Object.keys(v.allpagedata_fields).length
                ) {
                  Object.assign(fields, v.allpagedata_fields);
                }
                if (v.details) {
                  const copy = (obj: Record<string, string>) => {
                    const k = Object.keys(obj)[0];
                    if (fields[k] === undefined || fields[k] === '')
                      fields[k] = obj[k];
                  };

                  if (typeof v.details === 'string') {
                    try {
                      JSON.parse(v.details).forEach(copy);
                    } catch {}
                  } else if (Array.isArray(v.details)) {
                    v.details.forEach(copy);
                  } else if (typeof v.details === 'object') {
                    Object.entries(v.details).forEach(([k, val]) => {
                      if (fields[k] === undefined || fields[k] === '')
                        fields[k] = val;
                    });
                  }
                }

                const year = fields.Year;
                const make = fields.Make;
                const model = fields.Model;
                const title =
                  fields.VehicleTitle ||
                  (year && make && model
                    ? `${year} ${make} ${model}`
                    : v.stock_number);

                const img =
                  v.allpagedata_images?.[0] ||
                  v.one_image ||
                  v.html_s3_url ||
                  '';

                return (
                  <motion.div
                    key={v.stock_number}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-transform"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Link to={`/vehicle/${v.stock_number}`}>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={img}
                          alt="Vehicle"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                          {safeDisplay(title)}
                        </h3>
                        <p className="text-gray-600">
                          {safeDisplay(
                            `${year ?? ''} ${make ?? ''} ${model ?? ''}`.trim()
                          )}
                        </p>
                        <div
                          className="text-gray-600 break-words text-sm"
                          dangerouslySetInnerHTML={{
                            __html: v.vin_display || '<em>No VIN info</em>',
                          }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-emerald-600">
                            ${safeDisplay(v.final_bid)}
                          </span>
                          <button className="btn-secondary py-1 px-3 text-sm">
                            View
                          </button>
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <GoogleAd slot="2521397147" />
      </div>
      <Footer />
    </div>
  );
}
