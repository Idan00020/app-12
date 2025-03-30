"use client";
import React, { useState, useEffect } from "react";
import YouTubePlayer from "../components/you-tube-player";
import { useRouter } from "next/navigation";

export default function MainComponent() {
  const router = useRouter();
  
  // Redirect to home page
  useEffect(() => {
    router.push("/home");
  }, [router]);
  
  const [activeTab, setActiveTab] = useState("ai-analysis");
  const [cleaningSpeed, setCleaningSpeed] = useState(50);
  const [cleaningFrequency, setCleaningFrequency] = useState(24);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customTime, setCustomTime] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [cageData, setCageData] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [center, setCenter] = useState({ lat: 32.0853, lng: 34.7818 });
  const [lastLocation, setLastLocation] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleCageClick = (cageId) => {
    router.push(`/cages/${cageId}`);
  };

  useEffect(() => {
    const loadCageData = async () => {
      try {
        const response = await fetch("/api/get-cage-details", {
          method: "POST",
          body: JSON.stringify({ queryParams: { id: 1 } }),
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setCageData(data.cage);
        if (data.cage) {
          setCleaningSpeed(data.cage.cleaning_speed || 50);
          setCleaningFrequency(data.cage.cleaning_frequency || 24);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error loading cage data:", err);
      }
    };
    
    loadCageData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setCenter({ lat: latitude, lng: longitude });
          setIsLoadingLocation(false);
        },
        (error) => {
          setLocationError(
            "We were unable to obtain your location. Please allow access to the location in the browser."
          );
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocationError("Your browser does not support location detection.");
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      if (cageData?.device_id) {
        try {
          const response = await fetch("/api/get-cage-details", {
            method: "POST",
            body: JSON.stringify({ queryParams: { id: cageData.id } }),
          });
          const data = await response.json();
          if (data.cage?.last_latitude && data.cage?.last_longitude) {
            setLastLocation({
              lat: data.cage.last_latitude,
              lng: data.cage.last_longitude,
              updateTime: data.cage.last_update_time,
            });
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      }
    };
    fetchLocation();
    const interval = setInterval(fetchLocation, 30000);
    return () => clearInterval(interval);
  }, [cageData]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

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
      console.error(err);
      setError("Failed to load location suggestions");
    }
  };
  const saveSettings = async () => {
    try {
      const response = await fetch("/api/update-cage-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: {
            id: cageData?.id,
            cleaning_speed: parseInt(cleaningSpeed),
            cleaning_frequency: parseInt(cleaningFrequency),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings");
    }
  };
  const getUserLocation = async () => {
    setIsLoadingMap(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("הדפדפן שלך לא תומך באיתור מיקום.");
      setIsLoadingMap(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setUserLocation({ latitude, longitude });
        setCenter({ lat: latitude, lng: longitude });

        try {
          console.log("Sending location update:", {
            id: cageData?.id,
            latitude,
            longitude,
          });

          const response = await fetch("/api/update-cage-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              body: {
                id: cageData?.id,
                latitude,
                longitude,
              },
            }),
          });

          const data = await response.json();
          console.log("Server response:", data);

          if (data.error) {
            throw new Error(data.error);
          }

          setUpdateSuccess(true);
          loadCageData();
        } catch (err) {
          console.error("Failed to update location:", err);
          setLocationError("נכשל בעדכון מיקום הכלוב");
        }

        setIsLoadingMap(false);
      },
      (error) => {
        setLocationError(
          "לא הצלחנו לקבל את המיקום שלך. אנא אשר גישה למיקום בדפדפן"
        );
        setIsLoadingMap(false);
      }
    );
  };

  const renderLocation = () => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">מיקום הכלוב</h3>
          <button
            onClick={getUserLocation}
            className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoadingMap}
          >
            {isLoadingMap ? "מאתר מיקום..." : "קבל גישת מיקום"}
          </button>
        </div>

        {locationError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {locationError}
          </div>
        )}

        {updateSuccess && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
            המיקום עודכן בהצלחה
          </div>
        )}

        {userLocation && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
            מיקום נוכחי: {userLocation.latitude.toFixed(6)},{" "}
            {userLocation.longitude.toFixed(6)}
          </div>
        )}

        <div className="h-[400px] w-full rounded-lg overflow-hidden">
          {isLoadingMap ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-300"></div>
            </div>
          ) : (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${center.lat},${center.lng}&z=15&output=embed`}
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  };

  const renderGeneralControl = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Cleaning settings</h3>
        <div className="mb-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
          This information is a simulation. It will be changed to real
          information during the national competition.
        </div>
        <div className="space-y-6">
          <div>
            <label className="block mb-2">Cleaning speed</label>
            <input
              type="range"
              value={cleaningSpeed}
              onChange={(e) => setCleaningSpeed(e.target.value)}
              onMouseUp={saveSettings}
              className="w-full"
              min="0"
              max="100"
            />
            <div className="text-right text-sm text-gray-500">
              {cleaningSpeed} per hour
            </div>
          </div>
          <div>
            <label className="block mb-2">cleaning frequency</label>
            <input
              type="range"
              value={cleaningFrequency}
              onChange={(e) => setCleaningFrequency(e.target.value)}
              onMouseUp={saveSettings}
              className="w-full"
              min="1"
              max="48"
            />
            <div className="text-right text-sm text-gray-500">
              every {cleaningFrequency} hour
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">system time</h3>
        <div className="space-y-4">
          <div className="text-4xl font-mono">
            {currentTime.toLocaleTimeString("he-IL")}
          </div>
          <div className="text-gray-500">
            {currentTime.toLocaleDateString("he-IL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div>
            <h4 className="font-bold mb-2">time zone</h4>
            <div>Asia/Jerusalem</div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleString("he-IL", { timeZoneName: "long" })}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-2">Set an adjusted time</h4>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {cageData ? (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-4 items-center">
                <a
                  href="/home"
                  className="bg-gray-900 dark:bg-gray-800 text-white font-inter px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  Change cage
                </a>
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full"
                >
                  {isDark ? "🌞" : "🌙"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setActiveTab("ai-analysis")}
                    className={`px-4 py-2 rounded font-inter ${
                      activeTab === "ai-analysis"
                        ? "bg-gray-900 dark:bg-gray-800 text-white"
                        : "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-800"
                    }`}
                  >
                    AI Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab("general-control")}
                    className={`px-4 py-2 rounded font-inter ${
                      activeTab === "general-control"
                        ? "bg-gray-900 dark:bg-gray-800 text-white"
                        : "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-800"
                    }`}
                  >
                    General control
                  </button>
                  <button
                    onClick={() => setActiveTab("location")}
                    className={`px-4 py-2 rounded font-inter ${
                      activeTab === "location"
                        ? "bg-gray-900 dark:bg-gray-800 text-white"
                        : "border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-800"
                    }`}
                  >
                    location
                  </button>
                </div>

                {activeTab === "general-control" ? (
                  renderGeneralControl()
                ) : activeTab === "location" ? (
                  renderLocation()
                ) : (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex justify-center">
                    {process.env.POSTGRES_URL?.youtube_url ? (
                  <YouTubePlayer videoId={process.env.POSTGRES_URL.youtube_url} />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-300">
                        No YouTube URL available
                      </div>
                    )}
                    </div>
                    <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      {lastLocation && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">מיקום הכלוב</h3>
                            <div className="text-sm text-gray-500">
                              עודכן לאחרונה:{" "}
                              {new Date(lastLocation.updateTime).toLocaleString(
                                "he-IL"
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                              <div className="text-sm text-gray-500">קו רוחב</div>
                              <div>{lastLocation.lat.toFixed(6)}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                              <div className="text-sm text-gray-500">קו אורך</div>
                              <div>{lastLocation.lng.toFixed(6)}</div>
                            </div>
                          </div>

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
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-bold font-inter text-gray-900 dark:text-gray-100 mb-4">
                  AI Analysis
                </h2>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-inter">
                    Example AI analysis data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
      <button onClick={() => handleCageClick(1)}>View Cage 1</button>
    </div>
  );
}