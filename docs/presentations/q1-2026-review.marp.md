---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  :root {
    --accent: #f59e0b;
    --r-and-d: #f59e0b;
    --ops: #10b981;
    --muted: #94a3b8;
    --ink: #0f172a;
    --bg: #ffffff;
  }
  section {
    background: var(--bg);
    color: var(--ink);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    padding: 72px 96px;
    justify-content: flex-start;
  }
  section.cover {
    justify-content: center;
    text-align: left;
  }
  h1 {
    font-size: 56px;
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  h1 strong, h2 strong { color: var(--ink); font-weight: 800; }
  h1 em { font-style: normal; color: var(--accent); font-weight: 800; }
  h2 {
    font-size: 26px;
    font-weight: 500;
    color: var(--muted);
    margin: 0 0 48px;
    letter-spacing: 0;
  }
  .big {
    font-size: 180px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--accent);
    margin: 8px 0 16px;
  }
  .big.ops { color: var(--ops); }
  .big.rnd { color: var(--r-and-d); }
  .label {
    font-size: 22px;
    color: var(--muted);
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .note {
    font-size: 22px;
    color: var(--muted);
    line-height: 1.5;
    max-width: 800px;
    margin-top: 24px;
  }
  .note strong { color: var(--ink); font-weight: 600; }
  ul.questions {
    list-style: none;
    padding: 0;
    margin-top: 32px;
  }
  ul.questions li {
    font-size: 36px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 32px;
    padding-left: 60px;
    position: relative;
    line-height: 1.3;
  }
  ul.questions li::before {
    content: counter(q);
    counter-increment: q;
    position: absolute;
    left: 0;
    top: -4px;
    font-size: 28px;
    color: var(--muted);
    font-weight: 700;
  }
  ul.questions { counter-reset: q; }
  .footer-meta {
    position: absolute;
    bottom: 32px;
    left: 96px;
    font-size: 14px;
    color: var(--muted);
  }
  section::after {
    color: var(--muted);
    font-size: 14px;
  }
  .row { display: flex; gap: 64px; align-items: baseline; }
  .col-num { display: flex; flex-direction: column; }
  .col-num .big { font-size: 100px; }
  svg { display: block; margin: 16px 0; }
  .scissors {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin: 48px 0 16px;
    max-width: 900px;
  }
  .scissors .row {
    display: flex;
    align-items: baseline;
    gap: 24px;
  }
  .scissors .cat {
    font-size: 26px;
    font-weight: 700;
    width: 80px;
  }
  .scissors .num {
    font-size: 84px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .scissors .ops .num, .scissors .ops .cat { color: var(--ops); }
  .scissors .rnd .num, .scissors .rnd .cat { color: var(--r-and-d); }
  .scissors .unit {
    font-size: 22px;
    color: var(--muted);
    margin-left: 8px;
  }
  .cycle {
    margin: 32px 0 16px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto auto;
    gap: 8px 32px;
    max-width: 1000px;
    align-items: center;
  }
  .cycle .step {
    background: #f8fafc;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
    padding: 20px 24px;
    font-size: 22px;
    font-weight: 600;
    color: var(--ink);
  }
  .cycle .step.highlight {
    background: #fef3c7;
    border-color: var(--accent);
  }
  .cycle .step .sub {
    display: block;
    font-size: 16px;
    font-weight: 400;
    color: var(--muted);
    margin-top: 6px;
  }
  .cycle .arrow {
    font-size: 32px;
    color: var(--muted);
    text-align: center;
    font-weight: 300;
  }
---

<!-- _class: cover -->

# OPS roste rychleji
# než R&D.

## Pokud to bude pokračovat, narazíme.

<div class="footer-meta">Design tým · Q1 2026 review</div>

---

<div class="label">Kapacita YoY</div>

# Tým má dnes **víc kapacity**.

<div class="big">+1.4 FTE</div>

<div class="note">
Z 1.7 na <strong>3.1 FTE</strong> meziročně.<br>
Headcount se ale prakticky nezměnil — růst táhne <strong>Taja</strong> (nastoupil v květnu) a <strong>Jarda</strong> (vyrampoval z 0.02 na 0.38).
</div>

---

<div class="label">OPS YoY</div>

# OPS **rychle roste**.

<div class="big ops">×2.2</div>

<div class="note">
Z 0.58 na <strong>1.29 FTE</strong>. Víc designerů + víc jobs = víc OPS, logicky.<br>
A charakter se profesionalizoval — místo drobných úkolů jedeme <strong>velké klientské zakázky</strong> (Eurowag, ČSOB, MM, Pronatal).
</div>

---

<div class="label">R&D dnes</div>

# Na R&D nám zbývá **málo**.

<div class="big rnd">16 %</div>

<div class="note">
Z historického 90 : 10 jsme se posunuli na 72 : 28. <strong>Posun správným směrem.</strong><br>
Ale cíl je <strong>minimálně 25 %, ideálně 35 %</strong>. Tam jsme stále daleko.
</div>

---

<div class="label">Tempo k cíli</div>

# Tempo je **příliš pomalé**.

<div class="big rnd">~10 let</div>

<div class="note">
Při současných deltách R&D dorůstá, ale jen pomalu — z 16 % se asymptoticky blíží stropu kolem <strong>26 %</strong>. To znamená: cíl <strong>25 % až za ~10 let</strong> (39 kvartálů), cíl <strong>35 % bez aktivního zásahu nedosažitelný</strong>. Tempo nás vede k minimu, ale neudrží nás u ideálu.
</div>

---

<div class="label">Proč na tom záleží</div>

# Bez R&D nejsou **nástroje**.

<div class="cycle">
  <div class="step">1. Roste tým a počet jobs<span class="sub">víc designerů, víc klientů</span></div>
  <div class="arrow">→</div>
  <div class="step">2. Víc manuální OPS<span class="sub">onboarding, podpora, koordinace</span></div>

  <div class="arrow">↑</div>
  <div></div>
  <div class="arrow">↓</div>

  <div class="step">4. Bez nástrojů ještě víc OPS<span class="sub">→ zpět na 1</span></div>
  <div class="arrow">←</div>
  <div class="step highlight">3. Méně času na R&amp;D<span class="sub">nástroje, automatizace</span></div>
</div>

<div class="note">
R&D není nadstandard — je to investice nutná pro <strong>udržitelný režim při růstu</strong>.
</div>

---

<div class="label">K rozhodnutí</div>

# Tři otázky pro tým.

<ul class="questions">
  <li>Cílíme R&amp;D na <strong>25 %</strong> minimum, nebo na <strong>35 %</strong> ideál?</li>
  <li>Přesun části kapacity <strong>z OPS</strong>, nebo <strong>navýšit</strong> celkovou kapacitu?</li>
  <li>Jak definujeme <strong>udržitelný režim růstu</strong> — kolik R&amp;D musí zbýt na každý nový job?</li>
</ul>
