/* ==========================================================================
   chatbot.js — "Sketch Assistant": a rule-based support chatbot.
   No AI service is connected. Answers come from config.js FAQs and the real
   product catalogue. To add a real AI later, set SMS.chatbot.aiProvider to an
   async function (text, history) => string | null. It is tried for free-text
   questions before the "connect you with our team" fallback. Keep API keys on a
   server, never in this file.
   ========================================================================== */
(function () {
  "use strict";
  const SMS = (window.SMS = window.SMS || {});
  const C = () => SMS.config;
  const esc = (s) => SMS.esc(s);
  let box, log, input, quick, history = [], flow = null, data = {};

  const MAIN_REPLIES = () => [
    "Explore Shoes", "Product Prices", "Size Guide", "Track My Order",
    "Shipping Information", "Return Policy"
  ].concat(SMS.customOn() ? ["Custom Shoes"] : []).concat(["Talk to a Human"]);

  const time = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function say(text, who, opts) {
    const row = document.createElement("div");
    row.className = "msg msg--" + who;
    const body = esc(text).replace(/\n/g, "<br>");
    row.innerHTML = `<div class="msg__bubble">${body}${opts && opts.html ? opts.html : ""}</div><time>${time()}</time>`;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    history.push({ who, text });
    return row;
  }
  function typing(ms) {
    return new Promise((res) => {
      const t = document.createElement("div");
      t.className = "msg msg--bot typing";
      t.setAttribute("aria-label", "Sketch Assistant is typing");
      t.innerHTML = '<div class="msg__bubble"><span></span><span></span><span></span></div>';
      log.appendChild(t);
      log.scrollTop = log.scrollHeight;
      setTimeout(() => { t.remove(); res(); }, ms == null ? 450 : ms);
    });
  }
  async function bot(text, opts) {
    await typing(opts && opts.delay);
    say(text, "bot", opts);
  }
  function setQuick(list) {
    quick.innerHTML = list.map((q) => `<button type="button" class="qr">${esc(q)}</button>`).join("");
  }

  /* ---------- product discovery ---------- */
  function recommend(d) {
    const budget = parseFloat(d.budget);
    let list = SMS.products.filter((p) => {
      if (d.type && !(p.category.toLowerCase().includes(d.type.toLowerCase()) || d.type.toLowerCase().includes(p.category.toLowerCase().replace(/ shoes?$/, "")))) return false;
      if (d.size && p.availableSizes.length && !p.availableSizes.includes(d.size)) return false;
      if (d.colour && p.availableColours.length && !p.availableColours.some((c) => c.toLowerCase() === d.colour.toLowerCase())) return false;
      if (!isNaN(budget) && SMS.hasPrice(p) && p.price > budget) return false;
      return true;
    });
    return list.slice(0, 3);
  }
  function productLinks(list) {
    return "<ul class=\"bot-list\">" + list.map((p) => `<li><a href="product.html?slug=${encodeURIComponent(p.slug)}">${esc(p.name)}</a> — ${esc(SMS.priceLabel(p))}</li>`).join("") + "</ul>";
  }

  /* ---------- flows ---------- */
  const FLOWS = {
    discover: [
      { key: "type", ask: () => "Which type of shoes are you looking for?", options: () => [...new Set(SMS.products.map((p) => p.category))].concat(["Any"]) },
      { key: "size", ask: () => "What size do you wear? (Not sure? Type “size guide”.)", options: () => [...new Set(SMS.products.flatMap((p) => p.availableSizes))].concat(["Not sure"]) },
      { key: "budget", ask: () => "What is your preferred budget? (a number, or “skip”)", options: () => ["Skip"] },
      { key: "colour", ask: () => "Which colour do you prefer?", options: () => [...new Set(SMS.products.flatMap((p) => p.availableColours))].concat(["Any"]) }
    ],
    custom: [
      { key: "name", ask: () => "Great, let's start your custom enquiry. What's your name?" },
      { key: "type", ask: () => "Which shoe type do you want customised?" },
      { key: "design", ask: () => "Describe the design you have in mind." },
      { key: "size", ask: () => "What's your shoe size?" },
      { key: "budget", ask: () => "What's your budget? (or “skip”)", options: () => ["Skip"] },
      { key: "ref", ask: () => "Any reference image link or extra details? (or “skip”)", options: () => ["Skip"] }
    ]
  };

  function startFlow(name) {
    flow = { name, step: 0 };
    data = {};
    askStep();
  }
  async function askStep() {
    const s = FLOWS[flow.name][flow.step];
    await bot(s.ask());
    setQuick(s.options ? s.options() : []);
    input.focus();
  }
  async function answerStep(text) {
    const s = FLOWS[flow.name][flow.step];
    const skip = /^(skip|any|not sure|no)$/i.test(text.trim());
    if (s.key === "budget" && !skip && isNaN(parseFloat(text.replace(/[^\d.]/g, "")))) {
      await bot("Please enter a number for your budget, or type “skip”.");
      return;
    }
    if (s.key === "size" && flow.name === "discover" && /size guide|not sure/i.test(text)) { data.size = ""; }
    else data[s.key] = skip ? "" : (s.key === "budget" ? text.replace(/[^\d.]/g, "") : text.trim());
    flow.step++;
    if (flow.step < FLOWS[flow.name].length) { askStep(); return; }
    const done = flow.name; const d = Object.assign({}, data); flow = null;
    if (done === "discover") finishDiscover(d); else finishCustom(d);
  }
  async function finishDiscover(d) {
    const list = recommend(d);
    if (list.length) await bot("Here's what matches from our catalogue:", { html: productLinks(list) });
    else await bot("I couldn't find an exact match in the catalogue. Try the shop page, or ask our team to help you find a pair.", { html: '<p><a href="shop.html">Browse all shoes</a></p>' });
    await bot("Availability and prices are confirmed by our team when you order on WhatsApp. I can't guarantee fit, so please check the size guide.");
    setQuick(MAIN_REPLIES());
  }
  async function finishCustom(d) {
    const msg = ["Hello " + C().brand.name + "!", "", "I'd like to enquire about a custom design.", "",
      "Name: " + (d.name || "-"), "Shoe type: " + (d.type || "-"), "Design: " + (d.design || "-"),
      "Size: " + (d.size || "-"), "Budget: " + (d.budget || "not specified"), "Reference/details: " + (d.ref || "-")].join("\n");
    const btn = `<p><button class="btn btn--wa btn--small" data-wa-msg="${esc(msg)}">Send enquiry on WhatsApp</button></p>`;
    await bot("Thanks! Here's your enquiry. Tap below to send it to our team on WhatsApp. Nothing has been saved on this website.", { html: btn });
    setQuick(MAIN_REPLIES());
  }

  /* ---------- intents ---------- */
  function faqById(id) { return C().faqs.find((f) => f.id === id); }
  function findFaq(text) {
    const t = text.toLowerCase();
    let best = null, score = 0;
    C().faqs.forEach((f) => {
      const s = f.keywords.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
      if (s > score) { score = s; best = f; }
    });
    return best;
  }
  function humanButton() {
    const ctx = history.filter((h) => h.who === "user").slice(-5).map((h) => "- " + h.text).join("\n");
    const msg = "Hello " + C().brand.name + "! I need help from your team." + (ctx ? "\n\nMy recent messages to the assistant:\n" + ctx : "");
    return `<p><button class="btn btn--wa btn--small" data-wa-msg="${esc(msg)}">Chat with our team on WhatsApp</button></p>`;
  }

  async function handle(text) {
    const t = text.trim();
    if (!t) return;
    say(t, "user");
    if (flow) { await answerStep(t); return; }
    const l = t.toLowerCase();

    if (/custom|personali[sz]e/.test(l) && SMS.customOn()) {
      await bot("We take custom design enquiries. I can collect your details now, or you can use the full form.", { html: '<p><a href="custom-design.html">Open custom design page</a></p>' });
      startFlow("custom"); return;
    }
    if (/explore|shoes|recommend|find me|looking for/.test(l) && !/size guide/.test(l)) { startFlow("discover"); return; }
    if (/price|cost|how much/.test(l)) {
      const priced = SMS.products.filter(SMS.hasPrice);
      await bot(priced.length
        ? "Here are current prices:" : "Prices aren't listed on the website yet. Our team confirms the price for each pair when you message on WhatsApp.",
        priced.length ? { html: productLinks(priced) } : { html: humanButton() });
      setQuick(MAIN_REPLIES()); return;
    }
    if (/size guide|size|measure|fit/.test(l)) {
      await bot(faqById("size").a, { html: '<p><button class="btn btn--small" data-size-guide>Open size guide</button></p>' });
      setQuick(MAIN_REPLIES()); return;
    }
    if (/track|where is my order|order status/.test(l)) {
      await bot("This website has no order tracking because orders are handled by our team on WhatsApp. Message them with your order details for an update.", { html: humanButton() });
      setQuick(MAIN_REPLIES()); return;
    }
    if (/human|agent|team|person|whatsapp|support/.test(l)) {
      await bot("Of course. Tap below to continue with our team on WhatsApp. Your recent messages are included.", { html: humanButton() });
      setQuick(MAIN_REPLIES()); return;
    }
    if (/how.*order|place.*order|order/.test(l) && !/track/.test(l)) {
      await bot(faqById("order").a, { html: '<p><a href="shop.html">Start shopping</a></p>' });
      setQuick(MAIN_REPLIES()); return;
    }
    const faq = findFaq(t);
    if (faq) { await bot(faq.a); setQuick(MAIN_REPLIES()); return; }

    // future AI hook
    if (typeof api.aiProvider === "function") {
      try {
        const ai = await api.aiProvider(t, history.slice());
        if (ai) { await bot(ai); setQuick(MAIN_REPLIES()); return; }
      } catch (e) { /* fall through to fallback */ }
    }
    await bot(C().chatbot.fallback, { html: humanButton() });
    setQuick(MAIN_REPLIES());
  }

  /* ---------- UI ---------- */
  function build() {
    const cfg = C().chatbot;
    const wrap = document.createElement("div");
    wrap.id = "chatbot";
    wrap.innerHTML = `
      <button class="chat-launch" id="chat-launch" aria-label="Open ${esc(cfg.name)}" aria-expanded="false" aria-controls="chat-panel">${SMS.icons.chat}</button>
      <section class="chat-panel" id="chat-panel" role="dialog" aria-label="${esc(cfg.name)}" hidden>
        <header class="chat-head">
          <div><strong>${esc(cfg.name)}</strong><span class="small">Rule-based assistant</span></div>
          <div>
            <button class="icon-btn" id="chat-clear" aria-label="Clear conversation" title="Clear conversation">${SMS.icons.trash}</button>
            <button class="icon-btn" id="chat-close" aria-label="Close chat">${SMS.icons.close}</button>
          </div>
        </header>
        <div class="chat-log" id="chat-log" role="log" aria-live="polite" tabindex="0"></div>
        <div class="chat-quick" id="chat-quick"></div>
        <form class="chat-form" id="chat-form">
          <label class="sr" for="chat-input">Type your message</label>
          <input id="chat-input" type="text" maxlength="300" placeholder="Type a message…" autocomplete="off">
          <button class="icon-btn" type="submit" aria-label="Send">${SMS.icons.send}</button>
        </form>
      </section>`;
    document.body.appendChild(wrap);
    box = wrap.querySelector("#chat-panel");
    log = wrap.querySelector("#chat-log");
    input = wrap.querySelector("#chat-input");
    quick = wrap.querySelector("#chat-quick");
    const launch = wrap.querySelector("#chat-launch");

    const open = () => {
      box.hidden = false;
      requestAnimationFrame(() => box.classList.add("open"));
      launch.setAttribute("aria-expanded", "true");
      if (!log.children.length) welcome();
      input.focus();
    };
    const close = () => {
      box.classList.remove("open");
      launch.setAttribute("aria-expanded", "false");
      setTimeout(() => { box.hidden = true; }, 200);
      launch.focus();
    };
    launch.addEventListener("click", () => (box.hidden ? open() : close()));
    wrap.querySelector("#chat-close").addEventListener("click", close);
    wrap.querySelector("#chat-clear").addEventListener("click", () => { log.innerHTML = ""; history = []; flow = null; welcome(); });
    box.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    wrap.querySelector("#chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value; input.value = "";
      handle(v);
    });
    quick.addEventListener("click", (e) => {
      const b = e.target.closest(".qr");
      if (b) handle(b.textContent);
    });
    log.addEventListener("click", (e) => {
      const w = e.target.closest("[data-wa-msg]");
      if (w) SMS.openWhatsApp(w.dataset.waMsg);
      if (e.target.closest("[data-size-guide]")) SMS.sizeGuide();
    });
  }
  async function welcome() {
    say(C().chatbot.welcome, "bot");
    setQuick(MAIN_REPLIES());
  }

  const api = {
    aiProvider: null,
    init() { build(); },
    _handle: handle // exposed for testing
  };
  SMS.chatbot = api;
})();
