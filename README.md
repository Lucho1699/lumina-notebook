# 📖 Lumina Notebook

> **Plataforma inteligente de apuntes digitales, visualización realista de cuadernos, digitalización de diapositivas y gestión de clases.**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Características Principales

* **📖 Experiencia de Cuaderno Realista:**
  * Motor de física 3D de paso de página (*page-flip*) con sensación táctil y háptica.
  * Modos de vista en dos páginas (cuaderno abierto) y página individual para dispositivos móviles.
  * Cuadrícula, líneas pautadas y hojas lisas intercambiables.

* **✍️ Tinta Digital y Dibujo Avanzado:**
  * Dibujo fluido con selección de colores, grosores y borrador de precisión.
  * Modo texto, figuras geométricas y personalización de notas por página.

* **📸 Captura y Digitalización de Diapositivas:**
  * Integración con cámara web y móvil para capturar diapositivas o pizarras de clase al instante.
  * Ingestión y renderizado de archivos PDF directo en las páginas de tus cuadernos.

* **🎙️ Grabadora de Voz para Clases:**
  * Graba audio de conferencias o explicaciones sincronizadas con tus notas.

* **🗓️ Planificador y Agenda Académica:**
  * Calendario de tareas, recordatorios de entrega y seguimiento de pendientes por asignatura.

* **🔐 Autenticación y Perfil de Usuario:**
  * Servidor Express integrado con autenticación JWT y contraseñas cifradas con bcrypt.
  * Modo offline y persistencia local resiliente.

* **📱 Soporte PWA y Móvil:**
  * Progressive Web App (PWA) instalable en Android, iOS y Escritorio.
  * Preparado para Capacitor en dispositivos móviles nativos.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite |
| **Efectos y Física** | Page-Flip, Canvas Confetti, Web Audio API (Sound Engine) |
| **Documentos y PDF** | PDF.js (`pdfjs-dist`), jsPDF |
| **Backend & Auth** | Node.js, Express, JWT (`jsonwebtoken`), bcryptjs |
| **Móvil & PWA** | Service Workers, Web App Manifest, Capacitor Core & Haptics |
| **Testing & Calidad**| Vitest, Oxlint |

---

## 🚀 Despliegue en Render

El repositorio cuenta con configuración nativa de **Infrastructure as Code** con `render.yaml`:

1. Haz clic en el botón **Deploy to Render** o vincula este repositorio en tu panel de [Render](https://dashboard.render.com/).
2. Render detectará automáticamente el archivo `render.yaml`.
3. Comandos configurados:
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run server`
4. El servidor Node.js iniciará en producción sirviendo la API en `/api` y el frontend compilado en `/`.

---

## 💻 Desarrollo Local

### Prerrequisitos
* Node.js v18 o superior
* npm v9 o superior

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Lucho1699/lumina-notebook.git
cd lumina-notebook

# Instalar dependencias
npm install
```

### Ejecución en Modo Desarrollo

```bash
# Iniciar tanto el servidor de autenticación como Vite en paralelo:
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

### Pruebas Automatizadas

```bash
# Ejecutar la suite completa de pruebas unitarias con Vitest:
npm test
```

### Compilación para Producción

```bash
# Compilar TypeScript y empaquetar con Vite:
npm run build

# Probar el servidor de producción localmente:
npm run server
```

---

## 📁 Estructura del Proyecto

```text
lumina-notebook/
├── public/                 # Recursos estáticos, iconos PWA y Service Worker
├── server/                 # Servidor de autenticación Express & JWT
│   ├── auth.js             # Lógica de hashing bcrypt y tokens JWT
│   ├── db.js               # Gestor de base de datos de usuarios
│   └── index.js            # Servidor Express principal y fallback SPA
├── src/
│   ├── assets/             # Estilos globales y recursos multimedia
│   ├── components/
│   │   ├── AudioRecorder/  # Grabadora de notas de voz
│   │   ├── Auth/           # Modal de inicio de sesión y registro
│   │   ├── Camera/         # Captura de diapositivas con cámara
│   │   ├── Library/        # Biblioteca y selector de cuadernos
│   │   ├── Notebook/       # Visor 3D, lienzo de dibujo y barra de herramientas
│   │   ├── Planner/        # Agenda de clases y tareas pendientes
│   │   ├── SlideIngestion/ # Ingestión y conversor de PDFs
│   │   └── UI/             # Componentes de interfaz compartidos
│   ├── context/            # Contexto de autenticación y estado global
│   ├── types/              # Tipos TypeScript
│   ├── utils/              # Exportación a PDF, motor de sonido, hápticos y storage
│   └── __tests__/          # Pruebas automatizadas (46 tests unitarios)
├── render.yaml             # Especificación de despliegue para Render
└── vite.config.ts          # Configuración de compilación Vite y Tailwind
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
