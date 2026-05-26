import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './routes'
import AppShell from './AppShell'
import SetupWizardPage from '@/pages/setup/SetupWizardPage'

const DashboardPage       = lazy(() => import('@/pages/dashboard/DashboardPage'))
const EmpresasPage        = lazy(() => import('@/pages/empresas/EmpresasPage'))
const FuncionariosPage    = lazy(() => import('@/pages/empresas/FuncionariosDaEmpresaPage'))
const FolhaPage           = lazy(() => import('@/pages/folha/FolhaPage'))
const RubricasPage        = lazy(() => import('@/pages/rubricas/RubricasPage'))
const FeriasPage          = lazy(() => import('@/pages/ferias/FeriasPage'))
const RescisaoPage        = lazy(() => import('@/pages/rescisao/RescisaoPage'))
const PontoPage           = lazy(() => import('@/pages/ponto/PontoPage'))
const CustosSimuladorPage = lazy(() => import('@/pages/custos/CustosSimuladorPage'))
const QuickCalcPage       = lazy(() => import('@/pages/quickcalc/QuickCalcPage'))
const AdminPage           = lazy(() => import('@/pages/admin/AdminPage'))

import PlaceholderPage from '@/components/layout/PlaceholderPage'
function RelatoriosPage() {
  return <PlaceholderPage module="Relatórios" name="Relatórios" />
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Carregando...</span>
    </div>
  )
}

interface Props { initialState: 'setup' | 'main' }

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
        <Route element={<AppShell />}>
          <Route path={ROUTES.DASHBOARD}    element={<DashboardPage />} />
          <Route path={ROUTES.EMPRESAS}     element={<EmpresasPage />} />
          <Route path={ROUTES.FUNCIONARIOS} element={<FuncionariosPage />} />
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
