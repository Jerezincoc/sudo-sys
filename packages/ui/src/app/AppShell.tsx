// packages/ui/src/app/AppShell.tsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Calculator, LogOut } from 'lucide-react';
import './appshell.css';

export function AppShell() {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="logo-placeholder">
            <Calculator size={28} className="text-primary" />
            <span className="logo-text">SUDO SYS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/empresas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Building2 size={20} />
            <span>Empresas</span>
          </NavLink>
          
          <NavLink to="/funcionarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Funcionários</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item btn-logout">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        <header className="app-header">
          <h2>Módulo de Gestão</h2>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span>Admin</span>
          </div>
        </header>

        <div className="app-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
