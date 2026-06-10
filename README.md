# Retroalimentaciones Musicala

Canal confidencial interno para registrar retroalimentaciones, observaciones y situaciones a tener en cuenta sobre integrantes del equipo Musicala. Construido con Vite + React + Firebase (Auth con Google y Cloud Firestore).

- Los **usuarios autorizados** solo pueden crear registros; nunca ven los registros de otros.
- Los **administradores** (alekcaballeromusic@gmail.com y catalina.medina.leal@gmail.com) ven el dashboard completo, gestionan estados, notas, personas, correos autorizados y configuración.
- Usa el proyecto Firebase existente `reuniones-de-seguimiento-adm` con colecciones **separadas** (`feedbackEntries`, `authorizedFeedbackUsers`, `people`, `feedbackFields`, `feedbackSettings`). **No toca la colección `meetings`** de la app de actas.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Correr localmente

```bash
npm run dev
```

Abre la URL que muestra Vite (normalmente http://localhost:5173).

## 3. Configurar Firebase Auth con Google

1. Entra a la [Consola de Firebase](https://console.firebase.google.com/) → proyecto **reuniones-de-seguimiento-adm**.
2. **Authentication → Sign-in method → Google → Habilitar** (probablemente ya está habilitado por la app de actas).
3. **Authentication → Settings → Authorized domains**: agrega los dominios donde se servirá la app:
   - `localhost` (ya viene por defecto)
   - tu dominio de GitHub Pages (ej. `tuusuario.github.io`) **o** el dominio de Firebase Hosting (`reuniones-de-seguimiento-adm.web.app`).

## 4. Publicar reglas de Firestore

El archivo [firestore.rules](firestore.rules) ya incluye, copiadas tal cual, las reglas existentes de la app de actas (`meetings`, con sus funciones de validación), más las reglas nuevas de retroalimentación en colecciones separadas. Publicarlo no cambia en nada el comportamiento de la app de actas.

Opción A — Consola web:
1. Firestore Database → **Reglas**.
2. Pega el contenido completo de `firestore.rules` y haz clic en **Publicar**.

Opción B — Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # selecciona el proyecto existente, usa firestore.rules
firebase deploy --only firestore:rules
```

### Resumen de seguridad de las reglas

| Colección | Usuario autorizado | Admin |
|---|---|---|
| `feedbackEntries` | solo **crear** (con su propio correo y estado `pendiente`) | leer, actualizar, eliminar |
| `people` | leer | todo |
| `authorizedFeedbackUsers` | leer **solo su propio documento** | todo |
| `feedbackFields` | leer | todo |
| `feedbackSettings` | leer | todo |
| `meetings` | según las reglas existentes de la app de actas | — |
| cualquier otra | bloqueada | bloqueada |

La privacidad **no** depende de ocultar botones: las reglas impiden a nivel de servidor que un usuario no admin lea cualquier retroalimentación.

## 5. Primer uso (datos iniciales)

1. Inicia sesión con un correo admin.
2. Ve a **Configuración → Personas** y agrega al equipo.
3. Ve a **Configuración → Correos autorizados** y agrega los correos que podrán usar el canal.
4. (Opcional) Ajusta tipos, urgencias, áreas y textos en las otras pestañas.

## 6. Desplegar

### Opción A: GitHub Pages

1. Crea un repositorio en GitHub y sube el proyecto:
   ```bash
   git init
   git add .
   git commit -m "Retroalimentaciones Musicala"
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
2. Despliega:
   ```bash
   npm run deploy
   ```
   (usa el paquete `gh-pages`, ya incluido; publica la carpeta `dist` en la rama `gh-pages`).
3. En GitHub: **Settings → Pages → Source: rama `gh-pages`**.
4. Agrega `TU_USUARIO.github.io` a los dominios autorizados de Firebase Auth (paso 3).

### Opción B: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # proyecto existente, carpeta pública: dist, SPA: yes
npm run build
firebase deploy --only hosting
```

La app quedará en `https://reuniones-de-seguimiento-adm.web.app` (ese dominio ya está autorizado en Auth). Si esa URL ya la usa la app de actas, crea un **sitio adicional** de Hosting (Hosting → Add another site) para no pisarla, y despliega con `firebase deploy --only hosting:NOMBRE_DEL_SITIO`.

## Estructura

```
├── firestore.rules
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── firebase.js
    ├── auth.js
    ├── styles.css
    ├── services/firestoreService.js
    ├── utils/csvExport.js
    └── components/
        ├── Login.jsx
        ├── Layout.jsx
        ├── FeedbackForm.jsx
        ├── AdminDashboard.jsx
        ├── FeedbackList.jsx
        ├── FeedbackDetail.jsx
        ├── SettingsPanel.jsx
        ├── PeopleSettings.jsx
        ├── AuthorizedUsersSettings.jsx
        ├── FieldsSettings.jsx
        └── GeneralSettings.jsx
```
