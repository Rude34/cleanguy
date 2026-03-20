"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TopSearchProps = {
  defaultValue?: string;
};

export default function TopSearch({ defaultValue = "" }: TopSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  const submitQuery = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      router.push("/search");
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          submitQuery();
        }
      }}
      placeholder="Sorunu yaz ve Enter'a bas"
      className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      aria-label="Site arama"
    />
  );
}
