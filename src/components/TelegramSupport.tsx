'use client';

import Link from 'next/link';
import Image from 'next/image';



export default function TelegramSupport() {
  return (
    <Link
      href="https://t.me/ustools_support"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-25 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
      aria-label="Contact Support on Telegram"
    >
      {/* telegram svg icon */}
      <Image src="/telegram.png" alt="Telegram" width={64} height={64} />
    </Link>
  );
}
