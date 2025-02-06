import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen mt-20 bg-secondary-900 relative overflow-hidden">
      {/* Matrix-like background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#86C23233,transparent_2px)] bg-[size:4px_100%] z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(transparent,#86C23215)] z-0"></div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <div className="bg-secondary-800/50 backdrop-blur-sm p-8 rounded-lg border border-primary-800/50 shadow-xl">
          <h1 className="text-2xl font-bold text-primary-400 mb-6 font-mono">Password Reset Instructions</h1>
          
          <div className="space-y-6 text-gray-300">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-primary-300 font-mono">Follow these steps:</h2>
              
              <ol className="list-decimal list-inside space-y-4 ml-2">
                <li className="text-gray-400">
                  Open our Telegram chatbot:
                  <Link 
                    href="https://t.me/USTools_Bot" 
                    target="_blank"
                    className="block mt-2 text-primary-400 hover:text-primary-300 transition-colors duration-200 font-mono"
                  >
                    @USTools_Bot
                  </Link>
                </li>
                
                <li className="text-gray-400">
                  Send the following command to the bot:
                  <code className="block mt-2 bg-secondary-900/50 px-4 py-2 rounded font-mono text-primary-400">
                    /reset
                  </code>
                </li>
                
                <li className="text-gray-400">
                  Follow the bot&apos;s instructions to complete your password reset
                </li>
              </ol>
            </div>

            <div className="mt-8 text-center font-mono">
              <Link 
                href="/signin" 
                className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
              >
                Back to ./signin.sh
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}