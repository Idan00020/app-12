"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CagePage() {
  const { id } = useParams();
  const [cageData, setCageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCageData = async () => {
      try {
        const response = await fetch(`/api/get-cage-details?id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch cage data');
        const data = await response.json();
        setCageData(data);
      } catch (error) {
        console.error('Error fetching cage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCageData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!cageData) return <div>No cage data found</div>;

  return (
    <div>
      <h1>{cageData.name}</h1>
      <p>Status: {cageData.status}</p>
      <p>Researcher: {cageData.researcher}</p>
      <p>Cleaning Frequency: {cageData.cleaning_frequency} hours</p>
    </div>
  );
}
