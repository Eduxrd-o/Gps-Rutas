import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  mapOutline,
  navigateOutline,
  downloadOutline,
  copyOutline,
  openOutline,
  locateOutline,
  radioOutline,
  stopCircleOutline,
  documentTextOutline,
  pinOutline,
  flagOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { LocationService } from '../services/location';

interface DestinoPreset {
  id: string;
  nombre: string;
  latLng: string;
  waypoints?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  // Coordenadas actuales obtenidas por GPS
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  watchId: string | null = null;
  errorMsg = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  // Opciones de configuración de ruta
  usarGpsComoOrigen = signal<boolean>(true);
  origenManual = signal<string>('-0.180653,-78.467838');
  destinoSeleccionado = signal<string>('panecillo');
  destinoManual = signal<string>('-0.229415,-78.524581');
  waypointsManual = signal<string>('-0.201452,-78.498124|-0.220164,-78.512328');

  // Sitios de interés predefinidos
  destinosPredefinidos: DestinoPreset[] = [
    {
      id: 'panecillo',
      nombre: 'El Panecillo (Quito Sur)',
      latLng: '-0.229415,-78.524581',
      waypoints: '-0.201452,-78.498124|-0.220164,-78.512328',
    },
    {
      id: 'carolina',
      nombre: 'Parque La Carolina (Quito Norte)',
      latLng: '-0.182500,-78.484500',
      waypoints: '-0.195000,-78.490000',
    },
    {
      id: 'ejido',
      nombre: 'Parque El Ejido (Centro Norte)',
      latLng: '-0.210512,-78.498835',
      waypoints: '-0.205000,-78.495000',
    },
    {
      id: 'epn',
      nombre: 'Escuela Politécnica Nacional (EPN)',
      latLng: '-0.210250,-78.489120',
      waypoints: '-0.205000,-78.492000',
    },
    {
      id: 'casa',
      nombre: 'Mi Casa (Ejemplo personalizado)',
      latLng: '-0.180653,-78.467838',
      waypoints: '-0.190000,-78.475000',
    },
    {
      id: 'custom',
      nombre: 'Personalizado (Ingresar coordenadas)',
      latLng: '',
      waypoints: '',
    },
  ];

  // 1.- Hipervínculo a la posición GPS actual
  ubicacionGpsUrl = computed<string>(() => {
    const lat = this.latitude();
    const lng = this.longitude();
    if (lat !== null && lng !== null) {
      return `https://www.google.com/maps/@${lat},${lng}`;
    }
    // Coordenada por defecto de ejemplo si aún no se activa el GPS
    return 'https://www.google.com/maps/@-0.2025464,-78.4941719';
  });

  // Coordenadas activas de origen para la ruta
  origenRuta = computed<string>(() => {
    if (this.usarGpsComoOrigen() && this.latitude() !== null && this.longitude() !== null) {
      return `${this.latitude()},${this.longitude()}`;
    }
    return this.origenManual().trim();
  });

  // Coordenadas activas de destino
  destinoRuta = computed<string>(() => {
    const preset = this.destinosPredefinidos.find((d) => d.id === this.destinoSeleccionado());
    if (preset && preset.id !== 'custom') {
      return preset.latLng;
    }
    return this.destinoManual().trim();
  });

  // Waypoints activos
  waypointsRuta = computed<string>(() => {
    const preset = this.destinosPredefinidos.find((d) => d.id === this.destinoSeleccionado());
    if (preset && preset.id !== 'custom' && preset.waypoints) {
      return preset.waypoints;
    }
    return this.waypointsManual().trim();
  });

  // 2.- Hipervínculo para mostrar la ruta a casa, al parque o sitio de interés
  rutaGpsUrl = computed<string>(() => {
    const origin = encodeURIComponent(this.origenRuta());
    const destination = encodeURIComponent(this.destinoRuta());
    const waypoints = this.waypointsRuta();

    if (waypoints && waypoints.length > 0) {
      const waypointsEncoded = encodeURIComponent(waypoints);
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypointsEncoded}`;
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  });

  constructor(
    private loc: LocationService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      locationOutline,
      mapOutline,
      navigateOutline,
      downloadOutline,
      copyOutline,
      openOutline,
      locateOutline,
      radioOutline,
      stopCircleOutline,
      documentTextOutline,
      pinOutline,
      flagOutline,
      checkmarkCircleOutline,
    });
  }

  async ngOnInit() {
    await this.loc.ensurePermissions();
    await this.obtenerUbicacionActual();
  }

  async obtenerUbicacionActual() {
    this.isLoading.set(true);
    try {
      const pos = await this.loc.getCurrentPosition();
      this.latitude.set(pos.coords.latitude);
      this.longitude.set(pos.coords.longitude);
      this.errorMsg.set(null);
      await this.mostrarToast('Ubicación GPS obtenida con éxito', 'success');
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'Error al obtener la ubicación actual');
      await this.mostrarToast('No se pudo obtener el GPS: ' + (e?.message ?? ''), 'warning');
    } finally {
      this.isLoading.set(false);
    }
  }

  async iniciarSeguimiento() {
    try {
      this.watchId = await this.loc.watchPosition(
        (pos) => {
          this.latitude.set(pos.coords.latitude);
          this.longitude.set(pos.coords.longitude);
        },
        (err) => {
          this.errorMsg.set(err?.message ?? 'Error en seguimiento de ubicación');
        }
      );
      await this.mostrarToast('Seguimiento GPS en vivo activado', 'primary');
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'No se pudo iniciar el seguimiento');
    }
  }

  async detenerSeguimiento() {
    if (this.watchId) {
      await this.loc.clearWatch(this.watchId);
      this.watchId = null;
      await this.mostrarToast('Seguimiento GPS detenido', 'medium');
    }
  }

  cambiarDestinoPreset(id: string) {
    this.destinoSeleccionado.set(id);
    const preset = this.destinosPredefinidos.find((d) => d.id === id);
    if (preset && preset.id !== 'custom') {
      this.destinoManual.set(preset.latLng);
      this.waypointsManual.set(preset.waypoints || '');
    }
  }

  // 3.- Guardar ubicación actual en archivo txt
  async guardarUbicacionTxt() {
    const lat = this.latitude() ?? -0.2025464;
    const lng = this.longitude() ?? -78.4941719;
    const url = this.ubicacionGpsUrl();
    const fechaHora = new Date().toLocaleString();

    const contenido = `========================================================
         REPORTE DE UBICACIÓN GPS
========================================================
Fecha y Hora      : ${fechaHora}
Latitud           : ${lat}
Longitud          : ${lng}
Estado            : ${this.latitude() !== null ? 'Coordenadas en vivo obtenidas' : 'Coordenadas de referencia'}

Hipervínculo Google Maps:
${url}
========================================================
`;

    await this.descargarArchivo('ubicacion_gps.txt', contenido);
  }

  // 4.- Guardar ruta en archivo txt
  async guardarRutaTxt() {
    const fechaHora = new Date().toLocaleString();
    const origen = this.origenRuta();
    const destino = this.destinoRuta();
    const waypoints = this.waypointsRuta();
    const url = this.rutaGpsUrl();
    const preset = this.destinosPredefinidos.find((d) => d.id === this.destinoSeleccionado());
    const nombreDestino = preset?.nombre ?? 'Destino personalizado';

    const contenido = `========================================================
         REPORTE DE RUTA - GOOGLE MAPS
========================================================
Fecha y Hora      : ${fechaHora}
Punto de Origen   : ${origen} ${this.usarGpsComoOrigen() && this.latitude() !== null ? '(Ubicación actual GPS)' : ''}
Punto de Destino  : ${destino} (${nombreDestino})
Puntos Intermedios: ${waypoints || 'Ninguno'}

Hipervínculo Google Maps (Ruta):
${url}
========================================================
`;

    await this.descargarArchivo('ruta_gps.txt', contenido);
  }

  // Guarda o descarga el archivo txt compatible con Android nativo y navegador web
  private async descargarArchivo(nombreArchivo: string, contenido: string) {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: nombreArchivo,
          data: contenido,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        await this.mostrarToast(`Guardado en Documentos/${nombreArchivo}`, 'success');
        return;
      } catch (err: any) {
        console.warn('Error guardando en Documents, intentando en Data:', err);
        try {
          await Filesystem.writeFile({
            path: nombreArchivo,
            data: contenido,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
          });
          await this.mostrarToast(`Guardado en archivos de la app: ${nombreArchivo}`, 'success');
          return;
        } catch (innerErr: any) {
          await this.mostrarToast('Error al guardar archivo: ' + (innerErr?.message || innerErr), 'danger');
          return;
        }
      }
    }

    // Modo navegador web (PC)
    try {
      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      await this.mostrarToast(`Archivo ${nombreArchivo} descargado exitosamente`, 'success');
    } catch (e: any) {
      await this.mostrarToast('Error al descargar archivo: ' + (e?.message || e), 'danger');
    }
  }

  // Copiar enlaces al portapapeles
  async copiarAlPortapapeles(texto: string, mensajeExito: string) {
    try {
      await navigator.clipboard.writeText(texto);
      await this.mostrarToast(mensajeExito, 'success');
    } catch {
      await this.mostrarToast('Error al copiar al portapapeles', 'danger');
    }
  }

  // Feedback al usuario con Toasts
  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger' | 'primary' | 'medium') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.watchId) {
      this.loc.clearWatch(this.watchId);
    }
  }
}

