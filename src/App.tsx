import React, { useEffect, useState, useRef } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams
} from "react-router-dom";
import { Search, Menu, X, User, Bell, Heart, Car } from "lucide-react";
import "./style1.css";
import GoogleAd from "./GoogleAd"; // <-- Our Ad component

/* 
   VehicleDetailPage:
   Displays a single vehicle in a layout reminiscent of an Amazon product page,
   including multiple images, raw HTML for vin_display, and other details.
*/

/**
 * A simple 360 overlay that shows:
 *  - A large main image on top
 *  - A row of thumbnails below
 * Clicking a thumbnail updates the main image.
 */

/**
 * A 360 overlay that:
 *  - Displays a large main image.
 *  - Shows a row of thumbnails below.
 *  - Provides left/right buttons to cycle frames.
 */
interface Custom360SpinProps {
  images: string[];
  onClose: () => void;
}

export function Custom360Spin({ images, onClose }: Custom360SpinProps) {
  // The currently displayed (main) image index
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Safely handle missing images
  const mainImage = images[selectedIndex] || "";

  // Left/Right Buttons
  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
        >
          X
        </button>
        <h2 className="text-xl font-semibold mb-4">360 View</h2>

        {/* Main image */}
        <div
          className="border border-gray-200 rounded mb-4 flex items-center justify-center bg-gray-50 relative"
          style={{ width: "100%", height: "500px" }}
        >
          {mainImage ? (
            <img
              src={mainImage}
              alt={`360 main ${selectedIndex}`}
              className="object-contain max-h-full max-w-full"
              onError={(e: any) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80";
              }}
            />
          ) : (
            <p className="text-gray-500">No image available</p>
          )}

          {/* Left arrow */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200"
            >
              ←
            </button>
          )}
          {/* Right arrow */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200"
            >
              →
            </button>
          )}
        </div>

        {/* Thumbnail row */}
        <div className="flex gap-2 overflow-x-auto">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`cursor-pointer border ${
                idx === selectedIndex
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-400"
              } rounded p-1`}
            >
              <img
                src={imgUrl}
                alt={`Thumb ${idx}`}
                className="h-16 w-16 object-cover"
                onError={(e: any) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * VehicleDetailPage component
 * Displays normal images, vehicle details, and an optional 360 view
 */
export function VehicleDetailPage({ vehicles }: { vehicles: any[] }) {
  const { stockNumber } = useParams();
  const vehicle = vehicles.find((v) => v.stock_number === stockNumber);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Vehicle not found</h1>
          <Link
            to="/"
            className="inline-block text-blue-600 hover:text-blue-700 underline"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const {
    allpagedata_images = [],
    allpagedata_fields = {},
    vin_display = "",
    final_bid,
    stock_number_href,
    allpagedata_3sixty = []
  } = vehicle;

  // Extract the last 6 digits from OCR result
  const ocrVin = vehicle.ocr_result || "";
  const ocrVinLast6 = ocrVin.slice(-6);

  // Extract the first 11 digits from the two VIN fields in allpagedata_fields
  const allFieldsVin = allpagedata_fields.VIN || "";
  const allFieldsVinFirst11 = allFieldsVin.slice(0, 11);

  const allFieldsVinStatus = allpagedata_fields.VIN_Status_ || "";
  const allFieldsVinStatusFirst11 = allFieldsVinStatus.slice(0, 11);

  // We'll use the first normal image as the main displayed one
  const [mainImage, setMainImage] = useState(allpagedata_images[0] || "");
  // Show/hide the 360 overlay
  const [show360, setShow360] = useState(false);

  const title = allpagedata_fields.VehicleTitle || "Vehicle Detail";
  const safeDisplay = (val: any) => val || "Not available";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Menu size={24} />
              </Link>
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-blue-600">
                  TrueVin
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                Home
              </Link>
           
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-blue-600">
                <Heart size={20} />
              </button>
              <button className="text-gray-700 hover:text-blue-600">
                <Bell size={20} />
              </button>
              <button className="text-gray-700 hover:text-blue-600">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>

        {/* Layout for images */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Thumbnails of normal images */}
          <div className="flex md:flex-col flex-wrap gap-2 md:max-h-[80vh] overflow-y-auto">
            {allpagedata_images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-20 h-20 object-cover rounded cursor-pointer border border-gray-200"
                onClick={() => setMainImage(img)}
                onError={(e: any) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80";
                }}
              />
            ))}
          </div>

          {/* Main image area */}
          <div className="col-span-2">
            <img
              src={
                mainImage ||
                "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80"
              }
              alt="Main Vehicle"
              className="w-full object-cover rounded border border-gray-200 max-h-[70vh]"
              onError={(e: any) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80";
              }}
            />

            {/* vin_display as raw HTML */}
            <div
              className="text-gray-600 break-words mt-4"
              dangerouslySetInnerHTML={{ __html: vin_display }}
            />

            <p className="text-xl font-bold text-blue-600 mt-4">
              Final Bid: {safeDisplay(final_bid)}
            </p>

            <p className="text-xl font-bold text-black-600 mt-4">
              VIN: {allFieldsVinFirst11}{ocrVinLast6}
            </p>

          

            <Link
              to="/"
              className="mt-4 block w-full text-center bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Back to Listings
            </Link>

            {/* 360 View Button if images exist */}
            {allpagedata_3sixty.length > 0 && (
              <button
                onClick={() => setShow360(true)}
                className="mt-4 block w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                360 View
              </button>
            )}
          </div>
        </div>

        {/* Vehicle details */}
        <div className="bg-white shadow-md rounded mt-10 p-6">
          <h2 className="text-2xl font-semibold mb-4">Vehicle Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(allpagedata_fields).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-semibold text-gray-700">
                  {key.replace(/_/g, " ")}:
                </span>{" "}
                <span className="text-gray-900">{safeDisplay(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 360 Overlay */}
      {show360 && (
        <Custom360Spin images={allpagedata_3sixty} onClose={() => setShow360(false)} />
      )}
    </div>
  );
}

/**
 * VehicleDetailPage component
 * Displays normal images, vehicle details, and an optional 360 view
 */

/*
  VehicleListPage:
  Your original listing page with minor tweaks to route to '/vehicle/:stockNumber'
  instead of opening a modal. Otherwise, it keeps all the original code plus styling.
*/
interface VehicleListPageProps {
  vehicles: any[];
  loading: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

function VehicleListPage({
  vehicles,
  loading,
  isMenuOpen,
  setIsMenuOpen,
  searchQuery,
  setSearchQuery,
}: VehicleListPageProps) {
  const safeDisplay = (value: any) => value || "Not available";

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const carsPerPage = 15;

  // Filter to remove vehicles whose final_bid is "N/A"
  // Then apply VIN-based search (allFieldsVinFirst11 + ocrVinLast6)
  const filteredVehicles = vehicles
    .filter((vehicle: any) => safeDisplay(vehicle.final_bid) !== "N/A")
    .filter((vehicle: any) => {
      const allFieldsVin = vehicle.allpagedata_fields?.VIN || "";
      const ocrVin = vehicle.ocr_result || "";

      const allFieldsVinFirst11 = allFieldsVin.slice(0, 11);
      const ocrVinLast6 = ocrVin.slice(-6);

      const combinedVin = (allFieldsVinFirst11 + ocrVinLast6).toLowerCase();
      return !searchQuery || combinedVin.includes(searchQuery.toLowerCase());
    });

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * carsPerPage;
  const endIndex = startIndex + carsPerPage;
  const totalVehicles = filteredVehicles.length;
  const totalPages = Math.ceil(totalVehicles / carsPerPage);

  // Vehicles to show on the current page
  const vehiclesOnPage = filteredVehicles.slice(startIndex, endIndex);

  // Handlers for next/previous pages
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-blue-600">
                  TrueVin
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
           
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-blue-600">
                <Heart size={20} />
              </button>
              <button className="text-gray-700 hover:text-blue-600">
                <Bell size={20} />
              </button>
              <button className="text-gray-700 hover:text-blue-600">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
              Buy Vehicles
            </a>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
              Sell Vehicles
            </a>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
              Auctions
            </a>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
              Services
            </a>
          </div>
        </div>
      )}

      {/* Hero Search Section */}
      <div
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80")',
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">
              Find Your Perfect Vehicle
            </h1>
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by VIN.."
                  className="flex-1 px-6 py-4 rounded-lg text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 flex items-center justify-center">
                  <Search className="mr-2" size={20} />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Space (TOP) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GoogleAd slot="2521397147" />
      </div>

      {/* Vehicle Listings */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiclesOnPage.map((vehicle: any) => {
                const imageUrls = vehicle.allpagedata_images;
                const mainImage =
                  imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

                return (
                  <Link
                    to={`/vehicle/${vehicle.stock_number}`}
                    key={vehicle.stock_number}
                    className="bg-white rounded-lg shadow-md overflow-hidden block"
                  >
                    {mainImage && (
                      <div className="relative h-48">
                        <img
                          src={mainImage}
                          alt="Vehicle"
                          className="w-full h-full object-cover"
                          onError={(e: any) =>
                            (e.target.src =
                              "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80")
                          }
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-2">
                        {safeDisplay(vehicle.allpagedata_fields.VehicleTitle)}
                      </h2>
                      {vehicle.details && (
                        <div className="mb-4">
                          <p className="text-gray-600">
                            {vehicle.details.year} {vehicle.details.make}{" "}
                            {vehicle.details.model}
                          </p>
                        </div>
                      )}
                      <div
                        className="text-gray-600 break-words mb-4"
                        dangerouslySetInnerHTML={{
                          __html: vehicle.vin_display || "",
                        }}
                      />

                      <p className="text-lg font-bold text-blue-600 mb-4">
                        Final Bid: ${safeDisplay(vehicle.final_bid)}
                      </p>
                      <button className="w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-700 self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Ad Space */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GoogleAd slot="2521397147" />
      </div>
    </>
  );
}


/*
  App:
  Wraps everything in React Router.
  The default path '/' shows VehicleListPage.
  Clicking on a vehicle routes to '/vehicle/:stockNumber' which displays VehicleDetailPage.
*/
export function App() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = "https://p42429x0l5.execute-api.eu-north-1.amazonaws.com/vehicles";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();

        // Filter only those vehicles which have allpagedata_passed
        const filteredData = result.filter(
          (vehicle: any) => vehicle.allpagedata_passed === true
        );

        // For images use only allpagedata_images
        // For details only use allpagedata_fields
        const formattedData = filteredData.map((vehicle: any) => ({
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

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <VehicleListPage
              vehicles={vehicles}
              loading={loading}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          }
        />
        <Route
          path="/vehicle/:stockNumber"
          element={<VehicleDetailPage vehicles={vehicles} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
