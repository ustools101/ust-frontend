'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PaystackPop from '@paystack/inline-js';

interface PaystackResponse {
  reference: string;
  status: string;
}

let PaystackPopInstance: typeof PaystackPop | null = null;

export default function BuyCreditsPage() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState<number>(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize PaystackPop only on client side
    PaystackPopInstance = PaystackPop;
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAmount(value);
  };

  const verifyPayment = useCallback(async (reference: string) => {
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      toast.success('Payment successful! Credits added to your account.');
      router.push('/credits');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify payment. Please contact support.');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!PaystackPopInstance) {
      toast.error('Payment system is not ready. Please try again.');
      return;
    }
    
    if (!amount || amount < 1000) {
      toast.error('Minimum amount is 1,000 credits');
      return;
    }

    if (amount > 1000000) {
      toast.error('Maximum amount is 1,000,000 credits');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          email: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      const paystack = new PaystackPopInstance();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: session?.user?.email.toString()!,
        amount: amount * 100,
        ref: data?.reference,
        access_code: data.access_code,
        onClose: () => {
          toast.error('Payment cancelled');
          setIsProcessing(false);
        },
        callback: async (response: PaystackResponse) => {
          await verifyPayment(response.reference);
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCardIcon className="h-7 w-7 text-blue-500" />
            Buy Credits
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Purchase credits to use premium features
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Amount Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount of Credits
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="1000"
                  max="1000000"
                  value={amount}
                  onChange={handleAmountChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Min: 1,000 credits • Max: 1,000,000 credits
              </p>
            </div>

            {/* Price Preview */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price (NGN)
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {amount.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                1 credit = 1.00 NGN
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <ShieldCheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Secure Payment
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Your payment information is encrypted and secure. We use Paystack for secure payment processing.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isProcessing || amount < 1000 || amount > 1000000}
              className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Pay {amount.toLocaleString()} NGN
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
