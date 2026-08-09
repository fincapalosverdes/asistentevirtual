# Finca Palos Verdes · Gerente de Finca (v2)

Panel privado de gestión de Finca Palos Verdes — réplica reconstruida a partir del sitio
anterior (palosverdes-assist.vercel.app), con datos actualizados a agosto de 2026.

Sitio 100% estático (HTML + CSS + JS, sin backend ni build step) — se despliega directo en
Vercel sin configuración.

## Qué incluye

- Login simple (usuario/contraseña, verificado en el navegador)
- Resumen de la finca (KPIs + alertas del gerente)
- Brief de inversión (4 Retornos, modelo financiero, P&L)
- Finanzas (ventas, precios, nómina, costos, capex)
- Hato y desempeño (inventario, indicadores, sanidad)
- Diagnóstico de la finca
- Certificaciones y estado
- Documentos por solicitar
- Descarga de PDF (imprime la sección actual) y Excel (exporta las tablas de datos)

## Cómo publicar esto en un GitHub nuevo

1. Crea un repositorio nuevo y vacío en tu cuenta de GitHub (sin README, sin .gitignore) —
   por ejemplo `finca-palos-verdes-panel`.
2. En tu computador, abre una terminal en esta carpeta (`site/`) y ejecuta:

   ```bash
   git init
   git add .
   git commit -m "Panel Finca Palos Verdes v2"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/finca-palos-verdes-panel.git
   git push -u origin main
   ```

3. Entra a vercel.com → **Add New → Project** → importa ese repositorio de GitHub.
   No necesita ninguna configuración especial (Framework Preset: "Other" / static).
   Clic en **Deploy**.
4. Cuando termine, Vercel te da una URL nueva (tipo `finca-palos-verdes-panel.vercel.app`).
   Esa es la que compartes.

## Cambiar el usuario/contraseña

Están en `js/auth.js`, al inicio del archivo, en texto plano:

```js
const CREDENTIALS = {
  email: "elizabethderodado@yahoo.com",
  password: "domitilapv"
};
```

Cámbialos ahí antes de publicar si quieres una clave distinta a la anterior.

**Nota de seguridad:** este login es una verificación simple en el navegador — no es un
sistema de autenticación real (no hay servidor ni base de datos). Cualquiera que sepa ver
el código fuente del sitio puede ver la contraseña. Es exactamente el mismo nivel de
protección que "una puerta con clave visible si alguien mira" — suficiente para que no
entre cualquiera por accidente, pero no para proteger información realmente confidencial.
Si más adelante quieres autenticación real, se puede agregar (Vercel + un proveedor como
Clerk o Supabase Auth), pero requiere backend.

## Actualizar los datos

Todos los datos de las secciones están en `js/data.js`, organizados por sección. Editar ese
archivo actualiza el sitio — no hay que tocar el HTML.
