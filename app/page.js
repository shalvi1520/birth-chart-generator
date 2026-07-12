"use client";

import { useState } from "react";
import BirthChartForm from "@/components/BirthChartForm";
import ChartWheel from "@/components/ChartWheel";
import PlanetTable from "@/components/PlanetTable";
import Interpretations from "@/components/Interpretations";
import PlanetPopup from "@/components/PlanetPopup";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-[#101029] to-[#252065] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-300 mb-2">
          Birth Chart Generator
        </h1>
        <p className="text-indigo-300">
          Discover your natal chart — planetary positions, houses, and aspects.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-indigo-950/50 border border-indigo-800 rounded-2xl p-6 md:p-10">
        <BirthChartForm onSubmit={handleSubmit} loading={loading} />

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}

        {result && (
          <div className="mt-10 space-y-8">
          <p className="text-center text-indigo-300 text-sm">
          {result.location.displayName}
        </p>
        <div className="max-w-md mx-auto">
          <ChartWheel chart={result.chart} onPlanetClick={setSelectedPlanet} />
        </div>
          <PlanetTable chart={result.chart} />
          <Interpretations chart={result.chart} />
        </div>
)}
      </div>
      <PlanetPopup planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
    </main>
    
  );
}