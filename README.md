# Matti

A mobile-first mathematics practice website for a student and parent.

**Current status: working local prototype, not a private production service.**
The Dutch interface has six-question mixed sessions, deterministic structured
grading, written explanations flagged for human review, hints, retries, saved
drafts, a parent evidence view, and a reminder simulator. It contains twelve
assessment-level practice items plus twelve retained short diagnostic probes,
informed by the supplied analysis packages. Daily sessions use the assessment
items, not the elementary probes. It does not
contain the student's historical marks or original schoolwork.

## Framework and Hosting

React + TypeScript + Vite is a good fit: the interface compiles to static files,
works on mobile and desktop, and does not require a web server with Node in
production. A native app or server-rendered framework would add little here.
Fonts are served locally; there are no analytics, external image requests,
AI services, or third-party embeds in the prototype.

**GitHub Pages can host the interface, but cannot provide the private service
on its own.** A private GitHub repository does not normally make its Pages
website private. Pages cannot run a database, enforce student/parent permissions,
or reliably send scheduled email and push notifications. An account switch in
the browser is not access control.

Recommended production architecture: keep the Vite frontend on Pages, add an
EU-region Supabase project for invite-only authentication, PostgreSQL and
row-level security, and use server-side functions for grading and delivery.
An EU-compatible transactional email provider and optional Web Push complete
the service. Backend setup is not implemented or connected in this prototype.
If the entire website must be inaccessible without authentication, use a host
with an access gateway instead of ordinary Pages hosting.

## Run Locally

Use Node 22.18+ or Node 24 LTS and npm. Node 25.9 also ran the checks during
development. From the repository root:

```powershell
cd web
npm install
npm test
npm run build
npm run dev
```

Open the URL Vite prints. The usual URL is http://127.0.0.1:5173/.

On this machine the existing Node ZIP is nested one level deeper than its
outer directory. To make it available in a new PowerShell terminal:

```powershell
$env:Path = 'C:\Users\U981526\DevWorks\node-v25.9.0-win-x64\node-v25.9.0-win-x64;' + $env:Path
```

The development environment initially lacked Node on PATH. Dependencies were
installed with `npm install --ignore-scripts`, followed by direct compiler and
Vite runs, which succeeded. Normal installation with Node on PATH is preferred.

## Try the Learning Loop

1. Choose **Leerling**, then **Start je sessie**. The first question combines
  fraction division, a negative product and subtraction. Under **Tussenstappen**,
  enter the division result and the signed product before combining them.
  **Controleer stap** gives targeted feedback without displaying the solution;
  the reduced answer is `11/4`. The value `22/8` is mathematically equivalent
  but marked as unfinished fraction simplification, not a calculation failure.
2. Pause or reload. Resume the session: drafts, working, submitted answers and
   hint exposure remain in this browser.
3. Expand and simplify `1/2(6a-8ab)-2a(-3b+5)`. The full answer `2ab-7a`
  is accepted, as is `-7a+2ba`. `a(2b-7)` is equivalent but not expanded.
  The two checkpoints ask for each signed product separately before collecting
  like terms. Tap the whole signed terms `+3a` and `-10a`, then confirm their
  group. Do the same for `-4ab` and `+6ab`. Matching terms become underlined
  with the same group number; the final answer stays disabled until both groups
  are complete. **Eigen aanpak** provides an open working area for another valid
  method, but still requires marking a supplied expanded line before continuing.
  Switching modes preserves both drafts. Corrections after feedback
  remain assisted, not independent successes.
4. Determine the signed rotation angle and four image coordinates: `-90`,
  `1`, `-5`, `4`, `-3`. Each part is checked separately. Then simplify the
  fractional-coefficient polynomial to `12b-(20/3)a+24`.
5. Apply the trapezium formula to symbolic lengths: use `(B+b)*h/2` for
  the general formula and `16ac+4bc+16c` for the simplified area. Finally,
  write a complete interpretation of the supplied rotation notation, including
  endpoint correspondence. That explanation remains pending human review.
6. Choose **Ouder**, then **Antwoorden** to inspect the separate events.
   This is a demo view switch, not a separate authenticated account.
7. In **Instellingen**, simulate incomplete/complete sessions and push-permission
   failures. These controls do not send email or phone notifications.

Settings also export JSON and delete local demo data with confirmation.
There is deliberately no invented progress, historical diagnosis, or daily grade.
Existing elementary sessions and their evidence are retained. The revised set
can be started today without clearing that history; old sessions are not resumed
as the current assessment-level daily session.

## Learning Rules

- Six items mix all four provisional topic groups: one compound numerical
  calculation, two algebra questions, one transformation task, one symbolic
  application and one written explanation. Workload targets approximately
  15 minutes without a time limit and still needs testing with the student.
  Elementary probes are retained for diagnostic reference, not selected as
  routine daily practice. Difficulty labels reflect task structure, not merely
  larger numbers. Regression tests enforce the more substantial session mix.
- Selection prioritizes unseen items and overdue review. Developing skills have
  a one-day review interval, independent successes three days, and confirmed
  skills seven days. It selects again when a new day's session is created, not
  after each submitted answer. A saved session keeps its original question list.
- Independent means the first submitted answer to that item in that session,
  before any group confirmation, step check, hint, solution or earlier answer feedback. Merely writing
  steps does not count as asking for feedback. Every event is appended; original
  intermediate answers, final responses and working are never overwritten by
  retries. Step successes do not count as independent final-answer mastery.
- Provisional confirmation requires three most recent independent successes
  across at least three Brussels calendar dates. It is not proof of transfer or
  full curriculum mastery. Explanations pending review cannot earn confirmation.
- Numbers and simple fractions accept decimal commas and equivalent values.
  When a reduced fraction is explicitly requested, an equivalent decimal or
  unreduced fraction is classified as unfinished notation, not wrong arithmetic.
- Full polynomial answers use **mathjs** symbolic equivalence, not string equality
  or a single numeric substitution. Term order, implicit multiplication and
  equivalent coefficients are supported. Expansion/collection completeness is
  checked separately. Input is bounded to simple polynomials with constant
  nonzero denominators and small nonnegative integer powers. Unsupported syntax
  goes to review. Functions, assignments and variable denominators are rejected;
  this is not an unrestricted computer algebra console. No `eval` is used.
- Formula and transformation tasks store structured answer parts and their
  outcomes separately. Correct vector components are preserved when only the
  order of the image triangle's vertices is wrong. **KaTeX** renders authored
  fractions, exponents, brackets and transformation notation.
- Each assessment exercise offers two or three purposeful intermediate steps
  before the final answer: subcalculations, signed expansions, transformation
  rules, formula ingredients or interpretation parameters. Enter each step or
  choose **Eigen aanpak** to write a different method. Correctness checks are
  optional and apply only to the named intermediate value, not to an entire
  derivation. A step need not be checked or correct to submit the final answer.
  This supports trying a method and discussing an error without a compulsory
  hint or a rigid correctness gate for calculation checkpoints. Like-term
  identification is a required recognition gate as described below.
- Exercises that collect or compare like terms require marking complete signed
  terms first. Tap or use the keyboard to select all terms with the same letter
  part and exponents, then confirm the group. Incomplete groups or unlike terms
  do not unlock progression. Constants form their own type; singleton terms
  need no group. Confirmed groups use underlines, color and group numbers.
  Signs stay attached to their terms throughout selection.
- For bracketed polynomials the marking uses the student's own expansions,
  not a revealed model solution. Expansion checkpoints remain available, but
  later coefficient calculations and final answers wait until grouping is
  complete. The own-method workspace cannot bypass this requirement. Changing
  the expression invalidates the old groups. Confirmed groups and in-progress
  selections survive reload. Existing already-answered exercises are not
  retroactively blocked or regraded.
- Each group confirmation records the original selected signed terms, source,
  outcome and working snapshot in a separate `grouping` event. Parent
  **Antwoorden** shows incorrect selections and later corrections separately.
  Grouping results are recognition practice, not independent final-answer
  mastery. The final answer after this required feedback is marked assisted.
- Step drafts and the selected mode resume after reload. Each requested check
  saves its original response, feedback and working snapshot separately.
  Parent **Antwoorden** shows step checks alongside final answers. Specific
  encouragement acknowledges an actually checked correction, not just activity.
  Existing free-form working opens in **Eigen aanpak** rather than being erased.
- Open working and explanations remain for human review. A correct checkpoint
  or final answer does not prove a correct complete method. The app does not
  infer a misconception from one arithmetic
  error or attempt to infer attention, motivation or mental health.

## Source Review

All ten supplied files in `assets` were read. The master specification takes
precedence over supporting packages, including the longer exam simulations
proposed in SB5/SB6: those remain outside V1. SB packages guide diagnostics, not
the complete syllabus. Post-feedback corrections are not baseline mastery.
Missing primes, labels and vertex order are distinct from geometric concepts;
SB6 is positive practical evidence, with the half-point deduction unknown.

The exercise bank has source/objective/subtype/difficulty fields. Chapter
references repeated from SB4 are marked indirect and unverified. No unseen
textbook pages, official learning objectives, answer keys or original student
responses are presented as verified curriculum content.

### Missing Material

- All referenced Delta Nova textbook chapters, their **Studiewijzer** objective
  pages, and any answer/correction keys. In particular Chapter 2
  **Transformaties en symmetrie**, referenced by SB4 at printed pages 58-65,
  is not actually attached here. The other chapter titles/range are unknown.
- Original marked assessment photographs for SB1-SB6. SB3 specifically references
  `IMG_1975(1).jpeg`, `IMG_1976(1).jpeg`, `IMG_1987.jpeg`, `IMG_1988.jpeg`;
  none is in the workspace.
- The GeoGebra construction/export file for SB6 and its original marking sheet.
- Evidence needed to resolve SB1 N's printed expression; SB2 exercise 3.2,
  exercise 2c's expected answer and simplification question 4; SB3 part 2.1,
  the fraction/variable handwriting in part 2.3 and exponent glyph in part 2.4.

Keep these private. Do not upload copyrighted textbook scans or identifiable
schoolwork into Pages or a public source repository.

## Pages Deployment

The included GitHub Actions workflow is **manual**, so creating files does not
publish anything. Create/connect a private repository yourself, review what is
tracked, enable **Settings > Pages > Source: GitHub Actions**, then run
**Deploy demo to GitHub Pages** from Actions. Plan/account restrictions may
affect Pages availability for private repositories.

Only `web/dist` is published. Relative Vite asset paths support project URLs
such as `https://OWNER.github.io/mattiapp/`. Navigation currently stays within
the page, avoiding static-host route fallback issues. Tests and typechecking
run before deployment. No deployment has been performed by the assistant.

The root ignore file excludes `assets`, environment files, dependencies and
build output. **Ignore rules do not remove files already tracked by Git.**
Check the tracked file list before your first push. The public bundle contains
only original generic practice examples and indirect source tags, not raw
diagnostic files, learner scores, names or contact details.

## Production Plan and Release Gates

See [docs/architecture.md](docs/architecture.md) for the private data model,
notification design and content-review workflow.

| Requirement | Prototype | Production gate |
| --- | --- | --- |
| Mobile mixed session and concise feedback | Implemented | Tune workload with student |
| Independent/hint/retry evidence | Implemented locally | Server-authoritative append-only events |
| Resumption | Same-browser only | Authenticated cross-device persistence |
| Student/parent views | Unprotected demo switch | Invite-only accounts and tested RLS |
| Curriculum mapping | Provisional source tags | Read and review textbook objectives |
| Dutch written responses | Saved, flagged for review | Authorized reviewer workflow |
| Geometry | Notation example and diagrams | Reviewed construction tasks and parameters |
| GeoGebra | Listed as pending | Practical task integration; never fake file inspection |
| Adaptive selection | Deterministic daily rule | More reviewed variants and spaced-transfer validation |
| Reminders and completion alert | Tested decision logic and simulator | Backend outbox, real providers, devices and recipients |
| PWA, installation and offline use | Not implemented | Device-specific testing and private cache policy |

Do not use the local demo to hold sensitive information. Browser storage is not
encrypted, expires if cleared, and is readable by anyone using this browser
profile. It is not suitable for a shared school computer. No live accounts,
database, notification sender, service worker, secure session links or scheduled
jobs are present. This is **not the completed V1** from the master specification.

To move into private deployment, supply the textbook material, select a backend
host/region, confirm phone OS/browser and fallback preference, and configure
student/parent recipients and sender-domain verification through provider
dashboards. Never put service keys or private contact data in frontend variables
or chat. A PWA install alone will not solve authentication or scheduling.