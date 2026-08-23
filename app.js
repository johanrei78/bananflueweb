// ---------------------------------------------------------
// APP-TILSTAND
// ---------------------------------------------------------

const state = {
    foreldre: [],
    alleKryss: [],
    alleForeldrePerKryss: [],
    nesteForeldre: [],
    kryssNr: 0
};


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

        card.innerHTML = `
            <h4>Forelder ${index + 1}</h4>

            <img
                src="${imagePath}"
                alt="Bananflue med ${ant.toLowerCase()} antenner, ${oye.toLowerCase()}e øyne, ${vinge.toLowerCase()}e vinger og ${kropp.toLowerCase()} kropp"
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
            alert("Du kan bare velge to foreldre.");
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
                alert(
                    "Forelder 2 må ha motsatt kjønn av forelder 1."
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

        visForeldre();
    });


// ---------------------------------------------------------
// NAVIGASJON
// ---------------------------------------------------------

const pages = [
    "velg-foreldre",
    "krysning"
];

function visSide(pageId) {

    pages.forEach(function (id) {

        const page = document.getElementById(id);

        if (page) {
            page.hidden = id !== pageId;
        }
    });

    if (pageId === "krysning") {
        visKrysningsforeldre();
    }
}


document
    .querySelectorAll("nav button[data-page]")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            const pageId = button.dataset.page;

            // Resultater og oppsummering lager vi senere.
            if (pageId === "resultater" ||
                pageId === "oppsummering") {

                alert("Denne siden kommer i neste del av appen.");
                return;
            }

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

        status.textContent =
            "Start med å velge to P-foreldre på siden «Velg foreldre».";

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

        card.innerHTML = `
            <h3>Forelder ${index + 1}</h3>

            <img
                src="${imagePath}"
                alt="Valgt forelder ${index + 1}"
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
