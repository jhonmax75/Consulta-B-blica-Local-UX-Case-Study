(function () {
  "use strict";

  const form = document.getElementById("search-form");
  const input = document.getElementById("query");
  const results = document.getElementById("results");
  const title = document.getElementById("results-title");
  const summary = document.getElementById("results-summary");
  const notice = document.getElementById("data-notice");
  const showMore = document.getElementById("show-more");
  const pageSize = 100;
  const verses = Array.isArray(window.BIBLE_VERSES) ? window.BIBLE_VERSES : [];
  const verseByKey = new Map();
  const books = new Map();
  let matches = [];
  let renderedCount = 0;
  let activeTerms = [];

  function normalize(value) {
    return value.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[.]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function verseKey(book, chapter, verse) {
    return `${normalize(book)}|${chapter}|${verse}`;
  }

  for (const verse of verses) {
    verseByKey.set(verseKey(verse.book, verse.chapter, verse.verse), verse);
    if (!books.has(normalize(verse.book))) books.set(normalize(verse.book), verse.book);
  }
  books.set("cantico dos canticos", books.get("cantares"));
  books.set("canticos dos canticos", books.get("cantares"));
  books.set("lamentacoes de jeremias", books.get("lamentacoes"));
  for (const [numeric, roman] of [
    ["1 samuel", "i samuel"], ["2 samuel", "ii samuel"],
    ["1 reis", "i reis"], ["2 reis", "ii reis"],
    ["1 cronicas", "i cronicas"], ["2 cronicas", "ii cronicas"],
    ["1 corintios", "i corintios"], ["2 corintios", "ii corintios"],
    ["1 tessalonicenses", "i tessalonicenses"], ["2 tessalonicenses", "ii tessalonicenses"],
    ["1 timoteo", "i timoteo"], ["2 timoteo", "ii timoteo"],
    ["1 pedro", "i pedro"], ["2 pedro", "ii pedro"],
    ["1 joao", "i joao"], ["2 joao", "ii joao"], ["3 joao", "iii joao"]
  ]) {
    books.set(numeric, books.get(roman));
  }

  function parseReference(query) {
    const match = query.match(/^(.*?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*(\d+))?)?$/);
    if (!match) return null;
    const book = books.get(normalize(match[1]));
    if (!book) return { error: `Livro não reconhecido: ${match[1].trim()}.` };
    const chapter = Number(match[2]);
    if (!Number.isInteger(chapter) || chapter < 1) return { error: "Capítulo inválido." };
    if (!match[3]) return { book, chapter, start: 1, end: Infinity, chapterOnly: true };
    const start = Number(match[3]);
    const end = match[4] ? Number(match[4]) : start;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      return { error: "Intervalo de versículos inválido." };
    }
    return { book, chapter, start, end, chapterOnly: false };
  }

  function clearResults() {
    results.replaceChildren();
    renderedCount = 0;
    showMore.hidden = true;
  }

  function setMessage(heading, detail, warning) {
    title.textContent = heading;
    summary.textContent = detail || "";
    notice.textContent = warning || "";
    notice.classList.toggle("warning", Boolean(warning));
  }

  function appendHighlightedText(parent, text, terms) {
    if (!terms.length) {
      parent.textContent = text;
      return;
    }
    const ranges = [];
    let normalizedText = "";
    const originalStarts = [];
    const originalEnds = [];
    let originalIndex = 0;
    for (const character of text) {
      let normalizedCharacter = character.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
      if (/\s/.test(normalizedCharacter)) normalizedCharacter = " ";
      for (let unitIndex = 0; unitIndex < normalizedCharacter.length; unitIndex++) {
        const unit = normalizedCharacter[unitIndex];
        if (unit === " " && normalizedText.endsWith(" ")) {
          originalEnds[originalEnds.length - 1] = originalIndex + character.length;
          continue;
        }
        normalizedText += unit;
        originalStarts.push(originalIndex);
        originalEnds.push(originalIndex + character.length);
      }
      originalIndex += character.length;
    }
    for (const term of terms) {
      const needle = normalize(term);
      if (!needle) continue;
      let at = normalizedText.indexOf(needle);
      while (at !== -1) {
        ranges.push([
          originalStarts[at],
          originalEnds[at + needle.length - 1]
        ]);
        at = normalizedText.indexOf(needle, at + needle.length);
      }
    }
    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged = [];
    for (const range of ranges) {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
      else merged.push(range.slice());
    }
    if (!merged.length) {
      parent.textContent = text;
      return;
    }
    let cursor = 0;
    for (const [start, end] of merged) {
      parent.append(document.createTextNode(text.slice(cursor, start)));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(start, end);
      parent.append(mark);
      cursor = end;
    }
    parent.append(document.createTextNode(text.slice(cursor)));
  }

  function renderContext(card, verse, showChapter) {
    const container = card.querySelector(".context");
    if (container && container.dataset.chapter === String(showChapter)) {
      container.remove();
      for (const button of card.querySelectorAll(".context-button")) {
        button.setAttribute("aria-expanded", "false");
      }
      return;
    }
    const context = document.createElement("div");
    context.className = "context";
    context.dataset.chapter = String(showChapter);
    const neighbors = [];
    const first = showChapter ? 1 : Math.max(1, verse.verse - 2);
    const last = showChapter
      ? Math.max(...verses.filter(item =>
        normalize(item.book) === normalize(verse.book) && item.chapter === verse.chapter
      ).map(item => item.verse))
      : verse.verse + 2;
    for (let number = first; number <= last; number++) {
      const neighbor = verseByKey.get(verseKey(verse.book, verse.chapter, number));
      if (neighbor) neighbors.push(neighbor);
    }
    for (const neighbor of neighbors) {
      const line = document.createElement("p");
      const ref = document.createElement("strong");
      ref.textContent = neighbor.reference;
      line.append(ref, document.createTextNode(neighbor.text));
      if (neighbor.partial) line.append(document.createTextNode(" (trecho parcial na fonte)"));
      context.append(line);
    }
    if (container) container.remove();
    card.append(context);
    for (const button of card.querySelectorAll(".context-button")) {
      button.setAttribute("aria-expanded", String(button.dataset.chapter === String(showChapter)));
    }
  }

  function createCard(verse) {
    const card = document.createElement("article");
    card.className = "verse-card";
    const heading = document.createElement("h3");
    heading.textContent = verse.reference;
    const text = document.createElement("p");
    appendHighlightedText(text, verse.text, activeTerms);
    card.append(heading, text);

    const meta = document.createElement("div");
    meta.className = "verse-meta";
    if (verse.partial) {
      const badge = document.createElement("span");
      badge.className = "partial-badge";
      badge.textContent = "Trecho parcial na fonte";
      meta.append(badge);
    }
    const contextButton = document.createElement("button");
    contextButton.type = "button";
    contextButton.className = "context-button";
    contextButton.textContent = "Ver contexto (±2 versículos)";
    contextButton.dataset.chapter = "false";
    contextButton.setAttribute("aria-expanded", "false");
    contextButton.addEventListener("click", () => renderContext(card, verse, false));
    meta.append(contextButton);
    const chapterButton = document.createElement("button");
    chapterButton.type = "button";
    chapterButton.className = "context-button";
    chapterButton.textContent = "Ver capítulo";
    chapterButton.dataset.chapter = "true";
    chapterButton.setAttribute("aria-expanded", "false");
    chapterButton.addEventListener("click", () => renderContext(card, verse, true));
    meta.append(chapterButton);
    card.append(meta);
    return card;
  }

  function renderMore() {
    const end = Math.min(renderedCount + pageSize, matches.length);
    const fragment = document.createDocumentFragment();
    for (; renderedCount < end; renderedCount++) fragment.append(createCard(matches[renderedCount]));
    results.append(fragment);
    showMore.hidden = renderedCount >= matches.length;
    if (!showMore.hidden) showMore.textContent = `Mostrar mais resultados (${matches.length - renderedCount} restantes)`;
  }

  function search(query) {
    clearResults();
    const trimmed = query.trim();
    if (!trimmed) {
      setMessage("Comece uma pesquisa", "");
      return;
    }
    if (!verses.length) {
      setMessage("Dados de consulta indisponíveis", "", "Gere app/biblia-data.js usando scripts/exportar-dados-app.ps1.");
      return;
    }

    const reference = parseReference(trimmed);
    activeTerms = [];
    if (reference && reference.error) {
      setMessage("Referência inválida", reference.error);
      return;
    }
    if (reference) {
      matches = verses.filter(verse =>
        normalize(verse.book) === normalize(reference.book) &&
        verse.chapter === reference.chapter &&
        verse.verse >= reference.start && verse.verse <= reference.end
      );
      const requested = reference.chapterOnly
        ? `${reference.book} ${reference.chapter}`
        : `${reference.book} ${reference.chapter}:${reference.start}${reference.end !== reference.start ? `-${reference.end}` : ""}`;
      setMessage(requested, matches.length ? `${matches.length} versículo(s)` : "Referência não encontrada.");
      notice.textContent = "";
    } else {
      const terms = trimmed.split(",").map(term => term.trim()).filter(Boolean);
      activeTerms = terms;
      const normalizedTerms = terms.map(normalize);
      matches = verses.filter(verse => {
        const content = normalize(verse.text);
        return normalizedTerms.some(term => content.includes(term));
      });
      setMessage("Resultados da busca", `${matches.length} versículo(s) para ${terms.map(term => `“${term}”`).join(" ou ")}`);
      notice.textContent = "Palavras-chave separadas por vírgula são pesquisadas como alternativas.";
    }

    if (!matches.length) {
      results.replaceChildren();
      return;
    }
    renderMore();
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    search(input.value);
  });
  for (const button of document.querySelectorAll(".example")) {
    button.addEventListener("click", () => {
      input.value = button.dataset.query;
      search(input.value);
      input.focus();
    });
  }
  showMore.addEventListener("click", renderMore);
  setMessage("Comece uma pesquisa", "");
})();
