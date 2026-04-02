// packages/shared/src/ipc/channels.ts
// Fonte única de verdade para nomes de canais IPC.
// Importe daqui tanto no main quanto no renderer.

export const Channels = {
  // ── Empresas ──────────────────────────────────────────────────────────────
  EMPRESA_LIST:    'empresa:list',
  EMPRESA_CREATE:  'empresa:create',
  EMPRESA_UPDATE:  'empresa:update',
  EMPRESA_DELETE:  'empresa:delete',

  // ── Funcionários ──────────────────────────────────────────────────────────
  FUNC_LIST:       'funcionario:list',
  FUNC_CREATE:     'funcionario:create',
  FUNC_UPDATE:     'funcionario:update',
  FUNC_DELETE:     'funcionario:delete',

  // ── Folha de pagamento ────────────────────────────────────────────────────
  FOLHA_LIST:                'folha:list',
  FOLHA_CREATE_COMPETENCIA:  'folha:createCompetencia',
  FOLHA_ADD_LANCAMENTO:      'folha:addLancamento',
  FOLHA_REMOVE_LANCAMENTO:   'folha:removeLancamento',
  FOLHA_GENERATE_PDF:        'folha:generatePdf',

  // ── Férias ────────────────────────────────────────────────────────────────
  FERIAS_LIST:          'ferias:list',
  FERIAS_CREATE:        'ferias:create',
  FERIAS_GENERATE_PDF:  'ferias:generatePdf',

  // ── Rescisão ──────────────────────────────────────────────────────────────
  RESCISAO_LIST:         'rescisao:list',
  RESCISAO_CREATE:       'rescisao:create',
  RESCISAO_GENERATE_PDF: 'rescisao:generatePdf',

  // ── Ponto ─────────────────────────────────────────────────────────────────
  PONTO_LIST:           'ponto:list',
  PONTO_REGISTER:       'ponto:register',
  PONTO_GENERATE_PDF:   'ponto:generatePdf',

  // ── Extras ────────────────────────────────────────────────────────────────
  EXTRAS_LIST:          'extras:list',
  EXTRAS_CREATE:        'extras:create',
  EXTRAS_GENERATE_PDF:  'extras:generatePdf',

  // ── Custos / Simulador ────────────────────────────────────────────────────
  CUSTOS_SIMULATE:      'custos:simulate',
  CUSTOS_GENERATE_PDF:  'custos:generatePdf',

  // ── QuickCalc ─────────────────────────────────────────────────────────────
  QUICKCALC_RUN:         'quickcalc:run',
  QUICKCALC_GENERATE_PDF:'quickcalc:generatePdf',

  // ── Rubricas ──────────────────────────────────────────────────────────────
  RUBRICA_LIST:    'rubrica:list',
  RUBRICA_CREATE:  'rubrica:create',
  RUBRICA_UPDATE:  'rubrica:update',
  RUBRICA_DELETE:  'rubrica:delete',

  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH_LOGIN:    'auth:login',
  AUTH_LOGOUT:   'auth:logout',
  AUTH_SESSION:  'auth:session',

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_AUDIT_EXPORT:    'admin:auditExport',
  ADMIN_TABLES_UPDATE:   'admin:tablesUpdate',
} as const;

export type Channel = typeof Channels[keyof typeof Channels];
