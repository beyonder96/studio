import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number, forceVisible: boolean = false) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
