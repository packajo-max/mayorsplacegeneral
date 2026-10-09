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

export const FeeDisclosureBadge: React.FC<{ feeNgn?: number; className?: string }> = ({ feeNgn = 60, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-xl bg-[#F0F8F2] text-[#146C43] border border-[#198754]/30 ${className}`}>
      <span className="font-bold">Fixed ₦{feeNgn} Platform Fee</span>
      <span className="text-[11px] text-[#198754]">(Charged once per paid transaction)</span>
    </div>
  );
};
