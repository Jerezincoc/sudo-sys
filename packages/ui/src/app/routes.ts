// packages/ui/src/app/routes.ts
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { AgendasPage } from '../pages/demandas/AgendasPage';

export const routes = [
  {
    path: '/',
    element: DashboardPage,
    title: 'Dashboard',
  },
  {
    path: '/usuarios',
    element: UsersPage,
    title: 'Gestão de Usuários',
  },
  {
    path: '/agendas',
    element: AgendasPage,
    title: 'Agenda / Chamados',
  }
];
