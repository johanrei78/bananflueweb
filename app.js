// ---------------------------------------------------------
// APP-TILSTAND
// ---------------------------------------------------------

const state = {
    foreldre: [],
    alleKryss: [],
    alleForeldrePerKryss: [],
    nesteForeldre: [],
    kryssNr: 0,

    // Indeksen til krysset som vises på Resultater-siden.
    aktivtKryss: 0
};

// ---------------------------------------------------------
// MELDINGER TIL BRUKEREN
// ---------------------------------------------------------

function visMelding(tekst, type = "info") {

    const melding =
        document.getElementById("app-melding");

    let prefiks = "";

    if (type === "suksess") {
        prefiks = "Utført: ";
    }

    if (type === "feil") {
        prefiks = "Kan ikke utføres: ";
    }

    melding.textContent =
        prefiks + tekst;

    melding.className =
        `app-melding ${type}`;

    melding.hidden = false;
}


function skjulMelding() {

    const melding =
        document.getElementById("app-melding");

    melding.hidden = true;
    melding.textContent = "";
    melding.className = "app-melding";
}

// ---------------------------------------------------------
// LAG FORELDER I P-GENERASJONEN
// ---------------------------------------------------------

function lagPForelder(ant, oye, kropp, vinge, kjonn) {

    // Antenner:
    // Normal = aa
    // Aristapedia = Aa, fordi AA er letal
    const antenner =
        ant === "Aristapedia"
            ? ["A", "a"]
            : ["a", "a"];


    // Kroppsfarge og vinger ligger på samme kromosom.
    //
    // G = grå kropp (dominant)
    // g = sort kropp
    // V = normale vinger (dominant)
    // v = reduserte vinger

    const kroppAllel = kropp === "Grå" ? "G" : "g";
    const vingeAllel = vinge === "Normal" ? "V" : "v";

    const haplotype = `${kroppAllel}-${vingeAllel}`;

    // P-generasjonen er homozygot for disse genene.
    const haplotyper = [haplotype, haplotype];


    // X-bundet øyefarge.
    //
    // W = røde øyne
    // w = hvite øyne

    let oyefargeX;

    if (kjonn === "Hann") {
        oyefargeX = [oye === "Rød" ? "W" : "w"];
    } else {
        oyefargeX =
            oye === "Rød"
                ? ["W", "W"]
                : ["w", "w"];
    }


    return {
        antenner: antenner,
        haplotyper: haplotyper,
        oyefargeX: oyefargeX,
        kjonn: kjonn
    };
}

// ---------------------------------------------------------
// GENETIKK: GAMETER OG KRYSS
// ---------------------------------------------------------

function tilfeldigFra(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function lagGamet(individ) {

    // -----------------------------------------------------
    // Antenner (A/a)
    // -----------------------------------------------------

    const antAllel =
        tilfeldigFra(individ.antenner);


    // -----------------------------------------------------
    // Koblede gener: kroppsfarge og vinger
    // 20 % rekombinasjon
    // -----------------------------------------------------

    const h1 = individ.haplotyper[0];
    const h2 = individ.haplotyper[1];

    let haplotype;

    if (Math.random() < 0.2) {

        // Del haplotypene i kroppsfarge og vingeallel.
        const deler1 = h1.split("-");
        const deler2 = h2.split("-");

        if (Math.random() < 0.5) {

            haplotype =
                `${deler1[0]}-${deler2[1]}`;

        } else {

            haplotype =
                `${deler2[0]}-${deler1[1]}`;
        }

    } else {

        haplotype =
            tilfeldigFra([h1, h2]);
    }


    // -----------------------------------------------------
    // X-bundet øyefarge
    // -----------------------------------------------------

    if (individ.kjonn === "Hann") {

        // Hannen lager omtrent 50 % X-gameter
        // og 50 % Y-gameter.

        if (Math.random() < 0.5) {

            return {
                ant: antAllel,
                haplotype: haplotype,
                X: individ.oyefargeX[0]
            };

        } else {

            return {
                ant: antAllel,
                haplotype: haplotype,
                Y: true
            };
        }

    } else {

        // Hunnen gir alltid et X-kromosom.
        // Ett av hennes to X-alleler velges tilfeldig.

        return {
            ant: antAllel,
            haplotype: haplotype,
            X: tilfeldigFra(individ.oyefargeX)
        };
    }
}


function kryss(parent1, parent2, baseN = 1000) {

    // Samme variasjon som i Python-versjonen:
    // omtrent 1000 avkom, ±50.

    const n =
        baseN +
        Math.floor(Math.random() * 101) -
        50;

    const avkom = [];


    for (let i = 0; i < n; i++) {

        const g1 = lagGamet(parent1);
        const g2 = lagGamet(parent2);


        // -------------------------------------------------
        // Antenner
        // -------------------------------------------------

        const antenner = [g1.ant, g2.ant];

        // AA er letal.
        // Disse individene regnes derfor ikke blant
        // de levende avkommene.

        if (
            antenner[0] === "A" &&
            antenner[1] === "A"
        ) {
            continue;
        }


        // -------------------------------------------------
        // Kroppsfarge og vinger
        // -------------------------------------------------

        const haplotyper = [
            g1.haplotype,
            g2.haplotype
        ];


        // -------------------------------------------------
        // Kjønn og X-bundet øyefarge
        // -------------------------------------------------

        let kjonn;
        let oyefargeX;

        if (g1.Y || g2.Y) {

            kjonn = "Hann";

            // X-kromosomet kommer fra gameten
            // som ikke inneholder Y.

            const xAllel =
                g2.Y ? g1.X : g2.X;

            oyefargeX = [xAllel];

        } else {

            kjonn = "Hunn";

            oyefargeX = [
                g1.X,
                g2.X
            ];
        }


        const individ = {
            antenner: antenner,
            haplotyper: haplotyper,
            oyefargeX: oyefargeX,
            kjonn: kjonn
        };


        avkom.push(individ);
    }


    return avkom;
}

// ---------------------------------------------------------
// GENOTYPE → FENOTYPE
// ---------------------------------------------------------

function genotypeTilFenotype(geno) {

    // Antenner:
    // A er dominant og gir Aristapedia.
    const antenner =
        geno.antenner.includes("A")
            ? "Aristapedia"
            : "Normal";


    // Kroppsfarge og vinger
    const h1 = geno.haplotyper[0];
    const h2 = geno.haplotyper[1];

    // G er dominant over g.
    const kropp =
        h1.includes("G") || h2.includes("G")
            ? "Grå"
            : "Sort";

    // V er dominant over v.
    const vinger =
        h1.includes("V") || h2.includes("V")
            ? "Normal"
            : "Redusert";


    // X-bundet øyefarge
    let oye;

    if (geno.kjonn === "Hann") {

        oye =
            geno.oyefargeX[0] === "w"
                ? "Hvit"
                : "Rød";

    } else {

        oye =
            geno.oyefargeX[0] === "w" &&
            geno.oyefargeX[1] === "w"
                ? "Hvit"
                : "Rød";
    }


    return {
        ant: antenner,
        oye: oye,
        kropp: kropp,
        vinge: vinger
    };
}

// ---------------------------------------------------------
// FENOTYPE → BILDEFIL
// ---------------------------------------------------------

function phenotypeToImageCode(ant, oye, vinge, kropp) {

    const antCode =
        ant === "Aristapedia" ? "A" : "N";

    const oyeCode =
        oye === "Hvit" ? "H" : "R";

    const vingeCode =
        vinge === "Redusert" ? "R" : "N";

    const kroppCode =
        kropp === "Sort" ? "S" : "G";

    return `${antCode}_${oyeCode}_${vingeCode}_${kroppCode}`;
}

// ---------------------------------------------------------
// ALT-TEKST FOR BANANFLUEBILDER
// ---------------------------------------------------------

function lagAltTekst(ph) {

    return `Bananflue: ${ph.ant.toLowerCase()} antenner, ${ph.oye.toLowerCase()}e øyne, ${ph.vinge.toLowerCase()}e vinger og ${ph.kropp.toLowerCase()} kropp.`;
}

// ---------------------------------------------------------
// VIS VALGTE FORELDRE
// ---------------------------------------------------------

function visForeldre() {

    const container = document.getElementById("valgte-foreldre");

    container.innerHTML = "";

    if (state.foreldre.length === 0) {
        container.innerHTML = "<p>Ingen foreldre valgt ennå.</p>";
        return;
    }

    state.foreldre.forEach((forelder, index) => {

        const card = document.createElement("div");

        const ant = forelder.valgtFenotype.ant;
        const oye = forelder.valgtFenotype.oye;
        const kropp = forelder.valgtFenotype.kropp;
        const vinge = forelder.valgtFenotype.vinge;

        const imageCode =
            phenotypeToImageCode(ant, oye, vinge, kropp);

        const imagePath =
            `images/${imageCode}.png`;

        const kjonnSymbol =
            forelder.kjonn === "Hunn" ? "♀" : "♂";

        const altTekst =
            lagAltTekst(forelder.valgtFenotype);
        
        card.innerHTML = `
            <h4>Forelder ${index + 1}</h4>

            <img
                src="${imagePath}"
                alt="${altTekst}"
                width="150"
            >

            <p>
                ${ant} antenner,
                ${oye.toLowerCase()}e øyne,
                ${vinge.toLowerCase()}e vinger,
                ${kropp.toLowerCase()} kropp
                (${kjonnSymbol})
            </p>
        `;

        container.appendChild(card);
    });
}


// ---------------------------------------------------------
// LEGG TIL FORELDER
// ---------------------------------------------------------

document
    .getElementById("legg-til-forelder")
    .addEventListener("click", function () {

        if (state.foreldre.length >= 2) {
            visMelding(
                "Du kan bare velge to foreldre.",
                "feil"
            );
            return;
        }

        const ant =
            document.getElementById("antenner").value;

        const oye =
            document.getElementById("oyefarge").value;

        const kropp =
            document.getElementById("kropp").value;

        const vinge =
            document.getElementById("vinger").value;

        const kjonn =
            document.querySelector(
                'input[name="kjonn"]:checked'
            ).value;


        // Forelder nummer 2 må ha motsatt kjønn.
        if (state.foreldre.length === 1) {

            const forsteKjonn =
                state.foreldre[0].kjonn;

            if (forsteKjonn === kjonn) {
                visMelding(
                    "Forelder 2 må ha motsatt kjønn av forelder 1.",
                    "feil"
                );
                return;
            }
        }


        const forelder =
            lagPForelder(
                ant,
                oye,
                kropp,
                vinge,
                kjonn
            );


        // Vi lagrer også den valgte fenotypen.
        // Dette gjør det enkelt å finne riktig bilde.
        forelder.valgtFenotype = {
            ant: ant,
            oye: oye,
            kropp: kropp,
            vinge: vinge
        };


        state.foreldre.push(forelder);

        visMelding(
            "Forelder er lagt til.",
            "suksess"
        );

        // Når begge P-foreldrene er valgt,
        // er de klare til første kryss.
        if (state.foreldre.length === 2) {
            state.nesteForeldre =
                [...state.foreldre];
        }


        visForeldre();
    });


// ---------------------------------------------------------
// RESET
// ---------------------------------------------------------

document
    .getElementById("reset")
    .addEventListener("click", function () {

        state.foreldre = [];
        state.alleKryss = [];
        state.alleForeldrePerKryss = [];
        state.nesteForeldre = [];
        state.kryssNr = 0;
        state.aktivtKryss = 0;

        visForeldre();
    });


// ---------------------------------------------------------
// NAVIGASJON
// ---------------------------------------------------------

const pages = [
    "velg-foreldre",
    "krysning",
    "resultater",
    "oppsummering"
];

function visSide(pageId) {

    skjulMelding();
    
    pages.forEach(function (id) {

        const page = document.getElementById(id);

        if (page) {
            page.hidden = id !== pageId;
        }
    });

    // Marker aktiv side i hovedmenyen
    document
        .querySelectorAll("nav button[data-page]")
        .forEach(function (button) {

            const erAktiv =
                button.dataset.page === pageId;

            button.classList.toggle(
                "aktiv-side",
                erAktiv
            );

            if (erAktiv) {
                button.setAttribute(
                    "aria-current",
                    "page"
                );
            } else {
                button.removeAttribute(
                    "aria-current"
                );
            }
        });
    
    if (pageId === "krysning") {
        visKrysningsforeldre();
    }

    if (pageId === "resultater") {
        visResultater();
    }

    if (pageId === "oppsummering") {
        visOppsummering();
    }
}


document
    .querySelectorAll("nav button[data-page]")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            const pageId = button.dataset.page;


            visSide(pageId);
        });
    });


// ---------------------------------------------------------
// VIS FORELDRE PÅ KRYSNINGSSIDEN
// ---------------------------------------------------------

function visKrysningsforeldre() {

    const container =
        document.getElementById("krysningsforeldre");

    const status =
        document.getElementById("krysning-status");

    container.innerHTML = "";

    if (state.nesteForeldre.length !== 2) {

        if (
            state.foreldre.length < 2 &&
            state.alleKryss.length === 0
        ) {

            status.textContent =
                "Start med å velge to P-foreldre på siden «Velg foreldre».";

        } else {

            status.textContent =
                "Velg to foreldre, én hunn og én hann, på siden «Resultater».";
        }

        return;
    }
    
    status.textContent =
        "Disse foreldrene er klare til krysning.";

    state.nesteForeldre.forEach(function (forelder, index) {

        const ant = forelder.valgtFenotype.ant;
        const oye = forelder.valgtFenotype.oye;
        const kropp = forelder.valgtFenotype.kropp;
        const vinge = forelder.valgtFenotype.vinge;

        const imageCode =
            phenotypeToImageCode(
                ant,
                oye,
                vinge,
                kropp
            );

        const imagePath =
            `images/${imageCode}.png`;

        const kjonnSymbol =
            forelder.kjonn === "Hunn" ? "♀" : "♂";

        const card =
            document.createElement("div");

        const altTekst =
            lagAltTekst(forelder.valgtFenotype);
        
        card.innerHTML = `
            <h3>Forelder ${index + 1}</h3>

            <img
                src="${imagePath}"
                alt="${altTekst}"
                width="150"
            >

            <p>
                ${ant} antenner,
                ${oye.toLowerCase()}e øyne,
                ${vinge.toLowerCase()}e vinger,
                ${kropp.toLowerCase()} kropp
                (${kjonnSymbol})
            </p>
        `;

        container.appendChild(card);
    });
}

// ---------------------------------------------------------
// UTFØR KRYSNING
// ---------------------------------------------------------

document
    .getElementById("utfor-krysning")
    .addEventListener("click", function () {

        console.log("Utfør krysning-knappen ble trykket");
        
        if (state.nesteForeldre.length !== 2) {

            visMelding(
                "Du må velge to foreldre før du kan utføre krysningen.",
                "feil"
        );

            return;
        }


        const parent1 = state.nesteForeldre[0];
        const parent2 = state.nesteForeldre[1];


        const avkom =
            kryss(parent1, parent2, 1000);


        state.kryssNr += 1;

        state.alleKryss.push(avkom);

        state.alleForeldrePerKryss.push([
            parent1,
            parent2
        ]);

        // Vis det nyeste krysset som standard på Resultater-siden.
        state.aktivtKryss =
            state.alleKryss.length - 1;

        // Etter utført kryss må nye foreldre velges
        // før neste krysning.
        state.nesteForeldre = [];


        visMelding(
            `Krysning ${state.kryssNr} er fullført med ${avkom.length} levende avkom.`,
            "suksess"
        );
    });

// ---------------------------------------------------------
// VIS RESULTATER
// ---------------------------------------------------------

function visResultater() {

    const status =
        document.getElementById("resultat-status");

    const container =
        document.getElementById("resultat-grid");

    container.innerHTML = "";

    const faneContainer =
        document.getElementById("resultat-faner");

    faneContainer.innerHTML = "";

    faneContainer.setAttribute("role", "tablist");
    faneContainer.setAttribute(
        "aria-label",
        "Velg krysning"
    );
    
    if (state.alleKryss.length === 0) {

        status.textContent =
            "Ingen krysninger ennå.";

        return;
    }

    // -----------------------------------------------------
    // FANER FOR TIDLIGERE KRYSS
    // -----------------------------------------------------

    state.alleKryss.forEach(function (_, index) {

        const knapp =
            document.createElement("button");

        knapp.type = "button";

        knapp.textContent =
            `Krysning ${index + 1}`;

        knapp.className =
            "resultat-fane";

        knapp.setAttribute("role", "tab");

        knapp.setAttribute(
            "aria-selected",
            index === state.aktivtKryss
                ? "true"
                : "false"
        );
        
        if (index === state.aktivtKryss) {
            knapp.classList.add("aktiv");
        }

        knapp.addEventListener(
            "click",
            function () {

                state.aktivtKryss = index;

                visResultater();
            }
        );

        faneContainer.appendChild(knapp);
    });

    // -----------------------------------------------------
    // VELG HVILKET KRYSS SOM SKAL VISES
    // -----------------------------------------------------

    const kryssIndex =
        state.aktivtKryss;

    const avkom =
        state.alleKryss[kryssIndex];

    const foreldreBrukt =
        state.alleForeldrePerKryss[kryssIndex];

    status.textContent =
        `Krysning ${kryssIndex + 1}: ${avkom.length} levende avkom.`;

    const parentSection =
        document.createElement("section");

    parentSection.innerHTML = `
        <h3>Foreldre brukt i dette krysset</h3>
    `;

    const parentGrid =
        document.createElement("div");

    parentGrid.className = "parent-grid";


    foreldreBrukt.forEach(function (forelder, index) {

        const ph =
            genotypeTilFenotype(forelder);

        const altTekst = 
            lagAltTekst(ph);
        
        const imageCode =
            phenotypeToImageCode(
                ph.ant,
                ph.oye,
                ph.vinge,
                ph.kropp
            );

        const imagePath =
            `images/${imageCode}.png`;

        const symbol =
            forelder.kjonn === "Hunn" ? "♀" : "♂";

        const card =
            document.createElement("div");

        card.innerHTML = `
            <h4>Forelder ${index + 1}</h4>

            <img
                src="${imagePath}"
                alt="${altTekst}"
                width="150"
            >

            <p>
                ${ph.ant} antenner,
                ${ph.oye.toLowerCase()}e øyne,
                ${ph.vinge.toLowerCase()}e vinger,
                ${ph.kropp.toLowerCase()} kropp
                (${symbol})
            </p>

            <button
                type="button"
                class="velg-tidligere-forelder"
            >
                Velg til neste kryss
            </button>
        `;

        const knapp =
            card.querySelector(
                ".velg-tidligere-forelder"
            );

        knapp.addEventListener(
            "click",
            function () {

                velgEksisterendeForelder(
                    forelder
                );
            }
        );

        parentGrid.appendChild(card);
    });


    parentSection.appendChild(parentGrid);

    container.appendChild(parentSection);

    const offspringHeading =
        document.createElement("h3");

    offspringHeading.textContent =
        "Avkom – fenotyper";

    container.appendChild(offspringHeading);
    
    // -----------------------------------------------------
    // GRUPPER AVKOM ETTER FENOTYPE
    // -----------------------------------------------------

    const grupper = {};


    avkom.forEach(function (geno) {

        const ph =
            genotypeTilFenotype(geno);

        const key =
            `${ph.ant}|${ph.oye}|${ph.vinge}|${ph.kropp}`;


        if (!grupper[key]) {

            grupper[key] = {
                fenotype: ph,
                total: 0,
                hann: 0,
                hunn: 0,

                // Her lagrer vi de faktiske individene
                // slik at ett av dem senere kan velges tilfeldig.
                hanner: [],
                hunner: []
            };
        }
                


        grupper[key].total += 1;


        if (geno.kjonn === "Hann") {

            grupper[key].hann += 1;
            grupper[key].hanner.push(geno);

        } else {

            grupper[key].hunn += 1;
            grupper[key].hunner.push(geno);
        }
    });


    // -----------------------------------------------------
    // SORTER: VANLIGSTE FENOTYPE FØRST
    // -----------------------------------------------------

    const sorterteGrupper =
        Object.values(grupper)
            .sort(function (a, b) {
                return b.total - a.total;
            });


    // -----------------------------------------------------
    // VIS ÉN FLUE PER FENOTYPE
    // -----------------------------------------------------

    sorterteGrupper.forEach(function (gruppe) {

        const ph =
            gruppe.fenotype;


        const imageCode =
            phenotypeToImageCode(
                ph.ant,
                ph.oye,
                ph.vinge,
                ph.kropp
            );


        const imagePath =
            `images/${imageCode}.png`;


        const card =
            document.createElement("div");

        card.className =
            "result-card";

        const altTekst =
            lagAltTekst(ph);
        
        card.innerHTML = `
            <img
                src="${imagePath}"
                alt="${altTekst}"
                width="150"
            >

            <p>
                <strong>
                    ${ph.ant} antenner,
                    ${ph.oye.toLowerCase()}e øyne,
                    ${ph.vinge.toLowerCase()}e vinger,
                    ${ph.kropp.toLowerCase()} kropp
                </strong>
            </p>

            <p>
                Antall: ${gruppe.total}<br>
                ♂ ${gruppe.hann}
                &nbsp;&nbsp;
                ♀ ${gruppe.hunn}
            </p>

            <div class="result-buttons">

                <button
                    type="button"
                    class="velg-hunn"
                    ${gruppe.hunn === 0 ? "disabled" : ""}
                >
                    Velg hunn
                </button>

                <button
                    type="button"
                    class="velg-hann"
                    ${gruppe.hann === 0 ? "disabled" : ""}
                >
                    Velg hann
                </button>

            </div>
        `;

        const hunnKnapp =
            card.querySelector(".velg-hunn");

        const hannKnapp =
            card.querySelector(".velg-hann");


        hunnKnapp.addEventListener("click", function () {

            velgTilNesteKryss(
                gruppe.hunner,
                "Hunn"
            );
        });


        hannKnapp.addEventListener("click", function () {

            velgTilNesteKryss(
                gruppe.hanner,
                "Hann"
            );
        });
        
        container.appendChild(card);
    });
}

// ---------------------------------------------------------
// VELG AVKOM TIL NESTE KRYSS
// ---------------------------------------------------------

function velgTilNesteKryss(individer, kjonn) {

    if (individer.length === 0) {
        return;
    }


    // Maksimalt to foreldre kan velges.
    if (state.nesteForeldre.length >= 2) {

        visMelding(
            "Du har allerede valgt to foreldre til neste kryss.",
            "feil"
        );
        

        return;
    }


    // Hvis én forelder allerede er valgt,
    // må den neste ha motsatt kjønn.
    if (
        state.nesteForeldre.length === 1 &&
        state.nesteForeldre[0].kjonn === kjonn
    ) {

        visMelding(
            "Du må velge et individ av motsatt kjønn.",
            "feil"
        );

        return;
    }


    // Velg tilfeldig blant alle individer med
    // denne fenotypen og dette kjønnet.
    const kandidat =
        tilfeldigFra(individer);


    // Avkom har ikke valgtFenotype fra P-siden.
    // Derfor lager vi fenotypen fra genotypen.
    kandidat.valgtFenotype =
        genotypeTilFenotype(kandidat);


    state.nesteForeldre.push(kandidat);


    const symbol =
        kjonn === "Hunn" ? "♀" : "♂";


    visMelding(
        `${kjonn} ${symbol} er valgt til neste kryss.`,
        "suksess"
    );
}

// ---------------------------------------------------------
// VELG TIDLIGERE FORELDER TIL NESTE KRYSS
// ---------------------------------------------------------

function velgEksisterendeForelder(forelder) {

    if (state.nesteForeldre.length >= 2) {

        visMelding(
            "Du har allerede valgt to foreldre til neste kryss.",
            "feil"
        );

        return;
    }


    if (
        state.nesteForeldre.length === 1 &&
        state.nesteForeldre[0].kjonn === forelder.kjonn
    ) {

        visMelding(
            "Du må velge et individ av motsatt kjønn.",
            "feil"
        );

        return;
    }


    forelder.valgtFenotype =
        genotypeTilFenotype(forelder);


    state.nesteForeldre.push(forelder);


    const symbol =
        forelder.kjonn === "Hunn"
            ? "♀"
            : "♂";

    visMelding(
        `${forelder.kjonn} ${symbol} er valgt til neste kryss.`,
        "suksess"
    );

}

// ---------------------------------------------------------
// VIS OPPSUMMERING
// ---------------------------------------------------------

function visOppsummering() {

    const status =
        document.getElementById("oppsummering-status");

    const faneContainer =
        document.getElementById("oppsummering-faner");

    const tabellContainer =
        document.getElementById("oppsummering-tabell");

    const ignorerKjonn =
        document.getElementById("ignorer-kjonn").checked;


    faneContainer.innerHTML = "";

    faneContainer.setAttribute("role", "tablist");

    faneContainer.setAttribute(
        "aria-label",
        "Velg krysning"
    );
    
    tabellContainer.innerHTML = "";


    if (state.alleKryss.length === 0) {

        status.textContent =
            "Ingen krysninger ennå.";

        return;
    }


    // -----------------------------------------------------
    // FANER
    // -----------------------------------------------------

    state.alleKryss.forEach(function (_, index) {

        const knapp =
            document.createElement("button");

        knapp.type = "button";

        knapp.textContent =
            `Krysning ${index + 1}`;

        knapp.className =
            "resultat-fane";

        knapp.setAttribute("role", "tab");

        knapp.setAttribute(
            "aria-selected",
            index === state.aktivtKryss
                ? "true"
                : "false"
        );
        
        if (index === state.aktivtKryss) {
            knapp.classList.add("aktiv");
        }

        knapp.addEventListener(
            "click",
            function () {

                state.aktivtKryss = index;

                visOppsummering();
            }
        );

        faneContainer.appendChild(knapp);
    });


    const kryssIndex =
        state.aktivtKryss;

    const avkom =
        state.alleKryss[kryssIndex];

    status.textContent =
        `Krysning ${kryssIndex + 1}: ${avkom.length} levende avkom.`;


    // -----------------------------------------------------
    // GRUPPER AVKOM
    // -----------------------------------------------------

    const grupper = {};


    avkom.forEach(function (geno) {

        const ph =
            genotypeTilFenotype(geno);

        const key =
            `${ph.ant}|${ph.oye}|${ph.vinge}|${ph.kropp}`;


        if (!grupper[key]) {

            grupper[key] = {
                fenotype: ph,
                total: 0,
                hann: 0,
                hunn: 0
            };
        }


        grupper[key].total += 1;


        if (geno.kjonn === "Hann") {
            grupper[key].hann += 1;
        } else {
            grupper[key].hunn += 1;
        }
    });


    const sorterteGrupper =
        Object.values(grupper)
            .sort(function (a, b) {
                return b.total - a.total;
            });


    // -----------------------------------------------------
    // LAG TABELL
    // -----------------------------------------------------

    const table =
        document.createElement("table");

    table.className =
        "oppsummering-tabell";


    if (ignorerKjonn) {

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Fenotype</th>
                    <th>Antall</th>
                    <th>Andel</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

    } else {

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Fenotype</th>
                    <th>Antall</th>
                    <th>Andel</th>
                    <th>♂ Antall</th>
                    <th>♂ Andel</th>
                    <th>♀ Antall</th>
                    <th>♀ Andel</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
    }


    const tbody =
        table.querySelector("tbody");


    sorterteGrupper.forEach(function (gruppe) {

        const ph =
            gruppe.fenotype;

        const fenotypeTekst =
            `${ph.ant} antenner, ${ph.oye.toLowerCase()}e øyne, ${ph.vinge.toLowerCase()}e vinger, ${ph.kropp.toLowerCase()} kropp`;

        const total =
            avkom.length;

        const andel =
            (gruppe.total * 100 / total).toFixed(1);


        const row =
            document.createElement("tr");


        if (ignorerKjonn) {

            row.innerHTML = `
                <td>${fenotypeTekst}</td>
                <td>${gruppe.total}</td>
                <td>${andel} %</td>
            `;

        } else {

            const hannAndel =
                (gruppe.hann * 100 / total).toFixed(1);

            const hunnAndel =
                (gruppe.hunn * 100 / total).toFixed(1);


            row.innerHTML = `
                <td>${fenotypeTekst}</td>
                <td>${gruppe.total}</td>
                <td>${andel} %</td>
                <td>${gruppe.hann}</td>
                <td>${hannAndel} %</td>
                <td>${gruppe.hunn}</td>
                <td>${hunnAndel} %</td>
            `;
        }


        tbody.appendChild(row);
    });


    tabellContainer.appendChild(table);
}

document
    .getElementById("ignorer-kjonn")
    .addEventListener("change", function () {

        visOppsummering();
    });

visSide("velg-foreldre");
