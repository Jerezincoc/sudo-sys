import type { CampoSintetico } from '../types/relatorio'

export const CAMPOS_DISPONIVEIS: CampoSintetico[] = [
  // Trabalhador
  { id: 'trabalhador.matricula',     label: 'Matrícula',           nivel: '1',   tipo: 'texto' },
  { id: 'trabalhador.nome',          label: 'Nome',                nivel: '1',   tipo: 'texto' },
  { id: 'trabalhador.cpf',           label: 'CPF',                 nivel: '1',   tipo: 'texto' },
  { id: 'trabalhador.cargo',         label: 'Cargo',               nivel: '1',   tipo: 'texto' },
  { id: 'trabalhador.departamento',  label: 'Departamento',        nivel: '1',   tipo: 'texto' },
  { id: 'trabalhador.admissao',      label: 'Data Admissão',       nivel: '1',   tipo: 'data'  },
  { id: 'trabalhador.salario_base',  label: 'Salário Base',        nivel: '1',   tipo: 'valor' },
  // Competência
  { id: 'competencia.periodo',       label: 'Competência',         nivel: '1.1', tipo: 'texto' },
  { id: 'competencia.salario_bruto', label: 'Salário Bruto',       nivel: '1.1', tipo: 'valor' },
  { id: 'competencia.inss',          label: 'INSS',                nivel: '1.1', tipo: 'valor' },
  { id: 'competencia.irrf',          label: 'IRRF',                nivel: '1.1', tipo: 'valor' },
  { id: 'competencia.fgts',          label: 'FGTS',                nivel: '1.1', tipo: 'valor' },
  { id: 'competencia.liquido',       label: 'Líquido',             nivel: '1.1', tipo: 'valor' },
  { id: 'competencia.vt',            label: 'Vale Transporte',     nivel: '1.1', tipo: 'valor' },
  { id: 'competencia.vr',            label: 'Vale Refeição',       nivel: '1.1', tipo: 'valor' },
  // Empresa
  { id: 'empresa.razao_social',      label: 'Razão Social',        nivel: '2',   tipo: 'texto' },
  { id: 'empresa.cnpj',              label: 'CNPJ',                nivel: '2',   tipo: 'texto' },
  { id: 'empresa.endereco',          label: 'Endereço',            nivel: '2',   tipo: 'texto' },
  // Férias
  { id: 'ferias.periodo_aquisitivo', label: 'Período Aquisitivo',  nivel: '1.2', tipo: 'texto' },
  { id: 'ferias.dias_concedidos',    label: 'Dias Concedidos',     nivel: '1.2', tipo: 'texto' },
  { id: 'ferias.valor_total',        label: 'Valor Férias',        nivel: '1.2', tipo: 'valor' },
  // Ponto
  { id: 'ponto.horas_trabalhadas',   label: 'Horas Trabalhadas',   nivel: '1.1', tipo: 'valor' },
  { id: 'ponto.horas_extras',        label: 'Horas Extras',        nivel: '1.1', tipo: 'valor' },
  { id: 'ponto.horas_falta',         label: 'Horas Falta',         nivel: '1.1', tipo: 'valor' },
]

export const CATEGORIAS_CAMPOS = [
  { label: 'Trabalhador', prefixo: 'trabalhador' },
  { label: 'Competência', prefixo: 'competencia' },
  { label: 'Empresa',     prefixo: 'empresa' },
  { label: 'Férias',      prefixo: 'ferias' },
  { label: 'Ponto',       prefixo: 'ponto' },
]
