import { useEffect, useRef } from 'react'
import { MathfieldElement, convertAsciiMathToLatex } from 'mathlive'
import { Keyboard, Redo2, Undo2 } from 'lucide-react'

MathfieldElement.fontsDirectory = new URL('./mathlive-fonts/', document.baseURI).href
MathfieldElement.soundsDirectory = null
MathfieldElement.computeEngine = null
MathfieldElement.decimalSeparator = ','

export function MathInput({ id, label, value, disabled = false, onChange }: {
  id: string; label: string; value: string; disabled?: boolean; onChange: (value: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null)
  const editor = useRef<MathfieldElement | null>(null)
  const latest = useRef({ value, onChange, disabled })
  latest.current = { value, onChange, disabled }
  useEffect(() => {
    const field = new MathfieldElement()
    field.id = id
    field.setAttribute('aria-label', label)
    const update = () => latest.current.onChange(field.getValue('ascii-math').replaceAll('\u2212', '-'))
    const mounted = () => {
      editor.current = field
      field.smartFence = true
      field.removeExtraneousParentheses = false
      field.mathVirtualKeyboardPolicy = 'auto'
      field.menuItems = []
      field.disabled = latest.current.disabled
      field.setValue(convertAsciiMathToLatex(latest.current.value), { silenceNotifications: true })
    }
    field.addEventListener('mount', mounted)
    field.addEventListener('input', update)
    host.current?.appendChild(field)
    return () => { field.removeEventListener('mount', mounted); field.removeEventListener('input', update); field.remove(); editor.current = null }
  }, [id, label])
  useEffect(() => {
    const field = editor.current
    if (!field) return
    field.disabled = disabled
    if (field.getValue('ascii-math').replaceAll('\u2212', '-') !== value) field.setValue(convertAsciiMathToLatex(value), { silenceNotifications: true })
  }, [value, disabled])
  function insert(latex: string) { if (!disabled) { editor.current?.focus(); editor.current?.insert(latex, { selectionMode: 'placeholder', focus: true }) } }
  return <div className="math-input">
    <div ref={host} className="math-input-host" />
    <div className="math-input-tools" aria-label={`Wiskundige invoer: ${label}`}>
      <button type="button" disabled={disabled} title="Lange breukstreep" aria-label={`Lange breukstreep: ${label}`} onClick={() => insert(String.raw`\frac{#0}{\placeholder{}}`)}><span className="fraction-symbol"><span>a</span><span>b</span></span></button>
      <button type="button" disabled={disabled} title="Haakjes" aria-label={`Haakjes: ${label}`} onClick={() => insert(String.raw`\left(#0\right)`)}>( )</button>
      <button type="button" disabled={disabled} title="Minteken" aria-label={`Minteken: ${label}`} onClick={() => insert('-')}>-</button>
      <button type="button" disabled={disabled} title="Kwadraat" aria-label={`Kwadraat: ${label}`} onClick={() => insert('^{2}')}>x<sup>2</sup></button>
      <button type="button" disabled={disabled} title="Ongedaan maken" aria-label={`Ongedaan maken: ${label}`} onClick={() => editor.current?.executeCommand('undo')}><Undo2 size={16} /></button>
      <button type="button" disabled={disabled} title="Opnieuw" aria-label={`Opnieuw: ${label}`} onClick={() => editor.current?.executeCommand('redo')}><Redo2 size={16} /></button>
      <button type="button" disabled={disabled} title="Wiskundig toetsenbord" aria-label={`Wiskundig toetsenbord: ${label}`} onClick={() => { editor.current?.focus(); editor.current?.executeCommand('toggleVirtualKeyboard') }}><Keyboard size={17} /></button>
    </div>
  </div>
}