import type { ImportStatus } from '@prisma/client'
import { Badge, type BadgeProps } from '@/components/ui/badge'

const STATUS_CONFIG: Record<ImportStatus, { label: string; variant: BadgeProps['variant'] }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  PROCESSING: { label: 'Processing', variant: 'secondary' },
  REVIEW: { label: 'Needs Review', variant: 'default' },
  COMPLETE: { label: 'Complete', variant: 'outline' },
  FAILED: { label: 'Failed', variant: 'destructive' },
}

export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
