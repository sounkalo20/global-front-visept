'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PAGE_SIZES = [20, 50, 100, 200];
const STORAGE_KEY = 'visept_page_size';

export function getStoredPageSize(defaultSize = 20) {
  if (typeof window === 'undefined') return defaultSize;
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = parseInt(stored);
  return PAGE_SIZES.includes(parsed) ? parsed : defaultSize;
}

export default function PageSizeSelector({ value, onChange }) {
  const handleChange = (val) => {
    const num = parseInt(val);
    localStorage.setItem(STORAGE_KEY, String(num));
    onChange(num);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#D1D5DB]">
      <span>Afficher</span>
      <Select value={String(value)} onValueChange={handleChange}>
        <SelectTrigger className="w-[85px] h-8 text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>par page</span>
    </div>
  );
}