// Valores iniciales de cada copia. Todo se edita luego desde el panel (Ajustes).
export const DEFAULT_SETTINGS = {
  name: "HUMO",
  tagline: "Hamburguesas a la brasa",
  city: "Bogotá",
  address: "Calle 85 #13-09, Bogotá",
  whatsapp: "+57 300 123 4567",
  instagram: "",
  accent: "#f2a03d",
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
    v1: "", v2: "", v3: "", v4: ""
  },
  copy: {
    heroTitle: "Nace en la brasa.",
    heroText: "Carne madurada, pan horneado cada mañana y fuego de leña de verdad.",
    scene2: "Cada capa cae en su lugar, siempre en el mismo orden.",
    scene3: "Lo que lleva, gramo a gramo.",
    scene4: "Lista para ti."
  }
};
