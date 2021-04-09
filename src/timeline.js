"use strict";

/* ---------------------------
 * Carregando libs necessárias
 * ---------------------------
 */

// Filesystem
const fs = require("fs");

// Puppeteer com suporte para plugins
const puppeteer = require("puppeteer");

const linha_do_tempo = async () => {
  console.log("### Lava Jato - Linha do Tempo ###\n");

  // Guarda os itens da linha do tempo
  let resultados = [];

  // Inicia o browser
  const browser = await puppeteer.launch({
    headless: false, // Mudar para false para ver a janela do browser
    slowMo: 100, // Adiciona um tempo em milissegundos entre cada ação
    devtools: true
  });
  console.log("Browser - OK");

  // Nova página
  const page = await browser.newPage();
  console.log("Nova aba - OK");

  // Debug apenas - Permite que console.log() apareça no console do chrome (F12)
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));



  // Navegar até a página com a linha do tempo
  console.log("Site DO MPF - OK");
  await page.goto(
    "http://www.mpf.mp.br/grandes-casos/lava-jato/entenda-o-caso/lavajato-timeline-view",
    { waitUntil: "domcontentloaded" }
  );

  // Salvar o resultado da pesquisa
  const salvarResultado = async () => {
    // Seletor que indica o item da lista retornada
    const resultsSelector = "#linhadotempo-div > li.linha-item";
    await page.waitForSelector(resultsSelector);

    // Parsing do html retornado pela pesquisa
    const resultadosRetornados = await page.evaluate((resultsSelector) => {
      // Buscar a lista de itens retornados na página
      const itens = Array.from(document.querySelectorAll(resultsSelector));

      // Para cada item (noticia) na timeline...
      return itens.map((noticia) => {
        // Buscar as informações do item "Data publicação", "Ano do processo", etc.

        // Conterá as informações da notícia depois do parsing
        infos = {};

        // Data
        const dataSelector = "p.data_itemlinha";
        data = noticia.querySelector(dataSelector);
        infos.data = data.childNodes[0].textContent;

        // Título
        const tituloSelector = "b.titulo_itemlinha";
        titulo = noticia.querySelector(tituloSelector);
        infos.titulo = titulo.textContent;

        // Texto
        const textoNoticiaSelector = "div.timeline-text.d-block.position-relative.p-3 > p:nth-child(3)";
        texto = noticia.querySelector(textoNoticiaSelector);
        infos.texto = texto.textContent;
        
        // Link Para Matéria
        const linkMateriaSelector = "a.external-link";
        materia = noticia.querySelector(linkMateriaSelector);
        
        // Se o link existir...
        if (materia) {
            infos.linkMateria = materia.href;
        }

        // Números
        const titulosStatsSelector = "div.box_itemlinha > span.texto_itemlinha";
        const valoresStatsSelector = "div.box_itemlinha > span.valor_itemlinha";

        titulosStats = Array.from(noticia.querySelectorAll(titulosStatsSelector));
        valoresStats = Array.from(noticia.querySelectorAll(valoresStatsSelector));

        numeros = [];

        for(let i = 0; i < titulosStats.length; i++) {

            item = {};
            item.descricao = titulosStats[i].textContent.trim();
            item.valor = valoresStats[i].textContent;
            numeros.push(item);
        }

        // Se existirem estatísticas na notícia...
        if (numeros.length != 0) {
            infos.numeros = numeros;
        }
        

        return infos;
      });
    }, resultsSelector);

    // Retorna lista de notícias encontradas na timeline
    return resultadosRetornados;
  };

  console.log("Processando notícias da linha do tempo...");

  // Iniciar processamento
  let noticias = await salvarResultado();

// Linha do tempo processada. Fechar o browser.
  await browser.close();

  // Salvar os resultados em um arquivo no formato JSON.
  let json = JSON.stringify(noticias, null, 2);
  fs.writeFileSync('../saida/lavajato_linha_do_tempo.json', json);

  console.log("\n### Fim do processamento da linha do tempo ###");
};

linha_do_tempo();
