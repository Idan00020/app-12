"use client";
import React, { useState, useEffect } from "react";  // הוספת ייבוא של useState ו-useEffect

// פונקציה ראשית שתהיה בתוך Index
function MainComponent({ videoId, onError }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getYouTubeID = (url) => {
    if (!url) return null;

    if (url.length === 11) return url;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  const cleanVideoId = getYouTubeID(videoId);

  useEffect(() => {
    if (!cleanVideoId) {
      setHasError(true);
      onError?.("Invalid YouTube URL or ID");
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [cleanVideoId, onError]);

  if (hasError) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-4">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-700 dark:text-gray-300 font-inter">
            קישור לא תקין
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
          </div>
        ) : null}
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${cleanVideoId}?controls=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

// פונקציה נוספת שתשמש להדגמה
function StoryComponent() {
  return (
    <div className="p-4 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-inter text-gray-900 dark:text-gray-100 mb-4">
          Working Example (ID)
        </h2>
        <MainComponent videoId="dQw4w9WgXcQ" />
      </div>

      <div>
        <h2 className="text-xl font-bold font-inter text-gray-900 dark:text-gray-100 mb-4">
          Working Example (URL)
        </h2>
        <MainComponent videoId="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
      </div>

      <div>
        <h2 className="text-xl font-bold font-inter text-gray-900 dark:text-gray-100 mb-4"> 
          Error State
        </h2>
        <MainComponent videoId="" />
      </div>
    </div>
  );
}

export default function Index() {
  return <StoryComponent />;
}
