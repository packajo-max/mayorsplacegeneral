import React from 'react';

interface CurrencyProps {
  amount: number;
  className?: string;
  showKobo?: boolean;
}

export const Currency: React.FC<CurrencyProps> = ({ amount, className = '', showKobo = false }) => {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: showKobo ? 2 : 0,
    maximumFractionDigits: showKobo ? 2 : 0,
  }).format(amount);

  return <span className={`font-semibold tracking-tight ${className}`}>{formatted}</span>;
};

export const FeeDisclosureBadge: React.FC<{ feeNgn?: number; className?: string }> = () => {
  return null;
};
