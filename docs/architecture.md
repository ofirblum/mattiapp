# Implementation Decisions

## Scope and Authority

The master specification is authoritative. Supporting assessment packages contain
useful observations, uncertain transcriptions and conflicting later-stage ideas.
They are evidence about performance, not curriculum definitions or diagnoses.
The current app is a deliberately isolated local demo. The following architecture
is a proposal for the private service, not an already deployed infrastructure.

## Components

| Component | Choice | Responsibility |
| --- | --- | --- |
| Browser | React, TypeScript, Vite | Accessible Dutch UI and draft editing |
| Static hosting | GitHub Pages | Public application shell only |
| Identity | Supabase Auth, invite-only | Two separate accounts, no public registration |
| Private storage | Supabase PostgreSQL in an EU region | Sessions, evidence, memberships and preferences |
| Trusted application logic | Server-side functions | Role checks, immutable grading, completion and scheduling |
| Email | Transactional provider, to be selected | Daily student reminder and minimal parent alert |
| Phone | Standards-based Web Push | Conditional reminder after opt-in and device validation |

No native app or LLM service is necessary for the first release. Use the existing
bank as reviewed fixtures for engine development; replace provisional mappings
before claiming textbook coverage. Use a proven symbolic engine for broader
algebra, and GeoGebra or another established geometry engine for construction
tasks. Do not implement geometry correctness with visual guesses.

## Private Model

| Table | Important fields and invariants |
| --- | --- |
| households | ID, timezone, retention preference; one family initially |
| memberships | user ID, household ID, role `student` or `parent`; assigned only by trusted administration |
| sources | ID, private artifact reference, provenance, authority, uncertainty flags; never publicly served |
| chapters | textbook edition, verified chapter ID and title |
| objectives | chapter ID, original Dutch objective, page references, review status |
| skills | objective ID, subtype, stable taxonomy ID |
| items | ID, immutable version, objective/skill IDs, difficulty, source, solution, grader version, review state |
| sessions | student ID, Brussels local date, ordered item versions, status, timestamps; unique student/date |
| drafts | session/item IDs, response and working, revision number; owner-only upsert with optimistic locking |
| attempt_events | ID, student/session/item version, original response and working, event type, ordinal, help exposure, server timestamp, grader version and per-dimension outcome; append-only |
| reviews | attempt ID, authorized reviewer ID, decision, explanation, timestamp; supplements rather than replaces original grade |
| skill_state | Derived evidence summary, last independent result, due date, selection algorithm version; recomputable |
| notification_preferences | opted-in recipients, configurable local times, fallback, push subscription reference |
| notification_outbox | student/date/type unique key, intended channel, state, provider idempotency key, attempts, provider message ID |

Keep conceptual, execution, explanation, notation and fluency dimensions
separate. Missing evidence is not a failure. A notation-only result must not
lower conceptual geometry mastery. Current demo rows map only their own subtype;
they do not automatically assess every dimension in this proposed schema.

### Authorization and Security Gates

- Enable row-level security before exposing any table to the client. A student
  sees their own sessions and records; the parent sees only their linked
  student's evidence and preferences. Neither can set or edit their role.
- Test unauthenticated access, a student accessing parent-only operations,
  an unrelated authenticated user, guessed IDs and household boundary escapes.
- Grade and derive independent status on the server. Never accept client claims
  of mastery, correctness, timestamps, role, or notification eligibility.
- Allow draft editing but deny update/delete on original attempt events. Handle
  duplicate submissions with request IDs and transactional ordinal allocation.
- Parents should review ambiguous written responses through a separate
  authorized action. A visible model answer does not count as a human decision.
- Use short-lived standard authentication links and an allowlisted return URL
  including the Pages project path. Session links identify a day, not embed
  learner records or act as permanent shared passwords. Require sign-in when
  identity is absent. Consider school browser email-link restrictions.
- Keep database service-role keys, email keys and Web Push private keys on the
  server. Browser-visible project/publishable keys are not authorization.
- Provide sign-out, shared-device protection, deletion/export and a parent-agreed
  retention window before collecting real data. Minimize exact timings and
  remove needless identifiers. Do not persist private records in a public CDN
  or service-worker cache. Review provider processing terms and region.

Do not call production secure until these policies are actually implemented
and tested. The local demo intentionally has none of these account guarantees.

## Notifications

Run a backend scheduler each minute. Convert the current instant through
`Europe/Brussels`; do not hardcode a UTC offset or schedule using the child's
browser clock. Persist the intended local date and dispatch window. Backend
outages need a bounded catch-up policy, not days of stale reminders.

1. At the configured daily time (default 16:00), enqueue the student email
   with an authenticated return path to today's session. Suppress stale work.
2. At the evening time (default 20:15), check the server session. If unfinished,
   enqueue Web Push; link to resume if partly done. If completed, do not send.
3. On the first server-confirmed completion, transactionally enqueue the parent
   completion message. Include no scores, answers, topics or error details.
4. Enforce one logical message per student/date/type with a database unique
   constraint. Workers claim rows atomically. Recheck completion immediately
   before sending an evening reminder and cancel if finished.
5. Use provider-side idempotency keys and record acknowledgements. A database
   flag alone cannot guarantee exactly-once delivery if the worker crashes
   after a provider accepts a message. Reconcile ambiguous provider outcomes
   instead of blindly resending. Test retries and concurrent workers.

The pure prototype `reminderPlan` demonstrates date/time decisions and stable
keys, but it does not dispatch, atomically claim, persist delivery keys, close
send/completion races, or retry. Calling it after both deadlines returns both
eligible student messages when no delivery keys are supplied; it is not a
production cron implementation. Preferences in the UI are ephemeral simulation
values, not committed production recipient settings.

### Phone Prerequisites and Fallback

Confirm phone OS and browser before choosing a delivery promise. On supported
iPhones/iPads, Web Push requires a home-screen web app and permission obtained
from an explicit user interaction. Android and school browsers have different
support/permission constraints. Desktop permission is not phone permission.
Do not automatically prompt on page load or claim success from permission alone.

Email is a reasonable minimal fallback, but **is not equivalent to a phone push**.
If a guaranteed phone-channel fallback is required, discuss SMS or another
parent-approved channel with explicit consent and provider costs. Do not invent
email addresses, phone numbers or subscriptions. Delivery remains blocked on
sender-domain verification, configured recipients and real device opt-in.

Required integration tests before release: winter and summer deadlines, both DST
changes, unfinished/partial/completed sessions, completion racing a reminder,
duplicate completion calls, repeat cron ticks, concurrent workers, provider
timeouts, retries after acceptance, revoked/expired push subscriptions, permission
denied, no PWA installation, wrong family access and no private data in messages.
Only the pure decision cases are tested today.

## Content Review

1. Privately inventory the actual textbook chapters and edition. Extract each
   Studiewijzer learning objective with page-level provenance. Flag unread pages.
2. Build an objective coverage register independent of test performance. Include
   strengths and GeoGebra workflow skills. Unknown exam relevance is not grounds
   to remove an objective.
3. Author original, age-appropriate questions in Dutch. Do not publish textbook
   scans or reproduce broad exercise collections. Use the book for terminology,
   conventions, vocabulary and alignment, with permissions as needed.
4. Independently solve each item, check boundary/equivalent answers and common
   errors, and add positive, negative, notation-only and ambiguity test cases.
   Require a named adult/teacher reviewer before `published` status.
5. Version statements, solutions and grading together. Freeze the version used
   by an attempt so later edits cannot change what the learner originally saw.
6. Open explanations go to human review when uncertain. Do not use keyword
   presence or unconstrained AI as evidence of correct reasoning. Geometry
   checks need actual parameters and correspondence, not only point labels.

The bank retains the original assessment-level items and short probes and now
adds fourteen targeted sign-rule variants. Daily selection uses assessment-level items: compound
fractions/powers, full polynomial expansion and identities, signed substitution,
coordinate transformations, symbolic trapezium area and complete explanations.
Each new item names the supporting SB section; none uses a flagged unverified
printed expression. The old elementary items and their IDs remain intact so
historical attempts are not silently reinterpreted or deleted.

mathjs performs bounded syntax validation and a separate
expansion/like-term collection check. Multi-part tasks retain each part's outcome.
Nerdamer expands the polynomial difference exactly to establish equivalence;
the earlier mathjs simplifier could leave valid multivariate equalities unresolved.
MathLive supplies visual fractions and a mathematical keyboard, with local assets.
KaTeX renders authored mathematical notation. Regression tests cover independently
computed answers, equivalent forms, wrong signs, incomplete simplification,
unsafe/unsupported syntax, partial geometry correctness and every typeset item.
Every assessment item now offers two or three intermediate checkpoints before
the final answer, with an alternative own-method workspace. Checking a step uses
the same bounded graders, records a distinct `checkpoint` event, and makes a
later final answer assisted. Writing unverified steps alone does not. Drafts
retain both approaches across mode changes and reloads. Step outcomes are not
used as independent mastery evidence. A checked correction earns specific
acknowledgement; parent evidence retains the original step and each retry.

Like-term exercises also require a persistent recognition gate. A bounded mathjs
AST walk splits expanded sums into complete signed monomials, preserving
exponent distinctions and normalizing reordered letter parts. Students select
all members of each repeated type and confirm a group; singleton terms need no
group. Underlines and group numbers supplement color for accessibility. Expanded
work comes from the student's own checkpoint responses or an own-method line,
not an automatically revealed solution. Changing that source invalidates the
saved groups. The gate applies to both solving modes before collecting terms
and submitting final answers. Previously completed answers remain usable.

Each grouping submission appends a `grouping` event with the selected signed
terms, source, grade and working snapshot. These events neither overwrite earlier
selections nor count as independent skill mastery. Mandatory group feedback makes
the following final answer assisted. Draft validation preserves both confirmed
groups and a partly selected next group across reloads.

These checks certify only named intermediate values, not the completeness or
validity of an entire proof. Open working and explanations remain for human
review. No textbook reviewer has signed off the content. The old prime item
does not pretend to inspect a constructed point. GeoGebra remains pending.

The first-session refinement adds optional pre-feedback confidence, distinct
first-expansion evidence, known-sign-error feedback, student-computed numerical
counterexamples and at most one related transfer question. Developing sign skills
are prioritized within the existing mixed session, not instead of all curriculum
topics. H1/H2 correction PDFs now provide actual chapter theory and study guides.
See [first-session-refinement.md](first-session-refinement.md) for the reviewed
coverage pages, corrected missing-source status and geometry safeguards.

## Milestones

1. Local learning loop: completed prototype, unit tests and static build.
2. Content intake: obtain missing chapters/keys/photos; resolve flagged source
   uncertainties; approve a small chapter-aligned bank.
3. Private pilot: implement invite-only auth, RLS tests, trusted attempts,
   cross-device draft conflict handling and parent review. Obtain retention and
   provider decisions. Test two actual accounts on separate devices.
4. Delivery pilot: configure sender and recipients, outbox, scheduler and phone
   opt-in; validate all branches with real devices and delivery receipts.
5. Curriculum expansion: cover all verified objectives, varied constructions,
   precise notation and GeoGebra practical tasks. Tune progression from delayed
   independent evidence, not corrected work or artificially high repetition.

The master specification's V1 acceptance criteria are release gates, not a list
automatically satisfied by the existence of screens. Authentication, real
delivery, cross-device storage, textbook validation and full coverage remain open.