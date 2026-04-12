// packages/ui/src/app/Router.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { routes } from './routes';
import { AuthProvider, useAuth } from '../shared/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Carregando sessão...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function Router() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            {routes.map((route) => (
              <Route 
                key={route.path} 
                path={route.path} 
                element={<route.element />} 
              />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
