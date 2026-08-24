# Bananflue-kryss 🧬

En nettbasert app for å utforske nedarvingsmønstre hos bananfluer (*Drosophila*).

Appen er laget i ren HTML, CSS og JavaScript og kjøres direkte i nettleseren. Den krever derfor ikke Python, Streamlit eller andre installasjoner.

## Funksjonalitet

Appen lar brukeren:

* velge fenotyper for fire egenskaper hos foreldre i P-generasjonen
* velge kjønn på foreldrene
* gjennomføre kryss med omtrent 1000 avkom
* se fordelingen av fenotyper blant avkommet
* se antall hanner og hunner for hver fenotype
* velge avkom som foreldre i neste kryss
* velge tidligere foreldre på nytt, for eksempel ved tilbakekrysning
* gjennomføre flere påfølgende kryss
* se resultater fra tidligere kryss
* se en tabellarisk oppsummering av fenotypefordelingen

## Genetisk modell

Appen simulerer fire egenskaper:

### Antenner

* `A` gir Aristapedia-fenotype og er dominant over `a`
* genotypen `AA` er letal
* individer med Aristapedia i P-generasjonen settes derfor til `Aa`

### Øyefarge

* genet er X-bundet
* `W` gir røde øyne og er dominant over `w`
* `w` gir hvite øyne når det dominante allelet mangler

### Kroppsfarge

* `G` gir grå kropp og er dominant over `g`
* `g/g` gir sort kropp

### Vinger

* `V` gir normale vinger og er dominant over `v`
* `v/v` gir reduserte vinger

Genene for kroppsfarge og vinger er koblet. Modellen bruker en rekombinasjonsfrekvens på 20 %.

P-foreldrene settes som hovedregel til homozygote genotyper for de valgte fenotypene. Unntakene er X-bundet arv og Aristapedia, der homozygot dominant genotype er letal.

## Simulering

Hvert kryss produserer omtrent 1000 avkom, med tilfeldig variasjon på ±50 individer.

For hvert avkom simuleres:

* allel for antennetype
* haplotype for de koblede genene kroppsfarge og vinger
* eventuell rekombinasjon
* kjønn
* X-bundet øyefarge

Avkom med den letale genotypen `AA` fjernes fra resultatene.

Når et avkom velges som forelder til neste kryss, velges et faktisk simulert individ tilfeldig blant avkommene med den aktuelle fenotypen og det aktuelle kjønnet. Eventuelle skjulte recessive alleler følger derfor individet videre til neste kryss.

## Universell utforming

Appen er utviklet med vekt på tilgjengelighet og tastaturbruk.

Blant annet er det lagt inn:

* tydelig fokusmarkering
* tastaturbetjening av interaktive elementer
* semantiske skjemaetiketter
* informative alt-tekster for bananfluebilder
* tilgjengelige navn på knapper
* `aria-live` for statusmeldinger
* semantiske faner for tidligere kryss
* tabelloverskrifter og tabelltittel i oppsummeringen
* responsiv layout for smalere skjermer

## Filer

```text
Bananflueapp-web/
├── index.html
├── style.css
├── app.js
├── images/
│   ├── A_H_N_G.png
│   ├── ...
│   └── N_R_R_S.png
└── README.md
```

* `index.html` inneholder strukturen og brukergrensesnittet.
* `style.css` inneholder layout og visuell utforming.
* `app.js` inneholder appens tilstand, genetikkmodell og interaktivitet.
* `images/` inneholder de 16 bananfluebildene som representerer mulige fenotyper.

## Kjøring

Appen kan åpnes direkte via `index.html`, eller publiseres som en statisk nettside, for eksempel med GitHub Pages.

Ingen byggprosess eller installasjon av avhengigheter er nødvendig.

## Teknologi

* HTML
* CSS
* JavaScript

Appen bruker ingen eksterne JavaScript-biblioteker eller rammeverk.
