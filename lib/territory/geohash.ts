/**
 * Geohash encode (base32) para indexação Firestore.
 * Implementação mínima — precisão 1–12.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision = 7,
): string {
  let idx = 0
  let bit = 0
  let evenBit = true
  let latMin = -90
  let latMax = 90
  let lngMin = -180
  let lngMax = 180
  let hash = ''

  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lngMin + lngMax) / 2
      if (longitude >= mid) {
        idx = idx * 2 + 1
        lngMin = mid
      } else {
        idx = idx * 2
        lngMax = mid
      }
    } else {
      const mid = (latMin + latMax) / 2
      if (latitude >= mid) {
        idx = idx * 2 + 1
        latMin = mid
      } else {
        idx = idx * 2
        latMax = mid
      }
    }
    evenBit = !evenBit
    bit++
    if (bit === 5) {
      hash += BASE32[idx]!
      bit = 0
      idx = 0
    }
  }
  return hash
}

/** Prefixos (precisão 5) cobrindo a caixa visível — máx. 30 para query Firestore `in`. */
export function geohashPrefixesForBounds(
  south: number,
  north: number,
  west: number,
  east: number,
  precision = 5,
  maxPrefixes = 30,
): string[] {
  const latStep = (north - south) / 4
  const lngStep = (east - west) / 4
  const set = new Set<string>()

  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      const lat = south + latStep * i
      const lng = west + lngStep * j
      const full = encodeGeohash(lat, lng, precision)
      set.add(full.slice(0, precision))
      if (set.size >= maxPrefixes) break
    }
    if (set.size >= maxPrefixes) break
  }

  return [...set]
}
