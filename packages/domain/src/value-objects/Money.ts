export class Money {
  private constructor(private readonly _cents: number) {}
  static fromCents(cents: number): Money { return new Money(cents) }
  static fromReais(reais: number): Money { return new Money(Math.round(reais * 100)) }
  get cents(): number { return this._cents }
  get reais(): number { return this._cents / 100 }
  add(other: Money): Money { return new Money(this._cents + other._cents) }
  sub(other: Money): Money { return new Money(this._cents - other._cents) }
  pct(percent: number): Money { return new Money(Math.round(this._cents * percent / 100)) }
  format(): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.reais)
  }
}
