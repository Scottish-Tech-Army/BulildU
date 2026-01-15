"use client";

import { useState } from "react";

interface MilestoneInputProps {
  onAdd: (milestone: { title: string; targetDate?: string }) => void;
  placeholder?: string;
}

/**
 * Inline input for adding milestones during goal creation
 */
export function MilestoneInput({
  onAdd,
  placeholder = "e.g. update CV",
}: MilestoneInputProps) {
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [showDate, setShowDate] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        targetDate: targetDate || undefined,
      });
      setTitle("");
      setTargetDate("");
      setShowDate(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.trim()) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 text-base text-gray-900 bg-white rounded-xl border-2 border-gray-200 focus:border-brand-primary focus:outline-none placeholder:text-gray-400 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className="px-4 py-3 bg-brand-primary text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-primary/90 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Optional date toggle */}
      {!showDate ? (
        <button
          onClick={() => setShowDate(true)}
          className="text-sm text-gray-500 hover:text-brand-primary transition-colors"
        >
          + Add target date (optional)
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Due by:</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:border-brand-primary focus:outline-none transition-colors"
          />
          <button
            onClick={() => {
              setShowDate(false);
              setTargetDate("");
            }}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Remove date"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
