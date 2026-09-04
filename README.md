# Autoescola Manel — exclusiu per a Ares "Suricata" 🦡

App de pràctica del teòric de cotxe: 10 examens de 30 preguntes (no saps si has
aprovat fins que no l'acabes) + repàs automàtic de les preguntes fallades.
El progrés es desa en una base de dades, així que es manté encara que tanquis
el navegador o hi entris des d'un altre dispositiu.

## Què hi ha aquí

- `pages/index.js` — tota la interfície (menú, examen, resultat)
- `lib/questions.js` — el banc de 129 preguntes i la lògica per generar els examens
- `lib/db.js` + `pages/api/state.js` — desar/carregar el progrés a Postgres
- `styles/globals.css` — el disseny

No fa falta que toquis res d'això per publicar-ho — només has de seguir els
passos de sota. Són tot clics, cap línia de codi.

## Publicar-ho (uns 10 minuts, gratuït)

### 1. Puja aquest codi a GitHub

Si no tens compte, crea'n un a [github.com](https://github.com) (gratuït).

- A GitHub, clica **New repository** → posa-li un nom, per exemple
  `autoescola-manel` → **Create repository**.
- A la pàgina del repositori buit, clica **uploading an existing file** i
  arrossega-hi TOTS els fitxers i carpetes d'aquest projecte (mantenint
  l'estructura de carpetes `lib/`, `pages/`, `pages/api/`, `styles/`).
  - Alternativa amb terminal, si en tens:
    ```
    cd autoescola-manel-app
    git init
    git add .
    git commit -m "Autoescola Manel"
    git branch -M main
    git remote add origin https://github.com/EL_TEU_USUARI/autoescola-manel.git
    git push -u origin main
    ```

### 2. Importa el repositori a Vercel

- Crea un compte a [vercel.com](https://vercel.com) — pots fer-ho directament
  amb el teu compte de GitHub ("Continue with GitHub"), és el més ràpid.
- Al tauler de Vercel, clica **Add New → Project**.
- Tria el repositori `autoescola-manel` que acabes de pujar → **Import**.
- Vercel detecta automàticament que és un projecte Next.js. No cal canviar
  cap configuració → clica **Deploy**.
- Al cap d'un minut tindràs una URL del tipus
  `https://autoescola-manel-xxxx.vercel.app` — encara no funcionarà del tot
  perquè falta la base de dades (pas següent).

### 3. Afegeix la base de dades (Postgres, gratuït)

- Dins del projecte a Vercel, ves a la pestanya **Storage**.
- Clica **Create Database** → tria **Postgres** (és Neon per sota, el pla
  gratuït és de sobres per a aquesta app) → **Continue** → **Connect**.
- Vercel connecta automàticament la base de dades al projecte i afegeix la
  variable d'entorn `POSTGRES_URL` per tu — no has d'escriure res.
- Torna a la pestanya **Deployments** i fes **Redeploy** del darrer desplegament
  (perquè agafi la nova variable d'entorn).

### 4. Ja està

Obre la URL que et dona Vercel — aquesta és l'app definitiva de l'Ares. La pots
posar com a icona a la pantalla d'inici del mòbil (des del navegador: "Afegir
a la pantalla d'inici") perquè s'obri com si fos una app.

Cada vegada que pugis un canvi a GitHub (per exemple si m'demanes que ampliï
el banc de preguntes), Vercel torna a desplegar automàticament — no cal
repetir els passos 2-3.

## Notes

- L'app és d'una sola usuària (l'Ares); no hi ha pantalla de login, el
  progrés es guarda directament amb el seu compte de base de dades.
- Les preguntes són d'elaboració pròpia seguint l'estil i la normativa
  general de trànsit (RGC/DGT), no el banc oficial de la DGT.
- Si vols provar-ho en local abans de pujar-ho: `npm install` i després
  `npm run dev` (necessitaràs un fitxer `.env.local` amb `POSTGRES_URL`,
  vegeu `.env.example`).
