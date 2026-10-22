# Proyecto GPS y Rutas con Google Maps 📍🗺️

> **Escuela Politécnica Nacional (EPN)**  
> **ESFOT**
> **Materia:** Aplicaciones Móviles  
---

## Integrantes (Trabajo en Parejas)
- **Integrante 1:** Eduardo Ganchala 
- **Integrante 2:** Josue Ortiz 

---

## Descripción del Proyecto
Esta aplicación móvil desarrollada con **Ionic Framework**, **Angular Standalone Components** y **Capacitor** permite capturar en tiempo real las coordenadas del dispositivo móvil mediante GPS, generar enlaces dinámicos compatibles con la API de **Google Maps** (tanto para ubicación puntual como para rutas con múltiples puntos de parada/waypoints) y exportar estos reportes a archivos de texto plano (`.txt`).

---

## Requerimientos Implementados

### 1. Hipervínculo a la posición GPS del sitio 
- Obtención de las coordenadas actuales del dispositivo (`latitud` y `longitud`) mediante el plugin `@capacitor/geolocation`.
- Generación dinámica de un hipervínculo clickeable hacia Google Maps:
  ```text
  https://www.google.com/maps/@{LATITUD},{LONGITUD}
  ```
- **Ejemplo en funcionamiento:**
  ```text
  https://www.google.com/maps/@-0.2025464,-78.4941719
  ```
- En la interfaz se incluye:
  - Enlace HTML interactivo con `target="_blank"`.
  - Botón directo **"Abrir en Maps"**.
  - Botón **"Copiar Link"** que utiliza la API del portapapeles.

---

### 2. Hipervínculo que muestra la ruta a casa, parque o sitio de interés 
- Construcción automática de URLs de navegación usando la API de direcciones de Google Maps:
  ```text
  https://www.google.com/maps/dir/?api=1&origin={ORIGEN}&destination={DESTINO}&waypoints={WAYPOINTS}
  ```
- **Soporte de Destinos Predefinidos y Personalizados:**
  - **El Panecillo (Quito Sur):** `-0.229415,-78.524581`
  - **Parque La Carolina (Quito Norte):** `-0.182500,-78.484500`
  - **Parque El Ejido (Centro Norte):** `-0.210512,-78.498835`
  - **Escuela Politécnica Nacional (EPN):** `-0.210250,-78.489120`
  - **Mi Casa (Personalizado):** Configurable directamente por el usuario.
- **Origen Dinámico:** Opción de utilizar automáticamente la posición GPS actual del usuario como punto de partida o ingresar coordenadas manualmente.
- **Puntos Intermedios (Waypoints):** Separados por el caracter pipe `|` (o codificados como `%7C`).
- **Ejemplo generado:**
  ```text
  https://www.google.com/maps/dir/?api=1&origin=-0.180653,-78.467838&destination=-0.229415,-78.524581&waypoints=-0.201452,-78.498124%7C-0.220164,-78.512328
  ```

---

### 3. Botón para guardar ubicación en un archivo `.txt`
- Al presionar **"3. Guardar Ubicación en TXT"**, el sistema genera y descarga automáticamente el archivo `ubicacion_gps.txt`.
- **Estructura del archivo generado:**
  ```text
  ========================================================
           REPORTE DE UBICACIÓN GPS
  ========================================================
  Fecha y Hora      : 21/10/2026, 22:15:30
  Latitud           : -0.2025464
  Longitud          : -78.4941719
  Estado            : Coordenadas en vivo obtenidas

  Hipervínculo Google Maps:
  https://www.google.com/maps/@-0.2025464,-78.4941719
  ========================================================
  ```

---
### 4. Botón para guardar la ruta en un archivo `.txt` 
- Al presionar **"4. Guardar Ruta en TXT"**, el sistema genera y descarga automáticamente el archivo `ruta_gps.txt`.
- **Estructura del archivo generado:**
  ```text
  ========================================================
           REPORTE DE RUTA - GOOGLE MAPS
  ========================================================
  Fecha y Hora      : 21/10/2026, 22:15:30
  Punto de Origen   : -0.180653,-78.467838 (Ubicación actual GPS)
  Punto de Destino  : -0.229415,-78.524581 (El Panecillo (Quito Sur))
  Puntos Intermedios: -0.201452,-78.498124|-0.220164,-78.512328

  Hipervínculo Google Maps (Ruta):
  https://www.google.com/maps/dir/?api=1&origin=-0.180653,-78.467838&destination=-0.229415,-78.524581&waypoints=-0.201452,-78.498124%7C-0.220164,-78.512328
  ========================================================
  ```

---

## Tecnologías y Librerías Utilizadas
- **Ionic Framework 9.x:** Componentes de interfaz móvil adaptables.
- **Angular 22.x (Standalone Components & Signals):** Arquitectura reactiva y modular.
- **Capacitor 8.x:** Puente nativo para acceder al hardware del dispositivo.
- **@capacitor/geolocation:** Plugin oficial para geolocalización de alta precisión.
- **Ionicons:** Iconografía moderna.
- **HTML5 Blob & File APIs:** Descarga universal de archivos de texto compatible tanto con navegadores de escritorio como navegadores y WebViews móviles.

---

## Estructura Principal del Código

```text
src/
├── app/
│   ├── home/
│   │   ├── home.page.html    # Plantilla con tarjetas de requisitos, enlaces y botones
│   │   ├── home.page.ts      # Lógica de signals, cálculo de URLs y exportación TXT
│   │   └── home.page.scss    # Estilos modernos, diseño responsive y paleta de colores
│   └── services/
│       └── location.ts       # Servicio que gestiona permisos y llamadas a Geolocation
docs/
└── screenshots/              # Directorio destinado para capturas de pantalla de la entrega
```

---

## Instrucciones de Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <https://github.com/Eduxrd-o/Gps-Rutas.git>
cd Gps-Rutas
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en el navegador para pruebas locales
```bash
npm start
# O usando el CLI de Ionic:
ionic serve
```
> La aplicación se abrirá en `http://localhost:8100/`. Recuerda conceder permisos de ubicación al navegador cuando lo solicite.

### 4. Compilar y ejecutar en Android (Dispositivo o Emulador)
```bash
# Compilar bundle de producción
npm run build

# Sincronizar con el proyecto Android nativo
npx cap sync android

# Abrir Android Studio
npx cap open android
```