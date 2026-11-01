/* ==========================================================================
   checkout.js — builds WhatsApp order messages. No payment is taken here and
   no order is stored: the message is simply handed to WhatsApp.
   ========================================================================== */
(function () {
  "use strict";
  const SMS = (window.SMS = window.SMS || {});

  function lineFor(item, p, index) {
    const unit = SMS.hasPrice(p) ? SMS.money(p.price) : "Price to be confirmed";
    const parts = [];
    parts.push((index != null ? "Item " + (index + 1) + "\n" : "") + "Product: " + p.name);
    if (item.size) parts.push("Size: " + item.size);
    if (item.colour) parts.push("Colour: " + item.colour);
    parts.push("Quantity: " + item.qty);
    parts.push("Price: " + unit);
    return parts.join("\n");
  }

  /* items: [{ id, size, colour, qty }] */
  function buildOrderMessage(items) {
    const lines = items
      .map((it, i) => { const p = SMS.getProduct(it.id); return p ? lineFor(it, p, items.length > 1 ? i : null) : null; })
      .filter(Boolean);
    let msg = "Hello " + SMS.config.brand.name + "!\n\nI would like to place an order.\n\n" + lines.join("\n\n");
    const priced = items.every((it) => { const p = SMS.getProduct(it.id); return p && SMS.hasPrice(p); });
    if (items.length > 1 && priced) {
      const total = items.reduce((s, it) => s + SMS.getProduct(it.id).price * it.qty, 0);
      msg += "\n\nTotal: " + SMS.money(total);
    }
    msg += "\n\nPlease confirm availability, delivery charges and payment details.";
    return msg;
  }

  SMS.checkout = {
    buildOrderMessage,
    send(items) {
      if (!items.length) { SMS.toast("Your bag is empty.", "warn"); return; }
      SMS.openWhatsApp(buildOrderMessage(items));
    }
  };
})();
