export type FormulaOperador = '+' | '-' | '*' | '/'

export type FormulaNode =
  | { type: 'numero'; valor: number }
  | { type: 'variavel'; nome: string }
  | { type: 'unario'; operador: '-'; operando: FormulaNode }
  | { type: 'binario'; operador: FormulaOperador; esquerda: FormulaNode; direita: FormulaNode }
