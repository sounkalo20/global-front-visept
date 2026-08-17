'use client';

const STATUS_CONFIG = {
  draft: {
    label: 'Brouillon',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
  in_progress: {
    label: 'En cours',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  completed: {
    label: 'Complété',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  validated: {
    label: 'Validé',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  canceled: {
    label: 'Annulé',
    className: 'bg-red-100 text-red-600 border border-red-200',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const sizeClass = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}
