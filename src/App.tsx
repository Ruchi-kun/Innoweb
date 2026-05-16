import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import {
  Briefcase,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck, // 1. Added ShieldCheck here
} from 'lucide-react' // 2. Removed unused Settings
import Auth from './Auth'
import CredentialsUpload from './CredentialsUpload'
import Dashboard from './Dashboard/dashboard'
import CreateProgramme from './Dashboard/Program/CreateProgramme'
import MyProgrammes from './Dashboard/Program/MyProgrammes'
import ProgrammeDetails from './Dashboard/Program/ProgrammeDetails'
import { auth } from './firebase'
// 3. Removed unused AdminDashboardPage import
import CompanyPassport from "./Dashboard/Program/CompanyPassport.tsx";
import ParticipantProfile from "./Dashboard/Program/ParticipantProfile.tsx";
import WelcomeScreen from "./WelcomeScreen.tsx";

// Exporting this type so other files can use it if needed
export type AppView = 'dashboard' | 'programmes' | 'create' | 'credentials' | 'details' | 'admin' | 'passport' | 'profile';

const navItems: Array<{
  view: AppView
  label: string
  icon: typeof LayoutDashboard
}> = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'programmes', label: 'Programmes', icon: Briefcase },
  { view: 'passport', label: 'Passport', icon: FileCheck2 },
  { view: 'create', label: 'Create', icon: Plus },
  { view: 'credentials', label: 'Credentials', icon: ShieldCheck },
]

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  // 4. Kept only ONE handleNavigate function and typed it strictly to fix the "any" error
  const handleNavigate = (view: AppView | string) => {
    setCurrentView(view as AppView);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (!hasEntered) {
    return <WelcomeScreen onEnter={() => setHasEntered(true)} />;
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'programmes':
        return (
            <MyProgrammes
                onNavigate={handleNavigate}
                onViewDetails={(id: string) => {
                  setSelectedProgrammeId(id);
                  setCurrentView('details');
                }}
            />
        )
      case 'create':
        return <CreateProgramme onNavigate={handleNavigate} />
      case 'credentials':
        return <CredentialsUpload onNavigate={handleNavigate} />
      case 'passport':
        return <CompanyPassport onBack={() => setCurrentView('dashboard')} />
      case 'details':
        return selectedProgrammeId ? (
            <ProgrammeDetails
                programmeId={selectedProgrammeId}
                onNavigate={handleNavigate}
                onViewParticipant={(participantId) => {
                  setSelectedParticipantId(participantId);
                  setCurrentView('profile');
                }}
            />
        ) : <Dashboard onNavigate={handleNavigate} />

      case 'profile':
        return selectedParticipantId ? (
            <ParticipantProfile
                participantId={selectedParticipantId}
                onBack={() => setCurrentView('details')}
                onViewPassport={() => setCurrentView('passport')}
            />
        ) : <Dashboard onNavigate={handleNavigate} />
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
      <div className="flex h-screen bg-[#f8fafb] text-slate-900 font-sans overflow-hidden">
        <aside className="w-72 bg-[#1e2330] text-slate-300 flex flex-col shrink-0">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-[#1e2330] rounded-md rotate-45" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">InnoWeb</span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => (
                  <button
                      key={item.view}
                      onClick={() => {
                        setCurrentView(item.view)
                        setSelectedProgrammeId(null)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          currentView === item.view || (item.view === 'programmes' && currentView === 'details')
                              ? 'bg-white/10 text-white shadow-sm'
                              : 'hover:bg-white/5 hover:text-white text-slate-400'
                      }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-white/5">
            <div className="flex items-center gap-3 px-2 mb-6">
              {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-white/20" />
              ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-sm font-bold text-white">
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-white">{user.displayName || 'Signed in'}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
              </div>
            </div>

            <button
                onClick={() => signOut(auth)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-slate-100 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderView()}
        </div>
      </div>
  )
}

export default App