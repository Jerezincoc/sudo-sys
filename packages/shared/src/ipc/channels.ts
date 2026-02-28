export const IPC_CHANNELS = {
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",

  EMPRESA_CREATE: "empresa:create",
  EMPRESA_LIST: "empresa:list",

  FUNCIONARIO_CREATE: "funcionario:create",
  FUNCIONARIO_LIST: "funcionario:list",

  RUBRICA_CREATE: "rubrica:create",
  RUBRICA_LIST: "rubrica:list",

  FOLHA_CREATE: "folha:create",
  FOLHA_ADD_LANCAMENTO: "folha:addLancamento",
  FOLHA_GENERATE_PDF: "folha:generatePdf"
} as const;

export type IpcChannel =
  typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];