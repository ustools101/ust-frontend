'use client';

import { useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface BankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const BankInfoModal = ({ isOpen, onClose, amount }: BankInfoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Bank Transfer Information</h2>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-300">Amount to Pay:</p>
            <p className="text-lg text-white">₦{amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-300">Bank Details:</p>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-200">Bank Name: Kuda Bank</p>
              <p className="text-gray-200">Account Number: 3001323169</p>
              <p className="text-gray-200">Account Name: Godwin Idemudia</p>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-300">Instructions:</p>
            <ol className="list-decimal ml-4 space-y-2 text-gray-200">
              <li>Make the payment to the bank account above</li>
              <li>Take a screenshot or photo of your payment receipt</li>
              <li>Send the receipt along with your email address to us on WhatsApp: [Your WhatsApp Number]</li>
              <li>We will verify and credit your account within 24 hours</li>
            </ol>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function BuyCreditsPage() {
  const [amount, setAmount] = useState<number>(4000);
  const [showBankInfo, setShowBankInfo] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAmount(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount < 4000) {
      toast.error('Minimum amount is 4,000 credits');
      return;
    }

    if (amount > 1000000) {
      toast.error('Maximum amount is 1,000,000 credits');
      return;
    }

    setShowBankInfo(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Buy Credits</h1>
        <p className="mt-1 text-sm text-gray-400">Purchase credits to use premium features</p>
      </div>
      
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
              Amount (₦)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
              min="4000"
              max="1000000"
              placeholder="Enter amount"
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-400">Min: 4,000 credits</span>
              <span className="text-gray-400">Max: 1,000,000 credits</span>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-300">Secure Bank Transfer</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Pay ₦{amount.toLocaleString()}
          </button>
        </form>
      </div>

      <BankInfoModal
        isOpen={showBankInfo}
        onClose={() => setShowBankInfo(false)}
        amount={amount}
      />
    </div>
  );
}
