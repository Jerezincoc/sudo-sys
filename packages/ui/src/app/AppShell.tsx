// packages/ui/src/app/AppShell.tsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Calculator, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../shared/AuthContext';
import './appshell.css';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminOrSuporte = user?.roles.includes('ADMIN') || user?.roles.includes('SUPORTE');

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
          
          {isAdminOrSuporte && (
            <>
              <NavLink to="/empresas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Building2 size={20} />
                <span>Empresas</span>
              </NavLink>
              
              <NavLink to="/funcionarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={20} />
                <span>Funcionários</span>
              </NavLink>

              <NavLink to="/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={20} />
                <span>Gestão de Acessos</span>
              </NavLink>
            </>
          )}

          <NavLink to="/agendas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CheckSquare size={20} />
            <span>Demandas</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item btn-logout" onClick={handleLogout}>
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
            <div className="avatar">{user?.nome?.charAt(0).toUpperCase() || 'U'}</div>
            <span>{user?.nome || 'Usuário'}</span>
          </div>
        </header>

        <div className="app-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
