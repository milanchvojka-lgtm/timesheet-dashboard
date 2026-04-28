---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,500&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --bg: #fafaf7;
    --bg-alt: #f0efea;
    --ink: #0d0d0d;
    --ink-soft: #2e2e2e;
    --muted: #8a8a85;
    --pink: #ff77aa;
    --pink-soft: #ffe0ee;
    --rule: #0d0d0d1a;
  }

  section {
    background: var(--bg);
    color: var(--ink);
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    padding: 64px 88px;
    justify-content: flex-start;
    line-height: 1.5;
    font-weight: 400;
  }

  /* Header bar with brand + slide number */
  section::before {
    content: '2F · DESIGN TÝM';
    position: absolute;
    top: 28px;
    left: 88px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--ink);
    padding-bottom: 12px;
    border-bottom: 2px solid var(--ink);
    width: calc(100% - 176px);
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
  }
  section::after {
    color: var(--muted);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.05em;
    bottom: 28px;
    right: 88px;
  }

  /* Eyebrow with pink dot */
  .eyebrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: var(--pink);
    text-transform: uppercase;
    margin: 64px 0 24px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .eyebrow::before {
    content: '';
    display: inline-block;
    width: 9px;
    height: 9px;
    background: var(--pink);
    border-radius: 50%;
  }

  /* Headlines in IBM Plex Mono */
  h1 {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    font-size: 56px;
    line-height: 1.25;
    letter-spacing: -0.025em;
    color: var(--ink);
    margin: 0 0 24px;
    max-width: 22ch;
  }
  h1 strong {
    font-weight: 500;
    background: linear-gradient(to bottom, transparent 0 14%, var(--pink) 14% 96%, transparent 96% 100%);
    padding: 0 0.15em;
    color: var(--ink) !important;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
  h1 em { font-style: italic; color: var(--pink) !important; font-weight: 500; background: transparent; }
  strong { color: inherit; }

  h2 {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--ink-soft);
    margin: 0 0 24px;
    max-width: 50ch;
    line-height: 1.5;
  }
  h2 strong { font-weight: 600; color: var(--ink); }

  /* Cover slide */
  section.cover { justify-content: center; }
  section.cover h1 {
    font-size: 84px;
    line-height: 1.2;
    max-width: 18ch;
  }
  section.cover .eyebrow { margin-top: 0; }
  section.cover h2 { font-size: 26px; max-width: 40ch; }

  /* Big stat number */
  .big {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    font-size: 180px;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--ink);
    margin: 16px 0 24px;
    display: inline-block;
  }
  .big.hl {
    background: var(--pink);
    padding: 0 0.08em;
  }

  /* Body paragraph */
  .note {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 20px;
    line-height: 1.55;
    color: var(--ink-soft);
    max-width: 60ch;
    margin-top: 16px;
  }
  .note strong { color: var(--ink); font-weight: 600; }

  /* Two-cell scissors layout */
  .cells-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 2px solid var(--ink);
    margin: 32px 0 16px;
    max-width: 900px;
  }
  .cells-2 .cell {
    padding: 28px 32px;
    border-right: 2px solid var(--ink);
  }
  .cells-2 .cell:last-child { border-right: none; }
  .cells-2 .cell.pink { background: var(--pink); }
  .cells-2 .cell .tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
    color: var(--ink);
  }
  .cells-2 .cell .num {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    font-size: 64px;
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .cells-2 .cell .unit {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    color: var(--ink-soft);
    margin-left: 8px;
    letter-spacing: 0.05em;
  }

  /* Circular cycle diagram with pill shapes */
  .cycle {
    display: grid;
    grid-template-columns: 1fr 80px 1fr;
    grid-template-rows: auto 60px auto;
    align-items: center;
    justify-items: center;
    margin: 24px auto 0;
    max-width: 1080px;
    gap: 4px 0;
  }
  .cycle .step {
    border: 2.5px solid var(--ink);
    border-radius: 999px;
    padding: 24px 36px;
    background: var(--bg);
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .cycle .step.pink { background: var(--pink); }
  .cycle .step .num {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    font-size: 20px;
    line-height: 1;
    color: var(--pink);
    margin-bottom: 6px;
  }
  .cycle .step.pink .num { color: var(--ink); }
  .cycle .step .ttl {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 4px;
    line-height: 1.15;
    color: var(--ink);
  }
  .cycle .step .desc {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    color: var(--ink-soft);
    line-height: 1.3;
  }
  .cycle .step.pink .desc { color: var(--ink); }
  .cycle .arrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 38px;
    color: var(--ink);
    line-height: 1;
    font-weight: 400;
  }
  .cycle .empty { visibility: hidden; }

  /* Numbered question list */
  ul.questions {
    list-style: none;
    padding: 0;
    margin: 32px 0 0;
    counter-reset: q;
  }
  ul.questions li {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 24px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.4;
    padding: 18px 0 18px 56px;
    border-bottom: 1px solid var(--rule);
    position: relative;
    counter-increment: q;
  }
  ul.questions li:last-child { border-bottom: none; }
  ul.questions li::before {
    content: counter(q, decimal-leading-zero);
    position: absolute;
    left: 0;
    top: 18px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 18px;
    color: var(--pink);
    font-weight: 600;
    letter-spacing: 0.05em;
  }
  ul.questions li strong {
    background: linear-gradient(to bottom, transparent 0 14%, var(--pink) 14% 96%, transparent 96% 100%);
    padding: 0 0.15em;
    font-weight: 500;
    color: var(--ink) !important;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
  .note strong { color: var(--ink) !important; font-weight: 600; background: transparent; }

  /* Three-lever options grid */
  .levers {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0;
    border: 2px solid var(--ink);
    margin: 24px 0 16px;
  }
  .levers .lever {
    padding: 24px 26px;
    border-right: 2px solid var(--ink);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .levers .lever:last-child { border-right: none; }
  .levers .lever.pink { background: var(--pink); }
  .levers .lever .ttl {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 18px;
    color: var(--ink);
    line-height: 1.2;
  }
  .levers .lever .desc {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 15px;
    line-height: 1.45;
    color: var(--ink-soft);
  }
  .levers .lever.pink .desc { color: var(--ink); }
  .levers .lever .pro,
  .levers .lever .con {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    line-height: 1.4;
    color: var(--ink);
  }
  .levers .lever .con { color: var(--ink-soft); }
  .levers .lever.pink .con { color: var(--ink); }
---

<!-- _class: cover -->

<div class="eyebrow">Q1 2026 / Design tým</div>

# Operations je **2.5× větší** než R&D

## A rozdíl se každý kvartál trochu zvětšuje

---

<div class="eyebrow">01 / Kapacita YoY</div>

# Tým má dnes **víc kapacity**, než měl před rokem

<span class="big hl">+1.4 FTE</span>

<div class="note">
Z 1.7 na <strong>3.1 FTE</strong> meziročně. Vyrostli jsme díky <strong>Tajovi</strong> a <strong>Jardovi</strong>.
</div>

---

<div class="eyebrow">02 / Kam šel růst</div>

# Z růstu týmu šlo do R&D **prakticky nic**

<span class="big hl">2 %</span>

<div class="note">
50 % spolkly <strong>operations</strong>, 48 % ostatní projekty. Na R&D zbylo <strong>+0.03 FTE</strong>.
</div>

---

<div class="eyebrow">03 / Stav R&D</div>

# Z 90 : 10 jsme se posunuli na **72 : 28**

<span class="big hl">16 %</span>

<div class="note">
Pokrok proti historii. Cíl je <strong>minimum 25 %, ideál 35 %</strong>.
</div>

---

<div class="eyebrow">04 / Proč na tom záleží</div>

# Bez R&D nebudeme **inovovat nástroje**

<div class="cycle">
  <div class="step">
    <div class="num">01</div>
    <div class="ttl">Tým roste</div>
    <div class="desc">víc designérů, víc jobs</div>
  </div>
  <div class="arrow">→</div>
  <div class="step">
    <div class="num">02</div>
    <div class="ttl">Víc manuální OPS</div>
    <div class="desc">onboarding, koordinace</div>
  </div>
  <div class="arrow">↑</div>
  <div class="empty"></div>
  <div class="arrow">↓</div>
  <div class="step">
    <div class="num">04</div>
    <div class="ttl">Chybí nástroje</div>
    <div class="desc">ještě víc OPS, zpět na 01</div>
  </div>
  <div class="arrow">←</div>
  <div class="step pink">
    <div class="num">03</div>
    <div class="ttl">Méně času na R&amp;D</div>
    <div class="desc">nástroje, automatizace</div>
  </div>
</div>

<div class="note">
R&D není nadstandard — je to investice nutná pro <strong>růst</strong>.<br>Při současném tempu bychom k 25 % cíli šli zhruba <strong>10 let</strong>, k 35 % nikdy.
</div>

---

<div class="eyebrow">05 / Q2 2026 výhled</div>

# V Q2 nás čeká **oslabení**

<span class="big hl">−0.5 FTE</span>

<div class="note">
<strong>Taja</strong> 1.0 → 0.5 FTE (Itálie).
</div>

---

<div class="eyebrow">06 / Co dál — čtyři páky</div>

# Čtyři páky, kterými R&D můžeme posílit

<div class="levers">
  <div class="lever">
    <div class="ttl">01 / Doplnit tým</div>
    <div class="desc">Drobné/ dočasné posílení kapacity.</div>
  </div>
  <div class="lever">
    <div class="ttl">02 / Přerozdělit čas</div>
    <div class="desc">Omezit PR a interní ve prospěch R&amp;D.</div>
  </div>
  <div class="lever">
    <div class="ttl">03 / Limit na OPS</div>
    <div class="desc">20 % R&amp;D. OPS musí vejít do zbytku.</div>
  </div>
  <div class="lever">
    <div class="ttl">04 / AI automatizace</div>
    <div class="desc">Zefektivnit čas v OPS pomocí AI nástrojů.</div>
  </div>
</div>

---

<div class="eyebrow">07 / V Q2 použijeme dvě</div>

# V Q2 použijeme tři páky

<div class="levers">
  <div class="lever">
    <div class="ttl">01 / Doplnit tým</div>
    <div class="desc">Drobné/ dočasné posílení kapacity.</div>
  </div>
  <div class="lever pink">
    <div class="ttl">02 / Přerozdělit čas</div>
    <div class="desc">Omezit PR a interní ve prospěch R&amp;D.</div>
  </div>
  <div class="lever pink">
    <div class="ttl">03 / Limit na OPS</div>
    <div class="desc">20 % R&amp;D. OPS musí vejít do zbytku.</div>
  </div>
  <div class="lever pink">
    <div class="ttl">04 / AI automatizace</div>
    <div class="desc">Zefektivnit čas v OPS pomocí AI nástrojů.</div>
  </div>
</div>
