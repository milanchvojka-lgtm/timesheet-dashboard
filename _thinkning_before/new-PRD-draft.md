# Technické řešení
- data pocházejí z aplikace Costlocker, která má API, tak že bych preferoval tuto možnost (API klíč mám). Přes API budeme jen číst data, žádné zapisování ani úprava není potřeba
- není to podmínkou, ale bylo by skvělé, pokud bychom přístup k aplikaci ochránit přihlášením pomocí jména a hesla (u nás ve formě používáme Google, tak že ideálně využít Google Account pro autentizaci a přihlašování). Do aplikace se může přihlásit kdokoli s emailem v doméně 2fresh.cz.

# Obecné vlastnosti aplikace
- nejstarší data, která budeme načítat jsou za říjen 2024 a k tomu všechna novější
- vždy bych měl vidět, kdo je přihlášený uživatel
- vždy bych měl vidět, za jaké období jsou data zobrazená

# Přehled FTE pro členy týmu
- Tomáš Brza =  1 FTE
- Milan Chvojka =  0,9 FTE
- Petra Panáková = 0,5 FTE
- Jiří Martínek = 0,5 FTE
- Jaroslav Štigler =  0,05 FTE
- Tobiáš Vybíral = 0,05 FTE

# Aplikace bude mít následující části
## 1. Trendový dashboard
Tato část aplikace vychází uze stávajícího "sample-dashboard.js". Chci aby stejně vypadala (barvy, layout, typografie). Chci, aby podobně fungovala, co se zobrazení dat týká. Chci aby data dynamicky načítala přes API z Costlockeru. Ale chci aby byla trochu jinak strukturovaná. Aplikace bude mít tyto záložky: 
- Dashboard
- Projekty
- Aktivity
- Tým

Obsah a funkce záložek popíšu v dalších kapitolách pro záložku zvlášť:

### 1.1. Dashboard
#### 1.1.1. Období
- možnost zvolit si období na jaké chci koukat (defaultně: posledních 12 měsíců)
- další možnosti "posledních 6 měsíců", "poslední 3 měsíce" a "poslední měsíc"
- možná by bylo dobrý si pomocí date pickeru vybrat období jaký chci

#### 1.1.2. Dlaždice
- Nejvyšší FTE
- Nejnižší FTE
- Průměrné FTE
- Počet členů týmu

#### 1.1.3. Grafy
- spojnicový graf pro "Vývoj celkových hodin a FTE kapacity" podobně jako dnes v *.JS souboru

### 1.2. Projekty

#### 1.2.1. Období
- možnost zvolit si období na jaké chci koukat (defaultně: posledních 12 měsíců)
- další možnosti "posledních 6 měsíců", "poslední 3 měsíce" a "poslední měsíc"
- možná by bylo dobrý si pomocí date pickeru vybrat období jaký chci

#### 1.2.2. Dlaždice
- Počet FTE za projekt Interní za zvolené období
- Počet FTE za projekt OPS za zvolené období
- Počet FTE za projekt R&D za zvolené období
- Počet FTE za projekt Guiding za zvolené období
- Počet FTE za projekt UX Maturity za zvolené období

#### 1.2.3. Grafy
- spojnicový graf pro "Rozložení hodin podle projektů v čase" podobně jako dnes v *.JS souboru s možností vidět křivky pro Interní, OPS, R&D, PR, Guiding a UX Maturity
- sloupcový graf pro "Procentuální podíl projektů" podobně jako dnes v *.JS souboru s možností vidět křivky pro Interní, OPS, R&D, PR, Guiding a UX Maturity
- spojnicový graf "Vývoj jednotlivých projektů (hodiny)" podobně jako dnes v *.JS souboru s možností vidět křivky pro Interní, OPS, R&D, PR, Guiding a UX Maturity

### 1.3. Aktivity

#### 1.3.1. Období
- možnost zvolit si období na jaké chci koukat (defaultně: posledních 12 měsíců)
- další možnosti "posledních 6 měsíců", "poslední 3 měsíce" a "poslední měsíc"
- možná by bylo dobrý si pomocí date pickeru vybrat období jaký chci

#### 1.3.2. Dlaždice
- Kolik % z celkového času jsme věnovali aktivitě Interní a kolik to bylo celkem hodin
- Kolik % z celkového času jsme věnovali aktivitě OPS Guiding a kolik to bylo celkem hodin
- Kolik % z celkového času jsme věnovali aktivitě OPS Reviews a kolik to bylo celkem hodin
- Kolik % z celkového času jsme věnovali aktivitě OPS Hiring a kolik to bylo celkem hodin
- Kolik % z celkového času jsme věnovali aktivitě OPS Jobs a kolik to bylo celkem hodin
- Kolik % z celkového času jsme věnovali aktivitě R&D a kolik to bylo celkem hodin
- Kolik % z celkového času jsme věnovali aktivitě UX Maturity a kolik to bylo celkem hodin
- Kolik % z celkového času jsme věnovali aktivitě PR a kolik to bylo celkem hodin

#### 1.3.3. Grafy
- spojnicový graf "Vývoj OPS aktivit" (Hiring, Jobs, Reviews, Guiding)
- spojnicový graf "Vývoj Interních a R&D aktivit"

### 1.4. Tým

#### 1.4.1. Období
- možnost zvolit si období na jaké chci koukat (defaultně: posledních 12 měsíců)
- další možnosti "posledních 6 měsíců", "poslední 3 měsíce" a "poslední měsíc"
- možná by bylo dobrý si pomocí date pickeru vybrat období jaký chci

#### 1.4.2. Dlaždice
- Kolik % z jeho celkového FTE každý člen týmu odpracoval
- 

#### 1.4.3. Grafy
- Trend celkové kapacity týmu za časové období (Vývoj FTE jednotlivých členů týmu)
- sloupcový graf, který porovnává celkové FTE daného člena týmu se skutečně odpracovaným časem

## 2. Timesheet review buddy
Tato část aplikace bude kontrolovat, zda jsou všechny položky v timesheetu natrackované správně, tzn. jestli se všechny položky podařilo správně napárovat. Ve stávajícím dokumentu "timesheet-analyzer-PRD.md" tomu odpovídá část skriptu, která hledá tzv. "Nespárované" položky. Chci aby v této části aplikace bylo možné vybrat konkrétního člověka a zobrazit informaci o tom, 
- kolik záznamů celkem má
- kolik z toho se nepodařilo sprárovat
- pokud existují nějaké nespárované, tak zobrazit jejich seznam ve stejném formátu jako dneska dělá apliakce popsaná v "timesheet-analyzer-PRD.md"
