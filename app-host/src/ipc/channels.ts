/**
 * channels.ts
 * Centraliza todos os nomes de canal IPC para evitar typos.
 */
export const Channels = {
  // Setup
  SETUP_CHECK_INITIALIZED:   'setup:check-initialized',
  SETUP_TEST_DATABASE:       'setup:test-database',
  SETUP_SAVE_CONFIG:         'setup:save-config',
  SETUP_GET_CONFIG:          'setup:get-config',

  // Auth
  AUTH_LOGIN:                'auth:login',
  AUTH_LOGOUT:               'auth:logout',
  AUTH_REGISTER:             'auth:register',

  // Empresas
  EMPRESA_LIST:              'empresa:list',
  EMPRESA_CREATE:            'empresa:create',
  EMPRESA_UPDATE:            'empresa:update',
  EMPRESA_DELETE:            'empresa:delete',
  EMPRESA_IMPORT:            'empresa:import',

  // Diálogos do sistema
  DIALOG_OPEN_FILE:          'dialog:open-file',

  // Funcionarios
  FUNC_LIST:                 'funcionario:list',
  FUNC_CREATE:               'funcionario:create',
  FUNC_UPDATE:               'funcionario:update',
  FUNC_DELETE:               'funcionario:delete',

  // Folha
  FOLHA_LIST:                'folha:list',
  FOLHA_CREATE:              'folha:create',
  FOLHA_GENERATE_PDF:        'folha:generate-pdf',

  // Rubricas
  RUBRICA_LIST:              'rubrica:list',
  RUBRICA_CREATE:            'rubrica:create',
  RUBRICA_DELETE:            'rubrica:delete',
} as const

export type Channel = (typeof Channels)[keyof typeof Channels]
