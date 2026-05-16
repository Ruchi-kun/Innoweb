import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Auth from './Auth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,#1e1b4b_0%,#020617_100%)]">
        <div className="border-[3px] border-white/10 border-t-white rounded-full w-10 h-10 animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen w-screen bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#020617_100%)] font-sans text-slate-50 relative overflow-x-hidden flex flex-col m-0 p-0">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none"></div>

      {/* Header/Nav */}
      <header className="w-full p-6 flex justify-between items-center relative z-10 border-b border-white/5 bg-black/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Innoweb</span>
        </div>

        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-300 hover:bg-white/10">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <span className="text-xs font-bold text-white">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col items-start pr-2">
              <span className="text-slate-50 text-sm font-semibold tracking-wide leading-tight">
                {user.displayName || 'Welcome back!'}
              </span>
              <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider leading-tight">
                {user.email}
              </span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10 mx-1"></div>
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95"
            title="Sign Out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-[20px] border border-white/10 p-12 rounded-[32px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] text-center transform transition-all hover:-translate-y-1 hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)]">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto">
            You have successfully authenticated with Google. This is your new premium workspace.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-slate-200 font-semibold mb-1">Quick Actions</h3>
              <p className="text-slate-500 text-sm">Configure your settings and preferences.</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-slate-200 font-semibold mb-1">Security Status</h3>
              <p className="text-slate-500 text-sm">Your account is fully secured and verified.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
