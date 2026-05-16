import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import {
  Briefcase,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react'
import Auth from './Auth'
import CredentialsUpload from './CredentialsUpload'
import Dashboard from './Dashboard/dashboard'
import CreateProgramme from './Dashboard/Program/CreateProgramme'
import MyProgrammes from './Dashboard/Program/MyProgrammes'
import { auth } from './firebase'

type AppView = 'dashboard' | 'programmes' | 'create' | 'credentials'

const navItems: Array<{
  view: AppView
  label: string
  icon: typeof LayoutDashboard
}> = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'programmes', label: 'Programmes', icon: Briefcase },
  { view: 'create', label: 'Create', icon: Plus },
  { view: 'credentials', label: 'Credentials', icon: FileCheck2 },
]

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="border-[3px] border-white/10 border-t-white rounded-full w-10 h-10 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'programmes':
        return <MyProgrammes onNavigate={setCurrentView} />
      case 'create':
        return <CreateProgramme onNavigate={setCurrentView} />
      case 'credentials':
        return <CredentialsUpload />
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen w-screen bg-[#f8fafb] text-slate-900 font-sans flex overflow-hidden">
      <aside className="w-72 shrink-0 bg-[#171b2a] text-white flex flex-col border-r border-white/10">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white text-[#171b2a] flex items-center justify-center shadow-sm">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">Innoweb</div>
            <div className="text-xs text-slate-400">Innovation ecosystem</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ view, label, icon: Icon }) => {
            const isActive = currentView === view

            return (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white text-[#171b2a] shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-sm font-bold">
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {user.displayName || 'Signed in'}
              </div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>

          <button
            onClick={() => signOut(auth)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-slate-100 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>

          <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </aside>

      <section className="flex-1 min-w-0 overflow-y-auto">{renderCurrentView()}</section>
    </div>
  )
}

export default App
