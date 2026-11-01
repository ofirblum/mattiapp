import { multiply } from 'mathjs'

export type CoordinatePoint = { name: string; x: number; y: number }
export type GeometryScenario = { type: 'translation' | 'rotation'; original: CoordinatePoint[]; images: CoordinatePoint[]; vector?: [number, number]; centre?: [number, number]; angle?: number; holdForTextbook?: boolean }
export const geometryScenarios: Record<string, GeometryScenario> = {
  'translation-correspondence-v2': {
    type: 'translation', vector: [4, -3],
    original: [{ name: 'A', x: 1, y: 2 }, { name: 'B', x: 4, y: 2 }, { name: 'C', x: 2, y: 5 }],
    images: [{ name: 'H', x: 5, y: -1 }, { name: 'I', x: 8, y: -1 }, { name: 'G', x: 6, y: 2 }],
  },
  'rotation-coordinates-v2': {
    type: 'rotation', centre: [0, 0], angle: -90, holdForTextbook: true,
    original: [{ name: 'A', x: 2, y: 1 }, { name: 'B', x: 5, y: 1 }, { name: 'C', x: 3, y: 4 }],
    images: [{ name: "A'", x: 1, y: -2 }, { name: "B'", x: 1, y: -5 }, { name: "C'", x: 4, y: -3 }],
  },
}

export function transformedCoordinates(point: CoordinatePoint, scenario: GeometryScenario): [number, number] {
  if (scenario.type === 'translation' && scenario.vector) return [point.x + scenario.vector[0], point.y + scenario.vector[1]]
  if (scenario.type !== 'rotation' || !scenario.centre || scenario.angle === undefined) throw new Error('Incomplete transformation parameters')
  const angle = scenario.angle * Math.PI / 180
  const [horizontal, vertical] = multiply([[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]], [point.x - scenario.centre[0], point.y - scenario.centre[1]]) as number[]
  return [horizontal + scenario.centre[0], vertical + scenario.centre[1]]
}

export function geometryIsValid(scenario: GeometryScenario): boolean {
  if (scenario.original.length < 3 || scenario.original.length !== scenario.images.length) return false
  if (scenario.type === 'translation' && (!scenario.vector || scenario.vector.some(value => !Number.isFinite(value)))) return false
  if (scenario.type === 'rotation' && (!scenario.centre || !Number.isFinite(scenario.angle))) return false
  try {
    const [first, second, third] = scenario.original
    if (Math.abs((second.x - first.x) * (third.y - first.y) - (third.x - first.x) * (second.y - first.y)) < 1e-9) return false
    return scenario.original.every((point, index) => {
      const actual = scenario.images[index]
      const expected = transformedCoordinates(point, scenario)
      return [point.x, point.y, actual.x, actual.y, ...expected].every(Number.isFinite) && Math.abs(actual.x - expected[0]) < 1e-9 && Math.abs(actual.y - expected[1]) < 1e-9
    })
  } catch { return false }
}