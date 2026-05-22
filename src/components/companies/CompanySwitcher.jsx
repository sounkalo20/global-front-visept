'use client';

import useCompanyStore from '@/store/companyStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

export default function CompanySwitcher() {
  const { companies, activeCompany, setActiveCompany } = useCompanyStore();

  if (companies.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Building2 size={16} className="text-gray-400 hidden sm:block" />

      <Select
        value={activeCompany?.id?.toString()}
        onValueChange={(value) => {
          const company = companies.find(
            (c) => c.id === parseInt(value)
          );

          if (company) {
            setActiveCompany(company);
          }
        }}
      >
        <SelectTrigger className="w-[180px] sm:w-[220px] h-8 text-sm">
          <SelectValue placeholder="Choisir une entreprise" />
        </SelectTrigger>

        <SelectContent>
          {companies.map((company) => (
            <SelectItem
              key={company.id}
              value={company.id.toString()}
            >
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}