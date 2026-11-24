"use client";

import React, { useState } from "react";
import axios from "axios";
import { Sparkles, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { SYMPTOMS } from "@/lib/symptomClassifier";

type PredictionResult = {
  conditionId: string;
  name: string;
  specialist: string;
  summary: string;
  probability: number;
  matchedSymptoms: string[];
};

export default function SymptomPredictor() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  const [urgentWarning, setUrgentWarning] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
    setResults(null);
    setError(null);
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/symptom-predict", { symptoms: selected });
      setResults(res.data.predictions);
      setUrgentWarning(res.data.urgentWarning);
    } catch (err: any) {
      setResults(null);
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/60 shadow-xs space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-red-50 text-[#a4161a]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-extrabold text-xl text-gray-900 tracking-tight">
            ML Symptom <span className="italic font-serif font-normal text-[#a4161a]">Predictor</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Select the symptoms you have (at least 2). A Naive Bayes machine-learning model ranks
            which conditions your symptoms most resemble.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SYMPTOMS.map((s) => {
          const active = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? "bg-[#a4161a] text-white border-[#a4161a]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#a4161a] hover:text-[#a4161a]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={analyze}
          disabled={selected.length < 2 || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#a4161a] hover:bg-[#8b1116] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Analyze symptoms
        </button>
        <span className="text-xs text-gray-500">{selected.length} selected</span>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {urgentWarning && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{urgentWarning}</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={r.conditionId} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-gray-900 text-sm">
                  {i + 1}. {r.name}
                </p>
                <span className="text-xs font-semibold text-[#a4161a]">
                  {Math.round(r.probability * 100)}% match
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#a4161a] rounded-full"
                  style={{ width: `${Math.max(3, Math.round(r.probability * 100))}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{r.summary}</p>
              {r.matchedSymptoms.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Matching symptoms: {r.matchedSymptoms.join(", ")}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Consider seeing: {r.specialist}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          This is an educational demo, not a diagnosis. The model was trained on synthetic data and
          only knows 14 common conditions, so the true cause may not be listed. Percentages are
          relative match scores, not real-world probabilities. Please see a qualified doctor for
          any health concern.
        </p>
      </div>
    </div>
  );
}
