import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export default function Auth() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,#1e1b4b_0%,#020617_100%)] font-sans fixed top-0 left-0 z-10">
      <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 p-12 rounded-[28px] w-full max-w-[420px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] text-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)]">
        
        <div className="mb-10">
          <h2 className="text-slate-50 text-[2.25rem] font-bold mb-3 tracking-[-0.03em] bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-400 m-0 text-base leading-relaxed">
            Sign in to continue to your dashboard
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3.5 rounded-xl mb-6 text-sm animate-fade-in">
            {error}
          </div>
        )}
        
        <button 
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="flex items-center justify-center w-full bg-white text-slate-900 border-none px-6 py-3.5 rounded-2xl text-[1.05rem] font-semibold cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] min-h-[54px] hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-slate-50 hover:not-disabled:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] active:not-disabled:translate-y-0 active:not-disabled:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="border-[3px] border-slate-900/10 border-t-slate-900 rounded-full w-6 h-6 animate-spin"></div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-6 h-6 mr-3">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
