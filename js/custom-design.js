/* ==========================================================================
   custom-design.js — custom shoe enquiry. Validates, shows a summary and
   hands the enquiry to WhatsApp. Nothing is stored. A reference image cannot
   be attached through a wa.me link, so the customer is told to share it in the
   chat after WhatsApp opens.
   ========================================================================== */
(function () {
  "use strict";
  const SMS = (window.SMS = window.SMS || {});
  SMS.pageInit = SMS.pageInit || {};

  SMS.pageInit.custom = function () {
    const { $, esc } = SMS;
    const form = $("#custom-form"), out = $("#enquiry-summary");
    if (!SMS.customOn()) {
      $("#custom-wrap").innerHTML = `<div class="empty"><h1>Custom design is not available right now</h1><p>Browse the collection instead.</p><a class="btn btn--dark" href="shop.html">Shop</a></div>`;
      return;
    }
    const MAX_FILE = 5 * 1024 * 1024;
    const rules = {
      name: (v) => v.trim().length >= 2 || "Please enter your full name.",
      phone: (v) => /^\+?[\d\s-]{8,15}$/.test(v.trim()) || "Enter a valid WhatsApp number (8–15 digits).",
      email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email or leave it empty.",
      shoeType: (v) => !!v.trim() || "Please enter the shoe type.",
      size: (v) => !!v.trim() || "Please enter your shoe size.",
      design: (v) => v.trim().length >= 5 || "Please describe the design you want (at least 5 characters).",
      ownership: (v) => !!v || "Please choose one."
    };
    const field = (n) => form.elements[n];
    function validate() {
      let ok = true, first = null;
      Object.keys(rules).forEach((n) => {
        const el = field(n);
        const v = el.type === "radio" || el.length ? (form.querySelector(`[name="${n}"]:checked`) || {}).value || "" : el.value;
        const r = rules[n](v);
        const msg = form.querySelector(`[data-err="${n}"]`);
        if (r !== true) { ok = false; msg.textContent = r; msg.hidden = false; if (!first) first = el.length ? el[0] : el; }
        else { msg.hidden = true; }
      });
      const f = field("image").files[0];
      const fe = form.querySelector('[data-err="image"]');
      if (f && (!/^image\//.test(f.type) || f.size > MAX_FILE)) { ok = false; fe.textContent = "Please choose an image under 5 MB."; fe.hidden = false; if (!first) first = field("image"); }
      else fe.hidden = true;
      if (first) first.focus();
      return ok;
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      const g = (n) => (form.querySelector(`[name="${n}"]:checked`) || field(n) || {}).value || "";
      const d = {
        "Name": g("name"), "WhatsApp number": g("phone"), "Email": g("email") || "-", "Shoe type": g("shoeType"),
        "Shoe size": g("size"), "Design": g("design"), "Colours": g("colour") || "-", "Budget": g("budget") || "not specified",
        "Own shoes or new pair": g("ownership"), "Extra requirements": g("notes") || "-"
      };
      const hasImg = field("image").files.length > 0;
      const msg = "Hello " + SMS.config.brand.name + "!\n\nI'd like to enquire about a custom design.\n\n" +
        Object.entries(d).map(([k, v]) => k + ": " + v).join("\n") +
        (hasImg ? "\n\nI have a reference image and will send it in this chat." : "");
      out.hidden = false;
      out.innerHTML = `<h2>Review your enquiry</h2>
        <dl class="summary">${Object.entries(d).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
        ${hasImg ? "<p class='muted small'>Your reference image can't be attached automatically. Please send it in the WhatsApp chat once it opens.</p>" : ""}
        <button class="btn btn--wa" id="send-custom">${SMS.icons.whatsapp} Send enquiry on WhatsApp</button>
        <p class="muted small">This website doesn't store enquiries. It's only sent when you send the message in WhatsApp.</p>`;
      $("#send-custom").addEventListener("click", () => SMS.openWhatsApp(msg));
      out.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    form.addEventListener("reset", () => { out.hidden = true; $$errors(); });
    function $$errors() { form.querySelectorAll("[data-err]").forEach((x) => (x.hidden = true)); }
  };
})();
