import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Auth from './Auth'
import { LayoutDashboard, Briefcase, Users, CreditCard, Settings } from 'lucide-react'

// Import all 3 of your screens!
import Dashboard from './Dashboard/dashboard'
import MyProgrammes from './Dashboard/Program/MyProgrammes.tsx'
import CreateProgramme from './Dashboard/Program/CreateProgramme.tsx'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Now we have 3 views!
  const [currentView, setCurrentView] = useState<'dashboard' | 'programmes' | 'create'>('dashboard')

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
      <div className="flex h-screen w-screen bg-[#f8fafb] font-sans text-slate-800 overflow-hidden">

        {/* Floating sign-out button */}
        <button
            onClick={() => signOut(auth)}
            className="absolute top-6 right-36 z-50 flex items-center gap-2 bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200 transition-all duration-300 px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>

        {/* SHARED SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col pt-6 shrink-0 z-40">
          <div className="px-6 mb-8">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Innoweb</h1>
          </div>

          <nav className="flex-1 flex flex-col gap-1">
            <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-3 px-6 py-3 font-medium transition-colors border-l-4 w-full text-left
              ${currentView === 'dashboard'
                    ? 'bg-slate-50 border-slate-800 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'}`}
            >
              <LayoutDashboard size={20} className={currentView === 'dashboard' ? 'text-slate-600' : ''} />
              Dashboard
            </button>

            <button
                onClick={() => setCurrentView('programmes')}
                className={`flex items-center gap-3 px-6 py-3 font-medium transition-colors border-l-4 w-full text-left
              ${(currentView === 'programmes' || currentView === 'create')
                    ? 'bg-slate-50 border-slate-800 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'}`}
            >
              <Briefcase size={20} className={(currentView === 'programmes' || currentView === 'create') ? 'text-slate-600' : ''} />
              My Programmes
            </button>

            <div className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer border-l-4 border-transparent">
              <Users size={20} /> Connections
            </div>
            <div className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer border-l-4 border-transparent">
              <CreditCard size={20} /> Passport
            </div>
            <div className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer border-l-4 border-transparent">
              <Settings size={20} /> Settings
            </div>
          </nav>
        </aside>

        {/* DYNAMIC MAIN CONTENT - Router Logic */}
        <div className="flex-1 h-full relative">
          {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
          {currentView === 'programmes' && <MyProgrammes onNavigate={setCurrentView} />}
          {currentView === 'create' && <CreateProgramme onNavigate={setCurrentView} />}
        </div>

      </div>
  )
}

export default App