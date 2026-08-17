'use client';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function PosClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = time.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeString = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-[#D1D5DB] bg-gray-100 dark:bg-[#1F2937] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#374151] text-xs font-medium">
      <Clock size={15} className="text-gray-400 dark:text-[#9CA3AF]" />
      <span className="capitalize">{dateString}</span>
      <span className="text-gray-300 dark:text-[#374151]">|</span>
      <span className="font-semibold text-gray-800 dark:text-[#F9FAFB]">{timeString}</span>
    </div>
  );
}
