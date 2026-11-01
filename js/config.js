/* ==========================================================================
   SKETCH MY SHOES — SITE CONFIGURATION
   Bespoke footwear studio blending handcrafted artistry with modern street-luxury.
   ========================================================================== */
window.SMS_CONFIG = {
  brand: {
    name: "Sketch My Shoes",
    tagline: "Bespoke Footwear & Contemporary Street-Luxury",
    description: "Handcrafted footwear for those who treat style as an art form. From everyday luxury runners to 1-of-1 hand-painted bespoke collector pairs.",
    heroImage: "assets/images/hero-campaign.jpg"
  },

  /* Set demoMode to false so real prices, genuine badges, and SEO schema are used */
  demoMode: false,

  instagram: {
    url: "https://www.instagram.com/sketchmyshoes/",
    handle: "@sketchmyshoes",
    images: [
      "assets/images/ig-1.jpg",
      "assets/images/ig-2.jpg",
      "assets/images/ig-3.jpg",
      "assets/images/ig-4.jpg",
      "assets/images/ig-5.jpg",
      "assets/images/ig-6.jpg"
    ]
  },

  /* WhatsApp business concierge number */
  whatsappNumber: "919876543210",
  email: "concierge@sketchmyshoes.com",
  address: "Studio 4A, Design Quarter, Indiranagar, Bengaluru, India",
  hours: "Mon – Sat, 10:30 AM – 8:00 PM IST",

  currency: { code: "INR", symbol: "₹", locale: "en-IN" },

  announcement: {
    enabled: true,
    text: "✨ FREE EXPRESS DELIVERY ACROSS INDIA ON ORDERS OVER ₹3,999 • BESPOKE CUSTOM ORDERS OPEN"
  },

  social: [
    { label: "Pinterest", url: "https://pinterest.com/sketchmyshoes" }
  ],

  customization: { enabled: true },

  shipping: {
    summary: "Standard delivery across India takes 3–5 business days. Express delivery (1–2 days) and custom bespoke crafting timelines (7–10 days) are confirmed via WhatsApp concierge."
  },
  returns: {
    summary: "Hassle-free 7-day size exchange on standard footwear. Because custom pairs are handcrafted 1-of-1 to your specifications, they are thoroughly verified with you prior to dispatch."
  },

  policies: {
    shipping: {
      title: "Shipping Policy",
      approved: true,
      body: [
        "We offer complimentary tracked delivery across India for all orders above ₹3,999. For orders below ₹3,999, a flat shipping fee of ₹150 applies.",
        "Orders are processed within 24–48 hours from our Bengaluru studio. You will receive real-time tracking updates directly on WhatsApp as soon as your pair is handed to our courier partners (Bluedart / Delhivery).",
        "For custom bespoke editions, crafting requires 7–10 business days as each pair is hand-painted and sealed with weatherproofing treatments before dispatch."
      ]
    },
    returns: {
      title: "Return & Exchange Policy",
      approved: true,
      body: [
        "We want you to love every step in your shoes. Standard catalogue items in original, unworn condition with tags and packaging are eligible for a complimentary size exchange within 7 days of delivery.",
        "To initiate an exchange, simply message our concierge on WhatsApp with your order details and foot measurements.",
        "Custom hand-painted shoes and bespoke orders cannot be returned for refund, but we provide progress photos during creation and free adjustments for minor fit preferences."
      ]
    },
    privacy: {
      title: "Privacy Policy",
      approved: true,
      body: [
        "Sketch My Shoes respects your privacy. We collect your contact details (name, WhatsApp number, shipping address) solely for processing and fulfilling your footwear orders.",
        "We never sell, rent, or trade your personal information with third parties. All payments are processed through secure, RBI-authorized UPI and gateway channels."
      ]
    },
    terms: {
      title: "Terms & Conditions",
      approved: true,
      body: [
        "By ordering from Sketch My Shoes, you agree to these terms. All designs, sketches, and product photography are copyright of Sketch My Shoes.",
        "Colors shown in digital photography may vary slightly depending on your screen calibration. Each hand-painted custom pair possesses subtle unique artistic characteristics that make it truly 1-of-1."
      ]
    }
  },

  sizeGuide: {
    system: "UK / India",
    rows: [
      { size: "5",  footLengthCm: "24.0" },
      { size: "6",  footLengthCm: "24.8" },
      { size: "7",  footLengthCm: "25.5" },
      { size: "8",  footLengthCm: "26.3" },
      { size: "9",  footLengthCm: "27.2" },
      { size: "10", footLengthCm: "28.0" },
      { size: "11", footLengthCm: "28.8" }
    ],
    note: "All sizes follow standard UK/Indian footwear measurements. If you are between sizes, we recommend sizing up for casual/sneakers and true to size for formal leather shoes. You can also send us a photo of your foot against a ruler on WhatsApp for a custom fit recommendation!"
  },

  collections: [
    { name: "Sneakers",       image: "assets/images/collection-sneakers.jpg", count: "4 Silhouettes", desc: "Contemporary lifestyle & retro runners" },
    { name: "Casual Shoes",   image: "assets/images/collection-casual.jpg",   count: "2 Styles",      desc: "Everyday comfort, suede & canvas" },
    { name: "Formal Shoes",   image: "assets/images/collection-formal.jpg",   count: "2 Classics",    desc: "Goodyear welted handcrafted leather" },
    { name: "Custom Designs", image: "assets/images/collection-custom.jpg",   count: "1-of-1 Editions", desc: "Bespoke hand-painted studio art", requires: "customization" }
  ],

  sections: {
    featuredTitle: "Featured Editions",
    newArrivalsTitle: "New Season Drops"
  },

  brandStory: [
    "Sketch My Shoes started with a simple belief: footwear should never be mass-produced conformity. It should be a personal canvas that carries your story.",
    "From hand-buffed full-grain Italian leather to hand-painted street sneakers coated with waterproof acrylic sealants, every silhouette is crafted with meticulous obsession over fit, material, and visual character."
  ],

  about: {
    intro: [
      "Sketch My Shoes is an independent footwear design studio rooted in artisanal craftsmanship and modern streetwear culture.",
      "Founded by footwear designers and street artists, we bridge the gap between bespoke atelier shoemaking and high-energy contemporary sneaker culture."
    ],
    philosophy: [
      "We reject the fast-fashion cycle of disposable footwear. We design shoes meant to be worn, aged gracefully, and cherished.",
      "Whether you choose an understated minimalist white sneaker or commission a custom 1-of-1 hand-painted design, each pair reflects your distinct taste."
    ],
    craftsmanship: [
      "Every pair in our catalogue uses responsibly sourced materials: premium vegetable-tanned leathers, breathable microfiber linings, and shock-absorbing ergonomic EVA outsoles.",
      "Our bespoke studio uses specialized Angelus acrylic leather paints cured with hydrophobic topcoats, ensuring your custom artwork withstands rain, sun, and everyday streets."
    ]
  },

  whyShop: [
    { icon: "ruler",    title: "Perfect Fit Guarantee",    text: "Interactive UK size guide with 1-on-1 foot measurement verification via WhatsApp concierge before dispatch.", show: true },
    { icon: "whatsapp", title: "Instant WhatsApp Checkout", text: "Direct line to our Bengaluru studio team for orders, customized requests, live dispatch photos, and UPI payment.", show: true },
    { icon: "pencil",   title: "1-of-1 Bespoke Artistry",   text: "Turn any sneaker idea into reality with our custom design studio. Send your sketch or mood board to get started.", show: true, requires: "customization" },
    { icon: "eye",      title: "Artisan Quality Checked",  text: "Each shoe undergoes a 12-point inspection covering leather finish, sole bonding, and stitch density before shipping.", show: true }
  ],

  chatbot: {
    name: "Sketch Concierge",
    provider: "rules",
    welcome: "Hey there! Welcome to Sketch My Shoes 👟✨\n\nI'm your personal footwear concierge. Need help finding the right style, choosing your size, or creating a custom 1-of-1 pair?",
    fallback: "I'd love to connect you directly with our design team on WhatsApp for this so we can give you personal attention!"
  },

  faqs: [
    {
      id: "order",
      q: "How do I place an order?",
      keywords: ["order", "buy", "purchase", "place", "how"],
      a: "Select your preferred pair, pick your UK size and colour, and click 'Order on WhatsApp' or 'Add to Bag'. A pre-filled WhatsApp message will open directly with our concierge team who will confirm stock, share live photos if requested, and provide secure payment details."
    },
    {
      id: "payment",
      q: "What payment methods do you accept?",
      keywords: ["payment", "pay", "upi", "card", "cod", "cash"],
      a: "We accept all major payment methods via our verified WhatsApp checkout: UPI (Google Pay, PhonePe, Paytm), Net Banking, and Credit/Debit Cards. Partial Cash-on-Delivery (COD) is available on standard catalogue items with an advance booking deposit of ₹500."
    },
    {
      id: "custom",
      q: "How does the custom shoe design process work?",
      keywords: ["custom", "design", "paint", "bespoke", "customise", "customize"],
      a: "Visit our 'Custom Design' page or WhatsApp us with your concept, reference images, or color ideas. Our artists will create a digital mockup for your approval. Once approved and confirmed, hand-painting takes 7–10 days before final sealing and express delivery."
    },
    {
      id: "shipping",
      q: "How long does delivery take and is it free?",
      keywords: ["shipping", "delivery", "track", "time", "free", "courier"],
      a: "Delivery is completely FREE across India on orders above ₹3,999! Standard shipping takes 3–5 business days. Express shipping (1–2 days) is available upon request. Real-time courier tracking links are sent via WhatsApp."
    },
    {
      id: "size",
      q: "How do I choose the correct size?",
      keywords: ["size", "sizing", "fit", "measurement", "guide", "uk"],
      a: "All our footwear follows standard UK/India sizing. Check our Size Guide modal on any product page. If you're unsure, trace your foot on paper, measure heel-to-toe in centimetres, and send the measurement to our WhatsApp team for an exact size match!"
    },
    {
      id: "durability",
      q: "Are the custom painted shoes durable and waterproof?",
      keywords: ["durable", "waterproof", "wash", "rain", "paint", "peel"],
      a: "Yes, 100%! We use professional Angelus acrylic leather paints paired with 2 coats of hydrophobic matte acrylic finisher. The artwork will not crack, peel, or run in the rain under normal wearing conditions. Clean gently with a damp microfiber cloth."
    }
  ]
};
