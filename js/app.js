/* ==========================================================================
   app.js — shared UI: header/footer, helpers, wishlist, modals, toasts,
   product cards, command palette search, home page and shop page logic.
   ========================================================================== */
(function () {
  "use strict";
  const C = window.SMS_CONFIG;
  const P = window.SMS_PRODUCTS;
  const SMS = (window.SMS = window.SMS || {});
  SMS.config = C;
  SMS.products = P;

  /* ---------- helpers ---------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const hasPrice = (p) => typeof p.price === "number" && p.price > 0;
  const money = (n) =>
    new Intl.NumberFormat(C.currency.locale, { style: "currency", currency: C.currency.code, maximumFractionDigits: 0 }).format(n);
  const priceLabel = (p) => (hasPrice(p) ? money(p.price) : "Price on WhatsApp");
  const getProduct = (id) => P.find((p) => p.id === id);
  const customOn = () => !!(C.customization && C.customization.enabled);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  function waLink(message) {
    const num = String(C.whatsappNumber || "").replace(/\D/g, "");
    const base = num ? "https://wa.me/" + num : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(message);
  }
  function openWhatsApp(message) {
    if (!String(C.whatsappNumber || "").replace(/\D/g, "")) {
      toast("WhatsApp number isn't configured yet — pick the shop's chat in WhatsApp.", "warn");
    }
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  }
  Object.assign(SMS, { esc, $, $$, hasPrice, money, priceLabel, getProduct, customOn, store, waLink, openWhatsApp });

  /* ---------- icons ---------- */
  const ic = (d, extra) =>
    `<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ""}>${d}</svg>`;
  const ICONS = {
    search: ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    heart: ic('<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>'),
    bag: ic('<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/>'),
    menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    close: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
    whatsapp: ic('<path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6L3 21z"/><path d="M9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .6c-.8-.4-1.6-1.2-2-2l.6-1-1-2L9 9z"/>'),
    instagram: ic('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>'),
    chat: ic('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
    ruler: ic('<path d="M3 16l13-13 5 5L8 21l-5-5z"/><path d="M7 12l2 2M10 9l2 2M13 6l2 2"/>'),
    pencil: ic('<path d="M4 20l1-5L16 4l4 4L9 19l-5 1z"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    minus: ic('<path d="M5 12h14"/>'),
    trash: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    eye: ic('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    send: ic('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>'),
    filter: ic('<path d="M3 5h18l-7 8v6l-4 2v-8L3 5z"/>'),
    arrowRight: ic('<path d="M5 12h14M12 5l7 7-7 7"/>'),
    star: ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 'fill="currentColor"')
  };
  SMS.icons = ICONS;

  /* ---------- toast ---------- */
  function toast(msg, type) {
    let box = $("#toasts");
    if (!box) return;
    const t = document.createElement("div");
    t.className = "toast" + (type ? " toast--" + type : "");
    t.setAttribute("role", "status");
    t.textContent = msg;
    box.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 3200);
  }
  SMS.toast = toast;

  /* ---------- accessible modal ---------- */
  let lastFocus = null;
  function openModal(html, opts) {
    closeModal();
    lastFocus = document.activeElement;
    const wrap = document.createElement("div");
    wrap.className = "modal";
    wrap.id = "modal";
    wrap.innerHTML = `<div class="modal__backdrop" data-close></div>
      <div class="modal__panel ${opts && opts.wide ? "modal__panel--wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc((opts && opts.label) || "Dialog")}" tabindex="-1">
        <button class="icon-btn modal__close" data-close aria-label="Close">${ICONS.close}</button>
        <div class="modal__body">${html}</div>
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => wrap.classList.add("open"));
    const panel = $(".modal__panel", wrap);
    panel.focus();
    wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
    wrap.addEventListener("keydown", trapFocus);
    return wrap;
  }
  function closeModal() {
    const m = $("#modal");
    if (!m) return;
    m.classList.remove("open");
    setTimeout(() => {
      m.remove();
      document.body.classList.remove("no-scroll");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 200);
  }
  function trapFocus(e) {
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key !== "Tab") return;
    const f = $$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])', $("#modal")).filter((x) => !x.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  SMS.openModal = openModal;
  SMS.closeModal = closeModal;

  /* ---------- wishlist ---------- */
  const wl = {
    ids: () => store.get("sms_wishlist", []),
    has: (id) => wl.ids().includes(id),
    toggle(id) {
      let ids = wl.ids();
      if (ids.includes(id)) { ids = ids.filter((x) => x !== id); toast("Removed from wishlist"); }
      else { ids.push(id); toast("Saved to wishlist ♥"); }
      store.set("sms_wishlist", ids);
      wl.sync();
    },
    sync() {
      const n = wl.ids().length;
      $$("[data-wish-count]").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
      $$("[data-wish]").forEach((b) => {
        const on = wl.has(b.dataset.wish);
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on);
      });
    }
  };
  SMS.wishlist = wl;

  /* ---------- size guide modal ---------- */
  function sizeGuideModal() {
    const g = C.sizeGuide;
    const rows = g.rows.map((r) => `<tr><td><strong>${esc(g.system)} ${esc(r.size)}</strong></td><td>${r.footLengthCm ? esc(r.footLengthCm) + " cm" : "—"}</td></tr>`).join("");
    openModal(`<h2>Footwear Size Guide</h2>
      <p class="muted">Find your exact fit with our standard UK / Indian measurement chart.</p>
      <h3>How to measure your foot</h3>
      <ol class="steps">
        <li>Place a blank sheet of paper against a flat wall and stand firmly on it with your heel touching the wall.</li>
        <li>Mark the tip of your longest toe on the paper with a pen held vertically.</li>
        <li>Measure the distance from the edge of the paper to your mark in centimetres.</li>
        <li>Measure both feet and choose the size that fits your larger foot.</li>
      </ol>
      <table class="table"><thead><tr><th>Size (${esc(g.system)})</th><th>Foot length (cm)</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="muted small">${esc(g.note)}</p>
      <div style="margin-top:20px;text-align:center">
        <a class="btn btn--wa btn--small" href="${esc(waLink("Hello! I need help picking my shoe size."))}" target="_blank" rel="noopener noreferrer">${ICONS.whatsapp} Get Size Help on WhatsApp</a>
      </div>`, { label: "Size guide" });
  }
  SMS.sizeGuide = sizeGuideModal;

  /* ---------- product card ---------- */
  function productCard(p) {
    const badges = [];
    if (p.badge) {
      badges.push(`<span class="badge badge--highlight">${esc(p.badge)}</span>`);
    } else if (p.isNew) {
      badges.push('<span class="badge badge--new">New</span>');
    }
    if (p.originalPrice && p.originalPrice > p.price) {
      const off = Math.round((1 - p.price / p.originalPrice) * 100);
      badges.push(`<span class="badge badge--discount">-${off}%</span>`);
    }
    if (p.demo) {
      badges.push('<span class="badge badge--demo">Demo</span>');
    }

    const price = hasPrice(p)
      ? `<span class="card__price">${money(p.price)}</span>` + (p.originalPrice && p.originalPrice > p.price ? ` <s class="price-old">${money(p.originalPrice)}</s>` : "")
      : `<span class="card__price price--na">Price on WhatsApp</span>`;

    const sizes = p.availableSizes && p.availableSizes.length
      ? `<p class="card__sizes">UK Sizes: ${p.availableSizes.map(esc).join(" · ")}</p>`
      : "";

    const rating = p.rating
      ? `<div class="card__rating"><span class="stars">★★★★★</span> <strong>${p.rating}</strong> <span>(${p.reviewCount || 18})</span></div>`
      : "";

    return `<article class="card" data-id="${esc(p.id)}">
      <div class="card__media">
        <a href="product.html?slug=${encodeURIComponent(p.slug)}" aria-label="${esc(p.name)}">
          <img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy" width="800" height="800">
        </a>
        <div class="card__badges">${badges.join("")}</div>
        <button class="icon-btn card__wish" data-wish="${esc(p.id)}" aria-label="Add ${esc(p.name)} to wishlist" aria-pressed="false">${ICONS.heart}</button>
        <button class="btn btn--small card__quick" data-quick="${esc(p.id)}">Quick view</button>
      </div>
      <div class="card__body">
        <span class="card__cat">${esc(p.category)}</span>
        <h3 class="card__title"><a href="product.html?slug=${encodeURIComponent(p.slug)}">${esc(p.name)}</a></h3>
        ${rating}
        <div class="card__price-row">${price}</div>
        ${sizes}
        <div class="card__actions">
          <button class="btn btn--dark btn--block btn--small" data-quickadd="${esc(p.id)}">${ICONS.bag} Add to bag</button>
        </div>
      </div></article>`;
  }
  SMS.productCard = productCard;

  /* variant picker used by quick view + quick add */
  function quickView(id, addMode) {
    const p = getProduct(id);
    if (!p) return;
    const sizes = p.availableSizes.map((s) => `<label class="chip"><input type="radio" name="qv-size" value="${esc(s)}"><span>${esc(s)}</span></label>`).join("");
    const cols = p.availableColours.map((c, i) => `<label class="chip"><input type="radio" name="qv-col" value="${esc(c)}" ${i === 0 ? "checked" : ""}><span>${esc(c)}</span></label>`).join("");
    const m = openModal(`<div class="qv">
      <img src="${esc(p.images[0])}" alt="${esc(p.name)}">
      <div>
        <span class="card__cat">${esc(p.category)}</span>
        <h2>${esc(p.name)}</h2>
        <p class="price">${esc(priceLabel(p))}</p>
        <p class="muted">${esc(p.description)}</p>
        <fieldset><legend>UK Size <button type="button" class="link" id="qv-guide">Size guide</button></legend><div class="chips">${sizes || "<em>Not listed</em>"}</div></fieldset>
        ${p.availableColours.length ? `<fieldset><legend>Colour</legend><div class="chips">${cols}</div></fieldset>` : ""}
        <p class="form-error" id="qv-err" role="alert" hidden>Please select a size to continue.</p>
        <button class="btn btn--dark btn--block" id="qv-add">${ICONS.bag} Add to bag</button>
        <div style="margin-top:14px;text-align:center">
          <a class="link" href="product.html?slug=${encodeURIComponent(p.slug)}">View full product details →</a>
        </div>
      </div></div>`, { label: p.name, wide: true });
    $("#qv-guide", m).addEventListener("click", () => { closeModal(); sizeGuideModal(); });
    $("#qv-add", m).addEventListener("click", () => {
      const size = ($('input[name="qv-size"]:checked', m) || {}).value;
      const colour = ($('input[name="qv-col"]:checked', m) || {}).value || "";
      if (p.availableSizes.length && !size) { $("#qv-err", m).hidden = false; return; }
      SMS.cart.add(p.id, size || "", colour, 1);
      closeModal();
    });
  }
  SMS.quickView = quickView;

  function bindCards(root) {
    root = root || document;
    root.addEventListener("click", (e) => {
      const q = e.target.closest("[data-quick]");
      if (q) { quickView(q.dataset.quick); return; }
      const a = e.target.closest("[data-quickadd]");
      if (a) { quickView(a.dataset.quickadd, true); return; }
      const w = e.target.closest("[data-wish]");
      if (w) { wl.toggle(w.dataset.wish); }
    });
  }

  /* ---------- page chrome ---------- */
  const NAV = [
    ["Home", "index.html", "home"],
    ["Shop", "shop.html", "shop"],
    ["Collections", "index.html#collections", "collections"],
    ["Custom Studio", "custom-design.html", "custom", "1-OF-1"],
    ["About", "about.html", "about"],
    ["Contact", "contact.html", "contact"],
    ["FAQ", "faq.html", "faq"]
  ].filter((n) => n[2] !== "custom" || customOn());

  function navLinks(page) {
    return NAV.map(([label, href, key, tag]) => {
      const isCur = key === page || (page === "product" && key === "shop");
      const badge = tag ? `<span class="nav-pill">${tag}</span>` : "";
      return `<a href="${href}" ${isCur ? 'aria-current="page"' : ""}>${label} ${badge}</a>`;
    }).join("");
  }

  /* ---------- command center search ---------- */
  function setupSearch() {
    const overlay = $("#search-overlay");
    const input = $("#search-modal-input");
    const results = $("#search-results");
    if (!overlay || !input || !results) return;

    function openSearch() {
      overlay.classList.add("open");
      document.body.classList.add("no-scroll");
      setTimeout(() => input.focus(), 100);
      renderResults(input.value);
    }
    function closeSearch() {
      overlay.classList.remove("open");
      document.body.classList.remove("no-scroll");
    }

    function renderResults(q) {
      q = (q || "").trim().toLowerCase();
      let matches = P;
      if (q) {
        matches = P.filter((p) =>
          (p.name + " " + p.category + " " + (p.availableColours || []).join(" ") + " " + p.description)
            .toLowerCase()
            .includes(q)
        );
      }
      matches = matches.slice(0, 6);

      if (!matches.length) {
        results.innerHTML = `<div class="empty" style="padding:32px 16px"><p>No shoes found matching "<strong>${esc(q)}</strong>"</p><a class="btn btn--small btn--dark" href="shop.html">View all footwear</a></div>`;
        return;
      }

      results.innerHTML = matches.map((p) => `
        <a class="search-item" href="product.html?slug=${encodeURIComponent(p.slug)}">
          <img src="${esc(p.images[0])}" alt="${esc(p.name)}">
          <div class="search-item__info">
            <div class="search-item__title">${esc(p.name)}</div>
            <div class="search-item__cat">${esc(p.category)} · UK ${p.availableSizes.join(", ")}</div>
          </div>
          <div class="search-item__price">${hasPrice(p) ? money(p.price) : "WhatsApp"}</div>
        </a>
      `).join("");
    }

    $("#search-open").addEventListener("click", openSearch);
    const mOpen = $("#search-open-mobile");
    if (mOpen) mOpen.addEventListener("click", openSearch);
    $("#search-close-btn").addEventListener("click", closeSearch);
    overlay.addEventListener("click", (e) => {
      if (e.target.closest("[data-search-close]")) closeSearch();
    });

    input.addEventListener("input", (e) => renderResults(e.target.value));
    $("#search-form-modal").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim();
      location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });

    // Quick filter chips inside search modal
    $$(".search-pill", overlay).forEach((pill) => {
      pill.addEventListener("click", () => {
        const val = pill.dataset.filter || pill.textContent.trim();
        input.value = val;
        renderResults(val);
      });
    });

    // Global keyboard shortcut: Cmd+K / Ctrl+K & Escape
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (overlay.classList.contains("open")) closeSearch();
        else openSearch();
      }
      if (e.key === "Escape" && overlay.classList.contains("open")) {
        closeSearch();
      }
    });
  }

  function renderChrome() {
    const page = document.body.dataset.page || "";
    const a = C.announcement;
    const policyLink = (k, label) => `<li><a href="faq.html#${k}">${label}</a></li>`;
    const social = [
      `<li><a href="${esc(C.instagram.url)}" target="_blank" rel="noopener noreferrer">Instagram (@sketchmyshoes)</a></li>`,
      `<li><a href="${esc(waLink("Hello Sketch My Shoes studio!"))}" target="_blank" rel="noopener noreferrer">WhatsApp Concierge</a></li>`
    ].concat((C.social || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`)).join("");

    const html = `
      <a class="skip" href="#main">Skip to content</a>
      ${a && a.enabled && a.text ? `<div class="announce" role="note"><span class="pulse-dot"></span> ${esc(a.text)}</div>` : ""}
      ${C.demoMode ? `<div class="demo-banner" role="note">Demo catalogue notice: using placeholder inventory.</div>` : ""}
      <header class="header" id="header">
        <div class="container header__row">
          <button class="icon-btn only-mobile" id="menu-open" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">${ICONS.menu}</button>
          
          <a class="logo" href="index.html" aria-label="${esc(C.brand.name)} home">
            SKETCH<span class="logo-tag">MY</span>SHOES
            <span class="logo-sub only-desktop">STUDIO</span>
          </a>

          <nav class="nav only-desktop" aria-label="Main">${navLinks(page)}</nav>

          <div class="header__actions">
            <button class="header__search-trigger only-desktop" id="search-open" aria-label="Search shoes">
              ${ICONS.search}
              <span>Search shoes...</span>
              <kbd>⌘K</kbd>
            </button>
            <button class="icon-btn only-mobile" id="search-open-mobile" aria-label="Search shoes">${ICONS.search}</button>
            
            <a class="icon-btn only-desktop badge-wrap" href="shop.html?wishlist=1" aria-label="Wishlist">
              ${ICONS.heart}
              <span class="count" data-wish-count hidden>0</span>
            </a>
            
            <button class="icon-btn badge-wrap" id="cart-open" aria-label="Open shopping bag">
              ${ICONS.bag}
              <span class="count" data-cart-count hidden>0</span>
            </button>

            <a class="header__wa-btn only-desktop" href="${esc(waLink("Hello Sketch My Shoes studio! I have a question about your footwear."))}" target="_blank" rel="noopener noreferrer" aria-label="Chat with studio concierge">
              ${ICONS.whatsapp}
              <span>Concierge</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div class="drawer" id="drawer" aria-hidden="true">
        <div class="drawer__backdrop" data-drawer-close></div>
        <div class="drawer__panel drawer__panel--left" role="dialog" aria-label="Navigation Menu">
          <div class="drawer__mobile-head">
            <a class="logo" href="index.html">SKETCH<span class="logo-tag">MY</span>SHOES</a>
            <button class="icon-btn drawer__close" data-drawer-close aria-label="Close menu">${ICONS.close}</button>
          </div>
          <nav class="drawer__nav" aria-label="Mobile">
            ${navLinks(page)}
            <a href="shop.html?wishlist=1">Wishlist <span class="nav-pill" data-wish-count hidden>0</span></a>
          </nav>
          <div class="drawer__mobile-foot">
            <a class="btn btn--wa btn--block" href="${esc(waLink("Hello Sketch My Shoes!"))}" target="_blank" rel="noopener noreferrer">${ICONS.whatsapp} WhatsApp Concierge</a>
            <p class="small muted" style="margin:0;text-align:center">${esc(C.hours)}<br>${esc(C.address)}</p>
          </div>
        </div>
      </div>

      <!-- Shopping Bag Drawer -->
      <div class="drawer" id="cart-drawer" aria-hidden="true">
        <div class="drawer__backdrop" data-drawer-close></div>
        <aside class="drawer__panel drawer__panel--right" role="dialog" aria-label="Shopping bag">
          <div class="drawer__head">
            <h2>Your Bag <span data-cart-count style="font-size:0.9rem;font-weight:400" hidden>(0)</span></h2>
            <button class="icon-btn" data-drawer-close aria-label="Close bag">${ICONS.close}</button>
          </div>
          <div class="cart-shipping-bar" id="cart-shipping-notice">
            <span>✨</span> <span>Complimentary express delivery on orders over ₹3,999</span>
          </div>
          <div class="drawer__content" id="cart-items"></div>
          <div class="drawer__foot" id="cart-foot"></div>
        </aside>
      </div>

      <!-- Search Overlay (Command Palette) -->
      <div class="search-overlay" id="search-overlay" aria-hidden="true">
        <div class="modal__backdrop" data-search-close></div>
        <div class="search-modal" role="dialog" aria-modal="true" aria-label="Search shoes">
          <form class="search-modal__bar" id="search-form-modal">
            ${ICONS.search}
            <input class="search-modal__input" id="search-modal-input" type="search" placeholder="Search by shoe name, category, colour, style..." autocomplete="off">
            <button class="icon-btn" type="button" id="search-close-btn" data-search-close aria-label="Close search">${ICONS.close}</button>
          </form>
          <div class="search-modal__quick">
            <span>Trending:</span>
            <button type="button" class="search-pill" data-filter="Sneakers">Sneakers</button>
            <button type="button" class="search-pill" data-filter="Custom">Bespoke Custom</button>
            <button type="button" class="search-pill" data-filter="Formal">Formal Leather</button>
            <button type="button" class="search-pill" data-filter="Casual">Casual Low-Top</button>
          </div>
          <div class="search-results" id="search-results"></div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("afterbegin", html);

    const footer = `
      <footer class="footer">
        <div class="container footer__grid">
          <div>
            <a class="logo logo--light" href="index.html">SKETCH<span class="logo-tag">MY</span>SHOES<span class="logo-sub">STUDIO</span></a>
            <p class="footer__about">${esc(C.brand.description)}</p>
            <p class="small muted" style="margin-top:14px">📍 ${esc(C.address)}<br>⏰ ${esc(C.hours)}</p>
          </div>
          <div><h3>Footwear</h3><ul>
            <li><a href="shop.html">All Shoes</a></li>
            <li><a href="shop.html?category=Sneakers">Sneakers &amp; Runners</a></li>
            <li><a href="shop.html?category=Casual+Shoes">Casual Suede &amp; Canvas</a></li>
            <li><a href="shop.html?category=Formal+Shoes">Handcrafted Formal Leather</a></li>
            ${customOn() ? '<li><a href="custom-design.html">1-of-1 Bespoke Custom Studio</a></li>' : ""}
          </ul></div>
          <div><h3>Support &amp; Studio</h3><ul>
            <li><a href="contact.html">Concierge Contact</a></li>
            <li><a href="faq.html">FAQ &amp; Sizing</a></li>
            ${policyLink("shipping", "Shipping &amp; Delivery")}
            ${policyLink("returns", "Returns &amp; Size Exchanges")}
            ${policyLink("privacy", "Privacy Policy")}
            ${policyLink("terms", "Terms of Service")}
          </ul></div>
          <div><h3>Connect</h3><ul>${social}</ul></div>
        </div>
        <div class="container footer__bottom">
          <p>© <span id="year"></span> ${esc(C.brand.name)} Studio. All rights reserved.</p>
          <p class="muted small">Engineered with modern street-luxury aesthetics &amp; bespoke craftsmanship.</p>
        </div>
      </footer>
      <a class="wa-float" id="wa-float" href="${esc(waLink("Hello Sketch My Shoes studio!"))}" target="_blank" rel="noopener noreferrer" aria-label="Chat with Concierge on WhatsApp">${ICONS.whatsapp}</a>
      <div id="toasts" aria-live="polite"></div>`;
    document.body.insertAdjacentHTML("beforeend", footer);
    $("#year").textContent = new Date().getFullYear();

    const wa = $("#wa-float");
    wa.addEventListener("click", (e) => {
      if (!String(C.whatsappNumber || "").replace(/\D/g, "")) toast("WhatsApp number isn't configured yet.", "warn");
    });

    /* header behaviour on scroll */
    const hdr = $("#header");
    const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* drawer behaviour */
    const drawerOpen = (el, trigger) => {
      el.classList.add("open");
      el.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      if (trigger) trigger.setAttribute("aria-expanded", "true");
      const closeBtn = $("[data-drawer-close].icon-btn", el);
      if (closeBtn) closeBtn.focus();
    };
    const drawerClose = (el) => {
      el.classList.remove("open");
      el.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      const m = $("#menu-open"); if (m) m.setAttribute("aria-expanded", "false");
    };
    SMS.openCart = () => { SMS.cart.render(); drawerOpen($("#cart-drawer")); };
    SMS.closeCart = () => drawerClose($("#cart-drawer"));
    $("#menu-open").addEventListener("click", (e) => drawerOpen($("#drawer"), e.currentTarget));
    $("#cart-open").addEventListener("click", SMS.openCart);
    $$(".drawer").forEach((d) => {
      d.addEventListener("click", (e) => { if (e.target.closest("[data-drawer-close]")) drawerClose(d); });
      d.addEventListener("click", (e) => { if (e.target.closest(".drawer__nav a")) drawerClose(d); });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { $$(".drawer.open").forEach(drawerClose); }
    });

    setupSearch();
  }

  /* ---------- home page ---------- */
  function initHome() {
    const hero = $("#hero-img");
    if (hero) { hero.src = C.brand.heroImage; }

    const cols = $("#collection-grid");
    if (cols) {
      const list = C.collections.filter((c) => !c.requires || (c.requires === "customization" && customOn()));
      cols.innerHTML = list.map((c) => {
        const href = c.name === "Custom Designs" ? "custom-design.html" : "shop.html?category=" + encodeURIComponent(c.name);
        return `<a class="collection" href="${href}">
          <img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">
          <div class="collection__scrim">
            <span class="collection__tag">${esc(c.count || "Collection")}</span>
            <div class="collection__title">
              <span>${esc(c.name)}</span>
              <span class="collection__arrow">${ICONS.arrowRight}</span>
            </div>
            ${c.desc ? `<p class="small" style="margin:0;opacity:0.85">${esc(c.desc)}</p>` : ""}
          </div>
        </a>`;
      }).join("");
    }

    const ft = $("#featured-title"); if (ft) ft.textContent = C.sections.featuredTitle || "Featured Editions";
    const feat = $("#featured-grid");
    if (feat) {
      const items = P.filter((p) => p.featured);
      feat.innerHTML = items.length ? items.map(productCard).join("") : '<p class="empty">No featured products yet.</p>';
    }

    const newTitle = $("#new-h"); if (newTitle && C.sections.newArrivalsTitle) newTitle.textContent = C.sections.newArrivalsTitle;
    const neu = $("#new-grid");
    if (neu) {
      const items = P.filter((p) => p.isNew);
      neu.innerHTML = items.length ? items.map(productCard).join("") : '<p class="empty">No new arrivals yet.</p>';
    }

    const story = $("#brand-story");
    if (story) {
      const paras = C.brandStory.map((t) => `<p>${esc(t)}</p>`).join("");
      const feats = `
        <div class="story-features">
          <div class="story-feat">
            <div class="story-feat__icon">${ICONS.eye}</div>
            <div><strong>01. Artisan Hand-Finishing</strong><span>Every edge is hand-buffed, conditioned, and inspected before leaving the studio.</span></div>
          </div>
          <div class="story-feat">
            <div class="story-feat__icon">${ICONS.ruler}</div>
            <div><strong>02. Premium Grade Materials</strong><span>Full-grain leathers, durable canvases, and high-rebound kinetic cushioning.</span></div>
          </div>
          <div class="story-feat">
            <div class="story-feat__icon">${ICONS.pencil}</div>
            <div><strong>03. 1-of-1 Bespoke Artistry</strong><span>Custom hand-painted shoes treated with weatherproof acrylic topcoats.</span></div>
          </div>
        </div>`;
      story.innerHTML = paras + feats;
    }

    const why = $("#why-grid");
    if (why) {
      const items = C.whyShop.filter((w) => w.show && (!w.requires || (w.requires === "customization" && customOn())));
      why.innerHTML = items.map((w) => `
        <div class="why">
          <div class="why__icon">${ICONS[w.icon] || ICONS.eye}</div>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.text)}</p>
        </div>
      `).join("");
    }

    const ig = $("#ig-grid");
    if (ig) {
      const imgs = C.instagram.images || [];
      ig.innerHTML = imgs.length
        ? imgs.map((src, i) => `
            <a class="ig-card" href="${esc(C.instagram.url)}" target="_blank" rel="noopener noreferrer" aria-label="View photo on Instagram">
              <img src="${esc(src)}" alt="Sketch My Shoes Instagram photo ${i + 1}" loading="lazy">
              <div class="ig-card__overlay">${ICONS.instagram}</div>
            </a>
          `).join("")
        : `<a class="ig-empty" href="${esc(C.instagram.url)}" target="_blank" rel="noopener noreferrer">${ICONS.instagram}<span>See our latest pairs on Instagram ${esc(C.instagram.handle)}</span></a>`;
    }

    const nl = $("#newsletter-form");
    if (nl) nl.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", nl), msg = $("#newsletter-msg");
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      msg.className = "form-msg " + (ok ? "" : "form-error");
      msg.textContent = ok
        ? "✨ Welcome to the inner circle! You'll receive early access to new seasonal drops."
        : "Please enter a valid email address.";
      if (ok) nl.reset();
    });
  }

  /* ---------- shop page ---------- */
  function initShop() {
    const params = new URLSearchParams(location.search);
    const state = {
      q: params.get("q") || "",
      cats: params.get("category") ? [params.get("category")] : [],
      sizes: [], colours: [],
      min: "", max: "",
      sort: params.get("sort") || "newest",
      wishlist: params.get("wishlist") === "1"
    };
    const grid = $("#shop-grid");
    const priced = P.some(hasPrice);
    const cats = [...new Set(P.map((p) => p.category))];
    const sizes = [...new Set(P.flatMap((p) => p.availableSizes))].sort((a, b) => parseFloat(a) - parseFloat(b));
    const colours = [...new Set(P.flatMap((p) => p.availableColours))];

    $("#f-cats").innerHTML = cats.map((c) => `<label class="check"><input type="checkbox" value="${esc(c)}" ${state.cats.includes(c) ? "checked" : ""}> <span>${esc(c)}</span></label>`).join("");
    $("#f-sizes").innerHTML = sizes.map((s) => `<label class="chip"><input type="checkbox" value="${esc(s)}"><span>${esc(s)}</span></label>`).join("");
    $("#f-colours").innerHTML = colours.map((c) => `<label class="chip"><input type="checkbox" value="${esc(c)}"><span>${esc(c)}</span></label>`).join("");
    $("#f-price").hidden = !priced;
    $$("#sort option[data-price]").forEach((o) => { o.hidden = !priced; o.disabled = !priced; });
    $("#search").value = state.q;
    $("#sort").value = priced || !$("#sort option[value='" + state.sort + "'][data-price]") ? state.sort : "newest";
    skeleton();

    function skeleton() {
      grid.innerHTML = Array(4).fill('<div class="card skeleton" aria-hidden="true"><div class="card__media"></div><div class="card__body"><span></span><span></span></div></div>').join("");
    }
    function filtered() {
      const q = state.q.trim().toLowerCase();
      const min = parseFloat(state.min), max = parseFloat(state.max);
      let list = P.filter((p) => {
        if (state.wishlist && !wl.has(p.id)) return false;
        if (q && !(p.name + " " + p.category + " " + (p.availableColours || []).join(" ") + " " + p.description).toLowerCase().includes(q)) return false;
        if (state.cats.length && !state.cats.includes(p.category)) return false;
        if (state.sizes.length && !state.sizes.some((s) => p.availableSizes.includes(s))) return false;
        if (state.colours.length && !state.colours.some((c) => p.availableColours.includes(c))) return false;
        if (!isNaN(min) && (!hasPrice(p) || p.price < min)) return false;
        if (!isNaN(max) && (!hasPrice(p) || p.price > max)) return false;
        return true;
      });
      const idx = (p) => P.indexOf(p);
      if (state.sort === "price-asc") list.sort((a, b) => (hasPrice(a) ? a.price : Infinity) - (hasPrice(b) ? b.price : Infinity));
      else if (state.sort === "price-desc") list.sort((a, b) => (hasPrice(b) ? b.price : -1) - (hasPrice(a) ? a.price : -1));
      else list.sort((a, b) => (b.isNew - a.isNew) || (idx(a) - idx(b)));
      return list;
    }
    function render() {
      const list = filtered();
      $("#count").textContent = list.length + (list.length === 1 ? " product" : " products");
      $("#shop-title").textContent = state.wishlist ? "Your Wishlist" : "All Footwear";
      grid.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty"><h3>No matching footwear</h3><p>${state.wishlist ? "Your wishlist is currently empty. Explore our collection and tap the heart icon to save pairs." : "Try clearing your filters or searching for something else."}</p><button class="btn btn--dark" id="empty-clear">Clear all filters</button></div>`;
      wl.sync();
    }
    const read = () => {
      state.cats = $$("#f-cats input:checked").map((i) => i.value);
      state.sizes = $$("#f-sizes input:checked").map((i) => i.value);
      state.colours = $$("#f-colours input:checked").map((i) => i.value);
      state.min = $("#p-min").value; state.max = $("#p-max").value;
      state.sort = $("#sort").value; state.q = $("#search").value;
      render();
    };
    const clear = () => {
      $$("#filters input[type=checkbox]").forEach((i) => (i.checked = false));
      ["#p-min", "#p-max", "#search"].forEach((s) => ($(s).value = ""));
      state.wishlist = false; read();
    };
    $("#filters").addEventListener("input", read);
    $("#sort").addEventListener("change", read);
    $("#search").addEventListener("input", read);
    $("#clear-filters").addEventListener("click", clear);
    document.addEventListener("click", (e) => { if (e.target.id === "empty-clear") clear(); });
    const fd = $("#filters-wrap");
    const setFilters = (open) => { fd.classList.toggle("open", open); $("#filters-open").setAttribute("aria-expanded", open); document.body.classList.toggle("no-scroll", open && innerWidth < 900); };
    $("#filters-open").addEventListener("click", () => setFilters(true));
    $$("[data-filters-close]").forEach((b) => b.addEventListener("click", () => setFilters(false)));
    setTimeout(render, 150);
  }

  /* ---------- info pages: about, contact, faq ---------- */
  SMS.pageInit = SMS.pageInit || {};
  SMS.pageInit.about = function () {
    const sec = (id, arr) => { const el = $(id); if (el) { el.innerHTML = arr.map((t) => `<p>${esc(t)}</p>`).join(""); el.closest("section").hidden = !arr.length; } };
    sec("#about-intro", C.about.intro);
    sec("#about-philosophy", C.about.philosophy);
    sec("#about-craft", C.about.craftsmanship);
    const g = $("#about-gallery");
    const imgs = C.instagram.images || [];
    if (g) { g.innerHTML = imgs.map((s, i) => `<img src="${esc(s)}" alt="Sketch My Shoes atelier photo ${i + 1}" loading="lazy">`).join(""); g.closest("section").hidden = !imgs.length; }
  };
  SMS.pageInit.contact = function () {
    const rows = [];
    const num = String(C.whatsappNumber || "").replace(/\D/g, "");
    rows.push(`<li><strong>WhatsApp Concierge</strong><a href="${esc(waLink("Hello Sketch My Shoes!"))}" target="_blank" rel="noopener noreferrer">${num ? "+" + esc(num) : "Chat on WhatsApp"} (Fastest response)</a></li>`);
    rows.push(`<li><strong>Instagram</strong><a href="${esc(C.instagram.url)}" target="_blank" rel="noopener noreferrer">${esc(C.instagram.handle)}</a></li>`);
    if (C.email) rows.push(`<li><strong>Email</strong><a href="mailto:${esc(C.email)}">${esc(C.email)}</a></li>`);
    if (C.address) rows.push(`<li><strong>Studio</strong><span>${esc(C.address)}</span></li>`);
    if (C.hours) rows.push(`<li><strong>Hours</strong><span>${esc(C.hours)}</span></li>`);
    $("#contact-list").innerHTML = rows.join("");
    $("#contact-wa").href = waLink("Hello " + C.brand.name + "! I would like to enquire about your footwear.");
    const f = $("#contact-form");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (n) => f.elements[n].value.trim();
      const errs = [];
      if (v("name").length < 2) errs.push("Please enter your name.");
      if (v("message").length < 5) errs.push("Please write a short message.");
      if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) errs.push("Please enter a valid email or leave it empty.");
      const msgEl = $("#contact-msg");
      if (errs.length) { msgEl.className = "form-msg form-error"; msgEl.textContent = errs.join(" "); return; }
      msgEl.className = "form-msg"; msgEl.textContent = "Opening WhatsApp. Your message will be sent directly to our team.";
      openWhatsApp("Hello " + C.brand.name + "!\n\nName: " + v("name") + (v("email") ? "\nEmail: " + v("email") : "") + "\n\n" + v("message"));
    });
  };
  SMS.pageInit.faq = function () {
    $("#faq-list").innerHTML = C.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
    const box = $("#policies");
    box.innerHTML = Object.keys(C.policies).map((k) => {
      const pol = C.policies[k];
      const body = pol.approved && pol.body.length
        ? pol.body.map((t) => `<p>${esc(t)}</p>`).join("")
        : `<p class="muted">Policy details are confirmed with our concierge team on WhatsApp.</p>`;
      return `<section class="policy" id="${k}"><h2>${esc(pol.title)}</h2>${body}</section>`;
    }).join("");
    $("#size-guide-open").addEventListener("click", sizeGuideModal);
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  };

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    if (SMS.cart) SMS.cart.init();
    bindCards(document);
    wl.sync();
    const page = document.body.dataset.page;
    if (page === "home") initHome();
    if (page === "shop") initShop();
    if (SMS.pageInit && SMS.pageInit[page]) SMS.pageInit[page]();
    if (SMS.chatbot) SMS.chatbot.init();
    wl.sync();
  });
})();
