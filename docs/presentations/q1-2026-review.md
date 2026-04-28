# Design tým — Q1 2026 review

> Interní review pro tým / vedení 2fresh. Cíl: rozhodnutí, ne report.

Všechna čísla v FTE (kapacita), pracovní dny dle CZ kalendáře.

---

## Slide 1 — Cover

**Q1 2026: OPS roste rychleji než R&D.**
**Pokud to bude pokračovat, narazíme.**

*Podtitul: Co se děje s naší kapacitou a kam ji lijeme.*

---

## Slide 2 — Tým narostl o +1.4 FTE YoY (díky Tajovi a Jardovi)

**Headline: Není to růst po hlavách. Je to rampování dvou lidí.**

**Tři čísla nahoře:**
- Q1 2025 → Q1 2026: **1.70 → 3.12 FTE** (+1.42 FTE, +84 %)
- Q4 2025 → Q1 2026: **2.45 → 3.12 FTE** (+0.67 FTE, +27 %)
- Headcount aktivních lidí: **6 → 7** (skoro stejně)

**Bar chart — Δ FTE per osoba (Q1 2025 → Q1 2026):**

| Osoba | Q1 2025 | Q1 2026 | Δ FTE |
|---|---|---|---|
| **Taja** | 0.00 | 0.94 | **+0.94** ⭐ |
| **Jarda** | 0.00 | 0.38 | **+0.36** ⭐ |
| Petra | 0.36 | 0.51 | +0.15 |
| Milan | 0.68 | 0.75 | +0.07 |
| Jiří | 0.52 | 0.50 | -0.02 |
| Tobiáš | 0.02 | 0.01 | 0.00 |
| Dušan | — | 0.01 | +0.01 (rozjezd) |
| (David, Martin odešli) | 0.16 | 0.00 | -0.16 |

**Komentář pro řečníka:** Taja je dnes prakticky full-time. Jarda vyrampoval podle plánu. Bez nich by tým byl pořád na ~1.8 FTE.

---

## Slide 3 — Roste i objem práce — proto OPS absolutně narůstá

**Headline: Víc designerů + víc jobs = víc operations. Logické.**

**Hlavní číslo:** OPS 0.58 → **1.29 FTE** (×2.2 YoY)

**Charakter OPS se přitom změnil:**

| Q1 2025 | Q1 2026 |
|---|---|
| Drobné UX Maturity vyhodnocení (Dotidot, 2N) | Velké klientské zakázky |
| Hiring jednotlivců | **Eurowag 40h, ČSOB 26h, MM 24h** |
| Max ~9 h na úkol | Pronatal, Iteric/Kilde, Stimvia… |

**Komentář:** OPS se profesionalizovala. To je pozitivní změna. Růst objemu je logický důsledek toho, že nás je víc a děláme pro víc klientů.

**Proto problém není "moc OPS". Problém je, kolik nám zbývá na R&D.**

---

## Slide 4 — OPS vs R&D: historicky lepší, ale daleko od cíle

**Headline: Z 90:10 jsme se dostali na 72:28. R&D je dnes na 16 %. Cíl je 25–35 %.**

**Slope chart 5 kvartálů (FTE):**

| Kvartál | OPS FTE | R&D FTE | R&D % z týmu |
|---|---|---|---|
| Q1 2025 | 0.58 | 0.48 | 28 % |
| Q2 2025 | 0.56 | 0.23 | 12 % |
| Q3 2025 | 1.00 | 0.30 | 12 % |
| Q4 2025 | 1.05 | 0.33 | 14 % |
| **Q1 2026** | **1.29** | **0.51** | **16 %** |

*(Vizuálně: dva referenční řádky — 25 % a 35 % cíl.)*

**Co tato čísla znamenají:**
- ✅ R&D je dnes absolutně historicky největší (0.51 FTE = ~půl člověka full-time).
- ⚠️ Ale jako podíl jsme stále jen 16 % — pod 25% minimem.
- ❌ Cílových 35 % bychom dosáhli při **1.09 FTE** — dvojnásobek dneška.

---

## Slide 5 — Nůžky se rozevírají

**Headline: Pokud trend pokračuje, vracíme se k 90:10.**

**QoQ Δ Q4 2025 → Q1 2026:**
- OPS: **+0.25 FTE** (+24 %)
- R&D: **+0.17 FTE** (+52 % relativně, ale jen o málo absolutně)

**Slovy:** Z každé nově přidané FTE jde větší díl do OPS. A protože OPS roste z větší základny, podíl R&D bez aktivního zásahu zase poklesne.

**Vizualizace:** dvě křivky, OPS rostoucí strmě, R&D rostoucí mírně. Mezera mezi nimi se zvětšuje.

---

## Slide 6 — Proč R&D není nadstandard: začarovaný kruh

**Headline: Bez R&D nemáme nástroje. Bez nástrojů nestíháme. Tečka.**

**Diagram — 4 boxy v kruhu:**

```
┌───────────────────────────┐
│ 1. Roste tým & počet jobs │
└────────────┬──────────────┘
             ↓
┌────────────────────────────────────┐
│ 2. Víc manuální OPS práce          │
│    (onboarding, podpora, koordin.) │
└────────────┬───────────────────────┘
             ↓
┌────────────────────────────────┐
│ 3. Méně času na R&D            │
│    (nástroje, automatizace)    │
└────────────┬───────────────────┘
             ↓
┌──────────────────────────────────┐
│ 4. Bez nástrojů ještě víc OPS    │
│    → zpět na 1                   │
└──────────────────────────────────┘
```

**Klíčová věta:** *"Každý další designer nebo job zhoršuje poměr, pokud zároveň neinvestujeme do R&D."*

**Konkrétní dopad dnes:**
- Onboarding nových lidí (Dušan, případně další) je ručně intenzivní.
- Chybí nám automatizace, která by tu část OPS odbrala.
- Čas na R&D *fyzicky existuje*, ale je vždycky první, co padne pod tlakem klientského termínu.

---

## Slide 7 — K rozhodnutí

**Tři otevřené otázky pro tým / vedení:**

### 1. Cílíme R&D na 25 % nebo 35 %?

| Cíl | Potřeba R&D FTE | Δ vs dnes (0.51) |
|---|---|---|
| 25 % minimum | 0.78 FTE | **+0.27 FTE** (+53 %) |
| 35 % ideál | 1.09 FTE | **+0.58 FTE** (více než zdvojnásobit) |

### 2. Jak toho dosáhneme?

- **A) Přesun kapacity z OPS** → ale klientský tlak proti.
- **B) Navýšení celkové kapacity** → noví lidé / dorámpování stávajících.
- **C) Kombinace** → definovat strop pro OPS, zbytek do R&D.

### 3. Jak definujeme udržitelný režim růstu?

> *Pravidlo, kolik R&D nám musí zbývat na každého nového designera nebo na každý nový OPS klient — aby se začarovaný kruh nezavřel.*

---

## Příloha — Datová poznámka pro řečníka

- Zdroj: timesheet záznamy z Costlocker, dataset 2025-01-02 → 2026-03-31, 5 591 záznamů.
- FTE = tracked hours ÷ (CZ pracovní dny × 8 h/den).
- Pracovní dny použité: Q1'25 = 63, Q2'25 = 61, Q3'25 = 66, Q4'25 = 61, Q1'26 = 63.
- "R&D" = projekt "Design tým R&D_YYYY". "OPS" = "Design tým OPS_YYYY". Mimo scope: Internal, PR, Guiding, UX Maturity (zmíněno marginálně).
- Q1 2025 byl částečně artefakt prvního kvartálu reportingu (David Janda jen únor). Robustnější srovnání: Q1 2026 vs Q3 2025.

---

## Co prezentace záměrně neřeší

- Dušanův ramp jako otevřená otázka (lze řešit delegací na lead designery).
- Detail mimo OPS/R&D osu (PR, Internal, Guiding, UX Maturity).
- Billable / non-billable, schválenost záznamů, kvalita reportingu.
