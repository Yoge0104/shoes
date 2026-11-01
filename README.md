# Sketch My Shoes — website

A static e-commerce site (HTML, CSS, vanilla JS). No build step, no framework, no backend.

## Run locally
```bash
cd sketch-my-shoes
python3 -m http.server 8000     # then open http://localhost:8000
```
Use a local server rather than double-clicking the files: browsers block localStorage (cart, wishlist) on `file://` pages.

## Go live: checklist
All business details live in `js/config.js`; the catalogue lives in `js/products.js`.

1. **WhatsApp number** — set `whatsappNumber` (digits with country code, e.g. `"919876543210"`). Until then, WhatsApp buttons open WhatsApp without a recipient and show a warning.
2. **Products** — replace the 4 placeholder products in `products.js` with real ones: name, slug, category, real `price`, photos in `assets/images/`, sizes, colours, `stock` (or `null`). Placeholders have `price: null`, so the site shows "Price on WhatsApp" rather than inventing prices.
3. **Photos** — set `brand.heroImage` and add real photo paths to `instagram.images` (they power the home gallery and the About gallery).
4. **Turn off demo mode** — set `demoMode: false` once real products are in (removes the demo banner and enables product structured data).
5. **Brand text** — fill `brandStory` and `about` with verified wording only.
6. **Policies** — write shipping, returns, privacy and terms text in `policies`, then set `approved: true` on each. Unapproved policies show "not published yet". Update `shipping.summary`, `returns.summary` and the FAQ answers to match the business's real rules (delivery charges, COD, returns).
7. **Custom designs** — set `customization.enabled` to `false` if the brand doesn't offer it; the nav link, collection tile, chatbot flow and page switch off.
8. **Size guide** — add real `footLengthCm` values per size (currently blank).
9. **Contact** — fill `email`, `address`, `hours` (hidden while empty).
10. **SEO** — replace `YOUR-DOMAIN.example` in `robots.txt` and `sitemap.xml`; add a real social-share image for the Open Graph tags.

## What is and isn't real
- Orders and custom enquiries are **not saved anywhere**. They are only sent when the customer sends the pre-filled message in WhatsApp.
- No payments are taken. Payment is arranged by the team on WhatsApp.
- The newsletter form is a demo and stores nothing. Connect a service before relying on it.
- The chatbot is rule-based (config FAQs + the catalogue). No AI is connected. To add one later, set `SMS.chatbot.aiProvider = async (text, history) => reply` (call your own server; never put API keys in the browser).
- A reference image uploaded on the custom form can't be attached to a wa.me link; customers are told to send it in the chat.

## Deploy
Any static host works. Upload the folder contents as-is.
- **Netlify / Cloudflare Pages / Vercel**: drag the folder in (or connect a repo), no build command, publish directory `.`.
- **GitHub Pages**: push to a repo, Settings → Pages → deploy from branch root.
- **Shared hosting**: upload via FTP to `public_html`.
Serve over HTTPS.

## Structure
```
index.html shop.html product.html about.html contact.html faq.html custom-design.html
css/style.css css/responsive.css
js/config.js products.js app.js cart.js checkout.js chatbot.js product.js custom-design.js
assets/images assets/icons
```
