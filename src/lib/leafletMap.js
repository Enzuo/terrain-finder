// src/lib/leafletMap.js
import L from 'leaflet'

/**
 * @param {HTMLElement} mapContainer
 * @param {number[]} defaultView
 * @param {number} zoom
 */
export function createLeafletMap(mapContainer, defaultView = [46.3105761, 0.1725793], zoom = 12) {
  /** @type {import('leaflet').Map} */
  let map = L.map(mapContainer, { maxZoom: 19 }).setView([0, 0], zoom)
  /** @type {import('leaflet').Layer[]} */
  let polygonLayers = []
  /** @type {App.TerrainFeature[]} */
  let terrains = []

  init()

  return {
    map,
    clean,
    displayTerrains,
    centerOnTerrain
  }

  function init() {
    // Ensure defaultView is exactly [lat, lng]
    const lat = Number(defaultView[0])
    const lng = Number(defaultView[1])
    // map = L.map(mapContainer, { maxZoom: 19 }).setView([lat, lng], zoom)
    map.setView([lat, lng], zoom)
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    })
    const esriSat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }
    )
    const baseMaps = {
      OpenStreetMap: osm,
      'Satellite (Esri)': esriSat
    }
    osm.addTo(map)
    L.control.layers(baseMaps, undefined, { position: 'bottomleft' }).addTo(map)
  }

  function clean() {
    polygonLayers.forEach((layer) => map.removeLayer(layer))
    polygonLayers = []
  }

  /**
   * @param {App.TerrainFeature[]} terrainsToDisplay
   * @param {string|null} selectedPolygonId
   */
  function displayTerrains(terrainsToDisplay, selectedPolygonId) {
    clean()
    terrains = terrainsToDisplay
    terrains.forEach((feature) => {
      if (feature.geometry && feature.geometry.type === 'Polygon') {
        // Leaflet expects [lat, lng], but GeoJSON is [lng, lat]
        // Ensure each coordinate is [lat, lng] and has exactly 2 elements
        const coords = feature.geometry.coordinates[0]
          .map(([lng, lat]) => [Number(lat), Number(lng)])
          .filter(
            (arr) => arr.length === 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number'
          )
        const latLngTuples = coords
          .filter((arr) => arr.length === 2)
          .map(([lat, lng]) => [lat, lng])
        const isSelected = feature.id === selectedPolygonId
        const fallback = [[46.3105761, 0.1725793]]
        const layer = L.polygon(latLngTuples.length ? latLngTuples : fallback, {
          color: isSelected ? 'blue' : 'red',
          weight: isSelected ? 4 : 2,
          fillOpacity: isSelected ? 0.5 : 0.3
        })
        layer.addTo(map)
        polygonLayers.push(layer)
      }
    })
  }

  /**
   * Center the map on the terrain with the given ID
   * and copy its first coordinate to clipboard
   * @param {string} terrainId
   */
  function centerOnTerrain(terrainId) {
    var feature = terrains.find((f) => f.id === terrainId)
    if(!feature) {
      return
    }
    const coords = feature.geometry.coordinates[0]
      .map(([lng, lat]) => [Number(lat), Number(lng)])
      .filter((arr) => arr.length === 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number')
    const latLngTuples = coords.filter((arr) => arr.length === 2).map(([lat, lng]) => [lat, lng])
    const fallback = [[46.3105761, 0.1725793]]
    const bounds = L.latLngBounds(latLngTuples.length ? latLngTuples : fallback)
    map.fitBounds(bounds, { maxZoom: 19, animate: true })
    // Copy only the first coordinate pair (lat, lng) to clipboard
    try {
      const coordinates = coords[0]
      if (coordinates) {
        navigator.clipboard.writeText(`${coordinates[0]}, ${coordinates[1]}`)
      }
    } catch (e) {}
  }
}