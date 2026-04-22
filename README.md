# FILMAX Frontend (Angular)

## Información General

**Proyecto:** Catálogo de Películas MVP con API de IMDb  
**Módulo:** Frontend Web  
**Metodología:** Scrum (sprints de 1-2 semanas)  
**Estrategia de ramas:** Git Flow  
**Fecha del Sprint Planning:** 17/04/2026

Sistema web para consulta y valoración de películas/series con interfaz en Angular, diseño responsivo con Tailwind CSS y consumo de una API REST backend.

## Equipo

- Almanza Contreras José de Jesús
- Alonso Romero Pablo Emilio
- Avila Monjaraz Victor Hassiel
- Amador Ynfante Jossue
- Durán Torres Leonardo Gael

**Materia:** Desarrollo colaborativo  
**Docente:** Luis Enrique Cuellar Vivia

## Roles Scrum

- **Product Owner:** Pablo Emilio Alonso Romero
- **Scrum Master:** José de Jesús Almanza Contreras
- **Desarrolladores Frontend:** Víctor Hassiel Ávila Monjaraz, Jossué Amador Ynfante
- **Desarrollador Backend:** Leonardo Gael Durán Torres

## Objetivo del Sprint (MVP)

Construir un primer incremento funcional que permita a un usuario:

1. Registrarse en la plataforma.
2. Iniciar sesión.
3. Visualizar catálogo de películas y series.
4. Emitir calificaciones sobre contenido.

Este alcance prioriza la entrega de valor funcional mínimo para validar el producto.

## Historias de Usuario del Sprint

- **HU1 - Registro de usuario:** Como usuario, deseo registrarme en la plataforma para acceder a sus funcionalidades.
- **HU2 - Inicio de sesión:** Como usuario, deseo iniciar sesión con mis credenciales para acceder a mi cuenta.
- **HU3 - Visualización del catálogo:** Como usuario, deseo ver películas/series con título, descripción y género para explorar contenido.
- **HU4 - Calificación de contenido:** Como usuario, deseo calificar películas/series en una escala de 1 a 5.

## Alcance del Frontend

### Funcionalidades implementadas/planificadas

- Interfaz de registro de usuario.
- Interfaz de inicio de sesión.
- Vista de catálogo (listado/tarjetas).
- Componente de calificación (1 a 5 estrellas).
- Integración con backend mediante consumo de API.
- Manejo básico de sesión (token JWT y control de acceso en rutas).

### Fuera de alcance del sprint

- Autenticación social (Google/Facebook/etc.).
- Reproducción de contenido (streaming).
- Sistema de comentarios.
- Gestión completa de listas personales (favoritos/watchlist) como funcionalidad prioritaria de este sprint.

## Stack Tecnológico

- **Framework Frontend:** Angular 19
- **Estilos:** Tailwind CSS 19.x
- **HTTP Client:** Angular HttpClient
- **Autenticación:** JWT (emitido por backend)
- **Ecosistema Backend consumido:** Node.js/Express + MySQL/Prisma + IMDb API (vía proxy backend)

## Reglas de Negocio Relevantes para Frontend

- La escala de valoración es entera de **1 a 5**.
- El catálogo principal se consulta desde backend (que actúa como proxy a IMDb); **no exponer API key en frontend**.
- La sesión se maneja por token JWT.
- El frontend debe considerar privacidad por usuario sobre actividad personal (listas/valoraciones cuando aplique).

## Contratos de API Consumidos

> Base URL sugerida: definida por variable de entorno (por ejemplo `environment.ts`).

- `POST /auth/login` - Inicio de sesión.
- `GET /movies/search` - Búsqueda de películas/series (requiere auth).
- `POST /ratings` - Alta/actualización de calificación (requiere auth).
- `GET /lists/:type` - Consulta de favoritos/watchlist (requiere auth).

## Arquitectura Frontend Sugerida

```text
src/
  app/
    core/
      services/
        auth.service.ts
        movies.service.ts
        ratings.service.ts
      guards/
        auth.guard.ts
      interceptors/
        auth-token.interceptor.ts
    features/
      auth/
        login/
        register/
      catalog/
        catalog-list/
        movie-card/
      ratings/
        rating-stars/
    shared/
      components/
      models/
      utils/
```

## Flujo Funcional Principal

1. Usuario se registra o inicia sesión.
2. Backend responde con JWT.
3. Frontend guarda token de forma segura para sesión activa.
4. Usuario consulta catálogo.
5. Usuario califica contenido (1-5).
6. Frontend actualiza estado y refresca promedio si aplica.

## Requerimientos No Funcionales

- **Seguridad:** No exponer secretos/API keys en cliente.
- **Diseño:** Interfaz totalmente responsiva con enfoque mobile-first y utilidades Tailwind.
- **Rendimiento:** Búsquedas con tiempo de respuesta objetivo menor a 1.5s (dependiente de backend y red).

## Definición de Terminado (DoD)

Una historia se considera terminada cuando:

- La funcionalidad está implementada en frontend y backend.
- La integración entre capas funciona correctamente.
- Se probó sin errores críticos.
- Cumple criterios de aceptación.
- Es usable dentro del flujo principal de la aplicación.

## Backlog Priorizado Relacionado al Frontend

- **#01 (ALTA):** Setup Angular + Tailwind.
- **#02 (ALTA):** Auth Service, login/registro y protección de rutas.
- **#05 (MEDIA):** Gestión de listas (Favoritos/Watchlist) en integración fullstack.

## Configuración y Ejecución (Frontend)

### Prerrequisitos

- Node.js 20 LTS
- npm 10+
- Angular CLI 19

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run start
```

o

```bash
ng serve
```

### Build de producción

```bash
npm run build
```

## Variables de Entorno (Referencia)

Configurar en archivos de entorno de Angular:

- `apiBaseUrl`: URL base del backend.
- `production`: bandera de entorno.

Ejemplo conceptual:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000'
};
```

## Notas de Integración

- Alinear payloads frontend-backend con contratos definidos por sprint.
- Manejar estados de carga/error en búsquedas y autenticación.
- Validar en UI el rango de calificación para evitar envíos inválidos.

## Licencia

Uso académico - Proyecto FILMAX.
