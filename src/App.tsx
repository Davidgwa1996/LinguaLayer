import React, { useState } from 'react';
import { Menu, X, Home, MessageSquare, Shield, Smartphone, Video, FileText, Globe, Heart, LogIn, LogOut, FileSearch, LineChart, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './pages/LandingPage';
import { TechnicalArchitecture } from './pages/TechnicalArchitecture';
import { VideoDemoMode } from './pages/VideoDemoMode';
import { LiveChat } from './pages/LiveChat';
import { SimpleText } from './pages/SimpleText';
import { BusinessProtection } from './pages/BusinessProtection';
import { ProductSummary } from './pages/ProductSummary';
import { MarketOpportunity } from './pages/MarketOpportunity';
import { useAuth } from './lib/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import { PilotCustomerPage } from './pages/pilot/PilotCustomerPage';
import { PilotAgentPage } from './pages/pilot/PilotAgentPage';
import { PilotValidationPage } from './pages/pilot/PilotValidationPage';

function PilotLinkItem({ title, route }: { title: string, route: string }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}${route}`;

  const openLink = () => {
    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        showSuccess();
      } else {
        fallbackCopyText(url);
        showSuccess();
      }
    } catch (err) {
      setCopyFailed(true);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!success) {
      throw new Error('Fallback copy failed');
    }
  };

  const showSuccess = () => {
    setCopied(true);
    setCopyFailed(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Open ${title}`,
          url: url
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopy();
    }
  };

  const canShare = !!navigator.share;

  return (
    <div className="flex flex-col gap-1 py-1 border-b border-indigo-100/50 last:border-0">
       <span className="text-xs font-bold text-indigo-900">{title}</span>
       <input 
         title="Complete URL"
         type="text" 
         readOnly 
         value={url} 
         className="w-full text-[10px] sm:text-xs bg-white border border-indigo-100 rounded px-2 py-1 text-slate-500 focus:outline-none focus:border-indigo-300"
       />
       {copyFailed && (
         <span className="text-[10px] text-rose-500 font-medium my-1">
           Automatic copying was blocked. Select and copy the link manually above.
         </span>
       )}
       <div className="flex gap-2 items-center mt-1">
          <button onClick={openLink} className="flex-1 text-center py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-sm">Open</button>
          <button onClick={handleCopy} className={`flex-1 text-center py-1 text-xs font-bold transition-colors shadow-sm rounded border ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-indigo-600 hover:bg-slate-50 border-indigo-200'}`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {canShare && (
             <button onClick={handleShare} className="flex-1 text-center py-1 text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 rounded transition-colors shadow-sm">Share</button>
          )}
       </div>
    </div>
  );
}

function AdminOnlyRoute({ children, user, isSigningIn, handleSignIn, logout }: any) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
           <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
           <p className="text-slate-500 mb-8">You must sign in to access the Validation Centre.</p>
           <button type="button" onClick={handleSignIn} disabled={isSigningIn} className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
              <Globe className={`w-5 h-5 text-indigo-400 ${isSigningIn ? 'animate-spin' : ''}`} /> 
              {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
           </button>
           <p className="text-xs text-slate-400 mt-4">Required by administrator: njaudavid5@gmail.com</p>
        </div>
      </div>
    );
  }
  if (user.email !== 'njaudavid5@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-xl max-w-md w-full text-center">
           <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Administrator access is required.</h2>
           <p className="text-slate-500 mb-8">Your account ({user.email}) does not have permission to view the SDK Pilot Validation Centre.</p>
           <button onClick={logout} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </div>
    );
  }
  return children;
}

function AuthenticatedRoute({ children, user, isSigningIn, handleSignIn, itemName }: any) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
           <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
           <p className="text-slate-500 mb-8">You must sign in to access {itemName}.</p>
           <button type="button" onClick={handleSignIn} disabled={isSigningIn} className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
              <Globe className={`w-5 h-5 text-indigo-400 ${isSigningIn ? 'animate-spin' : ''}`} /> 
              {isSigningIn ? 'Signing In...' : 'Sign In with Google'}
           </button>
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash;
    
    if (hash === '#/pilot/customer') return 'pilot-customer';
    if (hash === '#/pilot/agent') return 'pilot-agent';
    if (hash === '#/pilot/validation') return 'pilot-validation';

    
    // First link / Shared link behavior
    if (hash.includes('#/room/')) {
        const roomId = hash.replace('#/room/', '');
        if (roomId && roomId.length > 5) {
            localStorage.setItem('pendingRoomId', roomId);
            localStorage.removeItem('activeRoomId');
        }
        window.location.hash = '';
        return 'home';
    }

    // Is it a fresh session from a shared base URL link?
    const isNewSession = !sessionStorage.getItem('lingualayer-session-active');
    sessionStorage.setItem('lingualayer-session-active', 'true');
    
    if (isNewSession) {
       // First link after publish should strictly go to landing page
       return 'home';
    }

    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
       return savedTab;
    }
    return 'home';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signInWithGoogle();
    setIsSigningIn(false);
  };

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/pilot/customer') setActiveTab('pilot-customer');
      else if (hash === '#/pilot/agent') setActiveTab('pilot-agent');
      else if (hash === '#/pilot/validation') setActiveTab('pilot-validation');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Grouped Navigation Items (as requested)
  const navGroups = [
    {
      name: "Product",
      items: [
        { id: 'home', label: 'Landing / Home', icon: Home },
        { id: 'live-chat', label: 'Live Demo', icon: MessageSquare },
        { id: 'product-summary', label: 'Product Summary', icon: FileSearch }
      ]
    },
    {
      name: "Proof",
      items: [
        { id: 'simple-text', label: 'Simple Text', icon: FileText },
        { id: 'video', label: 'Video Demo', icon: Video },
        { id: 'business', label: 'Business Protection', icon: Shield },
        { id: 'architecture', label: 'How It Works / Architecture', icon: Globe }
      ]
    },
    {
      name: "Strategy",
      items: [
        { id: 'market-opportunity', label: 'Market Opportunity', icon: LineChart }
      ]
    }
  ];

  const handleNavigate = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const getActiveLabel = () => {
    for (const group of navGroups) {
      const item = group.items.find(i => i.id === activeTab);
      if (item) return item.label;
    }
    return '';
  };

  const renderContent = () => {
    if (loading) return null; // or a spinner

    switch (activeTab) {
      case 'home': return <LandingPage onNavigate={setActiveTab} />;
      case 'simple-text': return <SimpleText />;
      case 'live-chat': return <LiveChat />;
      case 'business': return <BusinessProtection />;
      case 'video': return <VideoDemoMode />;
      case 'architecture': return <TechnicalArchitecture />;
      case 'product-summary': return <ProductSummary />;
      case 'market-opportunity': return <MarketOpportunity />;
      
      case 'pilot-customer': 
         return <PilotCustomerPage />;
      case 'pilot-agent': 
         return (
            <AuthenticatedRoute user={user} isSigningIn={isSigningIn} handleSignIn={handleSignIn} itemName="Pilot Agent">
               <PilotAgentPage />
            </AuthenticatedRoute>
         );
      case 'pilot-validation': 
         return (
            <AdminOnlyRoute user={user} isSigningIn={isSigningIn} handleSignIn={handleSignIn} logout={logout}>
               <PilotValidationPage />
            </AdminOnlyRoute>
         );
      default: return <LandingPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center transform rotate-3 shadow-md">
               <Globe className="w-5 h-5 text-white transform -rotate-3" />
             </div>
             <span className="font-extrabold text-xl text-slate-900 tracking-tight">LinguaLayer</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-80px)] space-y-4 pb-20">
          {navGroups.map((group, idx) => (
             <div key={idx}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">{group.name}</h4>
                <div className="space-y-1">
                   {group.items.map(item => (
                     <button 
                       key={item.id}
                       onClick={() => handleNavigate(item.id)}
                       className={`w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                     >
                       <item.icon className="w-5 h-5 shrink-0" />
                       <span>{item.label}</span>
                     </button>
                   ))}
                </div>
             </div>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-100">
             {loading ? null : user ? (
               <div className="flex flex-col gap-2">
                 <div className="flex flex-col px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Signed In</span>
                    <span className="text-sm font-medium text-slate-800 truncate" title={user.email || ''}>{user.email}</span>
                 </div>
                 {user.email === 'njaudavid5@gmail.com' && (
                    <div className="mb-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">SDK Pilot Test Access</h4>
                      <div className="flex flex-col gap-2">
                         <PilotLinkItem title="Validation Centre" route="#/pilot/validation" />
                         <PilotLinkItem title="Pilot Agent" route="#/pilot/agent" />
                         <PilotLinkItem title="Pilot Customer" route="#/pilot/customer" />
                      </div>
                    </div>
                 )}
                 <button onClick={logout} className="w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl font-medium text-rose-600 hover:bg-rose-50 transition-all">
                   <LogOut className="w-5 h-5" />
                   <span>Sign Out</span>
                 </button>
               </div>
             ) : (
                <button onClick={handleSignIn} disabled={isSigningIn} className="w-full flex items-center text-left gap-3 px-4 py-3 rounded-xl font-medium text-indigo-600 hover:bg-indigo-50 transition-all">
                  <LogIn className="w-5 h-5" />
                  <span>{isSigningIn ? 'Signing In...' : 'Sign In'}</span>
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 mr-4 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center transform rotate-3 shadow-md hidden sm:flex">
               <Globe className="w-5 h-5 text-white transform -rotate-3" />
             </div>
             <span className="font-extrabold text-xl text-slate-900 tracking-tight">LinguaLayer <span className="text-indigo-600">AI</span></span>
          </div>
          <div className="ml-auto text-sm font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
            {getActiveLabel()}
          </div>

          
          <div className="ml-4 pl-4 border-l border-slate-200 hidden md:block">
            {loading ? <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div> : user ? (
               <div className="flex items-center gap-2">
                 <span className="text-xs font-medium text-slate-600">{user.email}</span>
                 <button onClick={logout} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500" title="Sign out">
                    <LogOut className="w-4 h-4" />
                 </button>
               </div>
            ) : (
               <button onClick={handleSignIn} disabled={isSigningIn} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2 disabled:opacity-75">
                 <LogIn className="w-4 h-4" /> {isSigningIn ? 'Signing In...' : 'Sign In'}
               </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 mt-2">
        {renderContent()}
      </div>

      <footer className="w-full border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
           <div className="flex items-center gap-1.5 mb-4 md:mb-0">
              <Globe className="w-4 h-4" /> LinguaLayer AI © 2026. created by njaudavid5@gmail.com +447873404080
           </div>
           <div className="flex items-center gap-1.5 font-medium">
             Crafted with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for global connection
           </div>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
