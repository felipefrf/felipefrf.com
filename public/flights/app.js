/* Flight Price Finder, public demo.
 *
 * Plays back searches that the real engine computed over recorded Google Flights
 * answers (data.js, written by scripts/export_showcase.py). This file computes no
 * fare and no saving: it only decides how to draw what the engine produced, in
 * the order the engine asked for it.
 */
(function () {
  "use strict";

  var DATA = window.FLIGHT_SHOWCASE;
  var BASE = window.FLIGHT_BASEMAP;
  var ROUTES = DATA.routes;
  var SVGNS = "http://www.w3.org/2000/svg";

  // --- words -------------------------------------------------------------------
  var I18N = {
    en: {
      badge: "Recorded searches, replayed. Not live prices.",
      kicker: "Hidden-city fares",
      title: "The cheapest ticket to your city is sometimes a ticket to somewhere else.",
      lede: "Airlines price a ticket by where it ends, not by where it stops. A ticket to a city beyond yours that connects through yours can cost less than the direct flight. You get off at the connection. This engine hunts for those tickets.",
      pick: "Pick a recorded search",
      typeLabel: "or type a route",
      liveNote: "Want a route that isn't here? The real app searches any route with live fares; it runs on my own machine, because every search costs paid API calls.",
      go: "Search",
      legend: "Legend",
      lgOrigin: "origin",
      lgExit: "where you get off",
      lgBeyond: "city on the ticket",
      lgFlown: "flown",
      lgSkipped: "bought, not flown",
      lgProbe: "city checked",
      logTitle: "Search log",
      skip: "Skip",
      replay: "Replay",
      ph1: "Direct fares",
      ph2: "Cities beyond",
      ph3: "Hidden-city check",
      howTitle: "How the engine works",
      how1t: "Price the direct flight",
      how1: "One call to Google Flights (through SerpApi) for the route you asked, with the nearby airports in the same field: São Paulo is Guarulhos, Congonhas and Viracopos at once.",
      how2t: "Fan out to the cities beyond",
      how2: "From OpenFlights route data it picks the busiest cities an airline flies to from your destination, then asks for a ticket from your origin to each of them, one call per city.",
      how3t: "Keep the tickets that stop at your city",
      how3: "A ticket counts only if it is one through-fare that connects at your destination and costs less than flying directly to the airport where you would get off. Summing two tickets never finds this, so the engine never does it.",
      howReplay: "This page runs nothing live. Each search was made with the real app, which keeps every answer it pays for. Those answers were saved as recordings, and the real engine was re-run over them through a replay provider that refuses any question the recording cannot answer. The numbers here are its output, unedited.",
      howStack: "Python, FastAPI and SQLite on the owner's machine, with server-sent events for progress. The provider sits behind a typed protocol. Over 500 offline tests, including one that rebuilds this page's data and fails if it differs from what is published.",
      footBy: "Built by",
      footSrc: "Fares: Google Flights via SerpApi, recorded August 2026. Map: Natural Earth. Routes: OpenFlights. Type: IBM Plex.",
      mapTitle: "Map of the airports this search checks",
      calls: "{n} calls",
      recordedShort: "rec. {d}",
      typedMiss: "That isn't one of the recorded searches. This replay holds four; the live app searches any route.",
      typedHit: "Found it: {r}.",
      typedEmpty: "Type two airports or cities, like VIX GRU or Fortaleza São Paulo.",
      logIdle: "Pick a search to watch the engine run it.",
      logStart: "Replaying {n} recorded answers from {d}.",
      logDirectDone: "Cheapest direct: {p} to {a}. Now the cities beyond.",
      logNoneLeft: "No ticket beyond stops at {c} for less. Done.",
      logFound: "{n} ticket(s) beyond connect at {c} for less. Done.",
      itins: "{n} itineraries",
      viaN: "{n}/{t} via {c}",
      outRoute: "from {p}",
      outFind: "{p} · less",
      outPricier: "{p} · more",
      outNovia: "not via {c}",
      outEmpty: "no flights",
      foundKicker: "Hidden-city fare found",
      foundMany: "{n} found",
      foundHead: "Book {o} → {b}, get off in {e}.",
      noneKicker: "Nothing found",
      noneHead: "No cheaper ticket stops in {c}. The direct fare stands: {p}.",
      noneBody: "The engine asked for tickets to {n} cities beyond {c}. None of them connects there for less. That is the common case: hidden-city fares depend on the route and on the day.",
      kDirect: "Direct to {a}",
      kTicket: "Ticket to {b}",
      rLegs: "you fly {f} of {t} legs",
      kSave: "You save",
      ctxBeats: "The cheapest direct into {c} is {p} ({a}). This ticket beats that too, by {d}.",
      ctxLoses: "The cheapest direct into {c} is {p} ({a}), {d} less than this ticket: it only beats flying straight to {e}.",
      ctxSingle: "Compared with the cheapest direct flight to {e} found in the same search.",
      more: "Itinerary and warnings",
      dTitle: "{o} → {d}",
      dStamp: "Recorded {t} · {n} calls · Google Flights via SerpApi",
      sTicket: "The ticket",
      sFinds: "Every hidden-city fare found",
      sDirect: "Direct fares",
      sChecked: "Every city the engine checked",
      sLog: "Engine log",
      sNone: "The result",
      getOff: "get off",
      notFlown: "not flown",
      layover: "{t} connection in {a}",
      overnight: "overnight",
      long: "long",
      caution: "Before you buy one",
      c1: "<b>It breaks the airline's contract of carriage.</b> Airlines forbid it and can cancel the ticket or the loyalty account.",
      c2: "<b>Carry-on only.</b> A checked bag goes to the ticket's final city: {b}.",
      c3: "<b>One-way only.</b> Skipping a leg cancels every leg after it, including a return.",
      c4: "This fare was seen on {d}. It has almost certainly changed.",
      thRoute: "Ticket", thExit: "Get off", thFare: "Fare", thDirect: "Direct there", thSave: "Saving", thVsAll: "vs cheapest direct",
      thFlight: "Flight", thDep: "Departs", thArr: "Arrives",
      chFind: "cheaper, stops at {c}", chPricier: "stops at {c}, costs more", chNovia: "never stops at {c}", chEmpty: "no flights",
      moreOptions: "{n} more direct options in the recording.",
      less: "{p} less", pmore: "{p} more", thRouteD: "Route", chEmpty2: "no flights that day",
      panelNote: "Every fare on this page was recorded from Google Flights in August 2026 and has expired since. The searches are real; the replay re-runs the real engine over their answers, and nothing is typed in by hand.",
      noteLabel: "About this search",
      dateRange: "{a} to {b}",
      cityChecked: "{n} cities beyond"
    },
    pt: {
      badge: "Buscas gravadas, reproduzidas. Preços não são ao vivo.",
      kicker: "Tarifas hidden-city",
      title: "A passagem mais barata para a sua cidade às vezes é uma passagem para outro lugar.",
      lede: "A companhia aérea cobra pelo destino final, não pelas escalas. Um bilhete para uma cidade além da sua, com conexão na sua, pode custar menos que o voo direto. Você desce na conexão. Este motor caça esses bilhetes.",
      pick: "Escolha uma busca gravada",
      typeLabel: "ou digite uma rota",
      liveNote: "Quer uma rota que não está aqui? O app de verdade busca qualquer rota com preços ao vivo; ele roda na minha máquina, porque cada busca gasta chamadas pagas de API.",
      go: "Buscar",
      legend: "Legenda",
      lgOrigin: "origem",
      lgExit: "onde você desce",
      lgBeyond: "cidade do bilhete",
      lgFlown: "voado",
      lgSkipped: "comprado, não voado",
      lgProbe: "cidade consultada",
      logTitle: "Diário da busca",
      skip: "Pular",
      replay: "Repetir",
      ph1: "Tarifas diretas",
      ph2: "Cidades além",
      ph3: "Checagem hidden-city",
      howTitle: "Como o motor funciona",
      how1t: "Cota o voo direto",
      how1: "Uma chamada ao Google Flights (via SerpApi) para a rota pedida, com os aeroportos próximos no mesmo campo: São Paulo é Guarulhos, Congonhas e Viracopos de uma vez.",
      how2t: "Abre o leque para as cidades além",
      how2: "Pelos dados de rotas do OpenFlights, escolhe as cidades mais movimentadas para onde se voa a partir do seu destino e pede um bilhete da sua origem até cada uma, uma chamada por cidade.",
      how3t: "Fica com os bilhetes que param na sua cidade",
      how3: "Só vale se for uma tarifa única com conexão no seu destino, mais barata que o voo direto para o aeroporto onde você desceria. Somar dois bilhetes nunca acha isso, então o motor nunca soma.",
      howReplay: "Nada nesta página roda ao vivo. Cada busca foi feita no app de verdade, que guarda toda resposta pela qual pagou. Essas respostas viraram gravações, e o motor de verdade rodou de novo sobre elas por um provedor de replay que recusa qualquer pergunta que a gravação não responda. Os números são a saída dele, sem edição.",
      howStack: "Python, FastAPI e SQLite na máquina do dono, com server-sent events para o progresso. O provedor fica atrás de um protocolo tipado. Mais de 500 testes offline, incluindo um que reconstrói os dados desta página e falha se diferirem do publicado.",
      footBy: "Feito por",
      footSrc: "Tarifas: Google Flights via SerpApi, gravadas em agosto de 2026. Mapa: Natural Earth. Rotas: OpenFlights. Tipos: IBM Plex.",
      mapTitle: "Mapa dos aeroportos que esta busca consulta",
      calls: "{n} chamadas",
      recordedShort: "grav. {d}",
      typedMiss: "Essa não é uma das buscas gravadas. Este replay tem quatro; o app de verdade busca qualquer rota.",
      typedHit: "Achei: {r}.",
      typedEmpty: "Digite dois aeroportos ou cidades, como VIX GRU ou Fortaleza São Paulo.",
      logIdle: "Escolha uma busca para ver o motor rodar.",
      logStart: "Reproduzindo {n} respostas gravadas em {d}.",
      logDirectDone: "Direto mais barato: {p} para {a}. Agora, as cidades além.",
      logNoneLeft: "Nenhum bilhete além para em {c} por menos. Fim.",
      logFound: "{n} bilhete(s) além com conexão em {c} por menos. Fim.",
      itins: "{n} itinerários",
      viaN: "{n}/{t} via {c}",
      outRoute: "a partir de {p}",
      outFind: "{p} · menos",
      outPricier: "{p} · mais",
      outNovia: "não passa em {c}",
      outEmpty: "sem voos",
      foundKicker: "Tarifa hidden-city encontrada",
      foundMany: "{n} achados",
      foundHead: "Compre {o} → {b} e desça em {e}.",
      noneKicker: "Nada encontrado",
      noneHead: "Nenhum bilhete mais barato para em {c}. Vale a tarifa direta: {p}.",
      noneBody: "O motor pediu bilhetes para {n} cidades além de {c}. Nenhum faz conexão lá por menos. É o caso comum: hidden-city depende da rota e do dia.",
      kDirect: "Direto para {a}",
      kTicket: "Bilhete até {b}",
      rLegs: "você voa {f} de {t} trechos",
      kSave: "Você economiza",
      ctxBeats: "O direto mais barato para {c} é {p} ({a}). Este bilhete também ganha dele, por {d}.",
      ctxLoses: "O direto mais barato para {c} é {p} ({a}), {d} a menos que este bilhete: ele só ganha do voo direto para {e}.",
      ctxSingle: "Comparado com o voo direto mais barato para {e} na mesma busca.",
      more: "Itinerário e avisos",
      dTitle: "{o} → {d}",
      dStamp: "Gravada em {t} · {n} chamadas · Google Flights via SerpApi",
      sTicket: "O bilhete",
      sFinds: "Todas as tarifas hidden-city encontradas",
      sDirect: "Tarifas diretas",
      sChecked: "Todas as cidades que o motor consultou",
      sLog: "Log do motor",
      sNone: "O resultado",
      getOff: "desça aqui",
      notFlown: "não voado",
      layover: "conexão de {t} em {a}",
      overnight: "pernoite",
      long: "longa",
      caution: "Antes de comprar",
      c1: "<b>Viola o contrato de transporte da companhia.</b> As companhias proíbem e podem cancelar o bilhete ou a conta de milhas.",
      c2: "<b>Só bagagem de mão.</b> A mala despachada segue até a cidade final do bilhete: {b}.",
      c3: "<b>Só ida.</b> Pular um trecho cancela todos os seguintes, inclusive a volta.",
      c4: "Esta tarifa foi vista em {d}. Quase certamente já mudou.",
      thRoute: "Bilhete", thExit: "Desce em", thFare: "Tarifa", thDirect: "Direto até lá", thSave: "Economia", thVsAll: "vs direto mais barato",
      thFlight: "Voo", thDep: "Sai", thArr: "Chega",
      chFind: "mais barato, para em {c}", chPricier: "para em {c}, custa mais", chNovia: "nunca para em {c}", chEmpty: "sem voos",
      moreOptions: "Mais {n} opções diretas na gravação.",
      less: "{p} a menos", pmore: "{p} a mais", thRouteD: "Rota", chEmpty2: "sem voos no dia",
      panelNote: "Toda tarifa desta página foi gravada do Google Flights em agosto de 2026 e já expirou. As buscas são reais; o replay roda o motor de verdade sobre as respostas delas, e nada é digitado à mão.",
      noteLabel: "Sobre esta busca",
      dateRange: "{a} a {b}",
      cityChecked: "{n} cidades além"
    }
  };

  function pickLang() {
    try {
      var saved = localStorage.getItem("ff-lang");
      if (saved === "en" || saved === "pt") return saved;
    } catch (e) { /* storage blocked: fall through */ }
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    return /^pt/i.test(nav) ? "pt" : "en";
  }
  var lang = pickLang();

  function t(key, vars) {
    var s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; });
    return s;
  }
  function locale() { return lang === "pt" ? "pt-BR" : "en-US"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n, cur) {
    return new Intl.NumberFormat(locale(), { style: "currency", currency: cur || "BRL", maximumFractionDigits: 0 }).format(n);
  }
  function day(iso, opts) {
    var d = new Date(iso.slice(0, 10) + "T12:00:00Z");
    return new Intl.DateTimeFormat(locale(), Object.assign({ day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }, opts || {})).format(d);
  }
  function recorded(iso, withTime) {
    var o = { day: "numeric", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" };
    if (withTime) { o.hour = "2-digit"; o.minute = "2-digit"; o.hour12 = false; }
    var s = new Intl.DateTimeFormat(locale(), o).format(new Date(iso));
    return withTime ? s + " (" + (lang === "pt" ? "horário de Brasília" : "Brasília time") + ")" : s;
  }
  function hhmm(iso) { return iso ? iso.slice(11, 16) : ""; }
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  // --- places ------------------------------------------------------------------
  function cityOf(route, code) { var a = route.airports[code]; return a ? a.city : code; }
  function airportName(route, code) {
    var a = route.airports[code];
    return a && a.name ? a.name + " (" + code + ")" : (a ? a.city + " (" + code + ")" : code);
  }
  function originCity(r) { return cityOf(r, r.query.origin); }
  function destCity(r) { return cityOf(r, r.query.destination); }
  function routeName(r) { return originCity(r) + " → " + destCity(r); }
  function codes(list) { return list.join("·"); }

  // --- projection, shared with the basemap -------------------------------------------
  var P = BASE.projection;
  var COS = Math.cos(P.lat0 * Math.PI / 180);
  function proj(lat, lon) { return [(lon - P.lonMin) * COS * P.scale, (P.latMax - lat) * P.scale]; }
  function xy(route, code) { var a = route.airports[code]; return proj(a.lat, a.lon); }

  // --- svg helpers -------------------------------------------------------------------
  function el(name, attrs, parent) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function control(a, b, bend) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return [mx - dy * bend, my + dx * bend];
  }
  function quad(a, c, b) { return "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + "Q" + c[0].toFixed(1) + " " + c[1].toFixed(1) + " " + b[0].toFixed(1) + " " + b[1].toFixed(1); }
  function partial(a, c, b, u) {
    // de Casteljau: the first `u` of the quadratic, as its own quadratic
    var c1 = [a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u];
    var c2 = [c[0] + (b[0] - c[0]) * u, c[1] + (b[1] - c[1]) * u];
    var p = [c1[0] + (c2[0] - c1[0]) * u, c1[1] + (c2[1] - c1[1]) * u];
    return quad(a, c1, p);
  }

  // --- scene state -------------------------------------------------------------------
  var svg = document.getElementById("map");
  var layers = {};
  var view = { x: 0, y: 0, w: BASE.width, h: BASE.height };
  var fast = false;
  var runId = 0;
  var current = null;     // the route on the chart
  var applied = [];       // calls already played, to rebuild the log on a language switch
  var finished = false;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sleep(ms) {
    return new Promise(function (res) {
      if (fast) return res();
      var start = performance.now();
      (function tick(now) {
        if (fast || now - start >= ms) return res();
        requestAnimationFrame(tick);
      })(start);
    });
  }

  function grow(path, a, c, b, ms) {
    if (fast || reduced) { path.setAttribute("d", quad(a, c, b)); return Promise.resolve(); }
    return new Promise(function (res) {
      var start = performance.now();
      (function frame(now) {
        var u = Math.min(1, (now - start) / ms);
        if (fast) u = 1;
        var e = 1 - Math.pow(1 - u, 3);
        path.setAttribute("d", u >= 1 ? quad(a, c, b) : partial(a, c, b, e));
        if (u < 1) requestAnimationFrame(frame); else res();
      })(start);
    });
  }

  function setView(target, ms) {
    var from = Object.assign({}, view);
    function apply(v) { view = v; svg.setAttribute("viewBox", [v.x, v.y, v.w, v.h].map(function (n) { return n.toFixed(1); }).join(" ")); scaleSymbols(); }
    if (fast || reduced || !ms) { apply(target); declutter(current); return; }
    var start = performance.now();
    (function frame(now) {
      var u = Math.min(1, (now - start) / ms), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      apply({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e });
      if (u < 1) requestAnimationFrame(frame); else declutter(current);
    })(start);
  }

  // Symbols and labels are drawn in screen pixels: each sits in a group scaled by
  // `--k` (chart units per pixel), so a label is the same size on a phone and on a
  // 27-inch screen no matter how far the chart is zoomed.
  function scaleSymbols() {
    var box = svg.getBoundingClientRect();
    if (!box.width || !box.height) return;
    var k = Math.max(view.w / box.width, view.h / box.height);
    svg.style.setProperty("--k", k.toFixed(4));
    svg.classList.toggle("is-narrow", box.width < 600);
  }

  function fitView(route) {
    var pts = route
      ? Object.keys(route.airports).map(function (c) { return xy(route, c); })
      : [proj(5.3, -74), proj(-33.8, -34.7)];
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var box = svg.getBoundingClientRect();
    var W = box.width || 800, H = box.height || 700;
    // On wide screens the insets cover the chart's right edge (over the sea);
    // the airports are fitted into what is left, with room for their labels.
    var ins = document.querySelector(".insets");
    var covered = ins && getComputedStyle(ins).position === "absolute" ? ins.getBoundingClientRect().width + 30 : 0;
    var narrow = W < 600;
    var m = narrow ? { l: 62, t: 52, r: 62, b: 40 } : { l: 90, t: 70, r: covered + 90, b: 60 };
    var aw = Math.max(80, W - m.l - m.r), ah = Math.max(80, H - m.t - m.b);
    var bw = Math.max(x1 - x0, 30), bh = Math.max(y1 - y0, 30);
    var k = 1 / Math.min(aw / bw, ah / bh);
    return {
      x: (x0 + x1) / 2 - (m.l + aw / 2) * k,
      y: (y0 + y1) / 2 - (m.t + ah / 2) * k,
      w: W * k, h: H * k
    };
  }

  // --- the basemap ----------------------------------------------------------------------
  function drawBase() {
    svg.innerHTML = "";
    var title = el("title", { id: "map-title" }, svg);
    title.textContent = t("mapTitle");
    el("rect", { x: -400, y: -400, width: BASE.width + 800, height: BASE.height + 800, class: "m-water" }, svg);
    var g = el("g", { class: "m-base" }, svg);
    var grid = el("g", { class: "m-grid-g" }, g);
    el("path", { d: BASE.neighbours, class: "m-neigh", "vector-effect": "non-scaling-stroke" }, g);
    el("path", { d: BASE.brazil, class: "m-brazil", "vector-effect": "non-scaling-stroke" }, g);
    el("path", { d: BASE.states, class: "m-states", "vector-effect": "non-scaling-stroke" }, g);
    // graticule, every 5 degrees, labelled at its west and north ends
    var gl = el("g", {}, svg);
    for (var lat = 5; lat >= -35; lat -= 5) {
      var a = proj(lat, -80), b = proj(lat, -26);
      el("path", { d: "M" + a[0] + " " + a[1] + "H" + b[0], class: "m-grid", "vector-effect": "non-scaling-stroke" }, grid);
      var lp = proj(lat, -73.6);
      var tg = el("g", { transform: "translate(" + lp[0].toFixed(1) + " " + lp[1].toFixed(1) + ")" }, gl);
      var sym = el("g", { class: "sym" }, tg);
      var tx = el("text", { x: 2, y: -3, class: "m-grid-label" }, sym);
      tx.textContent = Math.abs(lat) + "°" + (lat > 0 ? "N" : lat < 0 ? "S" : "");
    }
    for (var lon = -75; lon <= -30; lon += 5) {
      var c = proj(8, lon), d = proj(-40, lon);
      el("path", { d: "M" + c[0] + " " + c[1] + "V" + d[1], class: "m-grid", "vector-effect": "non-scaling-stroke" }, grid);
    }
    var sea = proj(-30.5, -41);
    var sg = el("g", { transform: "translate(" + sea[0] + " " + sea[1] + ")" }, gl);
    var ss = el("g", { class: "sym" }, sg);
    var st = el("text", { class: "m-sea-label", "text-anchor": "middle" }, ss);
    st.textContent = lang === "pt" ? "Oceano Atlântico" : "Atlantic Ocean";

    layers.direct = el("g", {}, svg);
    layers.probes = el("g", {}, svg);
    layers.hc = el("g", {}, svg);
    layers.aps = el("g", {}, svg);
    layers.tags = el("g", {}, svg);
    scaleSymbols();
  }

  // An airport (or a cluster of airports a few km apart) with its label.
  function symbolAt(p, cls, parent) {
    var g = el("g", { transform: "translate(" + p[0].toFixed(2) + " " + p[1].toFixed(2) + ")", class: cls }, parent || layers.aps);
    return { g: g, s: el("g", { class: "sym" }, g), p: p };
  }

  function labelSide(from, to) {
    var dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy) || 1;
    return { ux: dx / len, uy: dy / len };
  }

  function placeText(s, side, lines, cls) {
    // lines: [{text, cls}] printed outward from the symbol, away from the origin
    var tx = el("text", { class: cls || "ap-label" }, s);
    lines.forEach(function (ln, i) {
      var sp = el("tspan", { dy: i ? 12 : 0, class: ln.cls || null }, tx);
      sp.textContent = ln.text;
    });
    positionText(tx, side, lines.length);
    return tx;
  }

  function positionText(tx, side, n) {
    var anchor = side.ux > .35 ? "start" : side.ux < -.35 ? "end" : "middle";
    var ox = side.ux * 9, oy = side.uy * 9;
    if (anchor === "middle") oy += side.uy >= 0 ? 8 : -4 - (n - 1) * 12;
    else oy += 4 - (n - 1) * 6;
    tx.setAttribute("x", ox.toFixed(1));
    tx.setAttribute("y", oy.toFixed(1));
    tx.setAttribute("text-anchor", anchor);
    [].forEach.call(tx.children, function (sp) { if (sp.getAttribute("dy") !== null && +sp.getAttribute("dy")) sp.setAttribute("x", ox.toFixed(1)); else sp.removeAttribute("x"); });
  }

  // Greedy label placement, in screen pixels: each candidate's label tries the
  // side away from the origin, then the mirror side, then above and below, and
  // keeps the first spot that collides with no label or symbol already placed.
  function declutter(route) {
    if (!route || !nodes.__dest) return;
    var k = parseFloat(svg.style.getPropertyValue("--k")) || 1;
    var placed = [];
    function box(sy, tx) {
      var b = tx.getBBox();
      return { x: sy.p[0] / k + b.x, y: sy.p[1] / k + b.y, w: b.width, h: b.height };
    }
    function hits(r) {
      return placed.some(function (q) { return r.x < q.x + q.w + 3 && q.x < r.x + r.w + 3 && r.y < q.y + q.h + 1 && q.y < r.y + r.h + 1; });
    }
    Object.keys(nodes).forEach(function (c) {
      var n = nodes[c];
      if (!n.p) return;
      placed.push({ x: n.p[0] / k - 5, y: n.p[1] / k - 5, w: 10, h: 10 });
      if (n.fixed) [].forEach.call(n.s.querySelectorAll("text, rect"), function (tx) { placed.push(box(n, tx)); });
    });
    var o = centroid(route, route.originAirports);
    route.candidates.forEach(function (code) {
      var n = nodes[code];
      var out = labelSide(o, n.p);
      var tries = [out, { ux: -out.ux, uy: -out.uy }, { ux: 0, uy: -1 }, { ux: 0, uy: 1 }, { ux: 1, uy: 0 }, { ux: -1, uy: 0 }];
      for (var i = 0; i < tries.length; i++) {
        positionText(n.label, tries[i], 1);
        if (!hits(box(n, n.label))) break;
        if (i === tries.length - 1) positionText(n.label, out, 1);
      }
      placed.push(box(n, n.label));
    });
  }

  function centroid(route, list) {
    var s = [0, 0];
    list.forEach(function (c) { var p = xy(route, c); s[0] += p[0]; s[1] += p[1]; });
    return [s[0] / list.length, s[1] / list.length];
  }

  // --- presets -------------------------------------------------------------------------
  var presetsBox = document.getElementById("presets");
  function renderPresets() {
    presetsBox.innerHTML = "";
    ROUTES.forEach(function (r) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "preset";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", current && current.slug === r.slug ? "true" : "false");
      b.dataset.slug = r.slug;
      var when = r.query.dateFrom !== r.query.dateTo
        ? t("dateRange", { a: day(r.query.dateFrom, { year: undefined }), b: day(r.query.dateTo, { year: undefined }) })
        : day(r.query.date, { year: undefined });
      b.innerHTML =
        '<span class="preset-codes">' + esc(r.query.origin) + '<span class="arrow">→</span>' + esc(r.query.destination) + "</span>" +
        '<span class="preset-name">' + esc(routeName(r)) + "</span>" +
        '<span class="preset-meta">' + esc(when) + " · " + esc(t("calls", { n: r.stats.calls })) + " · " + esc(t("recordedShort", { d: new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short", timeZone: "America/Sao_Paulo" }).format(new Date(r.recordedAt)) })) + "</span>";
      b.addEventListener("click", function () { choose(r, true); showChart(); });
      presetsBox.appendChild(b);
    });
  }

  // --- typing a route --------------------------------------------------------------------
  function norm(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]+/g, " ").trim(); }
  function keysFor(r, codesList, city) {
    var k = codesList.slice();
    k.push(norm(city));
    return k;
  }
  function firstAt(text, keys) {
    var best = -1;
    keys.forEach(function (k) {
      var m = new RegExp("(^| )" + k + "( |$)").exec(text);
      if (m && (best < 0 || m.index < best)) best = m.index;
    });
    return best;
  }
  function matchTyped(raw) {
    var text = norm(raw);
    if (!text) return { empty: true };
    var hit = null;
    ROUTES.forEach(function (r) {
      var oi = firstAt(text, keysFor(r, r.originAirports.concat([r.query.origin]), originCity(r)));
      var di = firstAt(text, keysFor(r, r.destAirports.concat([r.query.destination]), destCity(r)));
      if (oi >= 0 && di >= 0 && di > oi && !hit) hit = r;
    });
    return { route: hit };
  }

  // --- the log ---------------------------------------------------------------------------
  var logLines = document.getElementById("log-lines");
  var logCount = document.getElementById("log-count");
  var phases = document.getElementById("phases");
  var skipBtn = document.getElementById("skip");

  function setPhase(n) {
    [].forEach.call(phases.children, function (li) {
      var p = +li.dataset.phase;
      li.className = n === "done" || p < n ? "is-done" : p === n ? "is-on" : "";
    });
  }
  function sysLine(text) {
    var li = document.createElement("li");
    li.className = "sys";
    li.textContent = text;
    logLines.appendChild(li);
    logLines.scrollTop = logLines.scrollHeight;
  }
  function checkedFor(route, b) {
    for (var i = 0; i < route.checked.length; i++) if (route.checked[i].final_destination === b) return route.checked[i];
    return null;
  }
  function metroName(route) { return destCity(route); }

  function callLine(route, c) {
    var li = document.createElement("li");
    var to = c.kind === "route" ? codes(c.to) : c.beyond;
    var small = c.kind === "route"
      ? (route.query.dateFrom !== route.query.dateTo ? day(c.date, { year: undefined }) + " · " : "") + t("itins", { n: c.count })
      : cityOf(route, c.beyond) + (c.count ? " · " + t("viaN", { n: c.viaTarget, t: c.count, c: metroName(route) }) : "");
    var out, cls = c.outcome;
    if (c.kind === "route") {
      var prices = route.calls.filter(function (x) { return x.kind === "route"; });
      out = t("outRoute", { p: money(route.direct.cheapest.price, route.currency) });
      if (prices.length > 1) out = "";
    } else if (c.outcome === "find" || c.outcome === "pricier") {
      var ck = checkedFor(route, c.beyond);
      out = t(c.outcome === "find" ? "outFind" : "outPricier", { p: money(ck.through_price, route.currency) });
    } else if (c.outcome === "novia") {
      out = t("outNovia", { c: metroName(route) });
    } else {
      out = t("outEmpty");
    }
    if (c.outcome === "find") li.className = "is-find";
    li.innerHTML = '<span class="n">' + pad2(c.i + 1) + '</span><span class="what"><b>' + esc(codes(c.from)) + " → " + esc(to) + "</b><small>" + esc(small) + '</small></span><span class="out ' + cls + '">' + esc(out) + "</span>";
    logLines.appendChild(li);
    logLines.scrollTop = logLines.scrollHeight;
    logCount.textContent = pad2(c.i + 1) + " / " + pad2(route.calls.length);
  }

  // --- drawing one search -------------------------------------------------------------------
  var nodes = {};   // code -> {g, s, p}

  function resetScene(route) {
    layers.direct.innerHTML = "";
    layers.probes.innerHTML = "";
    layers.hc.innerHTML = "";
    layers.aps.innerHTML = "";
    layers.tags.innerHTML = "";
    nodes = {};
    var o = centroid(route, route.originAirports);
    var d = centroid(route, route.destAirports);

    // origin cluster
    route.originAirports.forEach(function (code) {
      var sy = symbolAt(xy(route, code), "ap ap--origin");
      el("circle", { r: 4.2, class: "ap-dot" }, sy.s);
      nodes[code] = sy;
    });
    var oc = symbolAt(o, "ap ap--origin");
    el("circle", { r: 9, class: "pulse" }, oc.s);
    placeText(oc.s, labelSide(d, o), [{ text: originCity(route).toUpperCase() }, { text: codes(route.originAirports), cls: "ap-sub" }]);

    // destination cluster
    route.destAirports.forEach(function (code) {
      var sy = symbolAt(xy(route, code), "ap ap--dest");
      el("circle", { r: 3.6, class: "ap-dot" }, sy.s);
      nodes[code] = sy;
    });
    var dc = symbolAt(d, "ap ap--dest");
    nodes.__dest = dc;
    drawDestLabel(route, false);

    // candidates, hidden until the engine asks about them
    route.candidates.forEach(function (code) {
      var p = xy(route, code);
      var sy = symbolAt(p, "ap ap--cand");
      el("circle", { r: 3.1, class: "ap-dot" }, sy.s);
      sy.label = placeText(sy.s, labelSide(o, p), [{ text: code }]);
      nodes[code] = sy;
    });
    oc.fixed = true; dc.fixed = true;
    nodes.__origin = oc;
    declutter(route);
  }

  function drawDestLabel(route, withPrices, final) {
    var dc = nodes.__dest;
    while (dc.s.firstChild) dc.s.removeChild(dc.s.firstChild);
    var o = centroid(route, route.originAirports);
    var d = centroid(route, route.destAirports);
    var lines = [{ text: destCity(route).toUpperCase() }];
    if (final && route.finds.length) return placeText(dc.s, labelSide(o, d), lines);
    route.destAirports.forEach(function (code) {
      var p = route.direct.byAirport[code];
      lines.push({ text: withPrices && p != null ? code + " " + money(p, route.currency) : code, cls: withPrices ? "ap-price" : "ap-sub" });
    });
    placeText(dc.s, labelSide(o, d), lines);
  }

  function probe(route, c) {
    var o = centroid(route, c.from);
    var b = xy(route, c.beyond);
    var path = el("path", { class: "probe", "vector-effect": "non-scaling-stroke" }, layers.probes);
    path.dataset.beyond = c.beyond;
    var cp = control(o, b, .14);
    nodes[c.beyond].g.classList.add("is-on");
    return grow(path, o, cp, b, 380).then(function () { return path; });
  }

  function resolve(route, c, path) {
    var n = nodes[c.beyond];
    path.classList.add("is-" + c.outcome);
    n.g.classList.add("is-" + c.outcome);
    if (c.outcome === "find") {
      var ck = checkedFor(route, c.beyond);
      var tsp = el("tspan", { class: "ap-price", dx: 4 }, n.label);
      tsp.textContent = money(ck.through_price, route.currency);
      declutter(route);
    }
  }

  function drawDirect(route) {
    var o = centroid(route, route.originAirports);
    var jobs = route.destAirports.map(function (code) {
      var path = el("path", { class: "direct", "vector-effect": "non-scaling-stroke" }, layers.direct);
      var b = xy(route, code);
      return grow(path, o, control(o, b, -.06), b, 520);
    });
    return Promise.all(jobs);
  }

  function legPoint(route, code) { return xy(route, code); }

  function drawHiddenCity(route, f) {
    layers.hc.innerHTML = "";
    var flown = true;
    var jobs = [];
    f.legs.forEach(function (lg) {
      var a = legPoint(route, lg.origin), b = legPoint(route, lg.destination);
      var path = el("path", { class: flown ? "hc-flown" : "hc-skipped", "vector-effect": "non-scaling-stroke" }, layers.hc);
      jobs.push([path, a, control(a, b, .1), b]);
      if (lg.destination === f.exit_at) flown = false;
    });
    // intermediate stops
    f.legs.slice(0, -1).forEach(function (lg) {
      if (lg.destination === f.exit_at) return;
      var sy = symbolAt(legPoint(route, lg.destination), "ap", layers.hc);
      el("circle", { r: 2.8, fill: "#17171A" }, sy.s);
      if (!nodes[lg.destination]) placeText(sy.s, { ux: 1, uy: 0 }, [{ text: lg.destination }]);
    });
    var ex = symbolAt(legPoint(route, f.exit_at), "ap", layers.hc);
    el("rect", { x: -5, y: -5, width: 10, height: 10, class: "hc-exit" }, ex.s);
    var by = symbolAt(legPoint(route, f.final_destination), "ap", layers.hc);
    el("circle", { r: 5.2, class: "hc-beyond" }, by.s);

    var chain = Promise.resolve();
    jobs.forEach(function (j) { chain = chain.then(function () { return grow(j[0], j[1], j[2], j[3], 420); }); });
    return chain.then(function () {
      tag(route, f.exit_at, t("getOff") + " · " + f.exit_at, "save");
    });
  }

  function tag(route, code, text, cls) {
    var sy = symbolAt(xy(route, code), "hc-tag " + (cls || ""), layers.tags);
    var label = text.toUpperCase();
    var w = label.length * 7.3 + 14;
    // under the symbol: the destination's label already owns the side away from
    // the origin, and the route arrives from the other side
    var x = -w / 2, y = 26;
    el("rect", { x: x, y: y, width: w, height: 18 }, sy.s);
    var tx = el("text", { x: x + 7, y: y + 12.5 }, sy.s);
    tx.textContent = label;
    sy.fixed = true;
    nodes.__tag = sy;
    declutter(route);
  }

  function dimOthers(route, f) {
    [].forEach.call(layers.probes.children, function (p) { if (!f || p.dataset.beyond !== f.final_destination) p.classList.add("is-dim"); });
    var onTicket = {};
    if (f) f.legs.forEach(function (lg) { onTicket[lg.origin] = onTicket[lg.destination] = true; });
    route.candidates.forEach(function (c) { if (!onTicket[c]) nodes[c].g.classList.add("is-dim"); });
    [].forEach.call(layers.direct.children, function (p) { if (f) p.classList.add("is-dim"); });
  }

  function showChart() {
    // On a phone the chart sits under the form: bring it up so the search is seen.
    if (window.innerWidth <= 820) svg.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  // --- the run --------------------------------------------------------------------------
  function choose(route, autorun) {
    current = route;
    try { history.replaceState(null, "", "#" + route.slug); } catch (e) { /* file:// */ }
    [].forEach.call(presetsBox.children, function (b) { b.setAttribute("aria-checked", b.dataset.slug === route.slug ? "true" : "false"); });
    if (autorun) run(route);
  }

  async function run(route) {
    var id = ++runId;
    fast = false;
    finished = false;
    applied = [];
    document.getElementById("verdict").hidden = true;
    document.getElementById("details").hidden = true;
    document.getElementById("legend").hidden = false;
    skipBtn.textContent = t("skip");
    skipBtn.onclick = function () { fast = true; };
    logLines.innerHTML = "";
    logCount.textContent = "";
    setView(fitView(route), 600);
    resetScene(route);
    setPhase(1);
    sysLine(t("logStart", { n: route.calls.length, d: recorded(route.recordedAt) }));
    await sleep(reduced ? 0 : 500);

    var routeCalls = route.calls.filter(function (c) { return c.kind === "route"; });
    var beyond = route.calls.filter(function (c) { return c.kind === "beyond"; });
    var beat = Math.max(170, Math.min(420, 5200 / Math.max(1, beyond.length)));

    var directDrawn = drawDirect(route);
    for (var i = 0; i < routeCalls.length; i++) {
      if (id !== runId) return;
      callLine(route, routeCalls[i]);
      applied.push(routeCalls[i]);
      await sleep(320);
    }
    await directDrawn;
    if (id !== runId) return;
    drawDestLabel(route, true);
    declutter(route);
    var ch = route.direct.cheapest;
    sysLine(t("logDirectDone", { p: money(ch.price, route.currency), a: airportName(route, ch.airport) }));
    await sleep(500);

    setPhase(2);
    var pending = [];
    for (var j = 0; j < beyond.length; j++) {
      if (id !== runId) return;
      (function (c) {
        pending.push(probe(route, c).then(function (path) {
          if (id !== runId) return;
          resolve(route, c, path);
          callLine(route, c);
          applied.push(c);
        }));
      })(beyond[j]);
      await sleep(beat);
    }
    await Promise.all(pending);
    if (id !== runId) return;

    setPhase(3);
    await sleep(450);
    var f = route.finds[0];
    dimOthers(route, f);
    if (f) { drawDestLabel(route, true, true); declutter(route); await drawHiddenCity(route, f); }
    if (id !== runId) return;
    sysLine(f ? t("logFound", { n: route.finds.length, c: metroName(route) }) : t("logNoneLeft", { c: metroName(route) }));
    setPhase("done");
    finished = true;
    svg.setAttribute("aria-label", f
      ? t("foundHead", { o: originCity(route), b: cityOf(route, f.final_destination), e: airportName(route, f.exit_at) })
      : t("noneHead", { c: destCity(route), p: money(route.direct.cheapest.price, route.currency) }));
    skipBtn.textContent = t("replay");
    skipBtn.onclick = function () { run(route); };
    renderVerdict(route);
    renderDetails(route);
  }

  // --- verdict + details ------------------------------------------------------------------
  function directOption(route, airport) {
    var best = null;
    route.options.forEach(function (o) { if (o.to === airport && o.stops === 0 && (!best || o.price < best.price)) best = o; });
    return best;
  }

  function renderVerdict(route) {
    var box = document.getElementById("verdict");
    document.getElementById("legend").hidden = true;
    var f = route.finds[0];
    var cur = route.currency;
    if (!f) {
      box.className = "verdict none";
      box.innerHTML =
        '<p class="verdict-kicker">' + esc(t("noneKicker")) + "</p>" +
        "<h2>" + esc(t("noneHead", { c: destCity(route), p: money(route.direct.cheapest.price, cur) })) + "</h2>" +
        '<p class="verdict-context">' + esc(t("noneBody", { n: route.candidates.length, c: destCity(route) })) + "</p>" +
        '<a class="verdict-more" href="#details">' + esc(t("more")) + " ↓</a>";
      box.hidden = false;
      return;
    }
    var legsFlown = 0;
    for (var i = 0; i < f.legs.length; i++) { legsFlown++; if (f.legs[i].destination === f.exit_at) break; }
    var many = route.finds.length > 1 ? " · " + t("foundMany", { n: route.finds.length }) : "";
    var ch = route.direct.cheapest;
    var ctx;
    if (route.destAirports.length > 1) {
      ctx = f.vsCheapestDirect > 0
        ? t("ctxBeats", { c: destCity(route), p: "<b>" + money(ch.price, cur) + "</b>", a: esc(ch.airport), d: "<b>" + money(f.vsCheapestDirect, cur) + "</b>" })
        : t("ctxLoses", { c: destCity(route), p: "<b>" + money(ch.price, cur) + "</b>", a: esc(ch.airport), d: money(-f.vsCheapestDirect, cur), e: esc(f.exit_at) });
    } else {
      ctx = t("ctxSingle", { e: esc(airportName(route, f.exit_at)) });
    }
    box.className = "verdict found";
    box.innerHTML =
      '<p class="verdict-kicker">' + esc(t("foundKicker") + many) + "</p>" +
      "<h2>" + esc(t("foundHead", { o: cityOf(route, f.legs[0].origin), b: cityOf(route, f.final_destination), e: airportName(route, f.exit_at) })) + "</h2>" +
      '<div class="compare">' +
        "<div><p class=\"k\">" + esc(t("kDirect", { a: f.exit_at })) + '</p><p class="v">' + money(f.direct_price, cur) + '</p><p class="r">' + esc(f.legs[0].origin + " → " + f.exit_at) + "</p></div>" +
        "<div><p class=\"k\">" + esc(t("kTicket", { b: f.final_destination })) + '</p><p class="v">' + money(f.total_price, cur) + '</p><p class="r">' + esc(t("rLegs", { f: legsFlown, t: f.legs.length })) + "</p></div>" +
        '<div class="save"><p class="k">' + esc(t("kSave")) + '</p><p class="v">' + money(f.savings, cur) + "</p></div>" +
      "</div>" +
      '<p class="verdict-context">' + ctx + "</p>" +
      '<a class="verdict-more" href="#details">' + esc(t("more")) + " ↓</a>";
    box.hidden = false;
  }

  function legsHtml(route, f) {
    var html = '<ul class="legs">';
    var flown = true;
    f.legs.forEach(function (lg) {
      var skipped = !flown;
      if (lg.layover && flown) {
        var lay = lg.layover;
        var flags = (lay.overnight ? " · " + t("overnight") : lay.long ? " · " + t("long") : "");
        html += '<li class="layover' + (lay.long || lay.overnight ? " long" : "") + '" style="list-style:none;padding:0 0 0 38px">' + esc(t("layover", { t: lay.label, a: lay.at })) + esc(flags) + "</li>";
      }
      var isExit = lg.destination === f.exit_at;
      html += '<li class="leg' + (skipped ? " skipped" : "") + '"><span class="leg-mark"></span>' +
        '<span class="leg-route">' + esc(lg.origin) + ' <span class="arrow">→</span> ' + esc(lg.destination) +
        (isExit ? ' <span class="leg-flag exit">' + esc(t("getOff")) + "</span>" : "") +
        (skipped ? ' <span class="leg-flag skip">' + esc(t("notFlown")) + "</span>" : "") + "</span>" +
        '<span class="leg-time">' + esc(hhmm(lg.departure)) + " – " + esc(hhmm(lg.arrival)) + "</span>" +
        '<span class="leg-meta">' + esc(lg.airline + " " + lg.flight_number) + " · " + esc(day(lg.departure, { weekday: "short" })) + " · " + esc(cityOf(route, lg.origin)) + " → " + esc(cityOf(route, lg.destination)) + "</span></li>";
      if (isExit) flown = false;
    });
    return html + "</ul>";
  }

  function cautionHtml(route, f) {
    return '<div class="caution" role="note"><h4>' + esc(t("caution")) + "</h4><ul>" +
      "<li>" + t("c1") + "</li>" +
      "<li>" + t("c2", { b: esc(cityOf(route, f.final_destination) + " (" + f.final_destination + ")") }) + "</li>" +
      "<li>" + t("c3") + "</li>" +
      "<li>" + esc(t("c4", { d: recorded(route.recordedAt) })) + "</li>" +
      "</ul></div>";
  }

  function findsTable(route) {
    var cur = route.currency;
    var multi = route.destAirports.length > 1;
    var rows = route.finds.map(function (f, i) {
      return '<tr class="' + (i === 0 ? "is-best" : "") + '"><td class="code">' + esc(f.book_route) + '</td><td class="code" data-l="' + esc(t("thExit")) + '">' + esc(f.exit_at) +
        '</td><td class="num" data-l="' + esc(t("thFare")) + '">' + money(f.total_price, cur) + '</td><td class="num" data-l="' + esc(t("thDirect")) + '">' + money(f.direct_price, cur) +
        '</td><td class="num pos" data-l="' + esc(t("thSave")) + '">' + money(f.savings, cur) + "</td>" +
        (multi ? '<td class="num ' + (f.vsCheapestDirect > 0 ? "pos" : "neg") + '" data-l="' + esc(t("thVsAll")) + '">' + esc(t(f.vsCheapestDirect > 0 ? "less" : "pmore", { p: money(Math.abs(f.vsCheapestDirect), cur) })) + "</td>" : "") + "</tr>";
    }).join("");
    return '<div class="tab-scroll"><table class="tab tab--finds"><thead><tr><th>' + esc(t("thRoute")) + "</th><th>" + esc(t("thExit")) +
      '</th><th class="num">' + esc(t("thFare")) + '</th><th class="num">' + esc(t("thDirect")) + '</th><th class="num">' + esc(t("thSave")) + "</th>" +
      (multi ? '<th class="num">' + esc(t("thVsAll")) + "</th>" : "") + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  function directTable(route) {
    var cur = route.currency;
    var multiDay = route.query.dateFrom !== route.query.dateTo;
    var rows = route.options.slice(0, 6).map(function (o) {
      return '<tr><td class="code">' + esc(o.from + " → " + o.to) + "</td><td>" + esc(o.airline + " " + o.flight) + '</td><td class="num">' +
        (multiDay ? esc(day(o.dep, { year: undefined })) + " " : "") + esc(hhmm(o.dep)) + '</td><td class="num">' + esc(hhmm(o.arr)) +
        '</td><td class="num">' + money(o.price, cur) + "</td></tr>";
    }).join("");
    var more = route.optionsCount > 6 ? '<p class="d-note">' + esc(t("moreOptions", { n: route.optionsCount - 6 })) + "</p>" : "";
    return '<div class="tab-scroll"><table class="tab"><thead><tr><th>' + esc(t("thRouteD")) + "</th><th>" + esc(t("thFlight")) +
      '</th><th class="num">' + esc(t("thDep")) + '</th><th class="num">' + esc(t("thArr")) + '</th><th class="num">' + esc(t("thFare")) +
      "</th></tr></thead><tbody>" + rows + "</tbody></table></div>" + more;
  }

  function chipsHtml(route) {
    var c = destCity(route);
    var chips = route.calls.filter(function (x) { return x.kind === "beyond"; }).map(function (x) {
      var ck = checkedFor(route, x.beyond);
      var price = ck ? money(ck.through_price, route.currency) : "";
      return '<span class="chip ' + x.outcome + '"><span class="code">' + esc(x.beyond) + "</span>" + esc(cityOf(route, x.beyond)) +
        (price ? " <small>" + price + "</small>" : "") + "</span>";
    }).join("");
    return '<div class="chips">' + chips + '</div><p class="chip-legend"><span class="find">' + esc(t("chFind", { c: c })) +
      '</span><span class="pricier">' + esc(t("chPricier", { c: c })) + '</span><span class="novia">' + esc(t("chNovia", { c: c })) + '</span><span class="empty">' + esc(t("chEmpty2")) + "</span></p>";
  }

  function renderDetails(route) {
    var box = document.getElementById("details");
    var f = route.finds[0];
    var when = route.query.dateFrom !== route.query.dateTo
      ? t("dateRange", { a: day(route.query.dateFrom, { year: undefined }), b: day(route.query.dateTo) })
      : day(route.query.date);
    var head = '<div class="d-head"><h2 id="details-title">' + esc(t("dTitle", { o: originCity(route), d: destCity(route) })) + " · " + esc(when) + "</h2>" +
      '<p class="stamp">' + esc(t("dStamp", { t: recorded(route.recordedAt, true), n: route.stats.calls })) + "</p></div>";
    var note = route.note ? '<p class="d-note"><b>' + esc(t("noteLabel")) + ":</b> " + esc(route.note[lang] || route.note.en) + "</p>" : "";
    var left, right;
    if (f) {
      left = '<div class="d-section"><h3>' + esc(t("sTicket")) + "</h3>" + legsHtml(route, f) + cautionHtml(route, f) + "</div>" +
        '<div class="d-section"><h3>' + esc(t("sFinds")) + "</h3>" + findsTable(route) + "</div>";
    } else {
      left = '<div class="d-section"><h3>' + esc(t("sNone")) + '</h3><div class="none-box"><p class="big">' +
        esc(money(route.direct.cheapest.price, route.currency)) + " · " + esc(airportName(route, route.direct.cheapest.airport)) + "</p><p>" +
        esc(t("noneBody", { n: route.candidates.length, c: destCity(route) })) + "</p></div>" + note + "</div>";
      note = "";
    }
    left += '<div class="d-section"><h3>' + esc(t("sChecked")) + " · " + esc(t("cityChecked", { n: route.candidates.length })) + "</h3>" + chipsHtml(route) + note + "</div>";
    right = '<div class="d-section"><h3>' + esc(t("sDirect")) + "</h3>" + directTable(route) + "</div>" +
      '<div class="d-section"><h3>' + esc(t("sLog")) + '</h3><pre class="engine-log">' + esc(route.log.join("\n")) + "</pre></div>";
    box.innerHTML = head + '<div class="d-grid"><div>' + left + "</div><div>" + right + "</div></div>";
    box.hidden = false;
  }

  // --- language -----------------------------------------------------------------------------
  function applyLang() {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    [].forEach.call(document.querySelectorAll("[data-i18n]"), function (n) { n.textContent = t(n.dataset.i18n); });
    [].forEach.call(document.querySelectorAll(".lang button"), function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"); });
    renderPresets();
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem("ff-lang", l); } catch (e) { /* ignore */ }
    applyLang();
    var st = document.querySelector(".m-sea-label");
    if (st) st.textContent = lang === "pt" ? "Oceano Atlântico" : "Atlantic Ocean";
    if (current) {
      // rebuild the words, not the drawing
      logLines.innerHTML = "";
      sysLine(t("logStart", { n: current.calls.length, d: recorded(current.recordedAt) }));
      applied.forEach(function (c) { callLine(current, c); });
      if (finished) {
        renderVerdict(current);
        renderDetails(current);
        skipBtn.textContent = t("replay");
        drawDestLabel(current, true, true);
      } else {
        skipBtn.textContent = t("skip");
      }
    } else {
      idle();
    }
  }
  [].forEach.call(document.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  function idle() {
    logLines.innerHTML = '<li class="log-empty">' + esc(t("logIdle")) + "</li>";
  }

  // --- form -----------------------------------------------------------------------------------
  // The presets are the only searches this replay holds; picking one runs it.
  document.getElementById("search").addEventListener("submit", function (ev) { ev.preventDefault(); });

  window.addEventListener("resize", function () {
    setView(fitView(current), 0);
    declutter(current);
  });

  // --- start ------------------------------------------------------------------------------------
  applyLang();
  drawBase();
  setView(fitView(null), 0);
  idle();
  var fromHash = ROUTES.filter(function (r) { return "#" + r.slug === location.hash; })[0];
  choose(fromHash || ROUTES[0], false);
  // Watch it once without asking: the point of the page is the search happening.
  setTimeout(function () { run(current); }, reduced ? 0 : 700);
})();
