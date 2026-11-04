# HUMO · Landing 3D para hamburguesería

Demo de portafolio: una landing de gama alta con estilo cortometraje para un negocio de hamburguesas. La hamburguesa es un modelo 3D construido en código (three.js), sin videos ni modelos pesados, así que carga rápido.

**Demo en vivo:** https://jononathanrincon.github.io/humo-landing-3d/

## Qué hace

Al hacer scroll se reproduce un cortometraje en 4 escenas:

1. **La brasa** – la carne sobre la parrilla, con carbones, chispas y humo.
2. **El armado** – la carne salta, la parrilla desaparece y los ingredientes caen en orden; el queso se derrite.
3. **Anatomía** – la hamburguesa se abre en el aire con el nombre y los gramos de cada capa.
4. **Servida** – plano final con precio y pedido por WhatsApp.

Después viene la carta: cada hamburguesa se arma en 3D con sus propios ingredientes, se puede girar arrastrando y ver por dentro.

## Cómo adaptarla a un cliente

Todo sale del bloque `CONFIG` al inicio del `<script>` en `index.html`:

```js
const CONFIG = {
  marca: "HUMO",
  ciudad: "Bogotá",
  whatsapp: "+57 300 123 4567",
  acento: "#f2a03d",
  moneda: { locale: "es-CO", code: "COP" },
  carta: [
    { nombre: "La Brasa", precio: 38000, capas: [
      { tipo: "pan_base" }, { tipo: "salsa", variante: "ahumada" },
      { tipo: "carne", gramos: 180 }, { tipo: "queso" }, { tipo: "pan_tapa" }
    ] }
  ]
};
```

Las capas van de abajo hacia arriba y el 3D se construye solo a partir de la lista.

| Tipo | Variantes |
|---|---|
| `pan_base`, `pan_tapa` | `brioche`, `negro` |
| `carne` | `res`, `smash`, `pollo`, `veg` |
| `queso` | `cheddar`, `provolone`, `blanco` |
| `salsa` | `casa`, `ahumada`, `ajonegro`, `rosada`, `picante`, `hummus` |
| `lechuga` | `crespa`, `rugula` |
| `cebolla` | `morada`, `blanca`, `caramelizada` |
| `tomate`, `pepinillos`, `tocineta`, `huevo`, `pina`, `jalapenos` | — |

Cada capa acepta además `nombre` y `gramos` para personalizar las etiquetas.

En la página, el botón **Personalizar demo** cambia nombre, ciudad, WhatsApp, color y hamburguesa protagonista en vivo, y copia la configuración en JSON.

## Correr localmente

Es un solo archivo estático. Ábrelo con cualquier servidor:

```bash
npx serve .
```

## Tecnología

- HTML, CSS y JavaScript sin build
- three.js r128 (CDN) con geometría, texturas y animación procedurales
- Tipografías: Big Shoulders Display, Familjen Grotesk, JetBrains Mono

## Nota

Marca, precios, dirección y teléfono son ficticios.

Diseño y desarrollo: Jonathan Rincón
