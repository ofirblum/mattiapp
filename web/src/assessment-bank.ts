import type { Checkpoint, Item, LikeTermPlan } from './learning.ts'

export const likeTermPlans: Record<string, LikeTermPlan> = {
  'polynomial-distribution-v2': { checkpointIds: ['expand-first', 'expand-second'], prompt: 'Werk eerst de twee producten uit. Groepeer daarna de gelijksoortige termen uit je eigen uitwerking, telkens samen met hun teken.' },
  'polynomial-fractions-v2': { checkpointIds: ['expanded'], prompt: 'Groepeer in je eigen uitgewerkte regel alle termen met hetzelfde letterdeel. Laat de constante apart staan.' },
  'missing-polynomial-v2': { expression: '17k-4x+8k', asList: true, prompt: 'Vergelijk deze termen uit de twee leden van de gelijkheid. Markeer de gelijksoortige termen. De lijst is geen nieuwe som: bij verplaatsen over het gelijkheidsteken moet je zelf de tekens verwerken.' },
  'trapezium-symbolic-v2': { expression: '3a+(a+b+4)', prompt: 'Markeer eerst de gelijksoortige termen in de som van de twee evenwijdige zijden, voordat je die som herleidt.' },
  'trapezium-symbolic-variant-v2': { expression: '2a+(3a+b+5)', prompt: 'Markeer eerst de gelijksoortige termen in de som van de twee evenwijdige zijden, voordat je die som herleidt.' },
  'algebra-explanation-v2': { expression: '3a-4ab+6ab-10a', prompt: 'Groepeer de gelijksoortige termen uit de middelste regel voordat je de fout in het herleiden verklaart.' },
  'coefficient-1': { expression: '-4ab+13ab', prompt: 'Markeer eerst de gelijksoortige termen, telkens samen met hun teken.' },
  'explanation-2': { expression: '3ab-5ab+3a', asList: true, prompt: 'Markeer de gelijksoortige termen in deze lijst voordat je je verklaring schrijft.' },
}

export const checkpointPlans: Record<string, Checkpoint[]> = {
  'mixed-fractions-v2': [
    { id: 'quotient', label: 'De deling', prompt: 'Bereken (5/6) : (10/9) afzonderlijk.', kind: 'number', answer: '3/4', success: 'De deling van de twee breuken klopt.', correction: 'Controleer of je door de tweede breuk deelt door met haar omgekeerde te vermenigvuldigen.' },
    { id: 'product', label: 'Het getekende product', prompt: 'Bereken (7/12) * (-6/7), inclusief het teken.', kind: 'number', answer: '-1/2', success: 'Het product en zijn teken kloppen. Bewaar ook het minteken dat ervoor staat in de oorspronkelijke opgave.', correction: 'Controleer de vereenvoudiging en het teken van het product zelf. Het minteken ervoor hoort bij de volgende bewerking.' },
  ],
  'powers-roots-v2': [
    { id: 'first-term', label: 'De eerste term', prompt: 'Bereken 2 * (7 / sqrt(16)).', kind: 'number', answer: '7/2', success: 'De eerste term is correct vereenvoudigd.', correction: 'Controleer eerst de vierkantswortel en werk daarna de vermenigvuldiging af.' },
    { id: 'second-term', label: 'De tweede term', prompt: 'Bereken (-15/3^2) * (sqrt(81)/5), met behoud van het teken.', kind: 'number', answer: '-3', success: 'De middelste term en zijn teken kloppen.', correction: 'Bereken de macht en de wortel voor je vermenigvuldigt. Houd de negatieve teller bij.' },
    { id: 'third-term', label: 'De derde term', prompt: 'Bereken (5/2) * (1/5 - 1)^2.', kind: 'number', answer: '8/5', success: 'De term met het kwadraat klopt.', correction: 'Werk eerst binnen de haakjes, kwadrateer de volledige breuk en vermenigvuldig daarna.' },
  ],
  'polynomial-distribution-v2': [
    { id: 'expand-first', label: 'Het eerste product', prompt: 'Werk alleen (1/2)(6a - 8ab) uit.', kind: 'polynomial', answer: '3a-4ab', success: 'Beide termen van het eerste product zijn correct uitgewerkt.', correction: 'Vermenigvuldig de factor met elke term tussen de haakjes, inclusief het teken.' },
    { id: 'expand-second', label: 'Het tweede getekende product', prompt: 'Werk alleen -2a(-3b + 5) uit, inclusief het minteken voor 2a.', kind: 'polynomial', answer: '6ab-10a', success: 'Beide termen en tekens van het tweede product kloppen.', correction: 'Neem -2a als volledige factor en vermenigvuldig die met beide termen tussen de haakjes.' },
  ],
  'polynomial-fractions-v2': [
    { id: 'expanded', label: 'Alle haakjes uitgewerkt', prompt: 'Schrijf de volledige uitdrukking zonder haakjes. Neem gelijksoortige termen nog niet noodzakelijk samen.', kind: 'polynomial', answer: '7b+(4/3)a+24-2a+5b-6a', collected: false, success: 'Je uitdrukking is gelijkwaardig aan de juiste expansie. Gelijksoortige termen mag je hier nog apart laten staan.', correction: 'Controleer elk teken na de distributies en neem ook de losse termen en de constante mee.' },
    { id: 'a-coefficient', label: 'De coefficient van a', prompt: 'Groepeer de getekende a-coefficienten uit je eigen uitwerking en bereken hun som.', kind: 'number', answer: '-20/3', success: 'De gecombineerde coefficient van a klopt.', correction: 'Breng de breuk en de gehele coefficienten op dezelfde noemer en tel met hun tekens op.' },
  ],
  'missing-polynomial-v2': [
    { id: 'k-coefficient', label: 'De ontbrekende k-coefficient', prompt: 'Welke coefficient van k hoort binnen de haakjes? Houd rekening met het minteken ervoor.', kind: 'number', answer: '-9', success: 'De k-coefficient binnen de haakjes klopt.', correction: 'Werk je voorgestelde k-term terug uit met het minteken voor de haakjes en vergelijk beide kanten.' },
    { id: 'x-coefficient', label: 'De ontbrekende x-coefficient', prompt: 'Bepaal op dezelfde manier de coefficient van x binnen de haakjes.', kind: 'number', answer: '4', success: 'De x-coefficient binnen de haakjes klopt.', correction: 'De x-term verandert van teken wanneer je de haakjes achter het minteken wegwerkt.' },
  ],
  'substitution-fractions-v2': [
    { id: 'quotient', label: 'De breukterm na invullen', prompt: 'Vul m en n in 2m/n in en bereken die term.', kind: 'number', answer: '3', success: 'De ingevulde breukterm klopt.', correction: 'Gebruik haakjes rond de negatieve waarden en controleer teller en noemer afzonderlijk.' },
    { id: 'signed-product', label: 'De tweede getekende term', prompt: 'Vul m en n in -(1/4)mn in en bereken de volledige term, inclusief het minteken ervoor.', kind: 'number', answer: '-3/2', success: 'Het product inclusief het voorafgaande minteken klopt.', correction: 'Bepaal eerst het teken van mn en verwerk daarna de volledige factor -1/4.' },
  ],
  'rotation-coordinates-v2': [
    { id: 'x-rule', label: 'Regel voor de nieuwe x-coordinaat', prompt: "Druk x' uit met x en/of y. Leid je regel af uit de gegeven rotatie van A naar A'.", kind: 'exact', answer: 'y', success: 'Je regel voor de nieuwe x-coordinaat klopt.', correction: 'Vergelijk de oude coordinaten van A met de nieuwe x-coordinaat van A\' en controleer de draairichting.' },
    { id: 'y-rule', label: 'Regel voor de nieuwe y-coordinaat', prompt: "Druk y' uit met x en/of y. Neem het teken mee.", kind: 'exact', answer: '-x', success: 'Je regel voor de nieuwe y-coordinaat klopt.', correction: 'Controleer welke oorspronkelijke coordinaat de nieuwe y-coordinaat wordt en of het teken verandert.' },
  ],
  'translation-correspondence-v2': [
    { id: 'image-a', label: 'Het beeld van A', prompt: 'Welk van de punten G, H en I is het beeld van A bij de translatie?', kind: 'exact', answer: 'H', success: 'De overeenkomst voor A klopt.', correction: 'Zoek een verplaatsing die dezelfde richting, zin en lengte heeft voor alle drie de punten.' },
    { id: 'image-b', label: 'Het beeld van B', prompt: 'Welk punt is met dezelfde verplaatsing het beeld van B?', kind: 'exact', answer: 'I', success: 'De overeenkomst voor B klopt.', correction: 'Gebruik precies dezelfde verplaatsing als voor A en controleer beide coordinaten.' },
  ],
  'trapezium-symbolic-v2': [
    { id: 'base-sum', label: 'De som van de evenwijdige zijden', prompt: 'Tel de twee gegeven evenwijdige zijden op en herleid die som.', kind: 'polynomial', answer: '4a+b+4', success: 'Je hebt beide evenwijdige zijden correct samengenomen.', correction: 'Neem beide gegeven lengtes volledig over en voeg alleen gelijksoortige termen samen.' },
    { id: 'height-factor', label: 'De hoogtefactor', prompt: 'Bereken de helft van de gegeven hoogte als lettervorm.', kind: 'polynomial', answer: '4c', success: 'De halve hoogte is correct vereenvoudigd.', correction: 'Deel de volledige gegeven hoogte door twee, met behoud van de letterfactor.' },
  ],
  'trapezium-symbolic-variant-v2': [
    { id: 'base-sum', label: 'De som van de evenwijdige zijden', prompt: 'Tel de twee gegeven evenwijdige zijden op en herleid die som.', kind: 'polynomial', answer: '5a+b+5', success: 'De som van de twee evenwijdige zijden klopt.', correction: 'Controleer of beide basislengtes volledig zijn meegenomen en voeg alleen gelijksoortige termen samen.' },
    { id: 'height-factor', label: 'De hoogtefactor', prompt: 'Bereken de helft van de gegeven hoogte als lettervorm.', kind: 'polynomial', answer: '3c', success: 'De halve hoogte is correct vereenvoudigd.', correction: 'Deel de volledige hoogte door twee en behoud de letterfactor.' },
  ],
  'rotation-language-v2': [
    { id: 'centre', label: 'Het centrum', prompt: 'Noteer alleen de naam van het rotatiecentrum uit de notatie.', kind: 'exact', answer: 'M', success: 'Je hebt het rotatiecentrum correct afgelezen.', correction: 'Kijk naar de centrumparameter in de index van de rotatie.' },
    { id: 'angle', label: 'De georienteerde hoek', prompt: 'Noteer de georienteerde hoek in graden als een getal met zijn teken.', kind: 'number', answer: '-120', success: 'De hoek en zijn teken kloppen.', correction: 'Neem de volledige hoekparameter over, inclusief het teken dat de draairichting bepaalt.' },
  ],
  'algebra-explanation-v2': [
    { id: 'transition', label: 'De eerste foute overgang', prompt: 'Nummer de gelijkheidstekens van links naar rechts. Bij welk nummer staat de eerste foute overgang?', kind: 'number', answer: '2', success: 'Je hebt de eerste foute overgang juist gelokaliseerd.', correction: 'Controleer eerst de distributies en daarna pas het samennemen van gelijksoortige termen.' },
    { id: 'ab-coefficient', label: 'De juiste coefficient van ab', prompt: 'Bereken de coefficient van ab door de getekende ab-termen in de middelste uitdrukking samen te nemen.', kind: 'number', answer: '2', success: 'De herstelde coefficient van ab klopt.', correction: 'Neem de tekens van de twee ab-coefficienten mee; tel niet alleen hun absolute waarden op.' },
  ],
}

export const assessmentBank: Item[] = [
  {
    id: 'mixed-fractions-v2', purpose: 'practice', topic: 'Getallen', skill: 'numbers.multistep.fractions', subtype: 'execution', objective: 'Bewerkingsvolgorde, deling en producten van getekende breuken combineren', chapter: null, source: 'SB1 G/O; nieuw voorbeeld met dezelfde bewerkingsstructuur', difficulty: 3,
    title: 'Samengestelde breukenbewerking', prompt: 'Bereken zonder rekenmachine. Schrijf je tussenstappen en geef het antwoord als volledig vereenvoudigde breuk.', expression: '3 - (5/6) : (10/9) - (7/12) * (-6/7)', tex: String.raw`3-\frac{5}{6}:\frac{10}{9}-\frac{7}{12}\cdot\left(-\frac{6}{7}\right)`, kind: 'number', answer: '11/4', answerFormat: 'reduced-fraction', requireWorking: true,
    hint: 'Bereken de deling en het product afzonderlijk. Houd het minteken voor het negatieve product bij het overschrijven.', solution: '(5/6):(10/9) = 3/4 en (7/12)(-6/7) = -1/2. Dus 3 - 3/4 - (-1/2) = 12/4 - 3/4 + 2/4 = 11/4.', success: 'Je eindwaarde en de vereenvoudigde breuk kloppen. Vergelijk ook je tussenstappen met de uitwerking.',
  },
  {
    id: 'powers-roots-v2', purpose: 'practice', topic: 'Getallen', skill: 'numbers.multistep.powers', subtype: 'execution', objective: 'Wortels, machten en getekende breuken in een samengestelde uitdrukking verwerken', chapter: null, source: 'SB1 P; nieuw voorbeeld met machten, wortels en breuken', difficulty: 3,
    title: 'Machten, wortels en tekens', prompt: 'Werk uit zonder rekenmachine. Schrijf je tussenstappen en geef een volledig vereenvoudigde breuk.', expression: '2*(7/sqrt(16)) + (-15/3^2)*(sqrt(81)/5) + (5/2)*(1/5-1)^2', tex: String.raw`2\cdot\frac{7}{\sqrt{16}}+\frac{-15}{3^2}\cdot\frac{\sqrt{81}}{5}+\frac{5}{2}\left(\frac15-1\right)^2`, kind: 'number', answer: '21/10', answerFormat: 'reduced-fraction', requireWorking: true,
    hint: 'Vereenvoudig eerst de wortels en de machten. Het kwadraat van de negatieve breuk is positief; de middelste term blijft negatief.', solution: '7/2 + (-15/9)(9/5) + (5/2)(-4/5)^2 = 7/2 - 3 + 8/5 = 35/10 - 30/10 + 16/10 = 21/10.', success: 'De samengestelde berekening heeft de juiste eindwaarde en breukvorm.',
  },
  {
    id: 'polynomial-distribution-v2', purpose: 'practice', topic: 'Lettervormen', skill: 'algebra.multistep.distribution', subtype: 'execution', objective: 'Distributiviteit en getekende coefficienten combineren bij veeltermen', chapter: null, source: 'SB3 2.2; nieuw analoog voorbeeld, geen onzekere transcriptie', difficulty: 2,
    title: 'Werk uit en herleid', prompt: 'Werk beide producten uit en herleid volledig. Schrijf de volledige veelterm, niet alleen een coefficient. Bewaar je tussenstappen.', expression: '1/2(6a - 8ab) - 2a(-3b + 5)', tex: String.raw`\frac12(6a-8ab)-2a(-3b+5)`, kind: 'polynomial', answer: '2ab-7a', requireWorking: true,
    hint: 'Werk eerst beide producten uit. Neem daarna de a-termen en ab-termen apart samen, telkens met hun teken.', solution: '3a - 4ab + 6ab - 10a = (3 - 10)a + (-4 + 6)ab = -7a + 2ab.', success: 'Je volledige veelterm is gelijkwaardig aan de oplossing en de gelijksoortige termen zijn samengenomen.',
  },
  {
    id: 'polynomial-fractions-v2', purpose: 'practice', topic: 'Lettervormen', skill: 'algebra.multistep.fraction_coefficients', subtype: 'execution', objective: 'Meerdere mintekens en breukcoefficienten in een veelterm verwerken', chapter: null, source: 'SB3 2.3; nieuw voorbeeld op vergelijkbaar niveau', difficulty: 3,
    title: 'Breukcoefficienten en haakjes', prompt: 'Werk uit en herleid zo kort mogelijk. Schrijf tussenstappen waarin elk oorspronkelijk deel herkenbaar blijft.', expression: '7b - 4(-1/3a - 6) - (2a - 5b) - 3(2a)', tex: String.raw`7b-4\left(-\frac13a-6\right)-(2a-5b)-3(2a)`, kind: 'polynomial', answer: '12b-(20/3)a+24', requireWorking: true,
    hint: 'De term -4(-6) is positief. Voor de a-termen moet je 4/3 - 2 - 6 berekenen.', solution: '7b + (4/3)a + 24 - 2a + 5b - 6a = 12b + (4/3 - 6/3 - 18/3)a + 24 = 12b - (20/3)a + 24.', success: 'Je hebt een gelijkwaardige herleide veelterm met de juiste breukcoefficient.',
  },
  {
    id: 'missing-polynomial-v2', purpose: 'practice', topic: 'Lettervormen', skill: 'algebra.identities.completion', subtype: 'execution', objective: 'Een ontbrekende veelterm bepalen en door terug invullen controleren', chapter: null, source: 'SB3 3.1 en SB2 3.3; nieuw voorbeeld', difficulty: 2,
    title: 'Vul de ontbrekende veelterm aan', prompt: 'Welke veelterm moet op de stippen staan zodat dit voor alle k en x klopt? Controleer je antwoord door de haakjes opnieuw uit te werken.', expression: '17k - 4x = 8k - (...)', tex: String.raw`17k-4x=8k-\left(\ldots\right)`, kind: 'polynomial', answer: '-9k+4x', requireWorking: true,
    hint: 'Het minteken voor de haakjes verandert beide tekens. Zoek eerst welke termen na dat minteken nodig zijn.', solution: 'De ontbrekende veelterm is -9k + 4x. Controle: 8k - (-9k + 4x) = 8k + 9k - 4x = 17k - 4x.', success: 'Je ontbrekende veelterm maakt de identiteit correct; de termvolgorde mag verschillen.',
  },
  {
    id: 'substitution-fractions-v2', purpose: 'practice', topic: 'Lettervormen', skill: 'algebra.substitution.complete', subtype: 'execution', objective: 'Negatieve waarden in een breukterm, product en constante invullen', chapter: null, source: 'SB2 substitutie en SB3 1; nieuw voorbeeld', difficulty: 2,
    title: 'Invullen zonder termen te verliezen', prompt: 'Bereken voor m = -3 en n = -2. Toon de ingevulde uitdrukking en geef een volledig vereenvoudigde breuk.', expression: '2m/n - (1/4)mn + 5', tex: String.raw`\frac{2m}{n}-\frac14mn+5\qquad(m=-3,\ n=-2)`, kind: 'number', answer: '13/2', answerFormat: 'reduced-fraction', requireWorking: true,
    hint: 'Zet elke negatieve waarde tussen haakjes. Neem ook de constante +5 over.', solution: '2(-3)/(-2) - (1/4)(-3)(-2) + 5 = 3 - 3/2 + 5 = 13/2.', success: 'Je substitutie heeft de juiste eindwaarde; de constante en het product zijn in het resultaat verwerkt.',
  },
  {
    id: 'rotation-coordinates-v2', purpose: 'practice', topic: 'Transformaties', skill: 'geometry.rotation.parameters', subtype: 'concept', objective: 'Een georienteerde rotatiehoek afleiden en meerdere beeldpunten bepalen', chapter: null, source: 'SB5 2.8 en 3.5; nieuw coordinatevoorbeeld zonder ongeziene diagrammen', difficulty: 3,
    title: 'Bepaal de rotatie en de beelden', prompt: "Een rotatie om O(0,0) beeldt A(2,1) af op A'(1,-2). Voor B(5,1) en C(3,4): bepaal de georienteerde hoek (-180 < hoek <= 180) en de coordinaten van B' en C'. Positieve hoeken zijn tegenwijzerzin. Licht je redenering toe bij je uitwerking.", expression: "A(2,1) -> A'(1,-2)", tex: String.raw`A(2,1)\longmapsto A'(1,-2)\quad\text{om }O(0,0)`, kind: 'compound', answer: '{"angle":"-90","bx":"1","by":"-5","cx":"4","cy":"-3"}', requireWorking: true,
    fields: [{ key: 'angle', label: 'Georienteerde hoek (graden)', kind: 'number', answer: '-90', category: 'concept' }, { key: 'bx', label: "x-coordinaat van B'", kind: 'number', answer: '1' }, { key: 'by', label: "y-coordinaat van B'", kind: 'number', answer: '-5' }, { key: 'cx', label: "x-coordinaat van C'", kind: 'number', answer: '4' }, { key: 'cy', label: "y-coordinaat van C'", kind: 'number', answer: '-3' }],
    hint: 'Vergelijk de vectoren OA en OA\'. Bij een kwartdraai in wijzerzin gaat (x,y) over in (y,-x).', solution: "De hoek is -90 graden: een kwartdraai in wijzerzin. De regel is (x,y) -> (y,-x). Dus B' = (1,-5) en C' = (4,-3).", success: 'De georienteerde hoek en alle gevraagde beeldcoordinaten kloppen.',
  },
  {
    id: 'translation-correspondence-v2', purpose: 'practice', topic: 'Transformaties', skill: 'geometry.translation.correspondence', subtype: 'concept', objective: 'Een schuifvector bepalen en hoekpuntvolgorde bij overeenkomst behouden', chapter: '2 (volgens SB4; nog te controleren)', source: 'SB4 2a en 4.7; nieuw coordinatevoorbeeld', difficulty: 2,
    title: 'Schuifvector en overeenkomst', prompt: 'Een translatie beeldt A(1,2), B(4,2), C(2,5) af op punten H(5,-1), I(8,-1), G(6,2). Geef de twee componenten van de schuifvector en de naam van de beelddriehoek in de volgorde die overeenkomt met ABC.', expression: 'ABC -> ...', tex: String.raw`\triangle ABC\longmapsto\triangle\ldots`, kind: 'compound', answer: '{"dx":"4","dy":"-3","vertices":"HIG"}', requireWorking: true,
    fields: [{ key: 'dx', label: 'Horizontale component', kind: 'number', answer: '4' }, { key: 'dy', label: 'Verticale component', kind: 'number', answer: '-3' }, { key: 'vertices', label: 'Hoekpunten beelddriehoek in volgorde', kind: 'exact', answer: 'HIG', category: 'notation' }],
    hint: 'Koppel overeenkomstige punten via dezelfde verplaatsing. De naam van het beeld begint met het beeld van A, daarna het beeld van B en dan dat van C.', solution: 'A -> H, B -> I en C -> G. Elke verplaatsing is (4,-3). Het beeld van driehoek ABC is daarom driehoek HIG, niet een willekeurige volgorde van G, H en I.', success: 'Je schuifvector en de volgorde van alle overeenkomstige hoekpunten zijn correct.',
  },
  {
    id: 'trapezium-symbolic-v2', purpose: 'practice', topic: 'Toepassen', skill: 'geometry.trapezium.symbolic', subtype: 'execution', objective: 'De trapeziumformule op symbolische zijden toepassen en algebraisch herleiden', chapter: null, source: 'SB3 4; nieuw symbolisch voorbeeld op hetzelfde toepassingsniveau', difficulty: 3,
    title: 'Oppervlakte met lettervormen', prompt: 'Een trapezium heeft evenwijdige zijden 3a en a+b+4, en hoogte 8c. Alle lengtes zijn positief en in cm. Geef eerst de algemene oppervlakteformule met B, b en h. Werk vervolgens de oppervlakte uit als een zo kort mogelijke veelterm in a, b en c (in cm2).', expression: 'B = a+b+4, b = 3a, h = 8c', tex: String.raw`B=a+b+4,\qquad b_{\text{basis}}=3a,\qquad h=8c`, kind: 'compound', answer: '{"formula":"(B+b)*h/2","area":"16ac+4bc+16c"}', requireWorking: true,
    fields: [{ key: 'formula', label: 'Algemene formule (B, b, h)', kind: 'polynomial', answer: '(B+b)*h/2', collected: false }, { key: 'area', label: 'Herleide oppervlakte (cm2)', kind: 'polynomial', answer: '16ac+4bc+16c' }],
    hint: 'Neem het gemiddelde van de evenwijdige zijden en vermenigvuldig met de hoogte. Gebruik de letter b in de algemene formule als basisnaam, niet als afzonderlijke term uit de gegeven lengte.', solution: 'Algemeen: A = (B+b)h/2. Invullen: ((a+b+4)+3a)8c/2 = (4a+b+4)4c = 16ac+4bc+16c cm2.', success: 'Je algemene formule en de volledig uitgewerkte symbolische oppervlakte zijn beide gelijkwaardig aan de oplossing.',
  },
  {
    id: 'trapezium-symbolic-variant-v2', purpose: 'practice', topic: 'Toepassen', skill: 'geometry.trapezium.symbolic', subtype: 'execution', objective: 'De trapeziumformule op symbolische zijden toepassen en algebraisch herleiden', chapter: null, source: 'SB3 4; tweede nieuw symbolisch oefenvoorbeeld', difficulty: 3,
    title: 'Van formule naar veelterm', prompt: 'Een trapezium heeft evenwijdige zijden 2a en 3a+b+5, en hoogte 6c. De lengtes zijn positief en in cm. Geef de algemene formule met B, b en h en herleid de oppervlakte volledig in a, b en c.', expression: 'Evenwijdige zijden: 2a en 3a+b+5; hoogte: 6c', tex: String.raw`2a,\quad 3a+b+5,\qquad h=6c`, kind: 'compound', answer: '{"formula":"(B+b)*h/2","area":"15ac+3bc+15c"}', requireWorking: true,
    fields: [{ key: 'formula', label: 'Algemene formule (B, b, h)', kind: 'polynomial', answer: '(B+b)*h/2', collected: false }, { key: 'area', label: 'Herleide oppervlakte (cm2)', kind: 'polynomial', answer: '15ac+3bc+15c' }],
    hint: 'Tel eerst beide evenwijdige zijden op. Neem daarna de helft van de hoogte als gemeenschappelijke factor.', solution: 'A = (B+b)h/2. Dus (2a+3a+b+5)6c/2 = (5a+b+5)3c = 15ac+3bc+15c cm2.', success: 'De algemene formule en de herleide veelterm kloppen beide.',
  },
  {
    id: 'rotation-language-v2', purpose: 'practice', topic: 'Transformaties', skill: 'geometry.rotation.explanation.complete', subtype: 'explanation', objective: 'Een rotatie van een lijnstuk volledig in woorden beschrijven met overeenkomst', chapter: null, source: 'SB5 1b; nieuwe formuleringstaak met alle rotatieparameters', difficulty: 2,
    title: 'Formuleer de volledige afbeelding', prompt: 'Beschrijf deze notatie in een volledige wiskundige zin. Benoem het oorspronkelijke voorwerp, het beeld, het centrum, de hoek, de draairichting en de overeenkomst van de eindpunten.', expression: 'r_(M,-120)([AB]) = [CD]', tex: String.raw`r_{(M,-120^{\circ})}([AB])=[CD]`, kind: 'explanation', answer: 'Het draaibeeld van het lijnstuk [AB] bij de rotatie om M over 120 graden in wijzerzin is het lijnstuk [CD]; A wordt afgebeeld op C en B op D.',
    hint: 'Een negatieve georienteerde hoek betekent wijzerzin. De volgorde in [AB] en [CD] legt de overeenkomst van de eindpunten vast.', solution: 'Het draaibeeld van het lijnstuk [AB] bij de rotatie om M over 120 graden in wijzerzin is het lijnstuk [CD]. Daarbij is C het beeld van A en D het beeld van B. Deze uitleg vraagt menselijke beoordeling.', success: '',
  },
  {
    id: 'algebra-explanation-v2', purpose: 'practice', topic: 'Lettervormen', skill: 'algebra.reasoning.error_analysis', subtype: 'explanation', objective: 'Een correcte distributie onderscheiden van een fout bij het samenvoegen van coefficienten', chapter: null, source: 'SB3 2.2 en SB2 signed-coefficient probes; nieuw uitgewerkt voorbeeld', difficulty: 3,
    title: 'Waar gaat de redenering mis?', prompt: 'Een leerling schrijft de onderstaande berekening. Wijs de eerste foute overgang aan, leg uit waarom die fout is en geef de correcte herleide veelterm. Zeg ook welke eerdere stap wel correct was.', expression: '(1/2)(6a-8ab)-2a(-3b+5) = 3a-4ab+6ab-10a = -7a-10ab', tex: String.raw`\begin{aligned}\frac12(6a-8ab)-2a(-3b+5)&=3a-4ab+6ab-10a\\&=-7a-10ab\end{aligned}`, kind: 'explanation', answer: 'De distributie in de eerste overgang is correct. De tweede overgang is fout: -4ab+6ab = 2ab, niet -10ab. De a-termen geven -7a. Het correcte resultaat is -7a+2ab.',
    hint: 'Controleer eerst de vier producten. Vergelijk daarna uitsluitend de coefficienten van hetzelfde letterdeel.', solution: 'De eerste expansie is correct. Bij het herleiden moet -4+6 = 2 worden gebruikt voor ab. De fout zit dus bij de getekende coefficienten, niet in de distributieve eigenschap. De juiste veelterm is -7a+2ab. Menselijke beoordeling van de uitleg blijft nodig.', success: '',
  },
]