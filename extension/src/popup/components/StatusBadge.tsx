import type { FillStatus } from '@lib/types/fill-result.js';

const STATUS_CONFIG: Record<FillStatus, { label: string; bg: string; color: string }> = {
  filled: { label: 'Filled', bg: '#e6f4ea', color: '#137333' },
  skipped: { label: 'Skipped', bg: '#fef7e0', color: '#b06000' },
  'not-found': { label: 'Not Found', bg: '#fce8e6', color: '#c5221f' },
  error: { label: 'Error', bg: '#fce8e6', color: '#c5221f' },
};

interface Props {
  status: FillStatus;
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
