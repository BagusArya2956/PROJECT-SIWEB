"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SearchableSelectProps = {
  value: string;
  options: string[];
  onChange: (nextValue: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Pilih opsi",
  className = ""
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((item) => item.toLowerCase().includes(keyword));
  }, [options, query]);

  useEffect(() => {
    setQuery("");
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = value || placeholder;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-2 h-[46px] w-full rounded-[10px] border border-[#e5e9e2] bg-[#f1f3ef] px-4 text-left text-[13px] text-[#3f4a43]"
      >
        <span className={value ? "" : "text-[#91a095]"}>{displayValue}</span>
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[12px] border border-[#d9e3d9] bg-white shadow-[0_14px_30px_rgba(88,109,94,0.16)]">
          <div className="border-b border-[#edf2ec] p-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kota/kabupaten..."
              className="h-9 w-full rounded-[8px] border border-[#dce7dc] bg-[#f8fbf8] px-3 text-[12px] text-[#334239] outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto p-1">
            {filtered.length ? (
              filtered.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full rounded-[8px] px-3 py-2 text-left text-[12px] ${
                      item === value
                        ? "bg-[#e6f7e9] font-semibold text-[#1f7a45]"
                        : "text-[#334239] hover:bg-[#f2f8f2]"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-[12px] text-[#75857b]">Tidak ada hasil</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
