import React from 'react';

type Props = {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  onSubscribe?: (planId: string) => void;
  isLoading?: boolean;
};

export const PlanCard: React.FC<Props> = ({ id, name, price, interval, features, onSubscribe, isLoading }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <span className="text-sm text-zinc-400 uppercase tracking-wide">{interval}</span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-white">${(price/100).toFixed(2)}</div>
        <div className="text-sm text-zinc-400">per {interval === 'monthly' ? 'month' : 'year'}</div>
      </div>
      <ul className="mt-6 space-y-3 text-zinc-300">
        {features && features.length > 0 ? (
          features.map((f, i) => <li key={i} className="flex items-center gap-2">
            <span className="text-green-500">✓</span> {f}
          </li>)
        ) : (
          <li className="text-zinc-500">No features listed</li>
        )}
      </ul>
      <div className="mt-8">
        <button 
          onClick={() => onSubscribe?.(id)} 
          disabled={isLoading}
          className="w-full px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Choose Plan'}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
