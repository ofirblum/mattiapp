import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { MathInput } from './MathInput.tsx'
import { GeometryExercise } from './GeometryExercise.tsx'
import { ArrowDownToLine, ArrowRight, Bell, BookOpen, Check, CheckCheck, ChevronRight, CircleCheck, Clock3, Eye, Lightbulb, LockKeyhole, Pause, PencilLine, Plus, ShieldAlert, Target, Trash2, TrendingUp } from 'lucide-react'
import { bank, brusselsDate, displayResponse, eligibleForPractice, emptyProgress, isAssessmentSession, makeEvent, makeGroupingEvent, makeVerificationEvent, missingWorking, prioritizeSignsInSavedSession, reminderPlan, responseFields, scheduleSignFollowUp, selectItems, signEvidence, skillEvidence, termMarkingState, verificationPair, workingText } from './learning.ts'
import type { Grade, Item, LearningEvent, Progress, ReminderPreferences, Session, Topic, WorkingDraft } from './learning.ts'

const storageKey = 'matti.demo.progress.v1'
const topics: Topic[] = ['Getallen', 'Lettervormen', 'Transformaties', 'Toepassen']
const topicDescriptions = ['Samengestelde breuken, machten en wortels', 'Veeltermen, breukcoefficienten en identiteiten', 'Rotatieparameters en overeenkomst', 'Symbolische meetkunde en redeneringen']
const outcomes = { correct: 'Correct', incorrect: 'Nog niet correct', notation: 'Notatie aanvullen', review: 'Te bespreken' }
const categories = { none: 'Geen', sign: 'Teken', calculation: 'Berekening', concept: 'Concept of parameter', vocabulary: 'Begrip', notation: 'Notatie of afwerking', unknown: 'Nog te onderzoeken', review: 'Menselijke beoordeling' }

function loadProgress(): { data: Progress; warning: string } {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { data: emptyProgress(), warning: '' }
    const data = JSON.parse(raw) as Progress
    if (data.version !== 1 || !Array.isArray(data.events) || !Array.isArray(data.sessions) || !data.drafts || typeof data.drafts !== 'object') throw new Error('schema')
    const known = new Set(bank.map(item => item.id))
    for (const session of data.sessions) {
      if (typeof session.id !== 'string' || typeof session.date !== 'string' || !Array.isArray(session.items) || !session.items.length || session.items.some(id => !known.has(id)) || !Number.isInteger(session.cursor) || session.cursor < 0 || session.cursor > session.items.length || !(session.completedAt === null || typeof session.completedAt === 'string')) throw new Error('session')
    }
    for (const event of data.events) {
      if (!known.has(event.itemId) || typeof event.id !== 'string' || !data.sessions.some(session => session.id === event.sessionId) || !Number.isFinite(Date.parse(event.at)) || !['answer', 'hint', 'solution', 'checkpoint', 'grouping', 'deferred', 'verification'].includes(event.type) || typeof event.response !== 'string' || typeof event.working !== 'string' || typeof event.independent !== 'boolean') throw new Error('event')
      if ((event.type === 'answer' || event.type === 'checkpoint' || event.type === 'grouping' || event.type === 'verification') && (!event.grade || !(event.grade.outcome in outcomes) || !(event.grade.category in categories) || typeof event.grade.feedback !== 'string')) throw new Error('grade')
      if (event.type === 'checkpoint' && typeof event.checkpointId !== 'string') throw new Error('checkpoint')
      if (event.type === 'grouping' && typeof event.groupingSource !== 'string') throw new Error('grouping')
      if (event.confidence !== undefined && !['sure', 'unsure'].includes(event.confidence)) throw new Error('confidence')
    }
    for (const draft of Object.values(data.drafts)) {
      if (!draft || typeof draft.response !== 'string' || typeof draft.working !== 'string') throw new Error('draft')
      if (draft.steps !== undefined && (!draft.steps || typeof draft.steps !== 'object' || Array.isArray(draft.steps) || Object.values(draft.steps).some(value => typeof value !== 'string'))) throw new Error('steps')
      if (draft.workingMode !== undefined && !['guided', 'own'].includes(draft.workingMode)) throw new Error('mode')
      if (draft.markingExpression !== undefined && typeof draft.markingExpression !== 'string') throw new Error('marking-expression')
      if (draft.mathLine !== undefined && typeof draft.mathLine !== 'string') throw new Error('math-line')
      if (draft.confidence !== undefined && !['sure', 'unsure'].includes(draft.confidence)) throw new Error('confidence')
      if (draft.verification !== undefined && (typeof draft.verification.original !== 'string' || typeof draft.verification.proposed !== 'string')) throw new Error('verification')
      if (draft.termMarking !== undefined && (typeof draft.termMarking.source !== 'string' || !Array.isArray(draft.termMarking.selected) || draft.termMarking.selected.some(id => typeof id !== 'string') || !Array.isArray(draft.termMarking.groups) || draft.termMarking.groups.some(group => !Array.isArray(group) || group.some(id => typeof id !== 'string')))) throw new Error('term-marking')
    }
    return { data, warning: '' }
  } catch {
    return { data: emptyProgress(), warning: 'Lokale gegevens konden niet veilig worden gelezen. Ze zijn niet overschreven. Wis ze via Instellingen om opnieuw te beginnen.' }
  }
}

function GeometryFigure({ variant = 'translation' }: { variant?: 'translation' | 'area' | 'prime' }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) return
    context.scale(2, 2)
    context.clearRect(0, 0, 400, 260)
    context.fillStyle = '#f1f7f3'
    context.fillRect(0, 0, 400, 260)
    context.fillStyle = '#c9dcd2'
    for (let horizontal = 20; horizontal < 400; horizontal += 20) for (let vertical = 20; vertical < 260; vertical += 20) {
      context.beginPath()
      context.arc(horizontal, vertical, 1, 0, 2 * Math.PI)
      context.fill()
    }
    context.font = '16px sans-serif'
    const polygon = (points: number[][], labels: string[], color: string) => {
      context.beginPath()
      points.forEach(([horizontal, vertical], index) => index ? context.lineTo(horizontal, vertical) : context.moveTo(horizontal, vertical))
      context.closePath()
      context.fillStyle = `${color}15`
      context.fill()
      context.strokeStyle = color
      context.lineWidth = 2
      context.stroke()
      points.forEach(([horizontal, vertical], index) => {
        context.fillStyle = color
        context.beginPath()
        context.arc(horizontal, vertical, 4, 0, Math.PI * 2)
        context.fill()
        context.fillText(labels[index], horizontal + 8, vertical - 9)
      })
    }
    if (variant === 'area') {
      polygon([[70, 190], [330, 190], [270, 70], [114, 70]], ['', '', '', ''], '#17664f')
      context.fillStyle = '#25382e'
      context.fillText('10 cm', 175, 215)
      context.fillText('6 cm', 170, 55)
      context.fillText('4 cm', 125, 140)
      context.setLineDash([5, 5])
      context.beginPath()
      context.moveTo(114, 70)
      context.lineTo(114, 190)
      context.stroke()
    } else if (variant === 'prime') {
      polygon([[75, 190], [145, 190], [115, 115]], ['A', 'B', 'C'], '#17664f')
      polygon([[245, 160], [315, 160], [285, 85]], ["A'", "B'", '?'], '#a74528')
    } else {
      polygon([[55, 205], [155, 205], [95, 105]], ['A', 'B', 'C'], '#17664f')
      polygon([[235, 155], [335, 155], [275, 55]], ["A'", "B'", "C'"], '#a74528')
      context.setLineDash([5, 6])
      context.strokeStyle = '#6e897c'
      context.beginPath()
      context.moveTo(95, 105)
      context.lineTo(275, 55)
      context.stroke()
    }
    return () => { context.resetTransform() }
  }, [variant])
  return <figure className="geometry"><canvas ref={canvas} width={800} height={520} role="img" aria-label={variant === 'area' ? 'Trapezium met evenwijdige zijden 6 en 10 centimeter en hoogte 4 centimeter.' : 'Twee overeenkomstige driehoeken; het beeld staat rechtsboven het origineel.'} /><figcaption>{variant === 'area' ? 'Trapezium' : 'Van origineel naar beeld'}</figcaption></figure>
}

function App() {
  const [initial] = useState(loadProgress)
  const [progress, setProgress] = useState(initial.data)
  const [storageWarning, setStorageWarning] = useState(initial.warning)
  const [saved, setSaved] = useState(false)
  const [parent, setParent] = useState(false)
  const [view, setView] = useState('today')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [filter, setFilter] = useState<Topic | 'Alles'>('Alles')
  const [preferences, setPreferences] = useState<ReminderPreferences>({ emailTime: '16:00', phoneTime: '20:15', enabled: true, pushPermission: 'unavailable' })
  const [simulation, setSimulation] = useState<boolean | null>(null)
  const answerInput = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const today = brusselsDate(new Date())
  const active = progress.sessions.find(session => session.id === activeId)
  const unfinished = progress.sessions.find(session => !session.completedAt && isAssessmentSession(session))
  const todaysSession = progress.sessions.find(session => session.date === today && isAssessmentSession(session))
  const item = active && !active.completedAt ? bank.find(question => question.id === active.items[active.cursor]) : undefined
  const events = active && item ? progress.events.filter(event => event.sessionId === active.id && event.itemId === item.id) : []
  const lastAnswer = events.filter(event => event.type === 'answer').at(-1)
  const hasHint = events.some(event => event.type === 'hint')
  const hasSolution = events.some(event => event.type === 'solution')
  const draftKey = active && item ? `${active.id}:${item.id}` : ''
  const draft: WorkingDraft = progress.drafts[draftKey] ?? { response: '', working: '' }
  const workingMode = draft.workingMode ?? (!draft.steps && draft.working.trim() ? 'own' : 'guided')
  const currentWorking = { ...draft, workingMode } as WorkingDraft
  const answerLocked = lastAnswer?.grade?.outcome === 'correct' || hasSolution
  const marking = item ? termMarkingState(item, currentWorking) : null
  const groupingComplete = !item?.likeTerms || marking?.complete || (answerLocked && !events.some(event => event.type === 'grouping'))
  const selectedTerms = draft.termMarking?.source === marking?.source ? draft.termMarking?.selected ?? [] : []
  const selectedTermText = marking?.terms.filter(term => selectedTerms.includes(term.id)).map(term => term.expression).join('; ')
  const latestGrouping = events.filter(event => event.type === 'grouping').at(-1)
  const groupingFeedback = latestGrouping && latestGrouping.groupingSource === marking?.source && latestGrouping.response === selectedTermText && latestGrouping.grade?.outcome !== 'correct' ? latestGrouping.grade : null
  const correctedSteps = item?.checkpoints?.filter(step => {
    const checks = events.filter(event => event.type === 'checkpoint' && event.checkpointId === step.id)
    const latest = checks.at(-1)
    return latest?.grade?.outcome === 'correct' && latest.response === draft.steps?.[step.id] && checks.some(event => event.grade?.outcome === 'incorrect')
  }) ?? []
  const fieldValues = responseFields(draft.response)
  const signStats = signEvidence(progress.events)
  const lastSignError = [...events].reverse().find(event => (event.grade?.category === 'sign' && (event.type === 'answer' || event.checkpointId === 'expanded')) || event.signCheck?.category === 'sign')
  const wrongExpression = lastSignError?.type === 'grouping' ? lastSignError.groupingSource ?? '' : lastSignError?.response ?? ''
  const counterexample = item?.signTraining && wrongExpression ? verificationPair(item, wrongExpression) : null
  const currentVerification = draft.verification ?? { original: '', proposed: '' }
  const lastVerification = events.filter(event => event.type === 'verification').at(-1)
  const verificationGrade = lastVerification?.verificationFor === counterexample?.proposed && lastVerification?.response === JSON.stringify(currentVerification) ? lastVerification?.grade : null
  const relatedCheckNext = active && item?.signTraining ? scheduleSignFollowUp(active, item, events).items.includes(item.signTraining.followUpId) : false
  const canAdvance = groupingComplete && (lastAnswer?.grade?.outcome === 'correct' || lastAnswer?.grade?.outcome === 'review' || hasSolution)
  const completeCount = progress.sessions.filter(session => session.completedAt).length
  const independentSuccesses = progress.events.filter(event => event.independent && event.grade?.outcome === 'correct').length
  const navigation = parent ? [{ id: 'parent', label: 'Overzicht', icon: TrendingUp }, { id: 'evidence', label: 'Antwoorden', icon: Eye }, { id: 'settings', label: 'Instellingen', icon: Bell }] : [{ id: 'today', label: 'Vandaag', icon: BookOpen }, { id: 'curriculum', label: 'Leerstof', icon: Target }, { id: 'progress', label: 'Voortgang', icon: TrendingUp }]

  useEffect(() => {
    if (initial.warning && storageWarning) return
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); setSaved(true) }
    catch { setSaved(false); setStorageWarning('Opslaan lukt niet. Laat dit tabblad open en exporteer je gegevens via Instellingen.') }
  }, [progress, initial.warning, storageWarning])

  useEffect(() => { if (lastAnswer) feedbackRef.current?.focus() }, [lastAnswer])

  function navigate(next: string) { setView(next); setActiveId(null); setFormError('') }
  function switchRole(next: boolean) { setParent(next); navigate(next ? 'parent' : 'today') }
  function start() {
    if (unfinished) { setProgress(current => ({ ...current, sessions: current.sessions.map(session => session.id === unfinished.id ? prioritizeSignsInSavedSession(session, current.events) : session) })); setActiveId(unfinished.id); return }
    if (todaysSession) { setActiveId(todaysSession.id); return }
    const session: Session = { id: crypto.randomUUID(), date: today, items: selectItems(progress.events), cursor: 0, completedAt: null }
    setProgress(current => ({ ...current, sessions: [...current.sessions, session] }))
    setActiveId(session.id)
  }
  function updateDraft(field: 'response' | 'working' | 'markingExpression' | 'mathLine', value: string) {
    setProgress(current => ({ ...current, drafts: { ...current.drafts, [draftKey]: { ...(current.drafts[draftKey] ?? draft), [field]: value } } }))
    setFormError('')
  }
  function appendMathLine() {
    if (answerLocked || !draft.mathLine?.trim()) return
    setProgress(current => {
      const previous = current.drafts[draftKey] ?? draft
      return { ...current, drafts: { ...current.drafts, [draftKey]: { ...previous, working: [previous.working, previous.mathLine].filter(Boolean).join('\n'), mathLine: '' } } }
    })
  }
  function setConfidence(confidence: 'sure' | 'unsure') {
    setProgress(current => ({ ...current, drafts: { ...current.drafts, [draftKey]: { ...(current.drafts[draftKey] ?? draft), confidence } } }))
  }
  function updateVerification(field: 'original' | 'proposed', value: string) {
    setProgress(current => {
      const previous = current.drafts[draftKey] ?? draft
      return { ...current, drafts: { ...current.drafts, [draftKey]: { ...previous, verification: { ...(previous.verification ?? { original: '', proposed: '' }), [field]: value } } } }
    })
  }
  function checkVerification() {
    if (!active || !item || !counterexample || !currentVerification.original.trim() || !currentVerification.proposed.trim()) return
    const event = makeVerificationEvent(active, item, progress.events, counterexample, currentVerification.original, currentVerification.proposed)
    setProgress(current => ({ ...current, events: [...current.events, event] }))
  }
  function updateStep(stepId: string, value: string) {
    setProgress(current => {
      const previous = current.drafts[draftKey] ?? draft
      return { ...current, drafts: { ...current.drafts, [draftKey]: { ...previous, steps: { ...previous.steps, [stepId]: value } } } }
    })
    setFormError('')
  }
  function chooseWorkingMode(mode: 'guided' | 'own') {
    setProgress(current => ({ ...current, drafts: { ...current.drafts, [draftKey]: { ...(current.drafts[draftKey] ?? draft), workingMode: mode } } }))
    setFormError('')
  }
  function checkStep(stepId: string) {
    if (!active || !item || !draft.steps?.[stepId]?.trim() || answerLocked) return
    if (!groupingComplete && !item.likeTerms?.checkpointIds?.includes(stepId)) return
    const event = makeEvent(active, item, progress.events, 'checkpoint', draft.steps[stepId], workingText(item, currentWorking), new Date(), stepId, draft.confidence)
    setProgress(current => ({ ...current, events: [...current.events, event] }))
  }
  function toggleTerm(termId: string) {
    if (!marking?.ready || marking.complete || answerLocked || marking.groups.some(group => group.includes(termId))) return
    const selected = selectedTerms.includes(termId) ? selectedTerms.filter(id => id !== termId) : [...selectedTerms, termId]
    setProgress(current => ({ ...current, drafts: { ...current.drafts, [draftKey]: { ...(current.drafts[draftKey] ?? draft), termMarking: { source: marking.source, selected, groups: marking.groups } } } }))
  }
  function groupSelectedTerms() {
    if (!item || !active || !marking?.ready || answerLocked) return
    const event = makeGroupingEvent(active, item, progress.events, currentWorking, selectedTerms)
    setProgress(current => {
      const previous = current.drafts[draftKey] ?? draft
      return { ...current, events: [...current.events, event], drafts: { ...current.drafts, [draftKey]: { ...previous, termMarking: { source: marking.source, selected: event.grade?.outcome === 'correct' ? [] : selectedTerms, groups: event.grade?.outcome === 'correct' ? [...marking.groups, selectedTerms] : marking.groups } } } }
    })
    setFormError('')
  }
  function resetTermGroups() {
    if (!marking || answerLocked) return
    setProgress(current => ({ ...current, drafts: { ...current.drafts, [draftKey]: { ...(current.drafts[draftKey] ?? draft), termMarking: { source: marking.source, selected: [], groups: [] } } } }))
  }
  function record(type: LearningEvent['type']) {
    if (!active || !item) return
    const event = makeEvent(active, item, progress.events, type, type === 'answer' ? draft.response : '', type === 'answer' ? workingText(item, currentWorking) : '', new Date(), undefined, type === 'answer' ? draft.confidence : undefined)
    setProgress(current => ({ ...current, events: [...current.events, event] }))
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!item || answerLocked) return
    const missingStep = missingWorking(item, currentWorking)
    if (missingStep) {
      setFormError(missingStep === 'like-terms' ? 'Groepeer eerst alle gelijksoortige termen, telkens samen met hun teken.' : missingStep === 'working' ? 'Schrijf je tussenstappen of redenering in je eigen uitwerking.' : 'Vul de ontbrekende tussenstap in of kies Eigen aanpak voor een andere werkwijze.')
      document.getElementById(missingStep === 'like-terms' ? 'like-terms' : missingStep === 'working' ? 'working' : `step-${missingStep}`)?.focus()
      return
    }
    if (item?.kind === 'compound') {
      const missing = item.fields!.find(field => !fieldValues[field.key]?.trim())
      if (missing) { setFormError(`Vul ook dit onderdeel in: ${missing.label}.`); document.getElementById(`answer-${missing.key}`)?.focus(); return }
    }
    if (!draft.response.trim()) { setFormError('Vul eerst je antwoord in.'); answerInput.current?.focus(); return }
    record('answer')
  }
  function advance() {
    if (!active || !canAdvance) return
    setProgress(current => ({ ...current, sessions: current.sessions.map(session => {
      if (session.id !== active.id) return session
      const next = item ? scheduleSignFollowUp(session, item, current.events) : session
      return { ...next, cursor: next.cursor + 1, completedAt: next.cursor + 1 === next.items.length ? new Date().toISOString() : null }
    }) }))
    setFormError('')
  }
  function deferGeometry() {
    if (!active || !item) return
    const event = makeEvent(active, item, progress.events, 'deferred')
    setProgress(current => ({ ...current, events: [...current.events, event], sessions: current.sessions.map(session => session.id === active.id ? { ...session, cursor: session.cursor + 1, completedAt: session.cursor + 1 === session.items.length ? new Date().toISOString() : null } : session) }))
  }
  function exportData() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `matti-demo-${today}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }
  function reset() {
    if (!window.confirm('Alle lokale oefengegevens en onafgewerkte antwoorden wissen? Dit kan niet ongedaan worden gemaakt.')) return
    try { localStorage.removeItem(storageKey); setStorageWarning(''); setProgress(emptyProgress()); setActiveId(null) }
    catch { setStorageWarning('Wissen is niet gelukt. Controleer de opslagrechten van deze browser.') }
  }
  function insertSymbol(symbol: string) {
    if (answerLocked) return
    const input = answerInput.current
    const text = input?.value ?? draft.response
    const position = input?.selectionStart ?? text.length
    const end = input?.selectionEnd ?? position
    const value = `${text.slice(0, position)}${symbol}${text.slice(end)}`
    if (input?.dataset.step) updateStep(input.dataset.step, value)
    else if (input?.id === 'working') updateDraft('working', value)
    else updateDraft('response', item?.kind === 'compound' && input?.dataset.part ? JSON.stringify({ ...fieldValues, [input.dataset.part]: value }) : value)
    requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(position + symbol.length, position + symbol.length) })
  }

  const evidenceView = <section className="evidence-list">
    <div className="section-heading"><h2>Antwoorden en hulp</h2><span>{progress.events.filter(event => event.type === 'answer').length} eindantwoorden</span></div>
    {progress.events.length === 0 ? <EmptyState text="Nog geen antwoorden. Na een oefensessie verschijnt hier het bewijs." /> : [...progress.events].reverse().map(event => {
      const question = bank.find(candidate => candidate.id === event.itemId)!
      const checkpoint = question.checkpoints?.find(step => step.id === event.checkpointId)
      return <details key={event.id} className="evidence-row">
        <summary><span><strong>{question.title}</strong><small>{new Date(event.at).toLocaleString('nl-BE')} · {event.type === 'verification' ? 'Zelf getoetst met getallen' : event.type === 'deferred' ? 'Uitgesteld voor inhoudscontrole' : event.type === 'grouping' ? 'Gelijksoortige termen gegroepeerd' : event.type === 'checkpoint' ? `Tussenstap: ${checkpoint?.label ?? event.checkpointId}` : event.type === 'hint' ? 'Hint bekeken' : event.type === 'solution' ? 'Uitwerking bekeken' : event.independent ? 'Eerste eindantwoord, zonder voorafgaande feedback' : 'Eindantwoord na hulp of eerdere feedback'}</small></span><span className={`tag ${event.grade?.outcome ?? ''}`}>{event.grade ? outcomes[event.grade.outcome] : 'Hulp'}</span></summary>
        {(event.type === 'answer' || event.type === 'checkpoint' || event.type === 'grouping' || event.type === 'verification') && <div className="evidence-detail"><p><strong>{event.type === 'verification' ? 'Waarden van de tegenproef' : event.type === 'grouping' ? 'Geselecteerde getekende termen' : event.type === 'checkpoint' ? 'Ingevoerde tussenstap' : 'Oorspronkelijk eindantwoord'}</strong><br />{event.type === 'answer' ? displayResponse(question, event.response) : event.response}</p><p><strong>Uitwerking op dat moment</strong><br />{event.working || 'Niet ingevuld'}</p><p><strong>Categorie:</strong> {event.grade && categories[event.grade.category]}</p><p>{event.grade?.feedback}</p>{event.confidence && <p>Vooraf aangegeven zekerheid: {event.confidence === 'sure' ? 'zeker' : 'twijfel'}.</p>}{event.signCheck && <p>Eerste tekenuitwerking: {outcomes[event.signCheck.outcome]}. {event.independentStep ? 'Zonder eerdere feedback op deze opgave.' : 'Na eerdere feedback.'}</p>}{event.grade?.parts?.map(part => <p key={part.key}>{part.label}: {outcomes[part.outcome]} ({categories[part.category]})</p>)}</div>}
      </details>
    })}
  </section>

  const skillRows = [...new Set(bank.map(question => question.skill))].map(skill => {
    const question = bank.find(candidate => candidate.skill === skill)!
    const evidence = skillEvidence(skill, progress.events)
    return <div key={skill} className="skill-row"><div><strong>{question.objective}</strong><small>{question.topic} · {question.subtype}</small></div><div className="skill-evidence"><span className={evidence.state === 'Zelfstandig bevestigd' ? 'green-text' : ''}>{evidence.state}</span><small>{evidence.successes}/{evidence.independent} zelfstandig correct{evidence.assisted > 0 ? ` · ${evidence.assisted} na hulp` : ''}{evidence.pending > 0 ? ` · ${evidence.pending} te bespreken` : ''}</small></div></div>
  })

  const termMarker = item?.likeTerms && marking ? <TermMarker item={item} state={marking} selected={selectedTerms} feedback={groupingFeedback ?? null} locked={answerLocked} ownMode={workingMode === 'own'} expression={draft.markingExpression ?? ''} onExpression={value => updateDraft('markingExpression', value)} onToggle={toggleTerm} onGroup={groupSelectedTerms} onReset={resetTermGroups} /> : null

  return <div className="app-shell">
    <a className="skip-link" href="#main">Naar inhoud</a>
    <div className="demo-strip"><ShieldAlert size={14} /><span>Lokale demo · geen beveiligde accounts of synchronisatie</span></div>
    <header className="app-header"><a className="brand" href="#" onClick={event => { event.preventDefault(); navigate(parent ? 'parent' : 'today') }} aria-label="Matti start"><span className="brand-mark">m<span>.</span></span><span>Matti<small>Wiskunde, elke dag.</small></span></a><div className="role-switch" aria-label="Demo-weergave"><button aria-pressed={!parent} onClick={() => switchRole(false)}>Leerling</button><button aria-pressed={parent} onClick={() => switchRole(true)}>Ouder</button></div><span className="header-status"><span className="status-dot" />{saved ? 'Lokaal bewaard' : 'Niet bewaard'}</span></header>
    <div className="workspace">
      <aside className="sidebar"><nav aria-label="Hoofdnavigatie">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'nav-item selected' : 'nav-item'} onClick={() => navigate(id)}><Icon size={20} /><span>{label}</span>{view === id && <ChevronRight size={16} />}</button>)}</nav><div className="sidebar-note"><PencilLine size={22} /><p>Een helder hoofd.<br />Een stap tegelijk.</p><span>Geen haast. Wel aandacht.</span></div><button className="nav-item settings-link" onClick={() => navigate('settings')}><Bell size={19} />Instellingen</button></aside>
      <main id="main" tabIndex={-1}>
        {storageWarning && <div className="storage-alert" role="alert"><ShieldAlert size={20} /><p>{storageWarning}</p><button onClick={() => navigate('settings')}>Instellingen</button></div>}
        {view === 'today' && !active && <>
          <div className="page-heading"><div><p className="eyebrow">JOUW DAGELIJKSE WISKUNDE</p><h1>Even tijd voor wiskunde.</h1><p>{new Date().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Brussels' })}</p></div><span className="date-stamp"><BookOpen size={22} />Dagelijks oefenen</span></div>
          {progress.sessions.some(session => !isAssessmentSession(session)) && !todaysSession && <div className="notice subtle"><Target size={20} /><p>Nieuwe oefenset op toetsniveau. Je eerdere antwoorden en uitwerkingen blijven bewaard.</p></div>}
          <section className="daily-section"><div className="daily-copy"><span className="session-label"><span className="status-dot" />{todaysSession?.completedAt ? 'AFGEROND' : unfinished ? 'KLAAR OM TE HERVATTEN' : 'OP TOETSNIVEAU'}</span><h2>{todaysSession?.completedAt ? 'Je werk voor vandaag zit erop.' : unfinished ? 'Ga verder waar je was.' : 'Jouw volgende stap.'}</h2><p>{todaysSession?.completedAt ? 'Je antwoorden en uitwerkingen zijn bewaard. Morgen staat een nieuwe mix klaar.' : 'Samengestelde berekeningen, veeltermen en transformaties. Werk volledig uit en licht je redenering toe.'}</p><div className="session-meta"><span><Clock3 size={17} />Richttijd: 15 minuten</span><span><PencilLine size={17} />6 opdrachten</span></div><button className="primary" onClick={start}>{todaysSession?.completedAt ? 'Bekijk je afronding' : unfinished ? 'Hervat je sessie' : 'Start je sessie'}<ArrowRight size={18} /></button><small className="session-footnote">{unfinished ? `${unfinished.cursor} van ${unfinished.items.length} opdrachten afgerond` : 'Neem de tijd voor je tussenstappen; geen tijdslimiet.'}</small></div><div className="daily-visual"><GeometryFigure /><div className="visual-caption"><span className="mini-label">MEETKUNDE</span><span>Een ander beeld. Dezelfde vorm.</span></div></div></section>
          <section className="session-outline"><div className="section-heading"><h2>Vandaag in je sessie</h2><span>Afwisselend oefenen</span></div><div className="topic-grid">{topics.map((topic, index) => <div className="topic-preview" key={topic}><span className={`topic-number topic-${index}`}>0{index + 1}</span><div><h3>{topic}</h3><p>{topicDescriptions[index]}</p></div></div>)}</div></section>
          <section className="bottom-note"><div className="note-icon"><Target size={23} /></div><div><h3>Een kleine controle maakt verschil.</h3><p>Zijn alle tekens, labels en gevraagde onderdelen aanwezig?</p></div></section>
        </>}

        {view === 'today' && active && !active.completedAt && item && !eligibleForPractice(item) && <section className="completion"><p className="eyebrow">INHOUDSCONTROLE</p><h1>Deze meetkundeopgave wacht op voorbereiding.</h1><p>Hoofdstuk 2 behandelt rotaties en coordinaten. De specifieke coordinatenregel voor een kwartdraai wordt nog niet zelfstandig geoefend zonder voorbereiding. Deze opgave telt niet als een fout en wordt niet beoordeeld.</p><button className="primary" onClick={deferGeometry}>Ga naar de volgende opdracht<ArrowRight size={18} /></button></section>}
        {view === 'today' && active && !active.completedAt && item && eligibleForPractice(item) && <>
          <div className="practice-top"><button className="text-button" onClick={() => setActiveId(null)}><Pause size={17} />Pauzeren</button><span>Opdracht {active.cursor + 1} van {active.items.length}</span><span className="save-indicator"><Check size={15} />{saved ? 'Lokaal bewaard' : 'Niet bewaard'}</span></div><progress className="session-progress" max={active.items.length} value={active.cursor} aria-label="Sessievoortgang" />
          <div className="exercise-layout"><section className="exercise"><p className="eyebrow">{item.topic.toUpperCase()} · {item.subtype === 'explanation' ? 'UITLEGGEN' : item.subtype === 'notation' ? 'NOTATIE' : 'OEFENEN'}</p><h1>{item.title}</h1><p className="exercise-prompt">{item.prompt}</p>{item.expression && <MathExpression expression={item.expression} tex={item.tex} />}{item.kind === 'prime' && <GeometryFigure variant="prime" />}{item.id === 'area-1' && <GeometryFigure variant="area" />}
          {item.geometry && <><GeometryExercise scenario={item.geometry} /><p className="geometry-note">Hier gaat het om een translatie, niet om een rotatie. Alle overeenkomstige punten hebben dezelfde verplaatsing; de driehoek draait niet. Gebruik de opgegeven coordinaten, niet een schatting uit de tekening.</p></>}
          <form onSubmit={submit}>
          {item.confidencePrompt && !lastAnswer && <fieldset className="confidence-choice"><legend>Hoe zeker ben je van je eerste uitwerking? (optioneel)</legend><button type="button" disabled={events.length > 0} aria-pressed={draft.confidence === 'unsure'} onClick={() => setConfidence('unsure')}>Ik twijfel</button><button type="button" disabled={events.length > 0} aria-pressed={draft.confidence === 'sure'} onClick={() => setConfidence('sure')}>Ik ben zeker</button></fieldset>}
          {counterexample && !answerLocked && <section className="verification-panel"><h2>Toets je eigen regel met getallen</h2>{lastSignError?.confidence === 'sure' && <p>Je gaf aan zeker te zijn. Een tegenproef kan aantonen of je twee uitdrukkingen echt dezelfde waarde hebben.</p>}<p>Neem a en x = {counterexample.assignments.a}, b en y = {counterexample.assignments.b}. Bereken beide uitdrukkingen afzonderlijk.</p><MathExpression expression={item.expression} tex={item.tex} /><MathExpression expression={counterexample.proposed} /><label>Waarde van de oorspronkelijke uitdrukking<MathInput id="verification-original" label="Waarde van de oorspronkelijke uitdrukking" value={currentVerification.original} onChange={value => updateVerification('original', value)} /></label><label>Waarde van jouw voorgestelde uitdrukking<MathInput id="verification-proposed" label="Waarde van jouw voorgestelde uitdrukking" value={currentVerification.proposed} onChange={value => updateVerification('proposed', value)} /></label><button type="button" className="secondary" disabled={!currentVerification.original.trim() || !currentVerification.proposed.trim()} onClick={checkVerification}><CheckCheck size={17} />Vergelijk mijn waarden</button>{verificationGrade && <div className={`checkpoint-feedback ${verificationGrade.outcome}`} role="status"><p>{verificationGrade.feedback}</p></div>}</section>}
          {item.likeTerms?.expression && termMarker}
          {item.checkpoints?.length ? <section className="working-path" aria-label="Tussenstappen">
            <div className="working-path-heading"><h2>Tussenstappen</h2><div className="working-mode" aria-label="Werkwijze"><button type="button" aria-pressed={workingMode === 'guided'} disabled={answerLocked} onClick={() => chooseWorkingMode('guided')}><Target size={14} />Stap voor stap</button><button type="button" aria-pressed={workingMode === 'own'} disabled={answerLocked} onClick={() => chooseWorkingMode('own')}><PencilLine size={14} />Eigen aanpak</button></div></div>
            {workingMode === 'guided' ? <ol className="checkpoint-list">{item.checkpoints.map((step, index) => {
              const value = draft.steps?.[step.id] ?? ''
              const lastCheck = events.filter(event => event.type === 'checkpoint' && event.checkpointId === step.id).at(-1)
              const currentCheck = lastCheck?.response === value ? lastCheck.grade : null
              const stepLocked = answerLocked || (!groupingComplete && !item.likeTerms?.checkpointIds?.includes(step.id))
              return <li key={step.id} className="checkpoint-stage"><div className="checkpoint">
                <span className="checkpoint-number">{index + 1}</span><div className="checkpoint-body"><label htmlFor={`step-${step.id}`}>{step.label}</label><p>{step.prompt}</p><div className="checkpoint-entry">{step.kind === 'number' || step.kind === 'polynomial' ? <MathInput id={`step-${step.id}`} label={step.label} value={value} disabled={stepLocked} onChange={value => updateStep(step.id, value)} /> : <input id={`step-${step.id}`} data-step={step.id} value={value} disabled={stepLocked} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={240} onFocus={event => { answerInput.current = event.currentTarget }} onChange={event => updateStep(step.id, event.target.value)} />}<button type="button" className="secondary" disabled={!value.trim() || stepLocked || currentCheck?.outcome === 'correct'} onClick={() => checkStep(step.id)} aria-label={`Controleer tussenstap: ${step.label}`}><Check size={16} />Controleer stap</button></div>
                {currentCheck && <div className={`checkpoint-feedback ${currentCheck.outcome}`} role="status"><strong>{outcomes[currentCheck.outcome]}</strong><p>{currentCheck.feedback}</p></div>}
                {lastCheck && !currentCheck && <small className="step-edited">Aangepast sinds de vorige controle.</small>}
                </div></div>
                {item.likeTerms?.checkpointIds?.at(-1) === step.id && termMarker}
              </li>
            })}</ol> : null}
            <div className="working-notes"><label htmlFor="working">{workingMode === 'own' ? 'Jouw uitwerking met tussenstappen' : 'Eigen notities (optioneel)'}</label><textarea id="working" value={draft.working} readOnly={answerLocked} onFocus={event => { answerInput.current = event.currentTarget }} onChange={event => updateDraft('working', event.target.value)} rows={workingMode === 'own' ? 5 : 2} maxLength={5000} /></div>
            <div className="math-line-entry"><label htmlFor="working-math">Rekenregel met breukstreep</label><MathInput id="working-math" label="Rekenregel met breukstreep" value={draft.mathLine ?? ''} disabled={answerLocked} onChange={value => updateDraft('mathLine', value)} /><button type="button" className="secondary" disabled={answerLocked || !draft.mathLine?.trim()} onClick={appendMathLine}><Plus size={16} />Voeg rekenregel toe</button></div>
            {workingMode === 'own' && !item.likeTerms?.expression && termMarker}
          </section> : <details className="working" open={item.requireWorking || Boolean(draft.working)}><summary><PencilLine size={16} />Mijn uitwerking{item.requireWorking ? ' (verplicht)' : ''}</summary><label className="sr-only" htmlFor="working">Jouw uitwerking</label><textarea id="working" value={draft.working} readOnly={answerLocked} onFocus={event => { answerInput.current = event.currentTarget }} onChange={event => updateDraft('working', event.target.value)} rows={4} maxLength={5000} /></details>}
          <fieldset className="final-response" disabled={!groupingComplete}>
          <div className="final-answer-heading"><h2>{item.kind === 'explanation' ? 'Volledige formulering' : 'Breng je stappen samen'}</h2></div>
          {item.kind === 'compound' ? <fieldset className="answer-parts"><legend>Jouw eindantwoorden</legend>{item.fields!.map(field => <label key={field.key} htmlFor={`answer-${field.key}`}>{field.label}{field.kind !== 'exact' ? <MathInput id={`answer-${field.key}`} label={field.label} value={fieldValues[field.key] ?? ''} disabled={answerLocked || !groupingComplete} onChange={value => updateDraft('response', JSON.stringify({ ...fieldValues, [field.key]: value }))} /> : <input id={`answer-${field.key}`} data-part={field.key} value={fieldValues[field.key] ?? ''} readOnly={answerLocked} onFocus={event => { answerInput.current = event.currentTarget }} onChange={event => updateDraft('response', JSON.stringify({ ...fieldValues, [field.key]: event.target.value }))} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={200} />}</label>)}</fieldset> : <><label htmlFor="answer">{item.kind === 'explanation' ? 'Jouw uitleg' : 'Jouw antwoord'}</label>{item.kind === 'explanation' ? <textarea id="answer" ref={element => { answerInput.current = element }} value={draft.response} readOnly={answerLocked} onChange={event => updateDraft('response', event.target.value)} rows={4} maxLength={3000} /> : item.kind === 'number' || item.kind === 'polynomial' ? <MathInput id="answer" label="Jouw antwoord" value={draft.response} disabled={answerLocked || !groupingComplete} onChange={value => updateDraft('response', value)} /> : <input id="answer" ref={element => { answerInput.current = element }} value={draft.response} readOnly={answerLocked} onChange={event => updateDraft('response', event.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} inputMode="text" maxLength={200} aria-describedby={formError ? 'answer-error' : undefined} />}</>}
          {item.kind === 'explanation' || item.kind === 'prime' ? <div className="symbol-bar" aria-label="Wiskundige symbolen">{[{ value: '-', name: 'Minteken' }, { value: "'", name: 'Prime' }, { value: '\u00b0', name: 'Graden' }].map(symbol => <button key={symbol.value} type="button" title={symbol.name} aria-label={symbol.name} onClick={() => insertSymbol(symbol.value)}>{symbol.value}</button>)}</div> : null}
          </fieldset>
          {formError && <p id="answer-error" className="form-error" role="alert">{formError}</p>}
          <div className="exercise-actions"><button className="primary" type="submit" disabled={answerLocked || !groupingComplete}><Check size={18} />{lastAnswer ? 'Controleer opnieuw' : 'Controleer antwoord'}</button><button className="text-button" type="button" disabled={hasHint || hasSolution} onClick={() => record('hint')}><Lightbulb size={18} />{hasHint ? 'Hint bekeken' : 'Een hint'}</button></div></form>
          {hasHint && <aside className="hint-box"><Lightbulb size={19} /><p>{item.hint}</p></aside>}
          {lastAnswer?.grade && <div ref={feedbackRef} tabIndex={-1} className={`feedback ${lastAnswer.grade.outcome}`} role="status"><div><strong>{outcomes[lastAnswer.grade.outcome]}</strong><p>{lastAnswer.grade.feedback}</p>{lastAnswer.grade.outcome === 'correct' && correctedSteps.length > 0 && <p>Je hebt deze tussenstap correct herwerkt: {correctedSteps.map(step => step.label.toLowerCase()).join(', ')}. De eerste versie blijft apart bewaard.</p>}{lastAnswer.grade.outcome === 'correct' && item.signTraining && lastSignError && <p>Je nieuwe einduitdrukking klopt. {relatedCheckNext ? 'Een verwante opgave controleert nu of je de regel zonder hulp kunt toepassen.' : 'Dit blijft oefenwerk na feedback; verdere onafhankelijke toepassing is nog nodig.'}</p>}{lastAnswer.grade.parts && <ul className="part-results">{lastAnswer.grade.parts.map(part => <li key={part.key}><span>{part.label}</span><span className={`tag ${part.outcome}`}>{outcomes[part.outcome]}</span></li>)}</ul>}<small>{lastAnswer.independent ? 'Eerste eindantwoord, zonder voorafgaande feedback.' : 'Dit eindantwoord volgt na stapcontrole, hulp of eerdere feedback.'} De ingevoerde tussenstappen blijven bewaard. Een controle bevestigt alleen de benoemde tussenuitkomst, niet automatisch de volledige methode.</small></div></div>}
          {hasSolution && <div className="solution-box"><h3>Een uitgewerkte oplossing</h3><p>{item.solution}</p></div>}
          {lastAnswer && !hasSolution && lastAnswer.grade?.outcome !== 'correct' && <button className="text-button reveal" onClick={() => record('solution')}><Eye size={17} />Bekijk een uitwerking</button>}
          {canAdvance && <button className="primary next-button" onClick={advance}>{active.cursor + 1 === active.items.length ? 'Rond je sessie af' : 'Volgende opdracht'}<ArrowRight size={18} /></button>}
          </section><aside className="exercise-aside"><span className="eyebrow">EVEN NAKIJKEN</span><CheckCheck size={28} /><h3>Volledig is ook belangrijk.</h3><p>{item.subtype === 'notation' ? 'Oorspronkelijk punt of beeldpunt? Alle primes en labels erbij?' : item.kind === 'explanation' ? 'Een volledige zin? Alle gevraagde begrippen en parameters genoemd?' : 'Alle termen meegenomen? Het teken van je antwoord gecontroleerd?'}</p><details className="source-note"><summary>Bron en leerdoel</summary><p>{item.objective}</p><p>{item.source}</p><p>{item.chapter ?? 'Hoofdstukkoppeling nog te controleren.'}</p></details></aside></div>
        </>}

        {view === 'today' && active?.completedAt && <section className="completion"><span className="completion-icon"><CircleCheck size={44} /></span><p className="eyebrow">SESSIE AFGEROND</p><h1>Je werk is bewaard.</h1><p>{progress.events.filter(event => event.sessionId === active.id && event.independent && event.grade?.outcome === 'correct').length} opdrachten in deze sessie zelfstandig correct opgelost.</p><p>Wat na een hint lukte, blijft apart bewaard. Uitlegvragen staan klaar om samen te bespreken.</p><div className="completion-topics">{active.items.map(id => { const question = bank.find(candidate => candidate.id === id)!; const result = progress.events.filter(event => event.sessionId === active.id && event.itemId === id && event.type === 'answer').at(-1); return <div key={id}><span>{question.title}</span><span className={`tag ${result?.grade?.outcome ?? ''}`}>{result?.grade ? outcomes[result.grade.outcome] : 'Uitwerking bekeken'}</span></div> })}</div><button className="primary" onClick={() => navigate('progress')}>Bekijk je voortgang<ArrowRight size={18} /></button><p className="muted">Er is geen oudermelding verzonden in deze lokale demo.</p></section>}

        {view === 'curriculum' && <><PageHeading eyebrow="LEERSTOF" title="Een brede basis." description="Lettervormen, transformaties en toepassing." /><div className="notice"><BookOpen size={21} /><p>Hoofdstuk 1 en 2 zijn beschikbaar met correcties. Verdere hoofdstukken en volledige leerboekdekking blijven te controleren.</p></div><div className="filter-tabs" aria-label="Onderwerpfilter">{(['Alles', ...topics] as const).map(topic => <button key={topic} aria-pressed={filter === topic} onClick={() => setFilter(topic)}>{topic}</button>)}</div><section>{bank.filter(question => filter === 'Alles' || question.topic === filter).map(question => <details className="curriculum-row" key={question.id}><summary><span className={`curriculum-dot topic-${topics.indexOf(question.topic)}`} /><span><strong>{question.objective}</strong><small>{question.topic} · {question.purpose === 'probe' ? 'Korte diagnose, niet in de dagsessie' : !eligibleForPractice(question) ? 'Wacht op voorbereiding' : question.difficulty === 3 ? 'Samengestelde toepassing' : 'Toetsgerichte oefening'}</small></span><ChevronRight size={18} /></summary><div className="curriculum-detail"><p>{question.prompt}</p>{question.expression && <MathExpression expression={question.expression} tex={question.tex} />}<p><strong>Herkomst:</strong> {question.source}</p><p><strong>Hoofdstuk:</strong> {question.chapter ?? 'Nog te koppelen aan leerboek'}</p><p><strong>Controle:</strong> rekenantwoorden getest; aanvullende inhoudelijke review blijft nodig.</p></div></details>)}<div className="curriculum-row pending-topic"><span className="curriculum-dot topic-2" /><div><strong>GeoGebra en meetkundige constructies</strong><small>Gepland · digitaal constructiebestand en beoordelingsmodel ontbreken</small></div><LockKeyhole size={18} /></div></section></>}

        {(view === 'progress' || view === 'parent') && <><PageHeading eyebrow={parent ? 'OUDEROVERZICHT · LOKALE DEMO' : 'JOUW VOORTGANG'} title={parent ? 'Zicht op het leerproces.' : 'Wat je zelf kunt.'} description={parent ? 'Zelfstandige antwoorden, oefenwerk en open beoordelingen blijven gescheiden.' : 'Zelfstandige resultaten zijn het bewijs. Een hint is een stap in het leren.'} /><div className="metrics"><div><span>Afgeronde sessies</span><strong>{completeCount}</strong><small>Op deze browser</small></div><div><span>Zelfstandig correct</span><strong>{independentSuccesses}</strong><small>Eerste antwoorden zonder hint</small></div><div><span>Leerdoelen geoefend</span><strong>{new Set(progress.events.filter(event => event.type === 'answer').map(event => bank.find(question => question.id === event.itemId)!.skill)).size}<span> / {new Set(bank.map(question => question.skill)).size}</span></strong><small>Alleen deze voorlopige oefenset</small></div></div><section><div className="section-heading"><h2>Bewijs per vaardigheid</h2><span>Geen dagcijfer</span></div>{skillRows}</section><div className="notice subtle"><Target size={21} /><p>Zelfstandig bevestigd: drie recente onafhankelijke correcte antwoorden, verspreid over minstens drie dagen. Dit is een voorlopige regel, geen uitspraak over volledige beheersing.</p></div>{parent && <button className="text-button" onClick={() => navigate('evidence')}><Eye size={18} />Bekijk de oorspronkelijke antwoorden<ArrowRight size={17} /></button>}</>}

        {(view === 'parent' || view === 'progress') && <section className="sign-evidence"><h2>Tekenregels: bewijs uit je uitwerkingen</h2><p><strong>{signStats.correct}/{signStats.samples}</strong> eerste uitwerkingen correct zonder eerdere feedback op die opgave. Dit is bewijs voor de tekenstap, niet voor volledige beheersing van de hele oefening.</p><p>Recente eerste uitwerkingen: {signStats.recent.correct}/{signStats.recent.total}.{signStats.previous.total > 0 ? ` Eerdere uitwerkingen: ${signStats.previous.correct}/${signStats.previous.total}.` : ' Er is nog geen eerdere reeks om mee te vergelijken.'}</p><p>Geregistreerde tekenfouten: {signStats.errors}. Daarvan vooraf als zeker aangegeven: {signStats.highConfidenceErrors}. Numerieke tegenproeven uitgevoerd: {signStats.verificationChecks}.</p></section>}
        {view === 'evidence' && <><PageHeading eyebrow="ONDERLIGGEND BEWIJS" title="Elk antwoord telt apart." description="Open een regel om antwoord, uitwerking en foutcategorie te bekijken." />{evidenceView}</>}

        {view === 'settings' && <><PageHeading eyebrow="INSTELLINGEN" title="Op jouw ritme." description="Meldingen worden hier alleen gesimuleerd. Er wordt niets verzonden." /><section className="settings-section"><div className="section-heading"><h2>Herinneringen</h2><span>Europe/Brussels</span></div><label className="setting-row"><span><strong>Dagelijkse herinneringen</strong><small>Voorkeur voor de simulatie</small></span><input type="checkbox" checked={preferences.enabled} onChange={event => setPreferences({ ...preferences, enabled: event.target.checked })} /></label><label className="setting-row"><span><strong>E-mail voor de leerling</strong><small>Rechtstreeks naar de dagsessie</small></span><input aria-label="Tijd dagelijkse e-mail" type="time" required value={preferences.emailTime} onChange={event => event.target.value && setPreferences({ ...preferences, emailTime: event.target.value })} /></label><label className="setting-row"><span><strong>Herinnering op de telefoon</strong><small>Alleen als de sessie nog niet af is</small></span><input aria-label="Tijd telefoonherinnering" type="time" required value={preferences.phoneTime} onChange={event => event.target.value && setPreferences({ ...preferences, phoneTime: event.target.value })} /></label><label className="setting-row"><span><strong>Push-toestemming</strong><small>Gesimuleerde apparaatstatus</small></span><select value={preferences.pushPermission} onChange={event => setPreferences({ ...preferences, pushPermission: event.target.value as ReminderPreferences['pushPermission'] })}><option value="unavailable">Niet beschikbaar</option><option value="granted">Toegestaan</option><option value="denied">Geweigerd</option></select></label><div className="reminder-simulation"><h3>Avondcontrole (simulatie)</h3><div className="button-row"><button className="secondary" onClick={() => setSimulation(false)}>Sessie niet af</button><button className="secondary" onClick={() => setSimulation(true)}>Sessie afgerond</button></div>{simulation !== null && <div className="simulation-result" role="status">{(() => { const date = new Date(); const jobs = reminderPlan(new Date(`${date.getUTCFullYear()}-10-27T22:00:00Z`), simulation, preferences); return jobs.length ? jobs.map(job => <p key={job.key}><Check size={16} />{job.recipient === 'parent' ? 'Eenvoudige voltooiingsmail aan ouder, zonder cijfers.' : job.channel === 'push' ? 'Telefoon: push met hervatlink.' : job.channel === 'email-fallback' ? 'Push niet beschikbaar: e-mail als terugvaloptie (geen telefoonpush).' : 'Dagelijkse e-mail aan leerling, indien nog niet verzonden.'}</p>) : <p>Herinneringen uitgeschakeld.</p> })()}</div>}</div><div className="notice"><Bell size={21} /><p>Voor echte meldingen zijn een private backend, een e-maildienst en toestemming op de telefoon nodig. De tijdstippen en voorkeuren hierboven gelden alleen zolang dit tabblad open is.</p></div></section><section className="settings-section"><div className="section-heading"><h2>Lokale oefengegevens</h2><LockKeyhole size={19} /></div><p>Alleen op deze browser, zonder wachtwoord. Gebruik deze demo niet voor gevoelige persoonsgegevens, ook niet op een gedeelde schoolcomputer.</p><div className="button-row"><button className="secondary" onClick={exportData}><ArrowDownToLine size={17} />Exporteer oefengegevens</button><button className="danger-button" onClick={reset}><Trash2 size={17} />Wis lokale gegevens</button></div></section></>}
      </main>
    </div><footer><span>Matti <span className="footer-dot">·</span> Stap voor stap.</span><span><LockKeyhole size={13} />Prototype · alleen lokale opslag</span></footer>
  </div>
}

function TermMarker({ item, state, selected, feedback, locked, ownMode, expression, onExpression, onToggle, onGroup, onReset }: {
  item: Item; state: ReturnType<typeof termMarkingState>; selected: string[]; feedback: Grade | null; locked: boolean; ownMode: boolean; expression: string;
  onExpression: (value: string) => void; onToggle: (id: string) => void; onGroup: () => void; onReset: () => void;
}) {
  return <section id="like-terms" className="term-marker" tabIndex={-1} aria-label="Gelijksoortige termen markeren">
    <h2>Markeer de gelijksoortige termen</h2><p>{item.likeTerms?.prompt}</p>
    {ownMode && !item.likeTerms?.expression && <label className="marking-expression">Jouw uitgewerkte regel om te markeren<MathInput id="marking-expression" label="Jouw uitgewerkte regel om te markeren" value={expression} disabled={locked} onChange={onExpression} /></label>}
    {!state.source && !ownMode && <p className="marking-wait">Vul eerst de uitgewerkte producten of de uitgewerkte regel hierboven in.</p>}
    {state.error && <p className="marking-error" role="status">{state.error}</p>}
    {state.terms.length > 0 && <><p className="term-instruction">{item.likeTerms?.asList ? 'Termen om te vergelijken (geen nieuwe som).' : 'Selecteer alle termen van een groep, inclusief hun tekens.'}</p><div className="term-row" role="group" aria-label="Getekende termen">{state.terms.map(term => {
      const group = state.groups.findIndex(group => group.includes(term.id))
      return <button type="button" key={term.id} data-term={term.id} className={`signed-term ${selected.includes(term.id) ? 'term-selected' : ''} ${group >= 0 ? `term-grouped term-group-${group % 3}` : ''}`} aria-label={`Term ${term.expression}${group >= 0 ? `, groep ${group + 1}` : ''}`} aria-pressed={selected.includes(term.id) || group >= 0} disabled={locked || state.complete || group >= 0 || !state.ready} onClick={() => onToggle(term.id)}><span dangerouslySetInnerHTML={{ __html: katex.renderToString(term.tex, { trust: false, throwOnError: false }) }} />{group >= 0 && <small aria-hidden="true">{group + 1}</small>}</button>
    })}</div></>}
    {state.ready && <div className="term-actions"><button type="button" className="secondary" disabled={locked || selected.length < 2 || state.complete} onClick={onGroup}><CheckCheck size={17} />Groepeer geselecteerde termen</button><button type="button" className="text-button" disabled={locked || (!state.groups.length && !selected.length)} onClick={onReset}>Opnieuw markeren</button></div>}
    {feedback && <div className={`checkpoint-feedback ${feedback.outcome}`} role="status"><p>{feedback.feedback}</p></div>}
    {state.complete && <p className="marking-complete" role="status"><CircleCheck size={17} />Alle gelijksoortige termen zijn gegroepeerd. Werk nu verder.</p>}
  </section>
}

function MathExpression({ expression, tex }: { expression: string; tex?: string }) {
  return tex ? <div className="math-expression typeset-math" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: false, strict: 'error' }) }} /> : <div className="math-expression">{expression}</div>
}
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></div> }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><PencilLine size={26} /><p>{text}</p></div> }

export default App