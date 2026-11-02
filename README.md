# Parque Andino Juncal · Maqueta del rediseño

Maqueta del nuevo sitio de [parqueandinojuncal.cl](https://parqueandinojuncal.cl): hero con diapositivas, barra de vidrio anclada, logo con pájaro animado cuadro a cuadro, reservador con total en vivo y bloques de contenido.

## Páginas

- `index.html`: la maqueta del sitio.
- `concepto-logo.html`: explicación del logo y la animación del pájaro, para el cliente.

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

Las fotos son las del sitio actual, enlazadas desde parqueandinojuncal.cl. Las noticias, los cupos del calendario y los datos de la franja de estado son de ejemplo.
