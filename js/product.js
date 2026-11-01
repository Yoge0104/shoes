/* ==========================================================================
   product.js — product details page (product.html?slug=...)
   ========================================================================== */
(function () {
  "use strict";
  const SMS = (window.SMS = window.SMS || {});
  SMS.pageInit = SMS.pageInit || {};

  SMS.pageInit.product = function () {
    const { $, $$, esc } = SMS;
    const root = $("#product-root");
    const slug = new URLSearchParams(location.search).get("slug");
    const p = SMS.products.find((x) => x.slug === slug);
    if (!p) {
      document.title = "Product not found | " + SMS.config.brand.name;
      root.innerHTML = `<div class="empty" style="margin:48px 0"><h1>Product not found</h1><p class="muted">This silhouette doesn't exist or has sold out.</p><a class="btn btn--dark" href="shop.html">Back to All Footwear</a></div>`;
      return;
    }
    document.title = p.name + " | " + SMS.config.brand.name;
    const md = $('meta[name="description"]');
    if (md) md.content = p.description.slice(0, 155);

    const stock = p.stock === null ? "Availability confirmed on WhatsApp" : p.stock > 0 ? `In stock (${p.stock} pairs left in studio)` : "Sold out";
    const out = p.stock === 0;
    const specs = p.specs && p.specs.length
      ? `<ul class="specs">${p.specs.map((s) => `<li><strong>${esc(s.label)}:</strong> ${esc(s.value)}</li>`).join("")}</ul>`
      : `<p class="muted">Handcrafted with premium leather &amp; vulcanized rubber.</p>`;

    const badges = [];
    if (p.badge) badges.push(`<span class="badge badge--highlight">${esc(p.badge)}</span>`);
    else if (p.isNew) badges.push('<span class="badge badge--new">New Arrival</span>');
    if (p.originalPrice && p.originalPrice > p.price) {
      const off = Math.round((1 - p.price / p.originalPrice) * 100);
      badges.push(`<span class="badge badge--discount">Save ${off}%</span>`);
    }

    const rating = p.rating ? `
      <div class="card__rating" style="margin:8px 0 16px;font-size:0.9rem">
        <span class="stars" style="color:var(--gold)">★★★★★</span>
        <strong>${p.rating}</strong>
        <span class="muted">(${p.reviewCount || 24} verified studio reviews)</span>
      </div>` : "";

    root.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <a href="shop.html?category=${encodeURIComponent(p.category)}">${esc(p.category)}</a> / <span>${esc(p.name)}</span></nav>
      <div class="pdp">
        <div class="gallery">
          <div class="gallery__main"><img id="g-main" src="${esc(p.images[0])}" alt="${esc(p.name)}" width="800" height="800"></div>
          ${p.images.length > 1 ? `<div class="gallery__thumbs">${p.images.map((src, i) => `<button type="button" class="thumb ${i === 0 ? "active" : ""}" data-src="${esc(src)}" aria-label="Show image ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
        </div>
        <div class="pdp__info">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">${badges.join("")}</div>
          <span class="card__cat">${esc(p.category)}</span>
          <h1>${esc(p.name)}</h1>
          ${rating}
          <p class="pdp__price">
            ${SMS.hasPrice(p) ? SMS.money(p.price) : "Price on WhatsApp"}
            ${p.originalPrice && p.originalPrice > p.price ? ` <s>${SMS.money(p.originalPrice)}</s>` : ""}
          </p>
          <p class="muted" style="font-size:1.05rem;line-height:1.7">${esc(p.description)}</p>
          <p class="stock ${out ? "stock--out" : ""}">● ${esc(stock)}</p>
          
          <fieldset>
            <legend>UK Size <button type="button" class="link" id="open-guide">Size guide</button></legend>
            <div class="chips" id="sizes">${p.availableSizes.length ? p.availableSizes.map((s) => `<label class="chip"><input type="radio" name="size" value="${esc(s)}"><span>UK ${esc(s)}</span></label>`).join("") : "<em>No sizes listed</em>"}</div>
          </fieldset>
          
          ${p.availableColours.length ? `<fieldset><legend>Colour</legend><div class="chips" id="colours">${p.availableColours.map((c, i) => `<label class="chip"><input type="radio" name="colour" value="${esc(c)}" ${i === 0 ? "checked" : ""}><span>${esc(c)}</span></label>`).join("")}</div></fieldset>` : ""}
          
          <fieldset><legend>Quantity</legend>
            <div class="qty"><button class="icon-btn" id="q-dec" aria-label="Decrease quantity">${SMS.icons.minus}</button><span id="q-val" aria-live="polite">1</span><button class="icon-btn" id="q-inc" aria-label="Increase quantity">${SMS.icons.plus}</button></div>
          </fieldset>
          
          <p class="form-error" id="size-err" role="alert" hidden>Please select your UK size to continue.</p>
          
          <div class="pdp__actions">
            <button class="btn btn--dark" id="add" ${out ? "disabled" : ""}>${SMS.icons.bag} Add to bag</button>
            <button class="btn btn--wa" id="buy-wa" ${out ? "disabled" : ""}>${SMS.icons.whatsapp} Buy via WhatsApp</button>
            <button class="icon-btn icon-btn--bordered" data-wish="${esc(p.id)}" aria-label="Save to wishlist" aria-pressed="false">${SMS.icons.heart}</button>
          </div>

          <div style="background:var(--surface-subtle);border-radius:var(--radius-md);padding:18px;margin-bottom:28px;font-size:0.86rem;display:grid;gap:8px">
            <div>🚚 <strong>Free Express Shipping</strong> across India for orders over ₹3,999</div>
            <div>🔄 <strong>7-Day Size Exchange</strong> with personalized concierge fit advice</div>
            <div>🛡️ <strong>Artisan Inspected</strong> with certificate of craftsmanship</div>
          </div>

          <div class="accordion">
            <details open><summary>Product Specifications</summary>${specs}</details>
            <details><summary>Shipping &amp; Delivery</summary><p>${esc(SMS.config.shipping.summary)}</p></details>
            <details><summary>Returns &amp; Fit Exchanges</summary><p>${esc(SMS.config.returns.summary)}</p></details>
          </div>
        </div>
      </div>
      <section class="section" aria-labelledby="rel-h"><h2 id="rel-h">Recommended For You</h2><div class="grid" id="related"></div></section>`;

    let qty = 1;
    const sel = (n) => ($(`input[name="${n}"]:checked`, root) || {}).value || "";
    const err = $("#size-err");
    $("#q-inc").addEventListener("click", () => { qty = Math.min(10, qty + 1); $("#q-val").textContent = qty; });
    $("#q-dec").addEventListener("click", () => { qty = Math.max(1, qty - 1); $("#q-val").textContent = qty; });
    $("#open-guide").addEventListener("click", SMS.sizeGuide);
    root.addEventListener("change", (e) => { if (e.target.name === "size") err.hidden = true; });
    $$(".thumb", root).forEach((t) => t.addEventListener("click", () => {
      $("#g-main").src = t.dataset.src;
      $$(".thumb", root).forEach((x) => x.classList.toggle("active", x === t));
    }));
    function valid() {
      if (p.availableSizes.length && !sel("size")) { err.hidden = false; $("#sizes").scrollIntoView({ block: "center", behavior: "smooth" }); return false; }
      return true;
    }
    $("#add").addEventListener("click", () => { if (valid()) SMS.cart.add(p.id, sel("size"), sel("colour"), qty); });
    $("#buy-wa").addEventListener("click", () => {
      if (!valid()) return;
      SMS.checkout.send([{ id: p.id, size: sel("size"), colour: sel("colour"), qty }]);
    });

    const rel = SMS.products.filter((x) => x.id !== p.id && x.category === p.category);
    const more = rel.concat(SMS.products.filter((x) => x.id !== p.id && x.category !== p.category)).slice(0, 4);
    $("#related").innerHTML = more.length ? more.map(SMS.productCard).join("") : "<p class='muted'>More footwear styles coming soon.</p>";
    SMS.wishlist.sync();

    if (!SMS.config.demoMode && !p.demo && SMS.hasPrice(p)) {
      const ld = {
        "@context": "https://schema.org/", "@type": "Product", name: p.name, description: p.description,
        image: p.images.map((i) => new URL(i, location.href).href), category: p.category,
        brand: { "@type": "Brand", name: SMS.config.brand.name },
        offers: { "@type": "Offer", priceCurrency: SMS.config.currency.code, price: p.price, url: location.href,
          availability: p.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" }
      };
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }
  };
})();
