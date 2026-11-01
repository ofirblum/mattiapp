import { useEffect, useRef } from 'react'
import type { CoordinatePoint, GeometryScenario } from './geometry.ts'

export function GeometryExercise({ scenario }: { scenario: GeometryScenario }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) return
    context.setTransform(2, 0, 0, 2, 0, 0)
    context.clearRect(0, 0, 400, 260)
    const points = [...scenario.original, ...scenario.images]
    const minX = Math.floor(Math.min(0, ...points.map(point => point.x))) - 1
    const maxX = Math.ceil(Math.max(0, ...points.map(point => point.x))) + 1
    const minY = Math.floor(Math.min(0, ...points.map(point => point.y))) - 1
    const maxY = Math.ceil(Math.max(0, ...points.map(point => point.y))) + 1
    const position = (x: number, y: number) => [30 + (x - minX) * 335 / (maxX - minX), 230 - (y - minY) * 205 / (maxY - minY)]
    context.fillStyle = '#f4f8f3'
    context.fillRect(0, 0, 400, 260)
    context.strokeStyle = '#dce5db'
    context.lineWidth = 0.6
    context.font = '9px sans-serif'
    context.fillStyle = '#536a5b'
    for (let x = minX; x <= maxX; x++) {
      const [horizontal] = position(x, 0)
      context.beginPath(); context.moveTo(horizontal, 25); context.lineTo(horizontal, 230); context.stroke()
      context.fillText(String(x), horizontal - 3, position(0, 0)[1] + 12)
    }
    for (let y = minY; y <= maxY; y++) {
      const [, vertical] = position(0, y)
      context.beginPath(); context.moveTo(30, vertical); context.lineTo(365, vertical); context.stroke()
      context.fillText(String(y), position(0, 0)[0] - 14, vertical + 3)
    }
    context.strokeStyle = '#7c9381'
    context.beginPath(); context.moveTo(...position(minX, 0) as [number, number]); context.lineTo(...position(maxX, 0) as [number, number]); context.moveTo(...position(0, minY) as [number, number]); context.lineTo(...position(0, maxY) as [number, number]); context.stroke()
    const polygon = (vertices: CoordinatePoint[], color: string) => {
      context.beginPath()
      vertices.forEach((point, index) => { const [x, y] = position(point.x, point.y); index ? context.lineTo(x, y) : context.moveTo(x, y) })
      context.closePath(); context.strokeStyle = color; context.lineWidth = 2; context.stroke(); context.fillStyle = `${color}15`; context.fill()
      context.font = '12px sans-serif'
      vertices.forEach(point => { const [x, y] = position(point.x, point.y); context.fillStyle = color; context.beginPath(); context.arc(x, y, 3, 0, Math.PI * 2); context.fill(); context.fillText(point.name, x + 6, y - 7) })
    }
    polygon(scenario.original, '#17664f')
    polygon(scenario.images, '#a74528')
  }, [scenario])
  const coordinates = [...scenario.original, ...scenario.images].map(point => `${point.name}(${point.x},${point.y})`).join(', ')
  return <figure className="geometry exercise-geometry"><canvas ref={canvas} width={800} height={520} role="img" aria-label={`${scenario.type === 'translation' ? 'Translatie' : 'Rotatie'} in een assenstelsel. ${coordinates}`} /><figcaption>{scenario.type === 'translation' ? 'Translatie: de orientatie van de driehoek blijft gelijk.' : 'Rotatie: de figuur draait om het centrum.'}</figcaption></figure>
}