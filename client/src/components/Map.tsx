/// <reference types="@types/google.maps" />

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: any;
  }
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

/**
 * Mapa Mockado - Versão sem Google Maps
 * Funciona 100% localmente sem precisar de chave de API
 * 
 * Recursos:
 * - Grid visual representando o mapa
 * - Suporta polylines (linhas de rota)
 * - Suporta marcadores
 * - Zoom e pan
 * - Totalmente compatível com o código que espera google.maps.Map
 */

interface MockMarker {
  position: { lat: number; lng: number };
  title?: string;
  icon?: string;
  remove?: () => void;
}

interface MockPolyline {
  path: { lat: number; lng: number }[];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  setMap?: (map: any) => void;
}

class MockGoogleMap {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private center: { lat: number; lng: number };
  private zoom: number;
  private markers: MockMarker[] = [];
  private polylines: MockPolyline[] = [];
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

  constructor(
    container: HTMLDivElement,
    options: {
      zoom?: number;
      center?: { lat: number; lng: number };
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      streetViewControl?: boolean;
      mapId?: string;
    }
  ) {
    this.container = container;
    this.zoom = options.zoom || 12;
    this.center = options.center || { lat: 37.7749, lng: -122.4194 };

    // Criar canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.display = "block";
    this.canvas.style.cursor = "grab";

    this.ctx = this.canvas.getContext("2d")!;
    container.appendChild(this.canvas);

    // Event listeners
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.onMouseUp());
    this.canvas.addEventListener("wheel", (e) => this.onWheel(e));

    // Desenhar mapa inicial
    this.draw();
  }

  private latLngToPixel(lat: number, lng: number): { x: number; y: number } {
    const metersPerPixel = 40075000 / Math.pow(2, this.zoom + 8);
    const x =
      (lng - this.center.lng) / metersPerPixel +
      this.canvas.width / 2;
    const y =
      (this.center.lat - lat) / metersPerPixel +
      this.canvas.height / 2;
    return { x, y };
  }

  private pixelToLatLng(x: number, y: number): { lat: number; lng: number } {
    const metersPerPixel = 40075000 / Math.pow(2, this.zoom + 8);
    const lng = this.center.lng + (x - this.canvas.width / 2) * metersPerPixel;
    const lat = this.center.lat - (y - this.canvas.height / 2) * metersPerPixel;
    return { lat, lng };
  }

  private onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.canvas.style.cursor = "grabbing";
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;

    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;

    const metersPerPixel = 40075000 / Math.pow(2, this.zoom + 8);
    this.center.lng -= (dx * metersPerPixel) / this.canvas.width;
    this.center.lat += (dy * metersPerPixel) / this.canvas.height;

    this.dragStart = { x: e.clientX, y: e.clientY };
    this.draw();
  }

  private onMouseUp() {
    this.isDragging = false;
    this.canvas.style.cursor = "grab";
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    this.zoom = Math.max(0, Math.min(20, this.zoom + delta));
    this.draw();
  }

  private draw() {
    // Limpar canvas
    this.ctx.fillStyle = "#e0f2fe";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenhar grid
    this.drawGrid();

    // Desenhar polylines
    this.drawPolylines();

    // Desenhar marcadores
    this.drawMarkers();

    // Desenhar informações
    this.drawInfo();
  }

  private drawGrid() {
    this.ctx.strokeStyle = "#94a3b8";
    this.ctx.lineWidth = 0.5;
    this.ctx.globalAlpha = 0.3;

    const gridSize = 0.01;
    const startLat = Math.floor(this.center.lat / gridSize) * gridSize;
    const startLng = Math.floor(this.center.lng / gridSize) * gridSize;

    for (let lat = startLat - 0.1; lat < startLat + 0.1; lat += gridSize) {
      const p1 = this.latLngToPixel(lat, startLng - 0.1);
      const p2 = this.latLngToPixel(lat, startLng + 0.1);
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    }

    for (let lng = startLng - 0.1; lng < startLng + 0.1; lng += gridSize) {
      const p1 = this.latLngToPixel(startLat - 0.1, lng);
      const p2 = this.latLngToPixel(startLat + 0.1, lng);
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1;
  }

  private drawPolylines() {
    this.polylines.forEach((polyline) => {
      if (polyline.path.length < 2) return;

      this.ctx.strokeStyle = polyline.strokeColor || "#3b82f6";
      this.ctx.lineWidth = polyline.strokeWeight || 3;
      this.ctx.globalAlpha = polyline.strokeOpacity || 0.7;

      this.ctx.beginPath();
      const firstPoint = this.latLngToPixel(
        polyline.path[0].lat,
        polyline.path[0].lng
      );
      this.ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < polyline.path.length; i++) {
        const point = this.latLngToPixel(
          polyline.path[i].lat,
          polyline.path[i].lng
        );
        this.ctx.lineTo(point.x, point.y);
      }

      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    });
  }

  private drawMarkers() {
    this.markers.forEach((marker) => {
      const pixel = this.latLngToPixel(marker.position.lat, marker.position.lng);

      // Desenhar marcador
      this.ctx.fillStyle = "#ef4444";
      this.ctx.beginPath();
      this.ctx.arc(pixel.x, pixel.y, 8, 0, Math.PI * 2);
      this.ctx.fill();

      // Desenhar borda
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Desenhar título se existir
      if (marker.title) {
        this.ctx.fillStyle = "#1f2937";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(marker.title, pixel.x, pixel.y - 15);
      }
    });
  }

  private drawInfo() {
    this.ctx.fillStyle = "#1f2937";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      `Zoom: ${this.zoom} | Lat: ${this.center.lat.toFixed(4)} | Lng: ${this.center.lng.toFixed(4)}`,
      10,
      20
    );
    this.ctx.fillText("Arraste para mover | Scroll para zoom", 10, 35);
  }

  setCenter(center: { lat: number; lng: number }) {
    this.center = center;
    this.draw();
  }

  setZoom(zoom: number) {
    this.zoom = Math.max(0, Math.min(20, zoom));
    this.draw();
  }

  addMarker(marker: MockMarker) {
    this.markers.push(marker);
    this.draw();
  }

  addPolyline(polyline: MockPolyline) {
    this.polylines.push(polyline);
    this.draw();
  }

  clearMarkers() {
    this.markers = [];
    this.draw();
  }

  clearPolylines() {
    this.polylines = [];
    this.draw();
  }
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  const init = usePersistFn(() => {
    if (!mapContainer.current) {
      console.error("❌ Map container não encontrado");
      return;
    }

    // Criar mapa mockado
    map.current = new MockGoogleMap(mapContainer.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
      mapId: "DEMO_MAP_ID",
    });

    console.log("✅ Mapa mockado inicializado com sucesso");

    // Criar objeto compatível com google.maps.Map
    const mockMapObject = {
      ...map.current,
      marker: {
        AdvancedMarkerElement: class {
          constructor(options: any) {
            if (options.map) {
              options.map.addMarker({
                position: options.position,
                title: options.title,
              });
            }
          }
          remove() {}
        },
      },
      Polyline: class {
        constructor(options: any) {
          if (options.map) {
            options.map.addPolyline({
              path: options.path,
              strokeColor: options.strokeColor,
              strokeOpacity: options.strokeOpacity,
              strokeWeight: options.strokeWeight,
            });
          }
        }
        setMap() {}
      },
      Marker: class {
        constructor(options: any) {
          if (options.map) {
            options.map.addMarker({
              position: options.position,
              title: options.title,
              icon: options.icon,
            });
          }
        }
      },
    };

    // Adicionar métodos necessários ao mockMapObject
    mockMapObject.setCenter = (center: { lat: number; lng: number }) => {
      map.current.setCenter(center);
    };
    mockMapObject.setZoom = (zoom: number) => {
      map.current.setZoom(zoom);
    };
    mockMapObject.clearMarkers = () => {
      map.current.clearMarkers();
    };
    mockMapObject.clearPolylines = () => {
      map.current.clearPolylines();
    };

    if (onMapReady) {
      onMapReady(mockMapObject);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div
      ref={mapContainer}
      className={cn("w-full h-full bg-blue-100 rounded-lg", className)}
    />
  );
}