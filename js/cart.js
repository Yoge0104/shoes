/* ==========================================================================
   cart.js — cart stored in localStorage
   Each size/colour combination is its own line, so variants never merge.
   ========================================================================== */
(function () {
  "use strict";
  const SMS = (window.SMS = window.SMS || {});
  const KEY = "sms_cart";
  const keyOf = (id, size, colour) => [id, size || "", colour || ""].join("|");
  let items = [];

  const load = () => {
    const raw = SMS.store.get(KEY, []);
    items = Array.isArray(raw) ? raw.filter((i) => i && SMS.getProduct(i.id) && i.qty > 0) : [];
  };
  const save = () => { SMS.store.set(KEY, items); updateCount(); };
  const count = () => items.reduce((n, i) => n + i.qty, 0);
  function updateCount() {
    const c = count();
    SMS.$$("[data-cart-count]").forEach((el) => {
      el.textContent = el.tagName === "SPAN" && el.textContent.startsWith("(") ? `(${c})` : c;
      el.hidden = c === 0;
    });
  }
  function totals() {
    let total = 0, unpriced = 0;
    items.forEach((i) => {
      const p = SMS.getProduct(i.id);
      if (SMS.hasPrice(p)) total += p.price * i.qty; else unpriced += i.qty;
    });
    return { total, unpriced };
  }

  function render() {
    const list = SMS.$("#cart-items"), foot = SMS.$("#cart-foot");
    const shipNotice = SMS.$("#cart-shipping-notice");
    if (!list) return;
    if (!items.length) {
      list.innerHTML = `<div class="empty" style="padding:48px 16px"><p style="font-size:1.1rem;font-weight:600;margin-bottom:8px">Your bag is empty.</p><p class="muted small" style="margin-bottom:20px">Explore our handcrafted collection and discover your signature pair.</p><a class="btn btn--dark btn--small" href="shop.html">Explore Collection</a></div>`;
      if (foot) foot.innerHTML = "";
      if (shipNotice) shipNotice.innerHTML = `<span>✨</span> <span>Complimentary express delivery on orders over ₹3,999</span>`;
      return;
    }

    list.innerHTML = items.map((i) => {
      const p = SMS.getProduct(i.id);
      const unit = SMS.hasPrice(p) ? SMS.money(p.price) : "Price on WhatsApp";
      const sub = SMS.hasPrice(p) ? SMS.money(p.price * i.qty) : "—";
      const k = keyOf(i.id, i.size, i.colour);
      return `<div class="line" data-key="${SMS.esc(k)}">
        <img src="${SMS.esc(p.images[0])}" alt="${SMS.esc(p.name)}">
        <div class="line__info">
          <a href="product.html?slug=${encodeURIComponent(p.slug)}"><strong>${SMS.esc(p.name)}</strong></a>
          <p class="muted small">${i.size ? "UK Size: " + SMS.esc(i.size) : ""}${i.size && i.colour ? " · " : ""}${SMS.esc(i.colour)}</p>
          <p class="small" style="font-weight:600">${unit}</p>
          <div class="qty">
            <button class="icon-btn" data-dec aria-label="Decrease quantity">${SMS.icons.minus}</button>
            <span aria-live="polite">${i.qty}</span>
            <button class="icon-btn" data-inc aria-label="Increase quantity">${SMS.icons.plus}</button>
          </div>
        </div>
        <div class="line__side">
          <strong>${sub}</strong>
          <button class="icon-btn" data-remove aria-label="Remove ${SMS.esc(p.name)}">${SMS.icons.trash}</button>
        </div>
      </div>`;
    }).join("");

    const t = totals();
    const freeThreshold = 3999;
    if (shipNotice) {
      if (t.total >= freeThreshold) {
        shipNotice.innerHTML = `<span>🎉</span> <strong>You've unlocked FREE Express Shipping!</strong>`;
        shipNotice.style.background = "#EBF7EE";
        shipNotice.style.color = "#15733A";
      } else {
        const diff = freeThreshold - t.total;
        shipNotice.innerHTML = `<span>🚚</span> <span>Add <strong>${SMS.money(diff)}</strong> more to unlock <strong>FREE Express Shipping</strong></span>`;
        shipNotice.style.background = "var(--accent-tint)";
        shipNotice.style.color = "var(--accent-hover)";
      }
    }

    if (foot) {
      foot.innerHTML = `
        <div class="total"><span>Estimated Total</span><strong>${t.total ? SMS.money(t.total) : "To be confirmed"}</strong></div>
        <p class="muted small" style="margin:0">${t.total >= freeThreshold ? "✓ FREE Express Delivery included" : "+ Standard courier shipping applied at checkout"}</p>
        <button class="btn btn--wa btn--block" id="cart-wa">${SMS.icons.whatsapp} Order on WhatsApp</button>
        <button class="btn btn--ghost btn--block btn--small" data-drawer-close>Continue Shopping</button>`;
    }
  }

  const api = {
    init() {
      load();
      updateCount();
      document.addEventListener("click", (e) => {
        if (e.target.closest("#cart-wa")) { SMS.checkout.send(items); return; }
        const line = e.target.closest(".line");
        if (!line || !line.closest("#cart-items")) return;
        const k = line.dataset.key;
        if (e.target.closest("[data-inc]")) api.setQty(k, 1, true);
        else if (e.target.closest("[data-dec]")) api.setQty(k, -1, true);
        else if (e.target.closest("[data-remove]")) api.remove(k);
      });
      window.addEventListener("storage", (e) => { if (e.key === KEY) { load(); updateCount(); render(); } });
    },
    add(id, size, colour, qty) {
      const p = SMS.getProduct(id);
      if (!p) return false;
      if (p.availableSizes.length && !size) { SMS.toast("Please select a UK size first.", "warn"); return false; }
      qty = Math.max(1, Math.min(10, parseInt(qty, 10) || 1));
      const k = keyOf(id, size, colour);
      const found = items.find((i) => keyOf(i.id, i.size, i.colour) === k);
      if (found) found.qty = Math.min(10, found.qty + qty);
      else items.push({ id, size: size || "", colour: colour || "", qty });
      save(); render();
      SMS.toast(`Added ${p.name} to bag! 👟`);
      SMS.openCart();
      return true;
    },
    setQty(k, delta, relative) {
      const it = items.find((i) => keyOf(i.id, i.size, i.colour) === k);
      if (!it) return;
      it.qty = relative ? it.qty + delta : delta;
      if (it.qty <= 0) items = items.filter((i) => keyOf(i.id, i.size, i.colour) !== k);
      else it.qty = Math.min(10, it.qty);
      save(); render();
    },
    remove(k) {
      items = items.filter((i) => keyOf(i.id, i.size, i.colour) !== k);
      save(); render();
      SMS.toast("Item removed from bag");
    },
    items: () => items.slice(),
    totals,
    render
  };
  SMS.cart = api;
})();
