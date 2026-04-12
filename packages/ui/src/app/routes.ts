// packages/ui/src/app/routes.ts
import { DashboardPage } from '../pages/dashboard/DashboardPage';

export const routes = [
  {
    path: '/',
    element: DashboardPage,
    title: 'Dashboard',
  },
  // As outras rotas como /empresas, /funcionarios serão adicionadas aqui futuramente
];
