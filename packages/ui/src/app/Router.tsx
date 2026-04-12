// packages/ui/src/app/Router.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './AppShell';
import { routes } from './routes';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
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
  );
}
