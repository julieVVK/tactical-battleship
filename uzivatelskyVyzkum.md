### **1\. Výzkum uživatelských potřeb (User Research)**

**1.1 Zdokumentování provedeného výzkumu**

**Identifikace respondenta:** Matouš (21 let), vysokoškolský student, spolubydlící. Reprezentuje typického zástupce cílové skupiny – běžného uživatele, který hry nehraje primárně kvůli hře samotné, ale jako formu rychlé sociální interakce a odreagování s konkrétním kamarádem na dálku.

**Způsob sběru dat:** Pozorování spojené s polostrukturovaným rozhovorem (v přirozeném prostředí studentského pokoje). Výzkum simuloval situaci, kdy je Matouš na dálku vyzván kamarádem ke společné online aktivitě. Během interakce s referenční online hrou pro dva hráče byl využit „Think-aloud protokol“ (myšlení nahlas), po kterém následoval rozhovor o jeho pocitech z asynchronního soupeření s živým člověkem.

**1.2 Formulace konkrétních uživatelských potřeb**

**Potřeba okamžitého vstupu do sdílené aktivity (Spontánnost):** Uživatel potřebuje po obdržení výzvy od kamaráda ihned zahájit vzájemnou interakci. Výzkum ukázal, že jakékoliv formální bariéry (např. nutnost vytvářet si identitu, prokazovat se nebo procházet úvodním schvalováním) ho silně frustrují, protože ničí spontánnost momentu a oddalují samotný kontakt s druhým člověkem.

**Potřeba taktické variability a eliminace stereotypního hádání:** Během testování tradiční verze uživatel rychle ztrácel zájem, protože proces sázel převážně na slepou náhodu. Uživatel potřebuje cítit, že má vývoj situace pod kontrolou díky strategickým rozhodnutím. Vyžaduje komplexnější kognitivní stimulaci – možnost využívat momenty překvapení a analyzovat složitější a nepředvídatelné geometrické vzorce, aby hra nebyla jen monotónním odklikáváním prázdných polí.

**Potřeba minimalizace rutinní přípravy před soupeřením:** Uživatel se chce co nejrychleji dostat k samotnému jádru kompetitivního zážitku. Zdlouhavá, mechanická příprava výchozího stavu (příprava herní plochy) ho nudí a vnímá ji jako nutné zlo, protože ho zdržuje od hlavní zábavy. Potřebuje mít možnost tuto rutinní fázi maximálně urychlit nebo zcela přeskočit.

### **2\. Analýza konkurenčních řešení**

**2.1 Mapování konkurence na zjištěné potřeby**

Pro analýzu byly vybrány 2 existující webové aplikace zastupující zcela odlišné přístupy (odpovídá objemu práce pro 1 osobu v týmu).

**Seznam analyzovaných produktů:**

1. **Battleshiponline.org** – Minimalistická webová implementace klasických lodí zaměřená na rychlost.  
2. **Sea Battle 2 (Webová verze)** – Komplexní verze námořní bitvy rozšířená o dodatečný arzenál.

**Vazba na potřeby z Kapitoly 1:**

* **Potřeba okamžitého vstupu (Spontánnost):** *Battleshiponline.org* tuto potřebu řeší excelentně pomocí generování přímého URL odkazu. Naopak *Sea Battle 2* selhává kvůli nutnosti procházet složitá menu a zakládat místnosti.  
* **Potřeba taktické variability:** Zde *Battleshiponline.org* zcela propadá, protože nabízí pouze rovné lodě a hru omezuje na slepé hádání. *Sea Battle 2* tuto potřebu velmi dobře saturuje přítomností radarů a min, avšak ani jedna z her nepracuje s nepředvídatelnými tvary lodí.  
* **Potřeba minimalizace rutinní přípravy:** Obě aplikace si tuto bariéru uvědomují a uspokojují ji pomocí funkce pro automatické (náhodné) rozmístění lodí.

**2.2 Vyhodnocení, Pro/Proti a Ponaučení**

**Aplikace 1: Battleshiponline.org**

* **Pro:**  
  1. Nevyžaduje žádnou registraci a umožňuje rychlé pozvání kamaráda pomocí vygenerovaného odkazu (řeší *potřebu spontánnosti*).  
  2. Jasné a dostupné tlačítko pro náhodné rozmístění lodí před začátkem partie (řeší *potřebu minimalizace rutinní přípravy*).  
  3. Minimalistické vizuální zpracování, které hráče okamžitě orientuje bez nutnosti učit se složité rozhraní.  
* **Proti:**  
  1. Striktní dodržování klasických pravidel bez jakýchkoliv schopností (radary, miny), hra rychle sklouzává ke *stereotypnímu hádání*.  
  2. Lodě mají pouze standardní rovné tvary (1 až 4 pole), což vůbec neuspokojuje *potřebu taktické variability* a hlubší strategie.  
  3. Během čekání na tah protihráče je zpětná vazba poměrně statická, což může vyvolat pocit, že se spojení přerušilo.

**Aplikace 2: Sea Battle 2 (Webová verze)**

* **Pro:**  
  1. Nabízí rozšířený arzenál zbraní (radary, miny, letadla), což excelentně řeší *potřebu taktické variability* a odstraňuje slepé hádání.  
  2. Obsahuje funkci automatického rozmístění i pro složitější zbraňový arzenál (řeší *minimalizaci rutiny*).  
  3. Výborná vizuální zpětná vazba a animace pomáhají udržet pozornost hráče i během tahů oponenta.  
* **Proti:**  
  1. Zcela selhává v *potřebě spontánnosti* – aplikace má příliš těžkopádné menu a neumožňuje okamžitou hru přes odkaz na jedno kliknutí.  
  2. I přes bohatý arzenál zůstávají tvary lodí pouze rovné (chybí komplexní geometrické vzory jako L nebo T).  
  3. Přeplácané uživatelské rozhraní zdržuje hráče, který hledá pouze rychlou interakci.

**Konkrétní ponaučení pro vlastní projekt (Syntéza)**

Na základě analýzy jsme definovali klíčové principy pro vývoj naší React/Node.js aplikace:

1. **Co převzít a implementovat:**  
   * **Okamžitý start přes URL v režimu Host (Guest mode):** Systém musí fungovat bez počáteční registrace a bez lobby. Hráč A získá unikátní odkaz, pošle ho Hráči B a ihned hrají.  
   * **Volitelná (odložená) registrace pro statistiky:** Abychom vyhověli *potřebě spontánnosti* (okamžitá hra), ale zároveň udrželi dlouhodobou motivaci, zavedeme tzv. „lazy registration“. Vytvoření účtu pro uchování statistik bude čistě volitelné a systém ho nabídne nenásilnou formou až **po** odehrání partie.  
   * **Rozšířený arzenál a taktická hloubka:** Implementujeme dodatečné funkce (např. radar odkrývající oblast nebo miny), aby hra nebyla jen o náhodném klikání.  
   * **Zavedení nových geometrických tvarů:** Na rozdíl od obou konkurentů zavedeme kromě rovných lodí také **L-tvary a T-tvary**. Tím naplníme potřebu komplexnější kognitivní stimulace.  
   * **Tlačítko „Náhodné rozestavení“:** Bude centrálním prvkem přípravné fáze pro okamžité přeskočení rutiny.  
2. **Jakým chybám se vyhnout:**  
   * **Vynucování účtu před hrou:** Zcela se vyhneme chybě většiny konkurence. Aplikace nesmí hráči blokovat přístup k samotné herní ploše požadavkem na přihlášení.  
   * **Odstranění nutnosti zdlouhavého klikání:** Rozhraní automaticky zbarví okolní políčka potopené lodě jako „prázdná voda“, aby hráč nemusel plýtvat tahy na místa, kde podle pravidel už další loď být nemůže.

