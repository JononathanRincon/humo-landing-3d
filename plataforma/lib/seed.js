// Carta de ejemplo para la primera vez que se abre la plataforma.
export const SEED_CATEGORIES = ["Hamburguesas", "Para acompañar", "Bebidas"];

const extrasBurger = [
  { name: "Tocineta extra", price: 4000 },
  { name: "Queso cheddar extra", price: 3500 },
  { name: "Carne extra 180 g", price: 9000 },
  { name: "Huevo", price: 2500 }
];

export const SEED_PRODUCTS = [
  { category: "Hamburguesas", name: "La Brasa", price: 38000, featured: true, image: "/media/hero.webp",
    description: "Nuestra firma: carne madurada a la leña, cheddar fundido y tocineta ahumada en casa.",
    extras: extrasBurger,
    layers: [
      { name: "Pan brioche con ajonjolí", grams: 55 }, { name: "Pepinillos", grams: 15 },
      { name: "Cebolla morada", grams: 15 }, { name: "Tocineta ahumada", grams: 30 },
      { name: "Cheddar madurado", grams: 40 }, { name: "Carne madurada 21 días", grams: 180 },
      { name: "Tomate", grams: 30 }, { name: "Lechuga crespa", grams: 15 },
      { name: "Salsa ahumada", grams: 20 }, { name: "Pan brioche", grams: 45 }
    ] },
  { category: "Hamburguesas", name: "Doble Smash", price: 34000, featured: true,
    description: "Dos carnes aplastadas en la plancha hasta formar costra, doble cheddar y salsa de la casa.", extras: extrasBurger },
  { category: "Hamburguesas", name: "Carbón", price: 42000, featured: true,
    description: "Pan de carbón activado, provolone, cebolla caramelizada y alioli de ajo negro.", extras: extrasBurger },
  { category: "Hamburguesas", name: "La Tropical", price: 40000,
    description: "Piña asada a la brasa, queso blanco, tocineta y huevo de yema blanda.", extras: extrasBurger },
  { category: "Hamburguesas", name: "Pollo Crunch", price: 32000,
    description: "Muslo de pollo marinado en suero, apanado dos veces, con mayo picante y jalapeños.",
    extras: [{ name: "Jalapeños extra", price: 2000 }, { name: "Queso cheddar", price: 3500 }] },
  { category: "Hamburguesas", name: "Huerta", price: 30000,
    description: "Medallón de garbanzo y champiñón, queso blanco, tomate y hummus de la casa.",
    extras: [{ name: "Aguacate", price: 3000 }] },
  { category: "Para acompañar", name: "Papas rústicas", price: 12000, description: "Con romero y sal de mar.",
    extras: [{ name: "Queso fundido", price: 4000 }, { name: "Tocineta picada", price: 4000 }] },
  { category: "Para acompañar", name: "Aros de cebolla", price: 13000, description: "Apanados en cerveza." },
  { category: "Para acompañar", name: "Yuca frita", price: 11000, description: "Con suero costeño." },
  { category: "Bebidas", name: "Malteada de arequipe", price: 15000, description: "400 ml." },
  { category: "Bebidas", name: "Limonada de coco", price: 10000, description: "500 ml." },
  { category: "Bebidas", name: "Cerveza artesanal", price: 14000, description: "Rubia o roja, 330 ml." }
];
