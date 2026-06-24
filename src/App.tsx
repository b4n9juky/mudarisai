import React from 'react';
import { AuthProvider, useAuth } from './stores/authStore';
import { PipelineProvider, usePipeline } from './stores/pipelineStore';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import StepIndicator from './components/StepIndicator';
import Footer from './components/Footer';
import StepInput from './pages/StepInput';
import StepAnalisisCPTPATP from './pages/StepAnalisisCPTPATP';
import StepProtaProsem from './pages/StepProtaProsem';
import StepModulAjar from './pages/StepModulAjar';
import StepLKPD from './pages/StepLKPD';
import StepAssessmentRubrik from './pages/StepAssessmentRubrik';
import AdminDashboard from './pages/AdminDashboard';
import GuruDashboard from './pages/GuruDashboard';
import { Sparkles, Shield, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

function DashboardHeader() {
  const { state, logout, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 no-print">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <h1 className="text-base font-bold tracking-tight text-slate-800">
          Mudaris<span className="text-emerald-600">AI</span>
        </h1>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] uppercase font-bold tracking-wider rounded border border-slate-200/50">
          Perangkat Ajar Generator
        </span>
      </div>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
              {state.user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{state.user?.namaGuru || state.user?.username}</p>
              <p className="text-[9px] text-slate-400 leading-tight">{state.user?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 min-w-[150px]">
                <button
                  onClick={() => { logout(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function PipelineDashboard() {
  const { state, dispatch } = usePipeline();
  const { isAdmin } = useAuth();
  const { state: authState } = useAuth();
  const [showGuruDashboard, setShowGuruDashboard] = useState(state.currentStep === 0);

  const handleStartNew = () => {
    setShowGuruDashboard(false);
    dispatch({ type: 'SET_STEP', payload: 0 });
  };

  const handleBackToDashboard = () => {
    setShowGuruDashboard(true);
    dispatch({ type: 'SET_STEP', payload: 0 });
  };

  // When step changes away from 0, hide dashboard
  const showDash = showGuruDashboard && state.currentStep === 0 && !isAdmin;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <DashboardHeader />

      {/* Guru Dashboard button */}
      <RoleGuard roles={['guru']}>
        <div className="px-6 pt-2 no-print">
          <button
            onClick={showDash ? undefined : handleBackToDashboard}
            className={`px-3 py-1 text-[10px] font-bold rounded border transition-colors ${
              showDash
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 cursor-default'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            <LayoutDashboard className="w-3 h-3 inline mr-1" />
            Dashboard
          </button>
        </div>
      </RoleGuard>

      {/* Admin shortcut */}
      <RoleGuard roles={['admin']}>
        <div className="px-6 pt-2 no-print">
          <button
            onClick={() => {
              const el = document.getElementById('admin-panel');
              if (el) el.classList.toggle('hidden');
            }}
            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded border border-indigo-200 transition-colors"
          >
            <Shield className="w-3 h-3 inline mr-1" />
            Panel Admin
          </button>
        </div>
      </RoleGuard>

      <RoleGuard roles={['admin']}>
        <div id="admin-panel" className="hidden px-6 pt-2">
          <AdminDashboard />
        </div>
      </RoleGuard>

      {showDash ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          <GuruDashboard onStartNew={handleStartNew} />
        </main>
      ) : (
        <>
          {/* Step Indicator */}
          <div className="px-6">
            <StepIndicator />
          </div>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
            {state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <span>⚠</span>
                <span>{state.error}</span>
                <button
                  onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
                  className="ml-auto text-red-400 hover:text-red-600 font-bold"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Pipeline Steps */}
            {state.currentStep === 0 && <StepInput onStartNew={handleStartNew} />}
            {state.currentStep === 1 && <StepAnalisisCPTPATP />}
            {state.currentStep === 2 && <StepProtaProsem />}
            {state.currentStep === 3 && <StepModulAjar />}
            {state.currentStep === 4 && <StepLKPD />}
            {state.currentStep === 5 && <StepAssessmentRubrik />}
          </main>
        </>
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <PipelineProvider>
          <PipelineDashboard />
        </PipelineProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
