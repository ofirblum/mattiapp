import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToString } from 'katex'
import { bank, brusselsDate, gradeAnswer, gradeCheckpoint, makeEvent, missingWorking, reminderPlan, selectItems, skillEvidence, workingText } from './learning.ts'
import type { LearningEvent, Session, ReminderPreferences } from './learning.ts'

const session: Session = { id: 'test', date: '2026-10-27', items: ['signed-1'], cursor: 0, completedAt: null }
const item = bank.find(question => question.id === 'signed-1')!
const preferences: ReminderPreferences = { emailTime: '16:00', phoneTime: '20:15', enabled: true, pushPermission: 'granted' }

test('all supported structured answers and solutions have golden cases', () => {
  for (const question of bank.filter(question => question.kind !== 'explanation')) assert.equal(gradeAnswer(question, question.answer).outcome, 'correct', question.id)
})
test('authored numeric answers agree with independently computed mathematics', () => {
  const expected: Record<string, number> = {
    'signed-1': -42 - (-17),
    'signed-2': -31 + 12,
    'decimal-1': 0.12 ** 2,
    'fraction-1': (-3 / 8) * (16 / 9),
    'coefficient-1': -4 + 13,
    'substitution-1': -(-8),
    'area-1': ((6 + 10) * 4) / 2,
    'mixed-fractions-v2': 3 - (5 / 6) / (10 / 9) - (7 / 12) * (-6 / 7),
    'powers-roots-v2': 2 * (7 / Math.sqrt(16)) + (-15 / 3 ** 2) * (Math.sqrt(81) / 5) + (5 / 2) * (1 / 5 - 1) ** 2,
    'substitution-fractions-v2': (2 * -3) / -2 - (1 / 4) * -3 * -2 + 5,
  }
  for (const [id, value] of Object.entries(expected)) {
    const question = bank.find(candidate => candidate.id === id)!
    const response = question.answerFormat ? question.answer : String(value)
    const [numerator, denominator = '1'] = response.split('/')
    assert.ok(Math.abs(Number(numerator) / Number(denominator) - value) < 1e-10, id)
    assert.equal(gradeAnswer(question, response).outcome, 'correct', id)
  }
  assert.equal(bank.filter(question => question.kind === 'number').length, Object.keys(expected).length)
})
test('numeric grading accepts comma decimals and equivalent fractions without evaluating code', () => {
  assert.equal(gradeAnswer(bank.find(question => question.id === 'decimal-1')!, '0,0144').outcome, 'correct')
  assert.equal(gradeAnswer(bank.find(question => question.id === 'fraction-1')!, '-4/6').outcome, 'correct')
  for (const input of ['1/0', 'alert(1)', 'NaN', 'Infinity', '-25 trailing', '']) assert.equal(gradeAnswer(item, input).outcome, 'review')
})
test('sign and prime omissions are classified separately', () => {
  assert.equal(gradeAnswer(item, '25').category, 'sign')
  const prime = bank.find(question => question.kind === 'prime')!
  assert.equal(gradeAnswer(prime, 'C').outcome, 'notation')
  assert.equal(gradeAnswer(prime, 'C\u2032').outcome, 'correct')
})
test('open explanations always require human review, including reference text', () => {
  const open = bank.find(question => question.kind === 'explanation')!
  assert.equal(gradeAnswer(open, open.answer).outcome, 'review')
  assert.equal(gradeAnswer(open, '180 O not correct').outcome, 'review')
})
test('first answer remains independent and retries never replace it', () => {
  const first = makeEvent(session, item, [], 'answer', '25')
  const hint = makeEvent(session, item, [first], 'hint')
  const retry = makeEvent(session, item, [first, hint], 'answer', '-25')
  assert.equal(first.independent, true)
  assert.equal(first.response, '25')
  assert.equal(retry.independent, false)
  assert.equal(skillEvidence(item.skill, [first, hint, retry]).successes, 0)
})
test('a hint before the first answer prevents independent credit', () => {
  const hint = makeEvent(session, item, [], 'hint')
  assert.equal(makeEvent(session, item, [hint], 'answer', '-25').independent, false)
})
test('mastery needs three distinct Brussels dates and three recent independent successes', () => {
  const events: LearningEvent[] = [1, 2, 3].map(day => makeEvent({ ...session, id: `session-${day}` }, item, [], 'answer', '-25', '', new Date(`2026-10-0${day}T15:00:00Z`)))
  assert.equal(skillEvidence(item.skill, events.slice(0, 1)).state, 'In ontwikkeling')
  assert.equal(skillEvidence(item.skill, events).state, 'Zelfstandig bevestigd')
  assert.equal(skillEvidence(item.skill, events.map(event => ({ ...event, at: events[0].at }))).state, 'In ontwikkeling')
})
test('selection interleaves topics, includes writing and changes after practice', () => {
  const now = new Date('2026-10-27T15:00:00Z')
  const original = selectItems([], now)
  const practiced = original.map(id => makeEvent(session, bank.find(question => question.id === id)!, [], 'answer', bank.find(question => question.id === id)!.answer, '', now))
  assert.equal(new Set(original).size, 6)
  assert.ok(original.every(id => bank.find(question => question.id === id)!.purpose === 'practice'))
  assert.equal(new Set(original.map(id => bank.find(question => question.id === id)!.topic)).size, 4)
  assert.ok(original.some(id => bank.find(question => question.id === id)!.kind === 'explanation'))
  assert.notDeepEqual(selectItems(practiced, now), original)
})
test('daily practice matches assessment level rather than mostly elementary probes', () => {
  const selected = selectItems([], new Date('2026-10-27T15:00:00Z')).map(id => bank.find(question => question.id === id)!)
  assert.ok(selected.filter(question => question.difficulty >= 2).length >= 4, 'At least four substantial items are required')
  assert.ok(selected.filter(question => question.topic === 'Lettervormen').length >= 2, 'Include two algebra tasks, not one coefficient probe')
  assert.ok(selected.filter(question => question.difficulty === 1).length <= 1, 'Elementary probes must not dominate daily practice')
})
test('polynomials accept term order and equivalent coefficients but distinguish unfinished simplification', () => {
  const polynomial = bank.find(question => question.id === 'polynomial-distribution-v2')!
  for (const response of ['-7a+2ba', '2*a*b-7*a', '2ab-14/2a']) assert.equal(gradeAnswer(polynomial, response).outcome, 'correct', response)
  for (const response of ['-7a-10ab', '2ab+7a', '2a-7b']) assert.equal(gradeAnswer(polynomial, response).outcome, 'incorrect', response)
  for (const response of ['3a-4ab+6ab-10a', 'a(2b-7)']) assert.equal(gradeAnswer(polynomial, response).outcome, 'notation', response)
  const fractions = bank.find(question => question.id === 'polynomial-fractions-v2')!
  assert.equal(gradeAnswer(fractions, '24 + 12b - 40/6a').outcome, 'correct')
  assert.equal(gradeAnswer({ ...polynomial, answer: 'a^2+a^3' }, 'a^2+a^3').outcome, 'correct')
})
test('symbolic grading rejects unsupported or unsafe constructs without asserting incorrect mathematics', () => {
  const polynomial = bank.find(question => question.kind === 'polynomial')!
  for (const response of ['import("fs")', 'a/a', '1/0', 'x^1000000', 'a=3', 'sqrt(a)', 'a'.repeat(300)]) assert.equal(gradeAnswer(polynomial, response).outcome, 'review', response)
})
test('equivalence checks the full authored polynomial calculation, not a sampled numeric value', () => {
  for (const id of ['polynomial-distribution-v2', 'polynomial-fractions-v2']) {
    const question = bank.find(candidate => candidate.id === id)!
    assert.equal(gradeAnswer({ ...question, collected: false }, question.expression).outcome, 'correct', id)
  }
  const identity = bank.find(question => question.id === 'missing-polynomial-v2')!
  assert.equal(gradeAnswer(identity, '4x-9k').outcome, 'correct')
  assert.equal(gradeAnswer(identity, '-9k-4x').outcome, 'incorrect')
})
test('multi-part geometry preserves correct vector components when only vertex order is wrong', () => {
  const question = bank.find(candidate => candidate.id === 'translation-correspondence-v2')!
  const result = gradeAnswer(question, JSON.stringify({ dx: '4', dy: '-3', vertices: 'GHI' }))
  assert.equal(result.outcome, 'notation')
  assert.deepEqual(result.parts?.map(part => part.outcome), ['correct', 'correct', 'incorrect'])
  const wrongVector = gradeAnswer(question, JSON.stringify({ dx: '-4', dy: '3', vertices: 'HIG' }))
  assert.equal(wrongVector.outcome, 'incorrect')
  assert.equal(wrongVector.parts?.at(-1)?.outcome, 'correct')
})
test('rotation coordinates and symbolic trapezium areas have independent geometric checks', () => {
  const rotation = bank.find(question => question.id === 'rotation-coordinates-v2')!
  const rotate = (horizontal: number, vertical: number) => [vertical, -horizontal]
  const [bx, by] = rotate(5, 1)
  const [cx, cy] = rotate(3, 4)
  assert.equal(gradeAnswer(rotation, JSON.stringify({ angle: '-90', bx: String(bx), by: String(by), cx: String(cx), cy: String(cy) })).outcome, 'correct')
  const area = bank.find(question => question.id === 'trapezium-symbolic-v2')!
  assert.equal(gradeAnswer(area, JSON.stringify({ formula: '(B*h+b*h)/2', area: '16c+4bc+16ac' })).outcome, 'correct')
  assert.equal(gradeAnswer(area, JSON.stringify({ formula: 'B*h', area: '16c+4bc+16ac' })).outcome, 'incorrect')
  assert.equal(gradeAnswer({ ...area, kind: 'polynomial', answer: area.fields![1].answer, collected: false }, '((3a)+(a+b+4))*8c/2').outcome, 'correct')
})
test('a correct value in the wrong requested fraction form is not an arithmetic failure', () => {
  const question = bank.find(candidate => candidate.id === 'mixed-fractions-v2')!
  assert.equal(gradeAnswer(question, '22/8').outcome, 'notation')
  assert.equal(gradeAnswer(question, '2,75').outcome, 'notation')
  assert.equal(gradeAnswer(question, '-11/4').category, 'sign')
})
test('every authored mathematical display renders without invalid escape characters', () => {
  for (const question of bank.filter(question => question.tex)) {
    assert.ok(!/[\u0000-\u001f]/.test(question.tex!), question.id)
    assert.ok(renderToString(question.tex!, { throwOnError: true, trust: false }).includes('katex'), question.id)
  }
})
test('every assessment exercise has small purposeful checkpoints with verified answers', () => {
  for (const question of bank.filter(question => question.purpose === 'practice')) {
    assert.ok(question.checkpoints && question.checkpoints.length >= 2 && question.checkpoints.length <= 3, question.id)
    for (const step of question.checkpoints!) assert.equal(gradeCheckpoint(question, step.id, step.answer).outcome, 'correct', `${question.id}:${step.id}`)
  }
})
test('step drafts require meaningful parts rather than just any text in a working box', () => {
  const question = bank.find(candidate => candidate.id === 'mixed-fractions-v2')!
  const draft = { response: '11/4', working: '', steps: { quotient: '3/4' } }
  assert.equal(missingWorking(question, draft), 'product')
  const complete = { ...draft, steps: { quotient: '3/4', product: '-1/2' } }
  assert.equal(missingWorking(question, complete), null)
  assert.ok(workingText(question, complete).includes('Het getekende product: -1/2'))
  assert.equal(missingWorking(question, { ...draft, workingMode: 'own', working: '3 - 3/4 + 1/2 = 11/4' }), null)
})
test('checking a step records the original response and prevents an inflated independent final success', () => {
  const question = bank.find(candidate => candidate.id === 'mixed-fractions-v2')!
  const first = makeEvent(session, question, [], 'checkpoint', '1/2', 'De deling: 1/2', new Date(), 'quotient')
  const retry = makeEvent(session, question, [first], 'checkpoint', '3/4', 'De deling: 3/4', new Date(), 'quotient')
  const final = makeEvent(session, question, [first, retry], 'answer', '11/4', '3 - 3/4 + 1/2')
  assert.equal(first.response, '1/2')
  assert.equal(first.checkpointId, 'quotient')
  assert.equal(first.grade?.outcome, 'incorrect')
  assert.equal(retry.grade?.outcome, 'correct')
  assert.equal(final.independent, false)
  assert.equal(skillEvidence(question.skill, [first, retry, final]).successes, 0)
  assert.equal(skillEvidence(question.skill, [first, retry, final]).assisted, 1)
  assert.equal(makeEvent(session, question, [], 'answer', '11/4', 'Eigen tussenstappen').independent, true)
})
test('a sign slip in a step gets targeted feedback without replacing the final-answer grade', () => {
  const question = bank.find(candidate => candidate.id === 'mixed-fractions-v2')!
  const result = gradeCheckpoint(question, 'product', '1/2')
  assert.equal(result.category, 'sign')
  assert.ok(result.feedback.includes('product'))
  assert.equal(gradeAnswer(question, '11/4').outcome, 'correct')
  assert.equal(gradeCheckpoint(question, 'not-a-step', '1').outcome, 'review')
})
test('checkpoint drafts survive JSON storage without losing earlier free-form working', () => {
  const draft = { response: '2ab-7a', working: 'Mijn eerdere uitwerking', steps: { 'expand-first': '3a-4ab' }, workingMode: 'guided' as const }
  assert.deepEqual(JSON.parse(JSON.stringify(draft)), draft)
  const question = bank.find(candidate => candidate.id === 'polynomial-distribution-v2')!
  assert.ok(workingText(question, draft).includes('Mijn eerdere uitwerking'))
  assert.ok(workingText(question, draft).includes('3a-4ab'))
})
test('like-term marking preserves signs, groups all matches and gates both working modes', async () => {
  const { signedTerms, gradeTermSelection, termMarkingState } = await import('./learning.ts')
  const question = bank.find(candidate => candidate.id === 'polynomial-distribution-v2')!
  const draft = { response: '2ab-7a', working: '', steps: { 'expand-first': '3a-4ab', 'expand-second': '6ab-10a' } }
  const state = termMarkingState(question, draft)
  assert.equal(state.ready, true)
  assert.equal(missingWorking(question, draft), 'like-terms')
  assert.equal(missingWorking(question, { ...draft, workingMode: 'own', working: 'Mijn aanpak' }), 'like-terms')
  assert.deepEqual(state.terms.map(term => term.expression.replace(/[()*\s]/g, '')), ['+3a', '-4ab', '+6ab', '-10a'])
  assert.equal(gradeTermSelection(state.terms, ['term-0', 'term-1']).outcome, 'incorrect')
  assert.equal(gradeTermSelection(state.terms, ['term-0', 'term-3']).outcome, 'correct')
  const complete = { ...draft, termMarking: { source: state.source, selected: [], groups: [['term-0', 'term-3'], ['term-1', 'term-2']] } }
  assert.equal(termMarkingState(question, complete).complete, true)
  assert.equal(missingWorking(question, complete), null)
  assert.equal(termMarkingState(question, { ...complete, steps: { ...draft.steps, 'expand-first': '3a+4ab' } }).complete, false)
  assert.equal(gradeTermSelection(signedTerms('a^2+2a+3a^2+4a'), ['term-0', 'term-1']).outcome, 'incorrect')
  assert.equal(gradeTermSelection(signedTerms('a+2a+3a'), ['term-0', 'term-1']).outcome, 'incorrect')
})
test('all configured like-term gates require every repeated group and leave singleton terms alone', async () => {
  const { termMarkingState } = await import('./learning.ts')
  const steps = { 'expand-first': '3a-4ab', 'expand-second': '6ab-10a', expanded: '7b+(4/3)a+24-2a+5b-6a' }
  for (const question of bank.filter(candidate => candidate.likeTerms)) {
    const draft = { response: '', working: '', steps }
    const state = termMarkingState(question, draft)
    assert.equal(state.ready, true, question.id)
    assert.equal(state.complete, false, question.id)
    const keys = [...new Set(state.terms.map(term => term.key))]
    const groups = keys.map(key => state.terms.filter(term => term.key === key).map(term => term.id)).filter(group => group.length > 1)
    const complete = { ...draft, termMarking: { source: state.source, selected: [], groups } }
    assert.equal(termMarkingState(question, complete).complete, true, question.id)
    assert.ok(workingText(question, complete).includes('Gelijksoortige termen:'), question.id)
    if (groups.length > 1) assert.equal(termMarkingState(question, { ...complete, termMarking: { ...complete.termMarking, groups: groups.slice(0, 1) } }).complete, false, question.id)
  }
})
test('own-method grouping cannot be skipped or reused after changing the expanded line', async () => {
  const { termMarkingState } = await import('./learning.ts')
  const question = bank.find(candidate => candidate.id === 'polynomial-distribution-v2')!
  const draft = { response: '2ab-7a', working: 'Mijn eigen methode', workingMode: 'own' as const, markingExpression: '3a-4ab+6ba-10a' }
  const state = termMarkingState(question, draft)
  const complete = { ...draft, termMarking: { source: state.source, selected: [], groups: [['term-0', 'term-3'], ['term-1', 'term-2']] } }
  assert.equal(missingWorking(question, draft), 'like-terms')
  assert.equal(missingWorking(question, complete), null)
  assert.equal(missingWorking(question, { ...complete, markingExpression: '3a+4ab+6ba-10a' }), 'like-terms')
  assert.equal(termMarkingState(question, { ...draft, markingExpression: '2ab-7a' }).ready, false)
  assert.equal(termMarkingState(question, { ...draft, markingExpression: 'a(2b-7)' }).ready, false)
})
test('term groups distinguish powers, accept reordered letter parts and recognize constants', async () => {
  const { signedTerms, gradeTermSelection, makeGroupingEvent } = await import('./learning.ts')
  const terms = signedTerms('a^2+2ba+3a^2+4ab+5-2')
  assert.equal(gradeTermSelection(terms, ['term-0', 'term-2']).outcome, 'correct')
  assert.equal(gradeTermSelection(terms, ['term-1', 'term-3']).outcome, 'correct')
  assert.equal(gradeTermSelection(terms, ['term-4', 'term-5']).outcome, 'correct')
  assert.equal(gradeTermSelection(terms, ['term-1', 'term-1']).outcome, 'incorrect')
  assert.equal(gradeTermSelection(terms, ['term-1', 'unknown']).outcome, 'incorrect')
  const question = bank.find(candidate => candidate.id === 'polynomial-distribution-v2')!
  const draft = { response: '', working: '', steps: { 'expand-first': '3a-4ab', 'expand-second': '6ab-10a' } }
  const first = makeGroupingEvent(session, question, [], draft, ['term-0', 'term-1'])
  const retry = makeGroupingEvent(session, question, [first], draft, ['term-0', 'term-3'])
  assert.equal(first.grade?.outcome, 'incorrect')
  assert.equal(retry.grade?.outcome, 'correct')
  assert.ok(first.response.includes('-'))
  assert.ok(first.groupingSource?.includes('3a-4ab'))
  const final = makeEvent(session, question, [first, retry], 'answer', '2ab-7a', 'Mijn uitwerking')
  assert.equal(final.independent, false)
  assert.equal(skillEvidence(question.skill, [first, retry, final]).successes, 0)
})
test('evening reminders are conditional and use stable deduplication keys', () => {
  const now = new Date('2026-10-27T19:15:00Z')
  assert.ok(reminderPlan(now, false, preferences).some(job => job.channel === 'push'))
  assert.deepEqual(reminderPlan(now, true, preferences).map(job => job.recipient), ['parent'])
  assert.deepEqual(reminderPlan(now, true, preferences, ['2026-10-27:completion']), [])
  assert.equal(reminderPlan(now, false, { ...preferences, pushPermission: 'denied' }).at(-1)?.channel, 'email-fallback')
  assert.deepEqual(reminderPlan(now, false, { ...preferences, enabled: false }), [])
})
test('summer, winter and DST transition times follow Europe/Brussels', () => {
  assert.equal(reminderPlan(new Date('2026-07-01T14:00:00Z'), false, preferences)[0]?.channel, 'email')
  assert.equal(reminderPlan(new Date('2026-12-01T15:00:00Z'), false, preferences)[0]?.channel, 'email')
  assert.equal(reminderPlan(new Date('2026-03-29T18:14:00Z'), false, preferences).length, 1)
  assert.equal(reminderPlan(new Date('2026-03-29T18:15:00Z'), false, preferences).length, 2)
  assert.equal(reminderPlan(new Date('2026-10-25T19:15:00Z'), false, preferences).length, 2)
  assert.equal(brusselsDate(new Date('2026-07-01T22:30:00Z')), '2026-07-02')
})