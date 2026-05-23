import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SetupWizardPage from '@/pages/setup/SetupWizardPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'

interface Props {
  initialState: 'setup' | 'main'
}

export default function AppRouter({ initialState }: Props) {
  if (initialState === 'setup') {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizardPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
