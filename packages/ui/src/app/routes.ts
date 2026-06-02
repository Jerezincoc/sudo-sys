export const ROUTES = {
  SETUP:        '/setup',
  LOGIN:        '/login',
  DASHBOARD:    '/dashboard',
  EMPRESAS:     '/empresas',
  FUNCIONARIOS: '/funcionarios',
  FOLHA:        '/folha',
  RUBRICAS:     '/rubricas',
  FERIAS:       '/ferias',
  RESCISAO:     '/rescisao',
  PONTO:        '/ponto',
  CUSTOS:       '/custos',
  QUICKCALC:    '/quickcalc',
  RELATORIOS:   '/relatorios',
  CBO:          '/cbo',
  DOCUMENTOS:   '/documentos',
  ADMIN:        '/admin',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
