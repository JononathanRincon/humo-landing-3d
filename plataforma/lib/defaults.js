// Valores iniciales de cada copia. Todo se edita luego desde el panel (Ajustes).
export const DEFAULT_SETTINGS = {
  name: "HUMO",
  tagline: "Hamburguesas a la brasa",
  city: "Bogotá",
  address: "Calle 85 #13-09, Bogotá",
  whatsapp: "+57 300 123 4567",
  instagram: "",
  accent: "#d4a356",
  currency: { locale: "es-CO", code: "COP" },
  timezone: "America/Bogota",
  hours: [
    { day: 1, label: "Lunes", open: "12:00", close: "22:00", closed: false },
    { day: 2, label: "Martes", open: "12:00", close: "22:00", closed: false },
    { day: 3, label: "Miércoles", open: "12:00", close: "22:00", closed: false },
    { day: 4, label: "Jueves", open: "12:00", close: "22:00", closed: false },
    { day: 5, label: "Viernes", open: "12:00", close: "00:00", closed: false },
    { day: 6, label: "Sábado", open: "12:00", close: "00:00", closed: false },
    { day: 0, label: "Domingo", open: "12:00", close: "21:00", closed: false }
  ],
  orders: { enabled: true, pickup: true, delivery: true, deliveryFee: 5000, minOrder: 25000, deliveryNote: "Cobertura de 4 km. Tiempo promedio 35 min." },
  tables: 12,
  media: {
    hero: "/media/hero.webp",
    despiece: "/media/despiece.webp",
    v1: "/media/videos/v1-brasa.mp4",
    v2: "/media/videos/v2-armado.mp4",
    v3: "/media/videos/v3-despiece.mp4",
    v4: "/media/videos/v4-giro.mp4",
    p1: "/media/escenas/poster-v1-brasa.webp",
    p2: "/media/escenas/poster-v2-armado.webp",
    p3: "/media/escenas/poster-v3-despiece.webp",
    p4: "/media/escenas/poster-v4-giro.webp"
  },
  copy: {
    heroTitle: "Nace en la brasa.",
    heroText: "Carne madurada, pan horneado cada mañana y fuego de leña de verdad.",
    scene2: "Cada capa cae en su lugar, siempre en el mismo orden.",
    scene3: "Lo que lleva, gramo a gramo.",
    scene4: "Lista para ti."
  }
};
