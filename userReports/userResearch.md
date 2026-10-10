### **1\. Výzkum uživatelských potřeb (User Research)**

**1.1 Zdokumentování provedeného výzkumu**

**Identifikace respondenta:** Matouš (21 let), student VUT, spolubydlící z pokoje. Reprezentuje občasného hráče, který nehraje hodiny denně, ale chce si jen rychle odpočinout mezi učením a zahrát si něco s kamarádem na dálku.

**Způsob sběru dat:** Pozorování a krátký rozhovor přímo na pokoji. Poslal jsem Matoušovi odkaz na existující online lodě a sledoval, jak reaguje. Poprosil jsem ho, aby říkal nahlas, co mu vadí a co se mu líbí (Think-aloud). Potom jsme si asi 10 minut povídali o tom, co mu u podobných webových her nejvíc chybí.

**1.2 Formulace konkrétních uživatelských potřeb**

**Potřeba začít hrát hned (žádné zdržování):** Uživatel chce po kliknutí na pozvánku od kamaráda okamžitě začít hrát. Jakékoliv nutné registrace, přihlašování nebo nastavování profilu ho otravují a berou chuť vůbec hru zapínat.

**Potřeba taktiky místo náhodného klikání:** Klasické lodě uživatele po pár kolech nudí, protože je to většinou jen o slepém hádání políček jedno po druhém. Potřebuje mít možnost situaci aktivně zvrátit pomocí taktických rozhodnutí a překvapivých tahů, aby zápas nestál čistě na náhodě.

**Potřeba vyhnout se zdlouhavé přípravě:** Uživatel nechce trávit minuty tím, že ručně skládá lodě na desku. Vnímá to jako zbytečnou rutinu, která ho zdržuje od samotného zápasu, a chce mít možnost pole připravit na jedno kliknutí.

### **2\. Analýza konkurenčních řešení**

**2.1 Mapování konkurence na zjištěné potřeby**

Vybrali jsme 2 webové hry, které k námořní bitvě přistupují z úplně jiných stran:

**Battleshiponline.org** – Jednoduchá klasická verze s důrazem na rychlé spuštění.

**Sea Battle 2 (Webová verze)** – Hra rozšířená o speciální zbraně a modernější prvky.

**Jak řeší zjištěné potřeby:**

**Okamžitý vstup:** *Battleshiponline.org* to zvládá skvěle – pošlete link a hned hrajete. *Sea Battle 2* je v tomhle hrozná, nutí hráče procházet zdlouhavé menu a vytvářet místnosti.

**Taktika a variabilita:** *Battleshiponline.org* selhává, má jen klasická pravidla a hra je jen o štěstí. *Sea Battle 2* je na tom díky arzenálu (radary, miny, letecké útoky) mnohem lépe a dává hráči prostor pro reálnou strategii.

**Rychlá příprava:** Obě hry mají možnost náhodného rozmístění lodí, takže rutinu řeší obstojně.

**2.2 Vyhodnocení, Pro/Proti a Ponaučení**

**Aplikace 1: Battleshiponline.org**

**Pro:**

* Hra přes vygenerovaný odkaz bez jakékoliv registrace.  
* Fungující tlačítko na náhodné rozházení lodí.  
* Čisté a přehledné prostředí, ve kterém se člověk hned vyzná.

**Proti:**

* Jen klasická pravidla bez jakýchkoliv schopností, hra rychle začne nudit.  
* Absence taktických mechanik nutí hráče jen slepě klikat čtverec po čtverci.  
* Špatná zpětná vazba, když soupeř přemýšlí (vypadá to, že hra zamrzla).

**Aplikace 2: Sea Battle 2 (Webová verze)**

**Pro:**

* Široký arzenál schopností (radar, letadla, miny), který odstraňuje náhodné hádání.  
* Rychlé automatické rozmístění lodí i se zbraněmi.  
* Povedené animace zásahů a útoků, které hráče udrží v pozornosti.

**Proti:**

* Příliš složitý začátek – žádný jednoduchý link pro kamaráda, nutnost proklikávat lobby.  
* Plno zbytečných herních módů, které tříští pozornost.  
* Rozhraní je přeplácané zbytečnými tlačítky a nabídkami.  
* 

**Konkrétní ponaučení pro náš projekt**

Z analýzy jsme si vzali jasné body pro návrh v Reactu:

**Co uděláme:**

* **Hraní jako host přes URL:** Žádné zakládání účtu před hrou. Hráč vytvoří hru, pošle kamarádovi odkaz a rovnou hrají.  
* **Dobrovolná registrace až po hře:** Kdo chce ukládat statistiky výher a proher, tomu po skončení zápasu nabídneme registraci. Kdo nechce, může hrát dál anonymně.  
* **Taktické schopnosti a gadgety:** Přidáme do hry speciální prvky (např. radar na prozkoumání oblasti 3x3 políčka nebo minu na obranu vlastních lodí), které dají hráčům kontrolu nad průběhem zápasu.  
* **Rychlý start:** Velké tlačítko na náhodné rozestavení hned na hlavní obrazovce přípravy, aby se neztrácel čas.

**Čeho se vyvarujeme:**

* Žádná povinná registrace nebo vybírání místností ze seznamu.  
* Po potopení lodě systém automaticky označí okolní políčka jako prázdná, aby hráč nemusel zbytečně klikat na místa, kde podle pravidel už nic být nemůže.

