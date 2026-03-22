import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  className?: string;
}

export const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => (
  <div className={cn('card-stat', className)}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-muted-foreground">{title}</span>
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold font-display">{value}</p>
    {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
  </div>
);
