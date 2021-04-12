
const fs = require("fs");

let file1 = fs.readFileSync("../saida/lavajato_linha_do_tempo.json");
let noticias = JSON.parse(file1);

let denunciados = /[0–9]{2}/;
let crimes = /[0–9]{2}/;

let denunciaCrimeRegex = /denunciados?:(.*)(?=crimes?:(.*))/i;
let denunciaRegex = /denunciados?:(.*)/i;

for (var i in noticias) {
    texto = noticias[i].texto;

    if(denunciaCrimeRegex.test(texto)) {
        // Quando tem denunciados e crimes
        let tags = texto.match(denunciaCrimeRegex);
        noticias[i].denunciados = tags[1].trim();
        noticias[i].crimes = tags[2].trim();
    }
    else if(denunciaRegex.test(texto)) {
        // Quando só tem denunciados
        let tags = texto.match(denunciaRegex);
        noticias[i].denunciados = tags[1].trim();
    }
}

// Salvar novo json
let json = JSON.stringify(noticias, null, 2);
fs.writeFileSync("../saida/lavajato_linha_do_tempo_completo.json", json);
