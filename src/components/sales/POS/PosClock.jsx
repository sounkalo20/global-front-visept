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
    <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border text-sm font-medium">
      <Clock size={16} className="text-gray-400" />
      <span className="capitalize">{dateString}</span>
      <span className="text-gray-300">|</span>
      <span>{timeString}</span>
    </div>
  );
}
