/**
 * @formula-contract
 * @frozen DO NOT MODIFY — see CLAUDE.md
 *
 * Mental Advantage (Double Jeopardy Expected Score)
 * Computes expected brand × CEP linkage score and deviation from it.
 *
 * TODO: Implement in Phase 1
 */

export type StrategicAction = 'DEFEND' | 'MAINTAIN' | 'BUILD'

export function calculateExpectedScore(
  _rowTotal: number,
  _colTotal: number,
  _grandTotal: number
): number {
  throw new Error('Not implemented — Phase 1')
}

export function calculateDeviation(
  _actual: number,
  _expected: number
): number {
  throw new Error('Not implemented — Phase 1')
}

export function getStrategicAction(_deviationPP: number): StrategicAction {
  throw new Error('Not implemented — Phase 1')
}
