import type { Item, SignTraining } from './learning.ts'

const minusRule = 'Een minteken voor haakjes betekent vermenigvuldigen met -1: elk teken binnen de haakjes verandert. -(u-v) = -u+v.'
const minusExample = 'Neem u=5 en v=2: -(5-2)=-3, maar -5-2=-7. De twee uitdrukkingen kunnen dus niet gelijkwaardig zijn.'
const productRule = 'Het product van twee negatieve factoren is positief. Vermenigvuldig daarna de coefficienten en de letterdelen.'
const productExample = '(-3)*(-2)=6, niet -6. Controleer een algebraisch product door positieve waarden voor de letters in te vullen.'
const sumRule = 'Neem gelijksoortige termen samen door hun getekende coefficienten op te tellen, niet door alle absolute waarden op te tellen.'
const sumExample = '-7+12-3=2. Met ab=1 moet de herleide coefficient dezelfde uitkomst geven.'

function signItem(id: string, family: string, stage: 1 | 2 | 3, expression: string, answer: string, expanded: string, wrongExpanded: string, wrongAnswer: string, letter: string, coefficient: string, followUpId: string, rule: string, counterexample: string, group = true): Item {
  const support: SignTraining = { family, stage, followUpId, rule, counterexample, wrongAnswers: [wrongAnswer] }
  const objectives: Record<string, string> = { 'subtract-brackets': 'Een algebraische uitdrukking tussen haakjes aftrekken', 'negated-difference': 'Het tegengestelde van een verschil correct uitschrijven', 'negative-distribution': 'Een negatieve factor over alle termen verdelen', 'negative-products': 'Negatieve lettercoefficienten vermenigvuldigen', 'signed-like-terms': 'Positieve en negatieve gelijksoortige termen combineren', mixed: 'Tekenregels betrouwbaar toepassen in gemengde veeltermen' }
  return {
    id, purpose: 'practice', topic: 'Lettervormen', skill: `algebra.signs.${family}`, objective: objectives[family], subtype: 'execution', chapter: '1.2-1.3 Lettervormen', source: 'Delta Nova H1: studiewijzer p.12, gelijksoortige termen p.19, haakjesregel p.22, distributiviteit p.28, samenvatting p.54-55; nieuw voorbeeld, prioriteit uit SB1-SB3 en eerste sessie', difficulty: stage === 3 ? 3 : 2,
    title: stage === 3 ? 'Werk uit en herleid' : stage === 2 ? 'Haakjes en coefficienten combineren' : 'Tekens door een bewerking volgen',
    prompt: stage === 3 ? 'Werk uit en herleid volledig. Schrijf een uitgewerkte regel en controleer dat elke term behouden is.' : 'Werk uit en herleid. Schrijf eerst de volledige uitdrukking zonder haakjes; houd de getekende termen nog apart.', expression, tex: expression.replaceAll('*', String.raw`\cdot `), kind: 'polynomial', answer, requireWorking: true, signTraining: support, confidencePrompt: stage === 1,
    checkpoints: [
      { id: 'expanded', label: 'Uitwerking zonder haakjes', prompt: 'Schrijf de volledige uitgewerkte regel. Laat gelijksoortige termen hier nog apart staan.', kind: 'polynomial', answer: expanded, collected: false, success: 'Deze uitgewerkte regel is gelijkwaardig aan de oorspronkelijke uitdrukking.', correction: 'Controleer de tekens bij de bewerking die de haakjes verwijdert.', signMistake: { wrongAnswers: [wrongExpanded], rule, counterexample } },
      { id: 'coefficient', label: `Coefficient van ${letter}`, prompt: `Neem de getekende coefficienten van ${letter} samen. Noteer alleen de coefficient.`, kind: 'number', answer: coefficient, success: `De samengenomen coefficient van ${letter} klopt.`, correction: 'Tel de coefficienten op met hun volledige teken.', signMistake: { wrongAnswers: [String(-Number(coefficient))], rule, counterexample } },
    ],
    likeTerms: group ? { checkpointIds: ['expanded'], prompt: 'Markeer eerst alle gelijksoortige getekende termen in je eigen uitgewerkte regel.' } : undefined,
    hint: rule, solution: `${expression} = ${expanded} = ${answer}. ${rule}`, success: 'Je herleide einduitdrukking klopt, met alle gevraagde tekens.',
  }
}

export const signBank: Item[] = [
  signItem('sign-subtract-a', 'subtract-brackets', 1, '5a-(2a-3b)', '3a+3b', '5a-2a+3b', '5a-2a-3b', '3a-3b', 'a', '3', 'sign-subtract-x', minusRule, minusExample),
  signItem('sign-subtract-x', 'subtract-brackets', 1, '-3x-(4x-2y)', '-7x+2y', '-3x-4x+2y', '-3x-4x-2y', '-7x-2y', 'x', '-7', 'sign-subtract-fraction', minusRule, minusExample),
  signItem('sign-negate-a', 'negated-difference', 1, '-(a-b)', '-a+b', '-a+b', '-a-b', '-a-b', 'a', '-1', 'sign-negate-x', minusRule, minusExample, false),
  signItem('sign-negate-x', 'negated-difference', 1, '-(x-2y)', '-x+2y', '-x+2y', '-x-2y', '-x-2y', 'x', '-1', 'sign-mixed-fraction', minusRule, minusExample, false),
  signItem('sign-distribute-a', 'negative-distribution', 1, '-2(3a-4b)+5a', '-a+8b', '-6a+8b+5a', '-6a-8b+5a', '-a-8b', 'a', '-1', 'sign-distribute-x', minusRule, '(-2)*(-4)=8. Het tweede product wordt positief; alleen de eerste term negatief maken is geen distributie.'),
  signItem('sign-distribute-x', 'negative-distribution', 1, '-3(2x-5y)+4x', '-2x+15y', '-6x+15y+4x', '-6x-15y+4x', '-2x-15y', 'x', '-2', 'sign-mixed-x', minusRule, productExample),
  signItem('sign-product-a', 'negative-products', 1, '(-3a)*(-2b)-5ab', 'ab', '6ab-5ab', '-6ab-5ab', '-11ab', 'ab', '1', 'sign-product-x', productRule, productExample),
  signItem('sign-product-x', 'negative-products', 1, '(-4x)*(-3y)-7xy', '5xy', '12xy-7xy', '-12xy-7xy', '-19xy', 'xy', '5', 'sign-product-mixed', productRule, productExample),
  signItem('sign-like-a', 'signed-like-terms', 1, '-7ab+12ab-3ab', '2ab', '-7ab+12ab-3ab', '-7ab-12ab-3ab', '-22ab', 'ab', '2', 'sign-like-x', sumRule, sumExample),
  signItem('sign-like-x', 'signed-like-terms', 1, '-5xy+9xy-2xy', '2xy', '-5xy+9xy-2xy', '-5xy-9xy-2xy', '-16xy', 'xy', '2', 'sign-product-mixed', sumRule, '-5+9-2=2. Bij xy=1 moet je algebraische uitkomst dezelfde waarde geven.'),
  signItem('sign-subtract-fraction', 'subtract-brackets', 2, '4a-(1/2)(6a-8b)', 'a+4b', '4a-3a+4b', '4a-3a-4b', 'a-4b', 'a', '1', 'sign-mixed-fraction', minusRule, minusExample),
  signItem('sign-product-mixed', 'negative-products', 2, '-2a(-3b+4)-5ab+3a', 'ab-5a', '6ab-8a-5ab+3a', '-6ab-8a-5ab+3a', '-11ab-5a', 'a', '-5', 'sign-mixed-x', productRule, productExample),
  signItem('sign-mixed-fraction', 'mixed', 3, '-(3/4)(4a-8b)-2(a+b)+5a', '4b', '-3a+6b-2a-2b+5a', '-3a-6b-2a-2b+5a', '-8b', 'b', '4', 'sign-mixed-x', minusRule, minusExample),
  signItem('sign-mixed-x', 'mixed', 3, '-2(3x-4y)-(5x+2y)+7x', '-4x+6y', '-6x+8y-5x-2y+7x', '-6x-8y-5x-2y+7x', '-4x-10y', 'x', '-4', 'sign-mixed-fraction', minusRule, minusExample),
]