'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  BanknotesIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

type PaymentMethod = 'bank' | 'usdt';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: PaymentMethod;
  usdtRate: number | null;
}

const PaymentModal = ({ isOpen, onClose, amount, paymentMethod, usdtRate }: PaymentModalProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'Kuda Bank';
  const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '3001323169';
  const accountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'Godwin Idemudia';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+2348000000000';
  const walletAddress = process.env.NEXT_PUBLIC_USDT_WALLET_ADDRESS || '';

  const usdtAmount = usdtRate ? (amount / usdtRate).toFixed(2) : '...';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 max-w-lg w-full border border-gray-800 my-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {paymentMethod === 'bank' ? '🏦 Bank Transfer' : '💰 USDT Payment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {paymentMethod === 'bank' ? (
          <div className="space-y-4">
            {/* Amount */}
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-400">Amount to Pay</p>
              <p className="text-2xl font-bold text-white">₦{amount.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">= {amount.toLocaleString()} Credits</p>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="text-white font-medium">{bankName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="text-white font-medium font-mono">{accountNumber}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(accountNumber, 'Account number')}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  {copied === 'Account number' ? (
                    <CheckIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Account Name</p>
                  <p className="text-white font-medium">{accountName}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-blue-400">Payment Instructions</p>
              </div>
              <ol className="list-decimal ml-6 space-y-2 text-sm text-gray-300">
                <li>Transfer <span className="text-white font-semibold">₦{amount.toLocaleString()}</span> to the bank account above</li>
                <li>Take a <span className="text-white">screenshot</span> of your payment receipt/confirmation</li>
                <li>Send the receipt with your <span className="text-white">registered email address</span> to WhatsApp</li>
                <li>Your credits will be added within <span className="text-green-400 font-semibold">30 minutes - 2 hours</span></li>
              </ol>
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi,%20I%20just%20made%20a%20payment%20of%20₦${amount.toLocaleString()}%20for%20credits.%20My%20email%20is:%20`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send Receipt on WhatsApp
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount */}
            <div className="bg-purple-900/30 border border-purple-800 rounded-lg p-4">
              <p className="text-sm text-purple-400">Amount to Pay</p>
              <p className="text-2xl font-bold text-white">${usdtAmount} USDT</p>
              <p className="text-xs text-purple-400 mt-1">
                ≈ ₦{amount.toLocaleString()} = {amount.toLocaleString()} Credits
              </p>
              {usdtRate && (
                <p className="text-xs text-gray-500 mt-1">
                  Rate: 1 USDT = ₦{usdtRate.toLocaleString()}
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center bg-white rounded-lg p-4">
              <QRCodeSVG 
                value={walletAddress} 
                size={180}
                level="H"
                includeMargin
              />
              <p className="text-xs text-gray-600 mt-2">Scan to get wallet address</p>
            </div>

            {/* Wallet Address */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">USDT Wallet Address (ERC-20 / Ethereum)</p>
                  <p className="text-white font-mono text-xs sm:text-sm break-all">{walletAddress}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(walletAddress, 'Wallet address')}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex-shrink-0"
                >
                  {copied === 'Wallet address' ? (
                    <CheckIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3">
              <p className="text-xs text-yellow-400 font-medium">⚠️ Important: Only send USDT on the Ethereum (ERC-20) network. Sending other tokens or using wrong network will result in permanent loss.</p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-blue-400">Payment Instructions</p>
              </div>
              <ol className="list-decimal ml-6 space-y-2 text-sm text-gray-300">
                <li>Send exactly <span className="text-white font-semibold">${usdtAmount} USDT</span> to the wallet address above</li>
                <li>Use <span className="text-white">Ethereum (ERC-20)</span> network only</li>
                <li>Take a <span className="text-white">screenshot</span> of the transaction confirmation</li>
                <li>Send the screenshot with your <span className="text-white">registered email</span> to WhatsApp</li>
                <li>Credits will be added after <span className="text-green-400 font-semibold">blockchain confirmation (10-30 mins)</span></li>
              </ol>
            </div>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi,%20I%20just%20sent%20$${usdtAmount}%20USDT%20for%20credits.%20My%20email%20is:%20`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send Receipt on WhatsApp
            </a>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-800 text-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function BuyCreditsPage() {
  const [amount, setAmount] = useState<number>(4000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [usdtRate, setUsdtRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    fetchUsdtRate();
  }, []);

  const fetchUsdtRate = async () => {
    try {
      setLoadingRate(true);
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTNGN');
      const data = await response.json();
      if (data.price) {
        setUsdtRate(parseFloat(data.price));
      }
    } catch (error) {
      console.error('Failed to fetch USDT rate:', error);
      setUsdtRate(1650);
    } finally {
      setLoadingRate(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
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

    setShowPaymentModal(true);
  };

  const usdtAmount = usdtRate ? (amount / usdtRate).toFixed(2) : '...';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Buy Credits</h1>
        <p className="mt-1 text-sm text-gray-400">Purchase credits to generate phishing links</p>
      </div>

      {/* USDT Rate Display */}
      {usdtRate && (
        <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-300">Current USDT Rate</span>
          </div>
          <span className="text-sm font-medium text-white">
            1 USDT = ₦{usdtRate.toLocaleString()}
          </span>
        </div>
      )}
      
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount (Credits = ₦)
            </label>
            <input
              type="number"
              id="amount"
              value={amount || ''}
              onChange={handleAmountChange}
              className="block w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
              min="4000"
              max="1000000"
              placeholder="Enter amount"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Min: ₦4,000</span>
              <span>Max: ₦1,000,000</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {[4000, 10000, 20000, 50000, 100000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  amount === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ₦{value.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bank Transfer Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {paymentMethod === 'bank' && (
                  <div className="absolute top-2 right-2">
                    <CheckIcon className="w-5 h-5 text-green-400" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${paymentMethod === 'bank' ? 'bg-green-600' : 'bg-gray-700'}`}>
                    <BanknotesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Bank Transfer</p>
                    <p className="text-xs text-gray-400">Nigerian Naira (₦)</p>
                  </div>
                </div>
                <div className="mt-3 text-left">
                  <p className="text-lg font-bold text-white">₦{amount.toLocaleString()}</p>
                </div>
              </button>

              {/* USDT Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('usdt')}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'usdt'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                {paymentMethod === 'usdt' && (
                  <div className="absolute top-2 right-2">
                    <CheckIcon className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${paymentMethod === 'usdt' ? 'bg-purple-600' : 'bg-gray-700'}`}>
                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">USDT</p>
                    <p className="text-xs text-gray-400">Ethereum (ERC-20)</p>
                  </div>
                </div>
                <div className="mt-3 text-left">
                  <p className="text-lg font-bold text-white">
                    {loadingRate ? '...' : `$${usdtAmount}`}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-300">
                {paymentMethod === 'bank' ? 'Secure Bank Transfer' : 'Secure Crypto Payment'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              paymentMethod === 'bank'
                ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
            }`}
          >
            {paymentMethod === 'bank' 
              ? `Pay ₦${amount.toLocaleString()}`
              : `Pay $${usdtAmount} USDT`
            }
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">💡 How it works</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• 1 Credit = ₦1 (e.g., ₦4,000 = 4,000 Credits)</li>
          <li>• Credits are used to generate and extend phishing links</li>
          <li>• Payments are manually verified for security</li>
          <li>• Credits are added within 30 mins - 2 hours after verification</li>
        </ul>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={amount}
        paymentMethod={paymentMethod}
        usdtRate={usdtRate}
      />
    </div>
  );
}
