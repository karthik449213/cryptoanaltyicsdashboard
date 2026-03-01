'use client';

import React from 'react';

type SubscriptionStatusProps = {
  status: string;
  planName?: string;
  endsAt?: string;
  onCancel?: () => void;
  isLoading?: boolean;
};

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  status, 
  planName,
  endsAt, 
  onCancel,
  isLoading 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-100 border-green-700';
      case 'trial':
        return 'bg-blue-900 text-blue-100 border-blue-700';
      case 'expired':
      case 'canceled':
        return 'bg-red-900 text-red-100 border-red-700';
      default:
        return 'bg-zinc-800 text-zinc-100 border-zinc-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active Subscription';
      case 'trial':
        return 'Trial Period';
      case 'expired':
        return 'Expired';
      case 'canceled':
        return 'Canceled';
      default:
        return 'No Subscription';
    }
  };

  return (
    <div className={`border rounded-xl p-4 inline-block ${getStatusColor(status)}`}>
      <div className="text-xs uppercase tracking-wide opacity-75 mb-1">Status</div>
      <div className="font-semibold text-base">{getStatusLabel(status)}</div>
      {planName && <div className="text-sm mt-2 opacity-90">Plan: {planName}</div>}
      {endsAt && (
        <div className="text-xs opacity-75 mt-2">
          {status === 'trial' ? 'Trial ends' : 'Renews'}: {new Date(endsAt).toLocaleDateString()}
        </div>
      )}
      {(status === 'active' || status === 'trial') && onCancel && (
        <button 
          onClick={onCancel}
          disabled={isLoading}
          className="mt-4 text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Canceling...' : 'Cancel Subscription'}
        </button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
