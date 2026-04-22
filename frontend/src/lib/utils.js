import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return '$' + Math.round(num).toLocaleString('es-CO');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  if (d.toDateString() === hoy.toDateString()) {
    return 'Hoy ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
  if (d.toDateString() === ayer.toDateString()) {
    return 'Ayer ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
