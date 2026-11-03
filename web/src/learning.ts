import { parse, rationalize, simplify } from 'mathjs'
import type { MathNode, OperatorNode, SymbolNode, ConstantNode, ParenthesisNode } from 'mathjs'
import { assessmentBank, checkpointPlans, likeTermPlans } from './assessment-bank.ts'

export type Topic = 'Getallen' | 'Lettervormen' | 'Transformaties' | 'Toepassen'
export type Outcome = 'correct' | 'incorrect' | 'notation' | 'review'
export type ErrorCategory = 'none' | 'sign' | 'calculation' | 'concept' | 'vocabulary' | 'notation' | 'unknown' | 'review'
export type AnswerField = { key: string; label: string; kind: 'number' | 'polynomial' | 'exact'; answer: string; category?: ErrorCategory; collected?: boolean }
export type Checkpoint = { id: string; label: string; prompt: string; kind: 'number' | 'polynomial' | 'exact' | 'explanation'; answer: string; success: string; correction: string; collected?: boolean }
export type LikeTermPlan = { expression?: string; checkpointIds?: string[]; asList?: boolean; prompt: string }
export type SignedTerm = { id: string; expression: string; tex: string; key: string }
export type TermMarking = { source: string; selected: string[]; groups: string[][] }
export type WorkingDraft = { response: string; working: string; steps?: Record<string, string>; workingMode?: 'guided' | 'own'; markingExpression?: string; termMarking?: TermMarking }
export type Item = {
  id: string
  topic: Topic
  skill: string
  subtype: 'execution' | 'concept' | 'notation' | 'explanation'
  objective: string
  chapter: string | null
  source: string
  difficulty: 1 | 2 | 3
  title: string
  prompt: string
  expression: string
  kind: 'number' | 'word' | 'prime' | 'explanation' | 'polynomial' | 'compound' | 'exact'
  purpose?: 'probe' | 'practice'
  tex?: string
  fields?: AnswerField[]
  requireWorking?: boolean
  checkpoints?: Checkpoint[]
  likeTerms?: LikeTermPlan
  collected?: boolean
  answerFormat?: 'reduced-fraction'
  answer: string
  hint: string
  solution: string
  success: string
}

const diagnosticBank: Item[] = [
  { id: 'signed-1', topic: 'Getallen', skill: 'signed.arithmetic', subtype: 'execution', objective: 'Aftrekken van een negatief getal', chapter: null, source: 'SB1 D; nieuw oefenvoorbeeld', difficulty: 1, title: 'Bewaar het teken', prompt: 'Bereken.', expression: '-42 - (-17)', kind: 'number', answer: '-25', hint: 'Een negatief getal aftrekken is het tegengestelde optellen: -42 + 17.', solution: '-42 + 17 = -25.', success: 'Je hebt het minteken bij het resultaat correct behouden.' },
  { id: 'signed-2', topic: 'Getallen', skill: 'signed.arithmetic', subtype: 'execution', objective: 'Getallen met verschillende tekens optellen', chapter: null, source: 'SB2 diagnostische probes; nieuw voorbeeld', difficulty: 1, title: 'Verschillende tekens', prompt: 'Bereken.', expression: '-31 + 12', kind: 'number', answer: '-19', hint: 'Vergelijk de absolute waarden. Welke is groter: 31 of 12?', solution: '-31 + 12 = -19.', success: 'Je combineert de grootte en het teken correct.' },
  { id: 'decimal-1', topic: 'Getallen', skill: 'decimal.powers', subtype: 'execution', objective: 'Een decimaal getal kwadrateren', chapter: null, source: 'SB1 C; nieuw oefenvoorbeeld', difficulty: 2, title: 'De komma telt mee', prompt: 'Bereken. Geef een decimaal getal.', expression: '0,12^2', kind: 'number', answer: '0.0144', hint: '12 x 12 = 144. Beide factoren hebben twee cijfers na de komma.', solution: '0,12 x 0,12 = 0,0144.', success: 'De waarde en de plaats van de komma zijn correct.' },
  { id: 'fraction-1', topic: 'Getallen', skill: 'fractions.multiply', subtype: 'execution', objective: 'Breuken vermenigvuldigen met behoud van teken', chapter: null, source: 'SB1 F/G; nieuw oefenvoorbeeld', difficulty: 2, title: 'Eerst vereenvoudigen', prompt: 'Bereken. Een gelijkwaardige breuk mag.', expression: '(-3/8) x (16/9)', kind: 'number', answer: '-2/3', hint: 'Vereenvoudig 16 met 8 en 3 met 9. Het product is negatief.', solution: '(-3 x 16)/(8 x 9) = -2/3.', success: 'Je breuk heeft de juiste waarde en het juiste teken.' },
  { id: 'coefficient-1', topic: 'Lettervormen', skill: 'algebra.coefficients', subtype: 'execution', objective: 'Gelijksoortige termen samenvoegen', chapter: null, source: 'SB3 2.2; nieuw oefenvoorbeeld', difficulty: 2, title: 'Gelijksoortige termen', prompt: 'Vul de coefficient van ab in.', expression: '-4ab + 13ab = (...)ab', kind: 'number', answer: '9', hint: 'Het letterdeel blijft ab. Bereken alleen -4 + 13.', solution: '(-4 + 13)ab = 9ab. De coefficient is 9.', success: 'Je hebt de getekende coefficienten correct samengenomen.' },
  { id: 'substitution-1', topic: 'Lettervormen', skill: 'algebra.substitution', subtype: 'execution', objective: 'Een negatief getal invullen in een tegengestelde', chapter: null, source: 'SB3 1; nieuw oefenvoorbeeld', difficulty: 1, title: 'Vul zorgvuldig in', prompt: 'Bereken -b als b = -8.', expression: '-b = -(-8)', kind: 'number', answer: '8', hint: 'Je zoekt het tegengestelde van -8.', solution: '-(-8) = 8.', success: 'Je hebt de negatieve waarde tussen haakjes correct verwerkt.' },
  { id: 'translation-1', topic: 'Transformaties', skill: 'geometry.translation.vocabulary', subtype: 'concept', objective: 'Het synoniem van verschuiving benoemen', chapter: '2 (volgens SB4; nog te controleren)', source: 'SB4 1c, verwijzing naar p. 65; hoofdstuk ontbreekt', difficulty: 1, title: 'Noem het precies', prompt: 'Welk wiskundig woord is een synoniem voor verschuiving?', expression: '', kind: 'word', answer: 'translatie', hint: 'Transformatie is de algemene categorie. Het gezochte woord begint met transl...', solution: 'Een verschuiving noemen we ook een translatie.', success: 'Je gebruikt het specifieke woord translatie correct.' },
  { id: 'fixed-1', topic: 'Transformaties', skill: 'geometry.fixedpoint.vocabulary', subtype: 'concept', objective: 'Een punt dat op zichzelf wordt afgebeeld benoemen', chapter: '2 (volgens SB4; nog te controleren)', source: 'SB4 1b, verwijzing naar p. 61; hoofdstuk ontbreekt', difficulty: 1, title: 'Op dezelfde plaats', prompt: 'Hoe noem je een punt dat bij een spiegeling op zichzelf wordt afgebeeld?', expression: '', kind: 'word', answer: 'dekpunt', hint: 'Een punt op de spiegelas blijft op dezelfde plaats. Het woord begint met dek...', solution: 'Dit punt is een dekpunt van de spiegeling.', success: 'Je herkent en benoemt een dekpunt correct.' },
  { id: 'prime-1', topic: 'Transformaties', skill: 'geometry.image.prime', subtype: 'notation', objective: 'Het beeldpunt met een prime benoemen', chapter: null, source: 'SB5 5; nieuw notatievoorbeeld, geen constructiebeoordeling', difficulty: 1, title: 'Het beeld krijgt een naam', prompt: "Het beeld van C is correct geconstrueerd. Het moet C met een prime heten. Schrijf alleen het label van het beeldpunt.", expression: "C -> ?", kind: 'prime', answer: "C'", hint: "Het oorspronkelijke punt heet C. Het beeld heet C met een prime: C'.", solution: "Het juiste label is C'. Alleen het label wordt hier beoordeeld, niet de constructie.", success: 'Je onderscheidt het oorspronkelijke punt en het beeld met een prime.' },
  { id: 'area-1', topic: 'Toepassen', skill: 'geometry.trapezium.area', subtype: 'execution', objective: 'De oppervlakte van een trapezium berekenen', chapter: null, source: 'SB3 4; nieuw numeriek oefenvoorbeeld', difficulty: 2, title: 'Van figuur naar formule', prompt: 'Een trapezium heeft evenwijdige zijden van 6 cm en 10 cm en een hoogte van 4 cm. Bereken de oppervlakte in cm2.', expression: 'a = 6, b = 10, h = 4', kind: 'number', answer: '32', hint: 'Gebruik ((a + b) x h)/2. De hoogte is niet een schuine zijde.', solution: '((6 + 10) x 4)/2 = 32 cm2.', success: 'Je hebt de oppervlakte met beide evenwijdige zijden en de hoogte berekend.' },
  { id: 'explanation-1', topic: 'Toepassen', skill: 'geometry.rotation.explanation', subtype: 'explanation', objective: 'Een puntspiegeling volledig in woorden beschrijven', chapter: null, source: 'SB5 1d; nieuw schrijfvoorbeeld', difficulty: 3, title: 'Zeg het volledig', prompt: 'Beschrijf in een volledige zin met welke rotatie een puntspiegeling om O overeenkomt. Vermeld het centrum en de hoek.', expression: '', kind: 'explanation', answer: 'Een puntspiegeling om O is een rotatie om O over 180 graden, in wijzerzin of tegenwijzerzin.', hint: 'Welke hoek brengt een punt precies aan de andere kant van O? Noem ook O als centrum.', solution: 'Voorbeeld: een puntspiegeling om O komt overeen met een rotatie om O over 180 graden. Beide draairichtingen geven hetzelfde beeld.', success: '' },
  { id: 'explanation-2', topic: 'Toepassen', skill: 'algebra.like_terms.explanation', subtype: 'explanation', objective: 'Uitleggen waarom termen gelijksoortig zijn', chapter: null, source: 'SB2 1a; nieuw schrijfvoorbeeld', difficulty: 2, title: 'Leg je redenering uit', prompt: 'Leg in een volledige zin uit waarom 3ab en -5ab gelijksoortige termen zijn, maar 3a en 3ab niet.', expression: '3ab, -5ab, 3a', kind: 'explanation', answer: '3ab en -5ab hebben hetzelfde letterdeel ab; 3a heeft letterdeel a en is daarom niet gelijksoortig met 3ab.', hint: 'Vergelijk de letterdelen, niet de coefficienten.', solution: '3ab en -5ab hebben hetzelfde letterdeel ab. Bij 3a is het letterdeel a, dus die term is niet gelijksoortig met 3ab.', success: '' },
]

export const bank: Item[] = [...assessmentBank.map(item => ({ ...item, checkpoints: checkpointPlans[item.id] })), ...diagnosticBank.map(item => ({ ...item, purpose: 'probe' as const }))].map(item => ({ ...item, likeTerms: likeTermPlans[item.id] }))
export const isAssessmentSession = (session: Session) => session.items.every(id => bank.find(item => item.id === id)?.purpose === 'practice')

export type Grade = { outcome: Outcome; category: ErrorCategory; feedback: string; parts?: { key: string; label: string; outcome: Outcome; category: ErrorCategory }[] }
export type LearningEvent = {
  id: string
  sessionId: string
  itemId: string
  at: string
  type: 'answer' | 'hint' | 'solution' | 'checkpoint' | 'grouping'
  checkpointId?: string
  groupingSource?: string
  response: string
  working: string
  independent: boolean
  grade: Grade | null
}
export type Session = { id: string; date: string; items: string[]; cursor: number; completedAt: string | null }
export type Progress = { version: 1; events: LearningEvent[]; sessions: Session[]; drafts: Record<string, WorkingDraft> }
export const emptyProgress = (): Progress => ({ version: 1, events: [], sessions: [], drafts: {} })

function numericValue(raw: string): number | null {
  const normalized = raw.trim().replaceAll(',', '.').replaceAll('\u2212', '-')
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d+)?|\.\d+))?$/.test(normalized)) return null
  const [numerator, denominator = '1'] = normalized.split('/')
  const value = Number(numerator) / Number(denominator)
  return Number.isFinite(value) ? value : null
}

function polynomialNode(raw: string): MathNode {
  const expression = raw.trim().replaceAll(',', '.').replaceAll('\u2212', '-').replaceAll('\u00b2', '^2').replaceAll('\u00b3', '^3').replaceAll('\u00b7', '*').replace(/([a-zA-Z])(?=[a-zA-Z])/g, '$1*').replace(/(\d\s*\/\s*\d+)(?=[a-zA-Z])/g, '$1*').replace(/([0-9a-zA-Z)])\s*\(/g, '$1*(')
  if (!expression || expression.length > 240 || !/^[0-9abckmnprxyzBh+\-*/^().\s]+$/.test(expression)) throw new Error('Unsupported expression')
  const root = parse(expression)
  let count = 0
  root.traverse(node => {
    if (++count > 100) throw new Error('Expression too large')
    if (node.type === 'SymbolNode' && !/^[abckmnprxyzBh]$/.test((node as SymbolNode).name)) throw new Error('Unsupported symbol')
    if (!['ConstantNode', 'SymbolNode', 'OperatorNode', 'ParenthesisNode'].includes(node.type)) throw new Error('Unsupported operation')
    if (node.type === 'ConstantNode' && (!Number.isFinite(Number((node as ConstantNode).value)) || Math.abs(Number((node as ConstantNode).value)) > 1e6)) throw new Error('Number too large')
    if (node.type === 'OperatorNode') {
      const operator = node as OperatorNode
      if (!['+', '-', '*', '/', '^'].includes(operator.op)) throw new Error('Unsupported operator')
      if (operator.op === '^' && !/^[0-4]$/.test(operator.args[1].toString())) throw new Error('Unsupported power')
      if (operator.op === '/') {
        const denominator = numericValue(operator.args[1].toString().replace(/[()]/g, ''))
        if (denominator === null || denominator === 0) throw new Error('Only constant nonzero denominators supported')
      }
    }
  })
  return root
}

function isCollected(root: MathNode): boolean {
  const terms: MathNode[] = []
  const collect = (node: MathNode): void => {
    if (node.type === 'ParenthesisNode') return collect((node as ParenthesisNode).content)
    if (node.type === 'OperatorNode' && ['+', '-'].includes((node as OperatorNode).op)) {
      for (const argument of (node as OperatorNode).args) collect(argument)
    } else terms.push(node)
  }
  collect(root)
  const signatures = new Set<string>()
  for (const term of terms) {
    let expanded = true
    term.traverse(node => { if (node.type === 'OperatorNode' && ['+', '-'].includes((node as OperatorNode).op) && (node as OperatorNode).args.length > 1) expanded = false })
    if (!expanded) return false
    const canonical = rationalize(term).toString()
    const signature = (canonical.match(/[a-zA-Z](?:\s*\^\s*\d+)?/g) ?? []).map(factor => factor.replaceAll(' ', '')).sort().join('*')
    if (signatures.has(signature)) return false
    signatures.add(signature)
  }
  return true
}

function polynomialGrade(item: Item, response: string): Grade {
  try {
    const actual = polynomialNode(response)
    const expected = polynomialNode(item.answer)
    const difference = simplify(rationalize(`(${actual.toString()})-(${expected.toString()})`)).toString()
    if (difference !== '0') return { outcome: 'incorrect', category: 'unknown', feedback: 'Deze uitdrukking is niet gelijkwaardig aan de juiste uitkomst. Controleer de distributies, de getekende coefficienten en of alle termen behouden zijn.' }
    if (item.collected !== false && !isCollected(actual)) return { outcome: 'notation', category: 'notation', feedback: 'Je uitdrukking is wiskundig gelijkwaardig, maar nog niet volledig uitgewerkt en herleid. Werk haakjes uit en neem gelijksoortige termen samen.' }
    return { outcome: 'correct', category: 'none', feedback: item.success }
  } catch {
    return { outcome: 'review', category: 'review', feedback: 'Deze algebraische schrijfwijze valt buiten de betrouwbare controle. Gebruik bijvoorbeeld 2ab - 7a of (3/4)a. Je antwoord blijft bewaard voor bespreking.' }
  }
}

export function responseFields(response: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(response)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.values(parsed).some(value => typeof value !== 'string')) return {}
    return parsed as Record<string, string>
  } catch { return {} }
}

export function displayResponse(item: Item, response: string): string {
  if (item.kind !== 'compound') return response
  const fields = responseFields(response)
  return item.fields!.map(field => `${field.label}: ${fields[field.key] ?? ''}`).join('\n')
}

export function gradeAnswer(item: Item, response: string): Grade {
  if (item.kind === 'polynomial') return polynomialGrade(item, response)
  if (item.kind === 'compound') {
    const fields = responseFields(response)
    const parts = item.fields!.map(field => {
      const result = gradeAnswer({ ...item, kind: field.kind, answer: field.answer, fields: undefined, collected: field.collected, answerFormat: undefined }, fields[field.key] ?? '')
      return { key: field.key, label: field.label, outcome: result.outcome, category: result.outcome === 'incorrect' && field.category ? field.category : result.category }
    })
    const failed = parts.find(part => part.outcome === 'incorrect')
    const uncertain = parts.some(part => part.outcome === 'review')
    const notationOnly = !failed && parts.some(part => part.outcome === 'notation')
    return { parts, outcome: failed ? failed.category === 'notation' && parts.every(part => part.outcome === 'correct' || part.category === 'notation') ? 'notation' : 'incorrect' : uncertain ? 'review' : notationOnly ? 'notation' : 'correct', category: failed?.category ?? (uncertain ? 'review' : notationOnly ? 'notation' : 'none'), feedback: failed ? `Controleer: ${parts.filter(part => part.outcome !== 'correct').map(part => part.label).join(', ')}. De correcte onderdelen blijven apart zichtbaar.` : uncertain ? 'Een of meer onderdelen vragen menselijke controle. Je antwoorden zijn apart bewaard.' : notationOnly ? 'De waarden kloppen; werk de aangeduide uitdrukking nog volledig uit en herleid.' : item.success }
  }
  if (item.kind === 'exact') return response.trim().replaceAll(' ', '').replaceAll('\u0394', '') === item.answer ? { outcome: 'correct', category: 'none', feedback: item.success } : { outcome: 'incorrect', category: 'notation', feedback: 'Controleer de overeenkomst en volgorde van de hoekpunten.' }
  if (item.kind === 'explanation') return { outcome: 'review', category: 'review', feedback: 'Je uitleg is bewaard voor bespreking. Vergelijk je zin met het voorbeeld; de app kent hier geen automatische juistheid toe.' }
  if (item.kind === 'number') {
    const actual = numericValue(response)
    const expected = numericValue(item.answer)!
    if (actual === null) return { outcome: 'review', category: 'review', feedback: 'Deze schrijfwijze kan ik niet betrouwbaar beoordelen. Gebruik een getal of een breuk; je oorspronkelijke antwoord blijft bewaard.' }
    if (Math.abs(actual - expected) < 1e-10) {
      if (item.answerFormat === 'reduced-fraction') {
        const match = response.trim().match(/^([+-]?\d+)\s*\/\s*(\d+)$/)
        const gcd = (left: number, right: number): number => right ? gcd(right, left % right) : Math.abs(left)
        if (!match || Number(match[2]) === 0 || gcd(Number(match[1]), Number(match[2])) !== 1) return { outcome: 'notation', category: 'notation', feedback: 'De waarde klopt. Geef nu de gevraagde volledig vereenvoudigde breuk, met een positieve noemer.' }
      }
      return { outcome: 'correct', category: 'none', feedback: item.success }
    }
    if (Math.abs(actual + expected) < 1e-10 && expected !== 0) return { outcome: 'incorrect', category: 'sign', feedback: 'De grootte klopt, maar het teken niet. Controleer het teken van de uitkomst.' }
    return { outcome: 'incorrect', category: 'calculation', feedback: 'De uitkomst klopt nog niet. Werk de berekening stap voor stap uit; een hint is beschikbaar.' }
  }
  const normalized = response.trim().replaceAll('\u2032', "'").replaceAll('\u2019', "'")
  if ((item.kind === 'word' ? normalized.toLowerCase().replace(/[.!]$/, '') : normalized) === item.answer) return { outcome: 'correct', category: 'none', feedback: item.success }
  if (item.kind === 'prime' && normalized === 'C') return { outcome: 'notation', category: 'notation', feedback: 'De letter C klopt, maar de prime ontbreekt. Dit is een notatiepunt, geen fout in de constructie.' }
  return { outcome: 'incorrect', category: item.kind === 'word' ? 'vocabulary' : 'notation', feedback: item.kind === 'word' ? 'Dit is nog niet de gevraagde wiskundige term. Bekijk eventueel de hint.' : "Controleer de hoofdletter C en de prime. Hier wordt alleen het label beoordeeld." }
}

export function gradeCheckpoint(item: Item, checkpointId: string, response: string): Grade {
  const checkpoint = item.checkpoints?.find(step => step.id === checkpointId)
  if (!checkpoint) return { outcome: 'review', category: 'review', feedback: 'Deze tussenstap kan niet betrouwbaar worden gecontroleerd.' }
  const result = gradeAnswer({ ...item, kind: checkpoint.kind, answer: checkpoint.answer, fields: undefined, answerFormat: undefined, collected: checkpoint.collected, success: checkpoint.success }, response)
  return { ...result, feedback: result.outcome === 'incorrect' ? checkpoint.correction : result.feedback }
}

export function signedTerms(expression: string): SignedTerm[] {
  const terms: SignedTerm[] = []
  const collect = (node: MathNode, sign = 1): void => {
    if (node.type === 'ParenthesisNode') return collect((node as ParenthesisNode).content, sign)
    if (node.type === 'OperatorNode') {
      const operator = node as OperatorNode
      if (operator.op === '+' || operator.op === '-') {
        if (operator.args.length === 1) return collect(operator.args[0], operator.op === '-' ? -sign : sign)
        collect(operator.args[0], sign)
        collect(operator.args[1], operator.op === '-' ? -sign : sign)
        return
      }
    }
    node.traverse(child => {
      if (child.type === 'OperatorNode' && ['+', '-'].includes((child as OperatorNode).op) && (child as OperatorNode).args.length > 1) throw new Error('expand')
    })
    const term = simplify(sign === -1 ? `-(${node.toString()})` : node.toString())
    const canonical = rationalize(term).toString()
    const key = (canonical.match(/[a-zA-Z](?:\s*\^\s*\d+)?/g) ?? []).map(factor => factor.replaceAll(' ', '')).sort().join('*') || 'constant'
    const value = term.toString()
    terms.push({ id: `term-${terms.length}`, expression: value.startsWith('-') ? value : `+${value}`, tex: value.startsWith('-') ? term.toTex() : `+${term.toTex()}`, key })
  }
  collect(polynomialNode(expression))
  return terms
}

export function gradeTermSelection(terms: SignedTerm[], selected: string[]): Grade {
  const chosen = terms.filter(term => selected.includes(term.id))
  if (new Set(selected).size !== selected.length || chosen.length !== selected.length || chosen.length < 2) return { outcome: 'incorrect', category: 'concept', feedback: 'Selecteer minstens twee volledige termen die je samen wilt groeperen.' }
  if (chosen.some(term => term.key !== chosen[0].key)) return { outcome: 'incorrect', category: 'concept', feedback: 'Deze termen hebben niet allemaal hetzelfde letterdeel met dezelfde exponenten. Houd elke term samen met zijn teken.' }
  if (terms.some(term => term.key === chosen[0].key && !selected.includes(term.id))) return { outcome: 'incorrect', category: 'concept', feedback: 'Er staat nog een term met hetzelfde letterdeel. Neem alle gelijksoortige termen van deze groep mee.' }
  return { outcome: 'correct', category: 'none', feedback: 'Deze volledige getekende termen zijn gelijksoortig.' }
}

export function termMarkingState(item: Item, draft: WorkingDraft) {
  if (!item.likeTerms) return { source: '', terms: [] as SignedTerm[], groups: [] as string[][], ready: true, complete: true, error: '' }
  const plan = item.likeTerms
  const values = plan.expression ? [plan.expression] : draft.workingMode === 'own' ? [draft.markingExpression ?? ''] : (plan.checkpointIds ?? []).map(id => draft.steps?.[id] ?? '')
  const source = values.every(value => value.trim()) ? values.map(value => `(${value})`).join('+') : ''
  if (!source) return { source, terms: [] as SignedTerm[], groups: [] as string[][], ready: false, complete: false, error: '' }
  try {
    const terms = signedTerms(source)
    const repeated = terms.filter(term => terms.filter(other => other.key === term.key).length > 1)
    const saved = draft.termMarking?.source === source ? draft.termMarking : undefined
    const used = new Set<string>()
    const groups = (saved?.groups ?? []).filter(group => {
      if (group.some(id => used.has(id)) || gradeTermSelection(terms, group).outcome !== 'correct') return false
      group.forEach(id => used.add(id))
      return true
    })
    return { source, terms, groups, ready: repeated.length > 0, complete: repeated.length > 0 && repeated.every(term => used.has(term.id)), error: repeated.length ? '' : 'Laat de gelijksoortige termen in deze regel nog apart staan voordat je ze groepeert.' }
  } catch {
    return { source, terms: [] as SignedTerm[], groups: [] as string[][], ready: false, complete: false, error: 'Schrijf een uitgewerkte veelterm zonder gelijkheidsteken. Werk de haakjes uit, maar neem de gelijksoortige termen nog niet samen.' }
  }
}

export function workingText(item: Item, draft: WorkingDraft): string {
  const marking = termMarkingState(item, draft)
  const groups = marking.groups.map((group, index) => `Groep ${index + 1}: ${marking.terms.filter(term => group.includes(term.id)).map(term => term.expression).join('; ')}`).join('\n')
  const grouping = groups ? `Gelijksoortige termen:\n${groups}\n\n` : ''
  if (!item.checkpoints?.length || draft.workingMode === 'own') return `${grouping}${draft.working}`
  const steps = item.checkpoints.map(step => `${step.label}: ${draft.steps?.[step.id] ?? ''}`).join('\n')
  return `${grouping}${steps}${draft.working.trim() ? `\n\nEigen notities:\n${draft.working}` : ''}`
}

export function missingWorking(item: Item, draft: WorkingDraft): string | null {
  if (!termMarkingState(item, draft).complete) return 'like-terms'
  if (item.checkpoints?.length && draft.workingMode !== 'own') {
    const missing = item.checkpoints.find(step => !draft.steps?.[step.id]?.trim())
    return missing ? missing.id : null
  }
  return item.requireWorking && !draft.working.trim() ? 'working' : null
}

export function makeEvent(session: Session, item: Item, events: LearningEvent[], type: LearningEvent['type'], response = '', working = '', at = new Date(), checkpointId?: string): LearningEvent {
  const prior = events.filter(event => event.sessionId === session.id && event.itemId === item.id)
  return { id: crypto.randomUUID(), sessionId: session.id, itemId: item.id, at: at.toISOString(), type, ...(type === 'checkpoint' ? { checkpointId } : {}), response, working, independent: type === 'answer' && prior.length === 0, grade: type === 'answer' ? gradeAnswer(item, response) : type === 'checkpoint' ? gradeCheckpoint(item, checkpointId ?? '', response) : null }
}

export function makeGroupingEvent(session: Session, item: Item, events: LearningEvent[], draft: WorkingDraft, selected: string[]): LearningEvent {
  const state = termMarkingState(item, draft)
  const response = state.terms.filter(term => selected.includes(term.id)).map(term => term.expression).join('; ')
  return { ...makeEvent(session, item, events, 'grouping', response, workingText(item, draft)), groupingSource: state.source, grade: gradeTermSelection(state.terms, selected) }
}

export function skillEvidence(skill: string, events: LearningEvent[]) {
  const itemIds = new Set(bank.filter(item => item.skill === skill).map(item => item.id))
  const answers = events.filter(event => itemIds.has(event.itemId) && event.type === 'answer')
  const independent = answers.filter(event => event.independent)
  const successes = independent.filter(event => event.grade?.outcome === 'correct')
  const days = new Set(successes.map(event => brusselsDate(new Date(event.at))))
  const recent = independent.slice(-3)
  const stable = days.size >= 3 && recent.length === 3 && recent.every(event => event.grade?.outcome === 'correct')
  const state = independent.length === 0 ? 'Nog geen bewijs' : stable ? 'Zelfstandig bevestigd' : 'In ontwikkeling'
  return { state, independent: independent.length, successes: successes.length, assisted: answers.filter(event => !event.independent && event.grade?.outcome === 'correct').length, pending: answers.filter(event => event.grade?.outcome === 'review').length }
}

export function selectItems(events: LearningEvent[], now = new Date()): string[] {
  const topics: Topic[] = ['Getallen', 'Lettervormen', 'Transformaties', 'Toepassen']
  const priority = (item: Item) => {
    const last = events.filter(event => event.itemId === item.id && event.type === 'answer').at(-1)
    if (!last) return item.kind === 'prime' ? 51 : 50
    const ageDays = (now.getTime() - new Date(last.at).getTime()) / 86400000
    const stable = skillEvidence(item.skill, events).state === 'Zelfstandig bevestigd'
    const interval = stable ? 7 : last.independent && last.grade?.outcome === 'correct' ? 3 : 1
    return Math.min(ageDays / interval, 10) * 10 + (last.grade?.outcome === 'incorrect' ? 5 : 0)
  }
  const practice = bank.filter(item => item.purpose === 'practice')
  const ranked = (topic: Topic, written = false) => practice.filter(item => item.topic === topic && (item.kind === 'explanation') === written).sort((left, right) => priority(right) - priority(left))
  const algebra = ranked('Lettervormen')
  const explanations = practice.filter(item => item.kind === 'explanation').sort((left, right) => priority(right) - priority(left))
  return [ranked(topics[0])[0], algebra[0], ranked(topics[2])[0], algebra[1], ranked(topics[3])[0], explanations[0]].map(item => item.id)
}

export function brusselsDate(now: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export type ReminderPreferences = { emailTime: string; phoneTime: string; enabled: boolean; pushPermission: 'granted' | 'denied' | 'unavailable' }
export function reminderPlan(now: Date, completed: boolean, preferences: ReminderPreferences, delivered: string[] = []) {
  if (!preferences.enabled) return []
  const date = brusselsDate(now)
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
  const candidates: { key: string; channel: string; recipient: string }[] = []
  if (!completed && time >= preferences.emailTime) candidates.push({ key: `${date}:daily-email`, channel: 'email', recipient: 'student' })
  if (!completed && time >= preferences.phoneTime) candidates.push({ key: `${date}:phone-reminder`, channel: preferences.pushPermission === 'granted' ? 'push' : 'email-fallback', recipient: 'student' })
  if (completed) candidates.push({ key: `${date}:completion`, channel: 'email', recipient: 'parent' })
  return candidates.filter(candidate => !delivered.includes(candidate.key))
}