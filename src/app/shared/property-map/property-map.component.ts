
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  ElementRef,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
  id?: number;
  latitude: number;
  longitude: number;
  title: string;
}

@Component({
  selector: 'app-property-map',
  standalone: true,
  template: `<div #mapContainer class="map-container"></div>`,
  styles: [
    `
      .map-container {
        width: 100%;
        height: 100%;
        min-height: 260px;
        border-radius: 12px;
        z-index: 0;
      }
    `
  ]
})
export class PropertyMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  // Single-marker mode (used on the property detail page).
  @Input() latitude = 0;
  @Input() longitude = 0;
  @Input() title = 'Property location';

  // Multi-marker mode (used on the Services page map preview).
  // When this array is non-empty it takes priority over latitude/longitude.
  @Input() markers: MapMarker[] = [];

  @Input() zoom = 14;

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private markerLayer: L.LayerGroup | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['latitude'] || changes['longitude'] || changes['markers'])) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    const points = this.resolvePoints();
    if (points.length === 0) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [points[0].latitude, points[0].longitude],
      zoom: this.zoom,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
    this.renderMarkers();
  }

  private renderMarkers(): void {
    if (!this.map) return;

    const points = this.resolvePoints();
    if (points.length === 0) return;

    if (!this.markerLayer) {
      this.markerLayer = L.layerGroup().addTo(this.map);
    }
    this.markerLayer.clearLayers();

    points.forEach((point) => {
      L.marker([point.latitude, point.longitude])
        .bindPopup(point.title)
        .addTo(this.markerLayer!);
    });

    if (points.length > 1) {
      // Fit the map to show every marker rather than just centering on one.
      const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
      this.map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      this.map.setView([points[0].latitude, points[0].longitude], this.zoom);
    }
  }

  private resolvePoints(): MapMarker[] {
    if (this.markers && this.markers.length > 0) {
      return this.markers.filter((m) => this.isValidCoord(m.latitude, m.longitude));
    }
    if (this.isValidCoord(this.latitude, this.longitude)) {
      return [{ latitude: this.latitude, longitude: this.longitude, title: this.title }];
    }
    return [];
  }

  private isValidCoord(lat: number, lng: number): boolean {
    return lat !== 0 && lng !== 0 && !Number.isNaN(lat) && !Number.isNaN(lng);
  }
}
