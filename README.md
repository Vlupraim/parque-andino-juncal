# Parque Andino Juncal · Maqueta del rediseño

Maqueta del nuevo sitio de [parqueandinojuncal.cl](https://parqueandinojuncal.cl): hero con diapositivas, barra de vidrio anclada, logo con pájaro animado cuadro a cuadro, reservador con total en vivo y bloques de contenido.

## Páginas

- `index.html`: portada (hero, reserva, tarifas, reglas, noticias, apoyo y contacto).
- Páginas interiores con el contenido real del sitio original: `el-parque`, `conservacion`, `visita`, `actividades` (y 6 más en `actividades/`), `noticias` (y 5 más en `noticias/`), `apoya`, `preguntas-frecuentes` y `terminos`.
- `concepto-logo.html`: explicación del logo y la animación del pájaro, para el cliente.
- `guardaparque.html`: herramienta del guardaparque (se instala en el teléfono y funciona sin internet). Escanea el QR del ticket, verifica su firma, revisa fecha, cancelaciones y entradas repetidas, y registra ingresos y cobros. PIN de la maqueta: 1911.

### Tickets firmados

El QR del ticket lleva los datos de la reserva firmados con ECDSA P-256 (`assets/boleto.js`), y el guardaparque los verifica con la clave pública, sin conexión. En la maqueta la firma se hace en el navegador con `assets/boleto-firma-demo.js`: **en producción esa clave privada vive solo en el servidor** y ese archivo se elimina. Las cancelaciones se descargan desde `assets/cancelaciones.json` (en producción, desde el servidor).

Las páginas interiores, y el header y el pie que comparten con la portada, se generan con:

```bash
node _tools/construir.mjs
```

El contenido se edita en `_tools/construir.mjs`; después se vuelve a ejecutar. Entre páginas hay una transición con el logo, y cada página se precarga al acercar el mouse a su enlace (`assets/site.js`).

## Ver en local

```bash
npm start
```

Abre http://localhost:4300. No tiene dependencias: `server.mjs` usa solo Node.

## Publicación

- **GitHub Pages:** cada push a `main` publica el sitio (`.github/workflows/pages.yml`).
- **Railway:** nuevo proyecto desde este repositorio. Detecta Node y ejecuta `npm start`; el servidor usa la variable `PORT` que entrega Railway. Luego, en *Settings → Networking*, genera un dominio público.

## Logo

- `assets/logo-juncal-negro.svg` y `assets/logo-juncal-blanco.svg`: logo completo en vectores.
- `assets/logo-juncal-data.js`: texto del logo y los 8 fotogramas del pájaro, generados por `_tools/hacer-logo.cjs` a partir de `referencias/fotogramas-gemini.jpg`.

Para regenerarlo:

```bash
npm i --no-save potrace@2.1.8 opentype.js@1.3.4
node _tools/hacer-logo.cjs
```

Tipografías: EB Garamond y Montserrat (licencia SIL OFL), en `_tools/fonts`.

## Pendiente

Las fotos son las del sitio actual, enlazadas desde parqueandinojuncal.cl. Los cupos del calendario de reserva son de ejemplo y el pago todavía no está conectado.

`privacidad.html` es un borrador alineado con la Ley 21.719: falta completar el RUT, el domicilio y los plazos de conservación, y que lo revise un abogado antes de publicarlo.
