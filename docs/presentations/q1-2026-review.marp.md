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
  .levers {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
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
    background: #ffffff;
  }
  .levers .lever:last-child { border-right: none; }
  .levers .lever.accent { background: #fef3c7; }
  .levers .lever .ttl {
    font-weight: 800;
    font-size: 20px;
    color: var(--ink);
    line-height: 1.2;
    letter-spacing: -0.01em;
  }
  .levers .lever .desc {
    font-size: 16px;
    line-height: 1.45;
    color: var(--muted);
  }
  .levers .lever.accent .desc { color: var(--ink); }
  .levers .lever .pro,
  .levers .lever .con {
    font-size: 14px;
    line-height: 1.4;
    color: var(--ink);
  }
  .levers .lever .con { color: var(--muted); }
  .levers .lever.accent .con { color: var(--ink); }
---

<!-- _class: cover -->

# Operations je **2.5× větší** než R&D.

## A propast se každý kvartál zvětšuje.

<div class="footer-meta">Design tým · Q1 2026 review</div>

---

<div class="label">Kapacita YoY</div>

# Tým má dnes **víc kapacity**, než měl před rokem.

<div class="big">+1.4 FTE</div>

<div class="note">
Z 1.7 na <strong>3.1 FTE</strong> meziročně.<br>
Vyrostli jsme díky <strong>Tajovi</strong> a <strong>Jardovi</strong>.
</div>

---

<div class="label">Kam šel růst</div>

# Z růstu týmu šlo do R&D *prakticky nic*.

<div class="big ops">2 %</div>

<div class="note">
50 % spolkly <strong>operations</strong>, 48 % ostatní projekty. Na R&D zbylo <strong>+0.03 FTE</strong>.
</div>

---

<div class="label">Stav R&D</div>

# Z 90 : 10 jsme se posunuli na *72 : 28*.

<div class="big rnd">16 %</div>

<div class="note">
Pokrok proti historii. Cíl je <strong>minimum 25 %, ideál 35 %</strong>.
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
R&D není nadstandard — je to investice nutná pro <strong>udržitelný režim při růstu</strong>. Při současném tempu bychom k 25 % cíli šli zhruba <strong>10 let</strong>, k 35 % nikdy.
</div>

---

<div class="label">Q2 2026 výhled</div>

# Q2 nás krátkodobě oslabí o **−0.5 FTE**.

<div class="big rnd">−0.5 FTE</div>

<div class="note">
<strong>Táňa</strong> 1.0 → 0.5 FTE (Itálie). <strong>Milan</strong> −0.4 FTE (jiný projekt). Jirka + Péťa zaskočí za Milana → net <strong>−0.5 FTE</strong>.<br>
Jednorázové. Mitigace: zpomalit tempo nových HALOTON jobů a onboardingu designérů, dokud se Táňa nevrátí.
</div>

---

<div class="label">Co dál — tři páky</div>

# Tři páky, kterými R&D vrátíme na cíl.

<div class="levers">
  <div class="lever">
    <div class="ttl">1. Doplnit tým</div>
    <div class="desc">Drobné posílení kapacity (vedení nepreferuje rozšíření).</div>
    <div class="pro">+ Rychlé. Funguje okamžitě.</div>
    <div class="con">− Náklady. Časem znovu narazíme na strop.</div>
  </div>
  <div class="lever">
    <div class="ttl">2. Přerozdělit čas</div>
    <div class="desc">Krátit PR, interní a svobodnářství ve prospěch R&amp;D.</div>
    <div class="pro">+ Bez nákladů. V naší kontrole.</div>
    <div class="con">− Jiné kategorie utrpí. PR a interní mají hodnotu.</div>
  </div>
  <div class="lever accent">
    <div class="ttl">3. Strop pro OPS</div>
    <div class="desc">Hard floor 25 % R&amp;D. OPS musí vejít do zbytku.</div>
    <div class="pro">+ Ošetřuje kořen — cyklus z předchozího slidu.</div>
    <div class="con">− Brzdí příjem nových klientů. Vyžaduje dohodu s vedením.</div>
  </div>
</div>

---

<div class="label">Doporučení</div>

# Začneme **kombinací 2 + 3**.

<div class="note">
<strong>Q2 (krátkodobě):</strong> zpomalit nábor v HALOTONu, ustát výpadek bez růstu OPS.<br><br>
<strong>Q3+ (střednědobě):</strong> zavést <strong>25 % R&D floor</strong> jako kvartální commit. Každé rozhodnutí o nové OPS práci se měří proti tomuto stropu.<br><br>
<strong>Páka 1 (přidat lidi)</strong> zůstává v záloze — vyhodnotit po dvou kvartálech, jestli kombinace 2+3 stačí.
</div>
