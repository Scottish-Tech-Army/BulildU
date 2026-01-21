"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FullScreenLayout } from "@/components/layouts/FullScreenLayout";
import {
  getDiscoveryData,
  addDiscoveryItem,
  removeDiscoveryItem,
  type DiscoveryPillar,
} from "@/lib/storage";
import {
  Wrench,
  Star,
  Sparkles,
  Heart,
  Compass,
  ChevronLeft,
  X,
  Plus,
  type LucideIcon,
} from "lucide-react";

// Pillar configuration
interface PillarConfig {
  title: string;
  singular: string;
  icon: LucideIcon;
  purpose: string;
  questions: string[];
  suggestions: string[];
}

const PILLAR_CONFIG: Record<DiscoveryPillar, PillarConfig> = {
  skills: {
    title: "Skills",
    singular: "skill",
    icon: Wrench,
    purpose: "Help you recognise what you can already do.",
    questions: [
      "What are you good at – at home, work, or in everyday life?",
      "What do people often come to you for?",
      "What skills have you developed through life experience?",
    ],
    suggestions: [
      "Problem-solving",
      "Communication",
      "Organisation",
      "Creativity",
      "Leadership",
    ],
  },
  qualities: {
    title: "Qualities",
    singular: "quality",
    icon: Star,
    purpose: "Build confidence by identifying personal strengths and character traits.",
    questions: [
      "What personal qualities describe you?",
      "When have you shown resilience, kindness, leadership, or creativity?",
      "What qualities help you get through challenges?",
    ],
    suggestions: [
      "Resilient",
      "Kind",
      "Determined",
      "Patient",
      "Honest",
    ],
  },
  values: {
    title: "Values",
    singular: "value",
    icon: Compass,
    purpose: "Help you understand what truly matters to you.",
    questions: [
      "What matters most to you in life right now?",
      "What do you want more of in your future?",
      "What do you want your life to stand for?",
    ],
    suggestions: [
      "Family",
      "Health",
      "Growth",
      "Security",
      "Freedom",
    ],
  },
  interests: {
    title: "Interests",
    singular: "interest",
    icon: Heart,
    purpose: "Reignite curiosity, motivation, and enjoyment.",
    questions: [
      "What do you enjoy doing?",
      "What topics or activities interest you?",
      "What would you like to explore more in the future?",
    ],
    suggestions: [
      "Technology",
      "Music",
      "Fitness",
      "Reading",
      "Cooking",
    ],
  },
};

export default function PillarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pillarKey = params.pillar as DiscoveryPillar;

  const [items, setItems] = useState<string[]>(() => {
    // Note: pillarKey is available since it's from useParams
    if (typeof window === "undefined") return [];
    const data = getDiscoveryData();
    return (pillarKey && data[pillarKey]) ? data[pillarKey] : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  const config = PILLAR_CONFIG[pillarKey];

  // Handle hydration flag separately to avoid SSR mismatches
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsHydrated(true);
    });
  }, []);

  if (!config) {
    router.push("/discovery");
    return null;
  }

  const Icon = config.icon;

  const handleAddItem = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    
    // Check for duplicates
    if (items.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    addDiscoveryItem(pillarKey, trimmed);
    setItems([...items, trimmed]);
    setInputValue("");
  };

  const handleRemoveItem = (item: string) => {
    removeDiscoveryItem(pillarKey, item);
    setItems(items.filter(i => i !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddItem(inputValue);
  };

  // Filter out suggestions that are already added
  const availableSuggestions = config.suggestions.filter(
    s => !items.some(i => i.toLowerCase() === s.toLowerCase())
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <FullScreenLayout bgClass="bg-bg-card">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-white sticky top-0 z-30 border-b border-gray-100">
          <div className="max-w-xl mx-auto w-full px-6 py-4 flex items-center justify-center gap-3">
            <Icon className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl text-[var(--color-charcoal)]">{config.title}</h1>
          </div>
        </header>

        <div className="max-w-xl mx-auto w-full px-6 pt-8 pb-32">
          {/* Purpose */}
          <div className="flex items-start gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 mb-6">
            <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <p className="text-sm text-brand-primary/80 leading-relaxed italic">
              {config.purpose}
            </p>
          </div>

          {/* Questions - Consolidated Card */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              Reflect on these questions
            </h2>
            <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
              <ul className="space-y-4">
                {config.questions.map((question, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary/40 shrink-0" />
                    <p className="text-gray-700 text-sm leading-relaxed">{question}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Add Item Input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Add a ${config.singular}...`}
                className="flex-1 h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-gray-900"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
                  inputValue.trim()
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Suggestion Chips */}
          {availableSuggestions.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleAddItem(suggestion)}
                    className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-medium border border-gray-200 hover:bg-brand-primary/10 hover:border-brand-primary/20 hover:text-brand-primary transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User's Items */}
          {items.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                Your {config.title.toLowerCase()} ({items.length})
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100"
                  >
                    <span className="text-gray-900 font-medium">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
        <div className="flex justify-center items-center h-16 max-w-xl mx-auto px-6">
          <button
            onClick={() => router.push("/discovery")}
            className="flex items-center gap-2 text-brand-primary font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Discovery
          </button>
        </div>
      </nav>
    </FullScreenLayout>
  );
}
