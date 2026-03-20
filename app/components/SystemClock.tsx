"use client";

import { useEffect, useState } from "react";

export default function SystemClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours24 = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const pad = (value: number) => value.toString().padStart(2, "0");

  return <span>{`${pad(hours12)}:${pad(minutes)} ${ampm}`}</span>;
}
