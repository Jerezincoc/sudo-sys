/**
 * container.ts
 * Continer de dependencias simples (sem framework IoC).
 */
let _root: ReturnType<typeof import('./compositionRoot').buildCompositionRoot> | null = null

export function getContainer() {
  if (!_root) {
    throw new Error('Composition root nao inicializado. Chame initContainer() primeiro.')
  }
  return _root
}

export function initContainer(root: NonNullable<typeof _root>) {
  _root = root
}
