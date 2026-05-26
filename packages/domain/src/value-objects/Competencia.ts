export class Competencia {
  constructor(public ano: number, public mes: number) {}

  toString(): string {
    return `${this.ano}-${String(this.mes).padStart(2, '0')}`
  }
}
