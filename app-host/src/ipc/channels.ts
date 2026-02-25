// app-host/src/ipc/channels.ts

/**
 * Canais IPC do SUDO SYS.
 * Padrão: "<modulo>:<acao>"
 *
 * Exemplo:
 * - "auth:login"
 * - "empresas:list"
 * - "rubricas:create"
 *
 * Mantemos aqui para:
 * - evitar strings mágicas espalhadas
 * - permitir autocomplete no TS
 * - versionar facilmente
 */
export const IPC_CHANNELS = {
  // Auth / Sessão
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_REGISTER: "auth:register",
  AUTH_ME: "auth:me",
  AUTH_VERIFY_EMAIL_PLACEHOLDER: "auth:verify_email_placeholder",

  // Empresas
  EMPRESAS_LIST: "empresas:list",
  EMPRESAS_CREATE: "empresas:create",
  EMPRESAS_UPDATE: "empresas:update",
  EMPRESAS_DELETE: "empresas:delete",

  // Funcionários
  FUNCIONARIOS_LIST_BY_EMPRESA: "funcionarios:list_by_empresa",
  FUNCIONARIOS_CREATE: "funcionarios:create",
  FUNCIONARIOS_UPDATE: "funcionarios:update",
  FUNCIONARIOS_DELETE: "funcionarios:delete",

  // Rubricas
  RUBRICAS_LIST: "rubricas:list",
  RUBRICAS_CREATE: "rubricas:create",
  RUBRICAS_UPDATE: "rubricas:update",
  RUBRICAS_DELETE: "rubricas:delete",
  RUBRICAS_VALIDATE_FORMULA: "rubricas:validate_formula",
  RUBRICAS_VARIABLES_DICTIONARY: "rubricas:variables_dictionary",

  // Folha Mensal
  FOLHA_CREATE: "folha:create",
  FOLHA_LIST: "folha:list",
  FOLHA_ADD_LANCAMENTO: "folha:add_lancamento",
  FOLHA_REMOVE_LANCAMENTO: "folha:remove_lancamento",
  FOLHA_GENERATE_PDF: "folha:generate_pdf",

  // Quick Calc (Modo Avulso)
  QUICKCALC_RUN: "quickcalc:run",
  QUICKCALC_GENERATE_PDF: "quickcalc:generate_pdf",

  // Férias
  FERIAS_CREATE: "ferias:create",
  FERIAS_LIST: "ferias:list",
  FERIAS_ADD_LANCAMENTO: "ferias:add_lancamento",
  FERIAS_REMOVE_LANCAMENTO: "ferias:remove_lancamento",
  FERIAS_GENERATE_PDF: "ferias:generate_pdf",

  // Rescisão
  RESCISAO_CREATE: "rescisao:create",
  RESCISAO_LIST: "rescisao:list",
  RESCISAO_ADD_LANCAMENTO: "rescisao:add_lancamento",
  RESCISAO_REMOVE_LANCAMENTO: "rescisao:remove_lancamento",
  RESCISAO_GENERATE_PDF: "rescisao:generate_pdf",

  // Extras
  EXTRAS_CREATE: "extras:create",
  EXTRAS_LIST: "extras:list",
  EXTRAS_ADD_LANCAMENTO: "extras:add_lancamento",
  EXTRAS_REMOVE_LANCAMENTO: "extras:remove_lancamento",
  EXTRAS_GENERATE_PDF: "extras:generate_pdf",

  // Ponto
  PONTO_CREATE_PERIODO: "ponto:create_periodo",
  PONTO_LIST_PERIODOS: "ponto:list_periodos",
  PONTO_REGISTER_BATIDA: "ponto:register_batida",
  PONTO_DELETE_BATIDA: "ponto:delete_batida",
  PONTO_GENERATE_PDF: "ponto:generate_pdf",

  // Custos
  CUSTOS_SIMULATE: "custos:simulate",
  CUSTOS_EXPORT_PDF: "custos:export_pdf",

  // Admin
  ADMIN_ROLES_LIST: "admin:roles_list",
  ADMIN_ROLES_UPDATE: "admin:roles_update",
  ADMIN_INTERNAL_TABLES_UPDATE: "admin:internal_tables_update",
  ADMIN_AUDIT_EXPORT: "admin:audit_export",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];