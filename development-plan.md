# Plan de Desarrollo — Frontend Todo App (clon de Trello)

> SPA que consume la API REST del backend `todo-app` (Spring Boot, corriendo en
> `http://localhost:8080`). Tableros kanban con columnas, tareas, subtareas, comentarios,
> roles, invitaciones por correo y actualizaciones en tiempo real vía WebSocket.

Fuente de verdad: este documento. La referencia completa de la API está en el Apéndice A.

---

## 1. Stack

| Capa            | Tecnología                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | React 19 + TypeScript (strict) + Vite                   |
| Estilos         | Tailwind CSS 4 + shadcn/ui + lucide-react               |
| Rutas           | React Router 7                                          |
| Estado servidor | TanStack Query v5 (caché, invalidación, optimistic)     |
| Estado sesión   | Zustand (solo auth/tokens)                              |
| Drag & drop     | dnd-kit (@dnd-kit/core + sortable)                      |
| Tiempo real     | @stomp/stompjs + sockjs-client (STOMP sobre SockJS)     |
| Formularios     | react-hook-form + zod (validaciones espejo del backend) |
| Tests           | Vitest + Testing Library (+ Playwright opcional E2E)    |
| Lint/format     | ESLint (typescript-eslint) + Prettier                   |

## 2. Entorno y puertos (CRÍTICO)

- Dev server en **`http://localhost:3000`**. No cambiar el puerto: el backend OAuth2
  redirige tras el login a `http://localhost:3000/oauth2/callback` y los correos de
  invitación enlazan `http://localhost:3000/invitations/accept|reject`.
- El backend **no tiene CORS configurado** → todo debe pasar por el **dev proxy de Vite**:

```ts
// vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:8080',
    '/oauth2/authorization': 'http://localhost:8080',  // solo el inicio; /oauth2/callback es ruta del SPA
    '/login/oauth2': 'http://localhost:8080',
    '/ws': { target: 'http://localhost:8080', ws: true },
  },
},
define: { global: 'globalThis' } // polyfill requerido por sockjs-client
```

- Todas las llamadas usan rutas relativas (`/api/v1/...`, `/ws`) — mismo origen, cero CORS.
- Variables de entorno: `VITE_API_BASE_URL` (default `''`), documentadas en `.env.example`.
- Requisito previo para desarrollar: backend levantado (`docker compose up -d` +
  `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`).
- Usuario demo del backend (perfil dev): `demo@example.com` / `password123` (tiene
  board colaborativo y personal con datos).

## 3. Integración con la API — lo que HAY que saber

### 3.1 Autenticación (JWT + refresh con rotación)

- Enviar `Authorization: Bearer <accessToken>` en todas las rutas protegidas.
- **Access token 15 min / refresh 7 días, rotación single-use**: cada `POST /auth/refresh`
  revoca el refresh usado y devuelve un par nuevo. Implicaciones:
  - El refresh debe ejecutarse como **singleton** (una sola promesa en vuelo; el resto
    de peticiones 401 esperan esa misma promesa). Si dos refresh corren a la vez, uno
    revoca al otro y el usuario cae de la sesión.
  - Flujo: interceptor → si 401 y hay refresh → encolar petición → refrescar una vez →
    reintentar → si el refresh también falla → logout.
  - El interceptor **no debe intentar refresh** para peticiones a `/api/v1/auth/*` (un
    401 en login/registro = credenciales inválidas, no sesión expirada) ni cuando no
    haya refresh token.
- El **refresh token es opaco** (no es un JWT): no intentar decodificarlo; solo se
  almacena y se envía. El access token sí es JWT y de él se leen `sub`/`email`/`name`.
- **Multi-pestaña**: al ser single-use, dos pestañas restaurando/refrescando a la vez
  pueden revocarse mutuamente. Sincronizar la sesión entre pestañas
  (`BroadcastChannel`/evento `storage`) o documentar la limitación.
- (Opcional) Refresco proactivo: renovar ~1 min antes de `exp(access)` usando
  `expiresIn` (segundos) del `AuthResponse`.
- **No existe endpoint `/me`**: la identidad del usuario se obtiene **decodificando el
  payload del JWT** (claims `sub` = userId, `email`, `name`). Decodificar sin verificar
  (la verificación la hace el backend).
- Almacenamiento: refresh token en `localStorage` (persistencia entre recargas), access
  token en memoria; al arrancar la app, si hay refresh, restaurar sesión con `refresh`.
- **No hay endpoint de logout**: logout = descartar tokens + limpiar caché de TanStack
  Query + redirigir a /login. (No hay revocación de access token; asumir 15 min.)

### 3.2 OAuth2 Google

- Botón "Continuar con Google" → `window.location.href = '/oauth2/authorization/google'`
  (navegación completa, no fetch).
- El backend termina redirigiendo (302) a `/oauth2/callback?accessToken=...&refreshToken=...`.
- Ruta `/oauth2/callback`: capturar ambos query params, guardar sesión, **limpiar la URL**
  (`navigate replace` sin query) y redirigir a la home.

### 3.3 Errores — ProblemDetail (RFC 9457)

Todas las respuestas de error son `application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "Request body validation failed",
  "instance": "/api/v1/boards",
  "errors": { "title": "must not be blank" }
}
```

- Parsear `title`, `detail` y `errors` (mapa campo→mensaje, solo en validación 400).
- Estrategia UI: toasts para errores de negocio (`detail`); mapear `errors{}` a los
  campos de react-hook-form; los 403 siempre se toleran con toast (nunca pantalla rota).
- No hay códigos simbólicos: identificar por `status` + `detail` (catálogo en Apéndice B).

### 3.4 Tiempo real (WebSocket/STOMP)

- Conexión: SockJS en `/ws`; autenticar con **header nativo `Authorization: Bearer ...`
  en el frame CONNECT** (no como query param).
- Suscripción: **solo** `/topic/boards/{boardId}` está permitida (el backend autoriza
  membresía; cualquier otro destino corta la conexión).
- Formato del evento (`RealtimeEvent`):

```json
{
  "type": "TASK_MOVED",
  "boardId": 1,
  "entityType": "TASK",
  "entityId": 55,
  "actorId": 1,
  "payload": { "title": "Ship v1", "fromColumnId": 5, "toColumnId": 6, "position": 0 },
  "occurredAt": "2026-09-27T12:00:00.123Z"
}
```

- `type` coincide con las acciones del log de actividades (Apéndice A §actividades).
- Estrategia: al abrir un tablero → conectar + suscribir; aplicar eventos al caché de
  TanStack Query (update de la query del board). Si `actorId` = mi userId y ya hice
  update optimista, el evento solo confirma.
- Los `payload` son **parciales** (ids y algún campo; p.ej. `TASK_UPDATED` solo trae
  `title`, y `SUBTASK_UPDATED`/`COMMENT_DELETED` ni traen `taskId`): no parchear a
  ciegas. Mapeo: column/task → invalidar la query del board; `SUBTASK_*` → invalidar
  por prefijo `['subtasks']`; `COMMENT_*` → invalidar `['comments']`; `MEMBER_*` /
  `INVITATION_*` → invalidar board + `['invitations']` (campana).
- **Al reconectar el WS (o recibir un evento desconocido) → re-fetch
  `GET /api/v1/boards/{id}`**: el broker es simple/in-memory, no hay garantía de entrega.
- Desconectar al salir del tablero o cerrar sesión.

### 3.5 Permisos por rol (fuente de verdad: el backend)

| Acción                                   | Owner | Admin | Member                    |
| ---------------------------------------- | :---: | :---: | :------------------------ |
| Editar/eliminar tablero, ver actividades |  ✅   |   —   | —                         |
| Invitar, quitar miembros, CRUD columnas  |  ✅   |  ✅   | —                         |
| Crear/eliminar/asignar tareas            |  ✅   |  ✅   | —                         |
| Editar/mover tarea, CRUD subtareas       |  ✅   |  ✅   | solo asignadas a sí mismo |
| Comentar (cualquier tarea)               |  ✅   |  ✅   | ✅                        |
| Eliminar comentario                      |  ✅   |  ✅   | solo propios              |

- El rol propio se obtiene de `GET /api/v1/boards` (cada item trae `role`) o cruzando
  `members[].userId` con mi `sub` del JWT.
- La UI oculta/deshabilita acciones según la matriz, pero **siempre maneja el 403 del
  backend** (toast + refetch) — nunca confiar solo en el cliente.
- Tableros `PERSONAL`: ocultar todo lo de miembros/invitaciones.
- **Gaps conocidos (NO inventar estas features)**: no existe cambio de rol, desasignar
  tarea, editar comentarios, endpoint `/me`, ni logout server-side.

### 3.6 Detalles finos de la API que suelen romper el frontend

- `PATCH /api/v1/tasks/{id}` es **multifunción**: editar (`title`/`description`) y mover
  (`columnId` + `position`) en la misma ruta. Mover dentro de otra board → 400.
- `members[].id` en el board es el **id de membresía** (para eliminar), `userId` es el
  del usuario (para asignar tareas).
- El snapshot `GET /boards/{id}` incluye columnas+tareas+miembros, pero **NO incluye
  subtareas ni comentarios**: el modal de tarea las carga al abrirse
  (`GET .../subtasks`, `GET .../comments`).
- Las `position` se recalculan y clampean server-side; tras una mutación confiable:
  update optimista + invalidate del board.
- 409 `The resource was modified concurrently, please retry` (locking optimista) →
  refetch del tablero + toast.
- Board inexistente o ajeno → **403** (`You are not a member of this board`), no 404.
- Las posiciones en dnd-kit: calcular `position` = índice destino dentro de la columna
  destino (0-based) y enviar solo `{columnId, position}`.
- **Limpiar `description`**: `null` en `PATCH` de board/tarea significa "no cambiar";
  para borrarla hay que enviar `""`.
- Mover una tarea enviando solo `columnId` (sin `position`) la deja **al final** de la
  columna destino (no al principio).
- Todos los `DELETE` responden **204 sin body**: el wrapper no debe intentar parsear JSON.
- Borrar un tablero **no emite evento WS** (no existe `BOARD_DELETED`): otros usuarios
  no se enteran hasta un refetch/navegación.
- `GET /invitations` **no filtra por expiración**: puede devolver PENDING ya vencidas →
  comparar `expiresAt` en la UI (y deshabilitar accept/reject si venció).
- `POST /boards` (201) devuelve `BoardDetail` **sin `role` raíz** (el rol del creador está
  en `members[]`): para refrescar el rol de la home, invalidar `GET /boards`.

## 4. Arquitectura de carpetas

```
src/
├── api/            → cliente HTTP (fetch wrapper + interceptor refresh 401),
│                     tipos de API, un archivo por recurso (auth, boards, columns...)
├── auth/           → store Zustand (tokens, user decodificado), guards de ruta,
│                     hook useAuth, decodeJwt
├── realtime/       → cliente STOMP/SockJS, RealtimeProvider, mapeo evento→acción
├── features/
│   ├── boards/     → lista, crear, detalle, editar, miembros, actividades
│   ├── columns/    → columna kanban + CRUD
│   ├── tasks/      → tarjeta, modal de tarea, DnD, subtareas, comentarios, asignación
│   ├── invitations/→ modal invitar, listas enviadas/recibidas, aceptar/rechazar
│   └── ...
├── components/     → ui/ (shadcn) + componentes compartidos (ErrorState, PageLoader...)
├── lib/            → utils, formatters (fechas), constantes de permisos
├── routes/         → configuración del router + ProtectedRoute
└── App.tsx
```

Convenciones: componentes en PascalCase, hooks `useXxx`, fixtures/tipos por feature,
todo el texto de UI en inglés (la API devuelve mensajes en inglés) o i18n queda fuera
de alcance. TypeScript strict sin `any`.

## 5. Fases de desarrollo (orden obligatorio, cada fase depende de la anterior)

### Fase 0 — Setup

- Vite + React 19 + TS strict, **puerto 3000**, proxy de `/api`, `/oauth2`, `/login/oauth2`,
  `/ws` y polyfill `global` (ver §2).
- Tailwind 4 + shadcn/ui init (estilo Trello-like: fondo neutro, tarjetas blancas).
- ESLint + Prettier + script `typecheck` (`tsc --noEmit`); scripts npm: `dev`, `build`,
  `preview`, `lint`, `typecheck`, `test`.
- Cliente HTTP: fetch wrapper con `baseUrl`, `credentials: 'omit'`, JSON, que **lanza
  `ApiError`** (con `status`, `title`, `detail`, `errors`) parseando ProblemDetail y
  maneja **204 sin body** sin intentar parsear.
- Repo: `git init`, `.gitignore`, GitHub Actions `ci.yaml` (node 22 + `npm ci` + lint +
  typecheck + test), ramas `main`/`develop` desde el inicio, reglas de protección vía
  `gh api` rulesets (push solo por PR, CI obligatorio, sin approvals). El repo remoto
  debe ser **público** (los rulesets requieren visibilidad pública en plan gratuito).
- **Verificar**: `npm run dev` sirve en 3000; `GET /api/v1/boards` sin token devuelve
  401 ProblemDetail parseable desde el navegador (mismo origen).

### Fase 1 — Autenticación

- Store de sesión (Zustand): accessToken (memoria), refreshToken (localStorage), user
  (decodificado del JWT: id, name, email). Restauración al boot vía refresh, con estado
  `isRestoring` para no redirigir a /login ni montar rutas protegidas antes de terminar
  (evita parpadeo/expulsión al recargar).
- Páginas login/registro con react-hook-form + zod (registro: email válido, password
  8–72, `name` máx 100; login: solo campos requeridos — el backend no valida longitud
  en login), errores de campo desde `errors{}` y 409 "Email already registered".
- Interceptor 401 con refresh **singleton** + cola de reintento (una sola pasada);
  fallo del refresh → logout limpio.
- OAuth: botón Google (redirección completa) + ruta `/oauth2/callback` que captura
  tokens, limpia URL y navega.
- `ProtectedRoute`/`GuestRoute`; logout (descarta tokens + `queryClient.clear()`).
- **Verificar**: login con `demo@example.com/password123`, recarga de página mantiene
  sesión, expiración de access a los 15 min se recupera sola, Google redirige de vuelta.

### Fase 2 — Tableros

- Página principal: lista de tableros (`GET /boards`) con `role` guardado (permite saber
  mi rol), badge PERSONAL/COLLABORATIVE, menú contextual (editar si OWNER, eliminar con
  confirmación).
- Modal crear tablero (title requerido, description opcional, type select). Al crear
  (201 `BoardDetail` sin `role` raíz) → invalidar `GET /boards` en lugar de asumir rol.
- Página detalle: snapshot `GET /boards/{id}` → columns (con tasks) + members; estado de
  carga (skeleton) y error 403 ("no eres miembro" → volver a la lista).
- Panel de miembros (modal): lista con roles; eliminar miembro (OWNER/ADMIN según matriz)
  usando `members[].id`; mostrar quién es el asignado de cada tarea (relación userId).
- **Verificar**: crear board personal y colaborativo; editar/borrar como OWNER; 403 en
  acciones prohibidas se muestra como toast.

### Fase 3 — Núcleo kanban (la fase más grande)

- Tablero con scroll horizontal de columnas (dnd-kit sortable):
  - **Tarjetas**: arrastrar dentro de columna y **entre columnas**; al soltar → update
    optimista (reordenar local) + `PATCH /tasks/{id} {columnId, position}`; error →
    rollback + toast + invalidate.
  - **Columnas**: reordenar (`PATCH /columns/{id} {position}`), renombrar, crear, borrar
    (confirmar: borra tareas en cascada).
- Crear tarea (botón al pie de columna, title requerido), eliminar tarea, editar título
  y descripción desde el modal (solo OWNER/ADMIN o el asignado).
- **Modal de tarea** (al hacer click en tarjeta): descripción editable, subtareas
  (lista + crear + toggle `done` + reordenar/eliminar), comentarios (lista + crear +
  eliminar según permisos), asignación (`POST /assignee {userId}` — picker con los
  miembros del board, solo OWNER/ADMIN).
- Comentarios y subtareas se cargan al abrir el modal (queries propias con TanStack).
- Todos los botones con permisos según §3.5 (y tolerar 403).
- **Verificar**: flujo completo con dos usuarios (demo + registro nuevo) en un board
  colaborativo; mover tarjetas entre columnas persiste tras refresco; Member solo
  edita su tarea asignada.

### Fase 4 — Tiempo real

- `RealtimeProvider`: conexión SockJS/STOMP con `connectHeaders: {Authorization: Bearer}`;
  reconexión con backoff; estado de conexión visible (indicador "Live/Reconnecting").
- Al abrir un board: subscribe `/topic/boards/{id}`; eventos → update del caché del
  board (por `type`: mover/recolocar tarjeta, crear/eliminar, subtask, comment, member,
  invitation, column). On reconnect → refetch del board completo.
- La misma conexión sirve para ver cambios de otros usuarios en miembros/invitaciones.
- **Verificar**: dos navegadores con usuarios distintos en el mismo board; mover una
  tarea en A aparece en B sin refrescar; matar el WS (offline) y recuperar.

### Fase 5 — Invitaciones

- Modal invitar (OWNER/ADMIN): email + rol (**solo `ADMIN`|`MEMBER`**; el OWNER puede
  ambos, el ADMIN solo MEMBER; enviar `OWNER` da 403 `Cannot invite a user as owner`);
  manejar 409 (ya miembro / invitación pendiente).
- Lista de invitaciones enviadas del board (`GET /boards/{id}/invitations`, con estado
  y expiración).
- Campana de notificaciones: invitaciones PENDING recibidas (`GET /invitations`),
  filtrando en UI las que ya vencieron por `expiresAt` (el backend no las excluye), con
  aceptar/rechazar inline y ruta `/invitations/accept|reject?token=...` (la que llega
  por email) que llama al POST correspondiente, muestra resultado y refresca.
- Deep link sin sesión: `/invitations/accept|reject?token=...` → si no hay sesión,
  redirigir a login conservando el destino (return URL) y continuar al volver.
- Validación: usuario autenticado debe coincidir con `inviteeEmail` (403 si no).
- **Verificar**: ciclo completo — registrar un segundo usuario, invitar, aceptar desde
  su sesión, aparece como miembro en el board (y evento `MEMBER_JOINED` en tiempo real).
  Ojo: con `RESEND_API_KEY` real y remitente `onboarding@resend.dev`, invitar a emails
  ajenos a la cuenta Resend puede dar 500 (rollback; la invitación no se crea) → probar
  con el `token` devuelto en el JSON de la invitación o desactivar la key en dev.

### Fase 6 — Log de actividades

- Vista en el board (solo visible para OWNER): `GET /boards/{id}/activities` paginado
  (page 0-based, size 20, scroll infinito o botón "cargar más"); cada item: actor,
  acción legible, detalles, fecha relativa.
- **Verificar**: realizar acciones y verlas aparecer (ordenadas DESC) incluida la
  paginación con >20 eventos.

### Fase 7 — Pulido, hardening y entregables

- Empty states (board sin columnas, columna sin tareas, sin invitaciones), skeletons,
  confirmaciones de borrado, toasts unificados, manejo de 409 concurrente (refetch).
- Responsive básico (el kanban con scroll horizontal; modalesSheet en móvil).
- Dark mode con shadcn (persistido en localStorage) — opcional si el tiempo apremia.
- ErrorBoundary global + página 404.
- Tests: unitarios de piezas críticas (decodeJwt, interceptor refresh singleton,
  mapeo de eventos realtime, formularios zod); Playwright E2E opcional de humo:
  login → crear board → crear columna → crear tarea → mover tarjeta.
- README (setup, scripts, variables, puertos, dependencia del backend).

## 6. Convenciones

- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`).
- Ramas `feature/*`, `fix/*`, `chore/*` desde `develop`; `main` solo recibe PRs desde
  `develop`; CI verde obligatorio, sin approvals requeridas.
- Cada componente/feature con su archivo de tipos; DTOs espejo de la API (Apéndice A).
- Nunca hardcoded: URLs del backend, tokens o secretos en el repo.
- Accesibilidad básica: shadcn la aporta — no romperla (focus, aria-labels, teclado en DnD).

## 7. Reglas de trabajo (críticas)

1. **No hacer commit, push ni PR sin visto bueno explícito del usuario.** Al terminar
   cada fase, avisar y explicar cómo verificarla; esperar aprobación.
2. CI debe estar en verde antes de merge.
3. Si falta conocimiento (dnd-kit, STOMP client, TanStack Query, shadcn...), usar la
   skill `find-skills` antes de improvisar.
4. Orden de fases: 0 → 1 → 2 → … → 7; cada fase depende de la anterior.
5. El backend no se modifica desde este repo: si falta algo (p.ej. CORS), se resuelve
   por proxy u otra vía de frontend, o se negocia con el usuario.

---

## 8. Diseño visual (spec acordado)

Dirección aprobada en `interfaz.pen` (login/registro, home, board Kanban/Members/Activity,
detalle de tarea, perfil y board oscuro). Sustituye el look tipo Trello por un **app-shell
con sidebar**, acento **naranja**, tipografía geométrica y dos temas.

- **Shell**: sidebar fija (workspace, `MAIN MENU`, `MY BOARDS` con dots de color) + topbar
  con breadcrumb, búsqueda, campana e avatar. Responsive: sidebar como Sheet en móvil.
- **Paleta clara**: fondo gris cálido `#F2F2F0`, superficie `#FFFFFF`, columna `#ECECE7`,
  bordes `#E6E6E1`, texto `#1A1A18` / `#6E6E67` / `#9C9C94`.
- **Paleta oscura**: fondo `#121212`, superficie `#1C1C1C`, columna `#242424`, bordes
  `#2E2E2E`, texto `#F4F4F2` / `#A8A8A1` / `#8F8F87`.
- **Acento**: naranja `#F97316` (texto sobre oscuro `#FB923C`, `#C2410C` sobre claro) en
  primarios, tabs activas, focos y dots. **Verde solo para éxito/Live** (`#16A34A`/`#4ADE80`).
- **Tipografía**: `Sora` para display/títulos y `Manrope` para UI, self-hosted
  (`@fontsource-variable/sora`, `@fontsource-variable/manrope`).
- **Tema**: clase `.dark` en `<html>`, toggle Light/Dark/System en Profile persistido.
- **Home**: saludo personalizado, botón "New board", banner de invitaciones pendientes (solo
  si hay), grid de tarjetas con tile de color, badge PERSONAL/COLLABORATIVE y rol.
- **Board**: header (título, badge, descripción, avatares, Invite, ⋯) + tabs **Kanban /
  Members / Activity** (Activity solo OWNER). Columnas de 272px con dot, contador y menú;
  tarjetas con título, descripción, "Edited" y avatar del assignee.
- **Detalle de tarea**: panel lateral derecho (Sheet) con propiedades (status, assignee,
  creado, editado), descripción, tabs Subtasks/Comments, progreso derivado de subtareas y
  composer de comentarios.
- **Perfil**: datos read-only (la API no permite editarlos), selector de tema y logout.
- **Invitaciones**: página `/invitations` (recibidas pendientes, aceptar/rechazar) y modal
  de invitar desde el board (OWNER → ADMIN|MEMBER, ADMIN → MEMBER).
- **Honestidad con la API**: sin priority/attachments/due date (no existen), sin editar
  comentarios, sin desasignar tarea, perfil read-only. El indicador **Live** llega en Fase 4.

Toasts con sonner; errores con `detail` del ProblemDetail; skeletons y empty states con
iconos lucide. Componentes shadcn base ya instalados; se añaden los que pida el diseño.

---

## Apéndice A — Referencia rápida de la API

Base: rutas relativas vía proxy. Auth = `Authorization: Bearer`. Errores = ProblemDetail.

```
POST /api/v1/auth/register        {name,email,password}          → 201 {accessToken,refreshToken,tokenType:"Bearer",expiresIn:900}
POST /api/v1/auth/login           {email,password}               → 200 {…igual}
POST /api/v1/auth/refresh         {refreshToken}                 → 200 {…igual}  (rotación single-use)
  · expiresIn en SEGUNDOS · refreshToken es opaco (no JWT) · no hay /me ni logout
GET  /oauth2/authorization/google → 302 /oauth2/callback?accessToken&refreshToken (frontend)

GET  /api/v1/users?email=...                                      → [{id,name,email}]

POST /api/v1/boards               {title*,description?,type*}    → 201 BoardDetail
GET  /api/v1/boards                                               → [{id,title,type,ownerId,role}]  (role = mío)
GET  /api/v1/boards/{id}                                          → BoardDetail {id,title,description,type,ownerId,
                                                                     members[{id(membership),userId,name,email,role}],
                                                                     columns[{id,name,position,tasks[Task]}]}
PATCH /api/v1/boards/{id}         {title?,description?}          → BoardDetail
DELETE /api/v1/boards/{id}                                        → 204
GET  /api/v1/boards/{id}/members                                  → BoardMember[]
DELETE /api/v1/boards/{id}/members/{memberId}                    → 204  (memberId = id de membresía)
GET  /api/v1/boards/{id}/activities?page&size                    → PageResponse {content[],page,size,totalElements,totalPages} (solo OWNER)

POST /api/v1/boards/{id}/columns  {name*}                        → 201 Column {id,name,position,tasks[]}
GET  /api/v1/boards/{id}/columns                                  → Column[]
PATCH /api/v1/boards/{id}/columns/{colId} {name?,position?}      → Column
DELETE /api/v1/boards/{id}/columns/{colId}                       → 204 (cascada tareas)

POST /api/v1/columns/{colId}/tasks {title*,description?}          → 201 Task {id,columnId,title,description,position,
                                                                     assigneeId,assigneeName,createdById,createdAt,updatedAt}
GET  /api/v1/columns/{colId}/tasks                                → Task[]
PATCH /api/v1/tasks/{id}          {title?,description?,columnId?,position?}  → Task (edita Y/O mueve)
POST /api/v1/tasks/{id}/assignee  {userId*}                       → Task (assignee debe ser miembro)
DELETE /api/v1/tasks/{id}                                        → 204

POST /api/v1/tasks/{id}/subtasks  {title*}                        → 201 {id,taskId,title,done,position}
GET  /api/v1/tasks/{id}/subtasks                                  → Subtask[]
PATCH /api/v1/tasks/{id}/subtasks/{subId} {title?,done?,position?} → Subtask
DELETE /api/v1/tasks/{id}/subtasks/{subId}                       → 204

POST /api/v1/tasks/{id}/comments  {content*}                      → 201 {id,taskId,authorId,authorName,content,createdAt}
GET  /api/v1/tasks/{id}/comments                                  → Comment[] (ASC)
DELETE /api/v1/tasks/{id}/comments/{commentId}                    → 204

POST /api/v1/boards/{id}/invitations {email*,role*}              → 201 InvitationResponse (role: ADMIN|MEMBER; OWNER → 403; 409 si ya miembro/pendiente)
GET  /api/v1/boards/{id}/invitations                             → Invitation[] (todas, OWNER/ADMIN)
GET  /api/v1/invitations                                         → Invitation[] (PENDING recibidas por mi email; puede incluir vencidas)
POST /api/v1/invitations/{token}/accept                          → Invitation {status:ACCEPTED}
POST /api/v1/invitations/{token}/reject                          → Invitation {status:REJECTED}

WS /ws (SockJS, STOMP) — CONNECT header: Authorization: Bearer
    subscribe /topic/boards/{id} → RealtimeEvent {type,boardId,entityType,entityId,actorId,payload,occurredAt}
    types: BOARD_*, COLUMN_*, TASK_CREATED/UPDATED/MOVED/ASSIGNED/DELETED, SUBTASK_*,
           COMMENT_*, MEMBER_*, INVITATION_*
```

## Apéndice B — Errores de negocio frecuentes (status + detail)

- 401 `Authentication required` / `Invalid email or password` / `Refresh token expired or revoked` / `Invalid refresh token`
- 403 `You are not a member of this board` · `Role X cannot perform Y` · `Personal boards cannot have members` · `Members can only delete their own comments` · `Members can only perform X on tasks assigned to them` · `The owner cannot be removed` · `Cannot invite a user as owner` · `Admins can only invite members` · `Admins can only remove members` · `Invitation is for a different email address` · `You are not allowed to perform this action`
- 404 `Column/Task/Subtask/Comment/Invitation not found` · `User not found` · `Board member not found` (board ajeno o inexistente = 403, no 404)
- 409 `Email already registered` · `User is already a member of this board` · `There is already a pending invitation for this email` · `Invitation is no longer pending` · `Invitation has expired` · `The resource was modified concurrently, please retry`
- 400 `Task can only be moved within the same board` · `Assignee must be a board member` · `Title/Column name/Task title/Subtask title must not be blank` · + `errors{}` para validación de campos (mapear al formulario)
