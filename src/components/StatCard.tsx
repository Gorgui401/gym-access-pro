import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  className?: string;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard = ({ title, value, icon, trend, className, iconColor, iconBg }: StatCardProps) => (
  <div className={cn('card-stat', className)}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</span>
      <div className={cn(
        'h-10 w-10 rounded-xl flex items-center justify-center',
        iconBg || 'bg-accent/10',
        iconColor || 'text-accent'
      )}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-extrabold font-display tracking-tight">{value}</p>
    {trend && <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>}
  </div>
);
