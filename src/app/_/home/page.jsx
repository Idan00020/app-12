"use client";
import React, { useState, useEffect } from "react";

function MainComponent() {
  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [lastLocation, setLastLocation] = useState({ lat: 32.0853, lng: 34.7818 });
  const [selectedCage, setSelectedCage] = useState(null);

  // Fetch cages from the database
  useEffect(() => {
    const fetchCages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cages');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setCages(data);
        
        // Set the first cage with location as the selected cage
        if (data.length > 0) {
          const cageWithLocation = data.find(cage => cage.last_latitude && cage.last_longitude);
          if (cageWithLocation) {
            setSelectedCage(cageWithLocation);
            setLastLocation({
              lat: cageWithLocation.last_latitude,
              lng: cageWithLocation.last_longitude
            });
          }
        }
      } catch (err) {
        setError("Failed to load cages");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCages();
  }, []);

  const handleSearch = async (input) => {
    try {
      const response = await fetch(
        `/integrations/google-place-autocomplete/autocomplete/json?input=${input}&radius=500`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setPredictions(data.predictions);
    } catch (err) {
      setError("Failed to load location suggestions");
      console.error(err);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.length > 2) {
      handleSearch(value);
    }
  };

  const handleCageClick = (cage) => {
    setSelectedCage(cage);
    if (cage.last_latitude && cage.last_longitude) {
      setLastLocation({
        lat: cage.last_latitude,
        lng: cage.last_longitude
      });
    }
  };

  const filteredCages = searchInput.length > 0
    ? cages.filter(cage => 
        cage.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        cage.researcher.toLowerCase().includes(searchInput.toLowerCase())
      )
    : cages;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-right mb-8 font-inter">
          C-Team 518 Cages
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="order-2 md:order-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="חיפוש כלובים..."
                  className="w-full p-3 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white text-right"
                  dir="rtl"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                />
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">טוען כלובים...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : filteredCages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">לא נמצאו כלובים</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCages.map((cage) => (
                    <a
                      key={cage.id}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCageClick(cage);
                      }}
                      className={`block bg-white dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                        selectedCage?.id === cage.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              cage.status === "Connected"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                        </div>
                        <div className="text-right">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {cage.name}
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {cage.researcher}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {cage.status}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg w-full">
              {lastLocation ? (
                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${lastLocation.lat},${lastLocation.lng}&z=15&output=embed`}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="h-full rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    אין מיקום זמין
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;