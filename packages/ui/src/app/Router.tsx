import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './routes'
import AppShell from './AppShell'

// ── Setup ──────────────────────────────────────────────────────────────────
import SetupWizardPage from '@/pages/setup/SetupWizardPage'

// ── Páginas principais (lazy) ──────────────────────────────────────────────
const DashboardPage        = lazy(() => import('@/pages/dashboard/DashboardPage'))
const EmpresasPage         = lazy(() => import('@/pages/empresas/EmpresasPage'))
const FolhaPage            = lazy(() => import('@/pages/folha/FolhaPage'))
const RubricasPage         = lazy(() => import('@/pages/rubricas/RubricasPage'))
const FeriasPage           = lazy(() => import('@/pages/ferias/FeriasPage'))
const RescisaoPage         = lazy(() => import('@/pages/rescisao/RescisaoPage'))
const PontoPage            = lazy(() => import('@/pages/ponto/PontoPage'))
const CustosSimuladorPage  = lazy(() => import('@/pages/custos/CustosSimuladorPage'))
const QuickCalcPage        = lazy(() => import('@/pages/quickcalc/QuickCalcPage'))
const AdminPage            = lazy(() => import('@/pages/admin/AdminPage'))

// ── Relatórios (placeholder) ───────────────────────────────────────────────
function RelatoriosPage() {
  return <PlaceholderPage title="Relatórios" />
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Em desenvolvimento</p>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>
    </div>
  )
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 28,
          height: 28,
          border: '2px solid var(--brand-600)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

interface Props {
  initialState: 'setup' | 'main'
}

export default function AppRouter({ initialState }: Props) {
  if (initialState === 'setup') {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizardPage />} />
        <Route path="*"      element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Layout principal com AppShell */}
        <Route element={<AppShell />}>
          <Route path={ROUTES.DASHBOARD}  element={<DashboardPage />} />
          <Route path={ROUTES.EMPRESAS}   element={<EmpresasPage />} />
          <Route path={ROUTES.FOLHA}      element={<FolhaPage />} />
          <Route path={ROUTES.RUBRICAS}   element={<RubricasPage />} />
          <Route path={ROUTES.FERIAS}     element={<FeriasPage />} />
          <Route path={ROUTES.RESCISAO}   element={<RescisaoPage />} />
          <Route path={ROUTES.PONTO}      element={<PontoPage />} />
          <Route path={ROUTES.CUSTOS}     element={<CustosSimuladorPage />} />
          <Route path={ROUTES.QUICKCALC}  element={<QuickCalcPage />} />
          <Route path={ROUTES.RELATORIOS} element={<RelatoriosPage />} />
          <Route path={ROUTES.ADMIN}      element={<AdminPage />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
