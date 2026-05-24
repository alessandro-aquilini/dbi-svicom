import { differenceInCalendarDays, format, isToday, isYesterday } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatChatTime(value?: string | Date): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return format(date, 'HH:mm', { locale: it });
}

export function formatChatDateLabel(value?: string | Date): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isToday(date)) return 'Oggi';
  if (isYesterday(date)) return 'Ieri';

  const diff = differenceInCalendarDays(new Date(), date);
  if (diff < 7) return `${diff} giorni fa`;
  if (diff < 365) return format(date, 'd MMM', { locale: it });
  return format(date, 'd MMM yyyy', { locale: it });
}

export function isSameChatDay(a: string | Date, b: string | Date): boolean {
  const first = typeof a === 'string' ? new Date(a) : a;
  const second = typeof b === 'string' ? new Date(b) : b;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function formatChatTooltip(value?: string | Date): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return format(date, 'd MMM yyyy · HH:mm', { locale: it });
}
