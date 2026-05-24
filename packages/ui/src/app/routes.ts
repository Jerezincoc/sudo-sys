export const ROUTES = {
  SETUP:      '/setup',
  DASHBOARD:  '/dashboard',
  EMPRESAS:   '/empresas',
  FOLHA:      '/folha',
  RUBRICAS:   '/rubricas',
  FERIAS:     '/ferias',
  RESCISAO:   '/rescisao',
  PONTO:      '/ponto',
  CUSTOS:     '/custos',
  QUICKCALC:  '/quickcalc',
  RELATORIOS: '/relatorios',
  ADMIN:      '/admin',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
