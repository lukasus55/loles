import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  listClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder, className = "", listClassName = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none hover:bg-neutral-900 transition-colors cursor-pointer ${className}`}
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full min-w-[120px] bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${listClassName}`}>
          <div className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                  value === option.value
                    ? "bg-red-950/40 text-white font-medium"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
