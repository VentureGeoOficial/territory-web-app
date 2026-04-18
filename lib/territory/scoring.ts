/**
 * Pontuação (XP) ao concluir uma corrida: distância + área dominada.
 */

/** Peso da distância (metros) no XP */
const XP_PER_100M_DISTANCE = 2
/** Peso da área (m²) no XP — alinhado à regra mínima existente no Firestore */
const XP_PER_100M2_AREA = 1

export function computeXpFromRun(distanceM: number, areaM2: number): number {
  const fromDist = Math.round((distanceM / 100) * XP_PER_100M_DISTANCE)
  const fromArea = Math.max(50, Math.round(areaM2 / 100) * XP_PER_100M2_AREA)
  return Math.max(50, fromDist + fromArea)
}
