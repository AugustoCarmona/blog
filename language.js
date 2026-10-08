(() => {
  const root = document.documentElement;
  const isConecta = root.dataset.site === "conecta";
  const requested = new URLSearchParams(location.search).get("lang");
  let saved;
  try { saved = localStorage.getItem("augusto-language"); } catch {}
  const language = ["es", "en"].includes(requested) ? requested : ["es", "en"].includes(saved) ? saved : "es";
  try { localStorage.setItem("augusto-language", language); } catch {}
  root.lang = language;
  const url = new URL(location.href);
  url.searchParams.set("lang", language);
  history.replaceState(null, "", url);

  const dictionary = window.siteTranslations[isConecta ? "conecta" : "blog"];
  const translate = (text) => {
    const normalized = text.trim().replace(/\s+/g, " ");
    if (!Object.hasOwn(dictionary, normalized)) return text;
    return text.replace(/\S[\s\S]*\S|\S/, dictionary[normalized]);
  };
  if ((isConecta && language === "en") || (!isConecta && language === "es")) {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => node.parentElement.closest("script, style, noscript") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    while (walker.nextNode()) walker.currentNode.textContent = translate(walker.currentNode.textContent);
    document.querySelectorAll("*").forEach((element) => {
      ["aria-label", "alt", "placeholder", "title", "data-typewriter", "data-footer-typewriter"].forEach((attribute) => {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, translate(element.getAttribute(attribute)));
      });
    });
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = translate(description.content);
  }
  // Both downloads stay available, with labels in the selected UI language.
  document.querySelectorAll(".cv-button").forEach((link) => {
    const isSpanish = link.getAttribute("href").includes("_ES.pdf");
    link.firstChild.textContent = language === "es"
      ? (isSpanish ? "CV en español " : "CV en inglés ")
      : (isSpanish ? "CV in Spanish " : "CV in English ");
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href.startsWith("#")) return;
    const destination = new URL(href, location.href);
    if (destination.origin !== location.origin || destination.pathname.includes("/primer-proyecto/") || /\.[^/]+$/.test(destination.pathname) && !destination.pathname.endsWith(".html")) return;
    destination.searchParams.set("lang", language);
    link.href = destination.href;
  });

  const picker = document.createElement("nav");
  picker.className = "language-switch";
  picker.setAttribute("aria-label", language === "es" ? "Idioma" : "Language");
  for (const [code, label] of [["es", "español"], ["en", "english"]]) {
    const link = document.createElement("a");
    const destination = new URL(location.href);
    destination.searchParams.set("lang", code);
    link.href = destination.href;
    link.lang = code;
    link.textContent = label;
    if (code === language) link.setAttribute("aria-current", "true");
    picker.append(link);
  }
  document.body.prepend(picker);
  root.removeAttribute("data-language-pending");
})();
