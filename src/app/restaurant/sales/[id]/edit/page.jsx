'use client';
import { useParams } from 'next/navigation';
import PosLayout from '@/components/sales/POS/PosLayout';

export default function EditSalePage() {
  const { id } = useParams();

  return <PosLayout mode="edit" saleId={id} backLink={"/restaurant/sales"} />;
}