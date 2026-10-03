import { visibleAnimals } from './store.js';
import { pet, esc } from '../components/ui.js';

// Coordenadas ficticias en Recoleta.
// Son ejemplos de demostración, no avistamientos reales.
const DEMO_LOCATIONS = {
  grecia: [-33.4050, -70.6410],
  canelo: [-33.4090, -70.6390],
  rocco: [-33.4140, -70.6440],
  mora: [-33.4030, -70.6370],
  chocolate: [-33.3990, -70.6420],
  luna: [-33.4070, -70.6430],
  firulais: [-33.4110, -70.6410],
  manchita: [-33.4020, -70.6450],
  plaza: [-33.4060, -70.6360]
};

let map = null;

// Encuadre inicial de Recoleta.
// Se conserva cuando cambia la tarjeta o se aplican filtros.
let savedView = {
  center: [-33.4060, -70.6410],
  zoom: 14
};

let examplePoints = [];
let userLocation = null;
let locationLayer = null;

function coordinates(animal) {
  // Los animales nuevos podrán tener coordenadas propias.
  if (
    Number.isFinite(animal.lat) &&
    Number.isFinite(animal.lng) &&
    Math.abs(animal.lat) <= 90 &&
    Math.abs(animal.lng) <= 180
  ) {
    return [animal.lat, animal.lng];
  }

  return DEMO_LOCATIONS[animal.id] || null;
}

function distanceMeters(first, second) {
  const radians = degrees => degrees * Math.PI / 180;
  const latitudeDelta = radians(second[0] - first[0]);
  const longitudeDelta = radians(second[1] - first[1]);
  const arc = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(first[0])) *
    Math.cos(radians(second[0])) *
    Math.sin(longitudeDelta / 2) ** 2;

  return 6371000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

export function findNearbyUrgentAnimal(animals, point, radius = 5000) {
  if (!Array.isArray(point) || !point.every(Number.isFinite)) return null;

  const urgentSignals = new Set(['Sangrado', 'Respira con dificultad']);
  const privateSituations = new Set(['Mi mascota', 'Adoptado', 'Encontrado']);

  return animals
    .filter(animal =>
      !privateSituations.has(animal.situation) &&
      (['Herido', 'Estado crítico'].includes(animal.health) ||
        animal.signals?.some(signal => urgentSignals.has(signal))) &&
      Number.isFinite(animal.lat) &&
      Number.isFinite(animal.lng) &&
      Math.abs(animal.lat) <= 90 &&
      Math.abs(animal.lng) <= 180
    )
    .map(animal => ({
      animal,
      distance: distanceMeters(point, [animal.lat, animal.lng])
    }))
    .filter(result => result.distance <= radius)
    .sort((first, second) => first.distance - second.distance)[0]?.animal || null;
}

function drawUserLocation() {
  if (!map || !userLocation) return;

  if (locationLayer) {
    map.removeLayer(locationLayer);
  }

  const L = window.L;

  locationLayer = L.layerGroup([
    L.circle(userLocation.point, {
      radius: userLocation.accuracy,
      color: '#287ac6',
      fillColor: '#287ac6',
      fillOpacity: 0.10,
      weight: 1,
      interactive: false
    }),

    L.circleMarker(userLocation.point, {
      radius: 8,
      color: '#ffffff',
      weight: 3,
      fillColor: '#287ac6',
      fillOpacity: 1
    }).bindTooltip('Tu ubicación')
  ]).addTo(map);
}

export function destroyMap() {
  if (!map) return;

  const center = map.getCenter();

  savedView = {
    center: [center.lat, center.lng],
    zoom: map.getZoom()
  };

  map.stopLocate();
  map.remove();

  map = null;
  locationLayer = null;
}

export function mountMap({
  state,
  query,
  selected,
  onSelect,
  onClose,
  notify,
  onLocationUpdate = () => {}
}) {
  const container = document.querySelector('#real-map');

  if (!container) return;

  const L = window.L;

  if (!L) {
    container.textContent =
      'No se pudo cargar el mapa. Comprueba tu conexión y recarga.';
    return;
  }

  map = L.map(container, {
    zoomControl: false
  }).setView(savedView.center, savedView.zoom);

  L.control.zoom({
    position: 'bottomleft'
  }).addTo(map);

  const tiles = L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">' +
        'OpenStreetMap</a> contributors'
    }
  ).addTo(map);

  let warned = false;

  tiles.on('tileerror', () => {
    if (warned) return;

    warned = true;

    notify(
      'No se pudieron cargar algunas partes del mapa. Revisa internet.'
    );
  });

  examplePoints = [];

  const animals = visibleAnimals(state, query);

  animals.forEach(animal => {
    const point = coordinates(animal);

    // No inventar ubicaciones para animales sin coordenadas.
    if (!point) return;

    examplePoints.push(point);

    const icon = L.divIcon({
      className: 'animal-map-icon',

      html: `
        <div class="animal-map-pin ${
          animal.id === selected ? 'is-selected' : ''
        }">
          ${pet(animal)}
          <span>${esc(animal.name)}</span>
        </div>
      `,

      iconSize: [64, 76],
      iconAnchor: [32, 38]
    });

    L.marker(point, {
      icon,
      title: animal.name,
      alt: animal.name,
      keyboard: true,
      bubblingMouseEvents: false
    })
      .addTo(map)
      .on('click', () => onSelect(animal.id));
  });

  // Pulsar una zona vacía cierra la tarjeta.
  map.on('click', onClose);

  map.on('locationfound', event => {
    userLocation = {
      point: [event.latlng.lat, event.latlng.lng],
      accuracy: event.accuracy
    };

    drawUserLocation();
    onLocationUpdate(userLocation.point, true);

    notify('Mapa centrado en tu ubicación.');
  });

  map.on('locationerror', event => {
    onLocationUpdate(null, false);

    notify(
      event.code === 1
        ? 'Permiso de ubicación denegado. Puedes mover el mapa manualmente.'
        : 'No se pudo obtener tu ubicación. Inténtalo nuevamente.'
    );
  });

  drawUserLocation();

  if (userLocation) {
    onLocationUpdate(userLocation.point, true);
  }

  const currentMap = map;

  requestAnimationFrame(() => {
    if (map === currentMap) {
      currentMap.invalidateSize();
    }
  });
}

export function locateUser(notify) {
  if (!map) return;

  if (!window.isSecureContext) {
    notify(
      'Para usar ubicación en el celular, abre el enlace HTTPS de Cloudflare.'
    );
    return;
  }

  if (!navigator.geolocation) {
    notify('Este navegador no ofrece geolocalización.');
    return;
  }

  notify('Buscando tu ubicación…');

  map.locate({
    setView: true,
    maxZoom: 16,
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30000
  });
}

export function showExamples(notify) {
  if (!map) return;

  if (!examplePoints.length) {
    notify(
      'No hay ejemplos visibles con estos filtros. Limpia los filtros.'
    );
    return;
  }

  map.fitBounds(examplePoints, {
    paddingTopLeft: [40, 160],
    paddingBottomRight: [40, 280],
    maxZoom: 15
  });
}