// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VehicleListPage } from "./pages/VehicleListPage";
import { VehicleDetailPage } from "./pages/VehicleDetailPage";

import { AboutUsPage } from "./pages/AboutUsPage";
import { ContactUsPage } from "./pages/ContactUsPage";
import { useVehicles } from "./hooks/useVehicles";
import "./style1.css";

export function App() {
  const { vehicles, loading } = useVehicles();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
         element={<VehicleDetailPage />}
       />
        <Route
          path="/about"
          element={
            <AboutUsPage
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
            />
          }
        />
        <Route
          path="/contact"
          element={
            <ContactUsPage
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
