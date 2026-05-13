<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
	import { Building03Icon } from '@hugeicons/core-free-icons';
	import type { Property } from '$lib/data/properties';

	type Props = {
		properties: Property[];
	};

	let { properties }: Props = $props();

	let mapEl: HTMLDivElement | undefined = $state();

	type IconNode = [string, Record<string, string | number>];

	function iconToSvg(icon: IconNode[], size = 14): string {
		const children = icon
			.map(([tag, attrs]) => {
				const a = Object.entries(attrs)
					.filter(([k]) => k !== 'key')
					.map(([k, v]) => {
						const name = k
							.replace(/([A-Z])/g, '-$1')
							.toLowerCase();
						return `${name}="${v}"`;
					})
					.join(' ');
				return `<${tag} ${a} />`;
			})
			.join('');
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none">${children}</svg>`;
	}

	function buildMarkerHtml(): string {
		const svg = iconToSvg(Building03Icon as IconNode[]);
		return `<span class="map-marker"><span class="map-marker__pin">${svg}</span></span>`;
	}

	onMount(() => {
		if (!mapEl) return;

		let map: import('leaflet').Map | undefined;
		let cleanup: (() => void) | undefined;

		(async () => {
			const L = await import('leaflet');
			if (!mapEl) return;

			map = L.map(mapEl, {
				center: [45.4668, 9.1905],
				zoom: 12,
				zoomControl: false,
				attributionControl: false,
				scrollWheelZoom: false
			});

			L.control
				.zoom({ position: 'bottomright' })
				.addTo(map);

			L.tileLayer(
				'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
				{
					subdomains: 'abcd',
					maxZoom: 19,
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
				}
			).addTo(map);

			L.control
				.attribution({ position: 'bottomleft', prefix: false })
				.addTo(map);

			const markerHtml = buildMarkerHtml();
			const icon = L.divIcon({
				className: 'map-marker-wrapper',
				html: markerHtml,
				iconSize: [28, 28],
				iconAnchor: [14, 14]
			});

			const markers: import('leaflet').Marker[] = [];
			for (const p of properties) {
				const m = L.marker([p.coordinates.lat, p.coordinates.lng], { icon })
					.addTo(map)
					.bindTooltip(
						`<strong>${p.name}</strong><br/><span class="text-muted">${p.address.street}</span>`,
						{ direction: 'top', offset: [0, -10], className: 'map-tooltip' }
					);
				markers.push(m);
			}

			if (markers.length > 0) {
				const group = L.featureGroup(markers);
				map.fitBounds(group.getBounds(), { padding: [32, 32], maxZoom: 14 });
			}

			const ro = new ResizeObserver(() => map?.invalidateSize());
			ro.observe(mapEl);

			cleanup = () => {
				ro.disconnect();
				map?.remove();
			};
		})();

		return () => cleanup?.();
	});
</script>

<div class="properties-map" bind:this={mapEl} role="region" aria-label="Mappa dei condomìni"></div>

<style>
	.properties-map {
		width: 100%;
		height: 100%;
		min-height: 320px;
		border-radius: calc(var(--radius) - 2px);
		background: var(--muted);
		overflow: hidden;
		isolation: isolate;
	}

	:global(.map-marker-wrapper) {
		background: transparent;
		border: 0;
	}

	:global(.map-marker) {
		position: relative;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
	}

	:global(.map-marker::before) {
		content: '';
		position: absolute;
		inset: -6px;
		border-radius: 9999px;
		background: color-mix(in oklch, var(--primary) 24%, transparent);
		opacity: 0;
		transform: scale(0.6);
		transition: opacity 160ms ease, transform 160ms ease;
	}

	:global(.map-marker__pin) {
		position: relative;
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 9999px;
		background: var(--primary);
		color: var(--primary-foreground);
		box-shadow:
			0 0 0 3px var(--card),
			0 4px 10px -2px color-mix(in oklch, var(--primary) 55%, transparent);
		transition: transform 160ms ease;
	}

	:global(.map-marker:hover .map-marker__pin),
	:global(.map-marker-wrapper:focus-visible .map-marker__pin) {
		transform: scale(1.08);
	}

	:global(.map-marker:hover::before) {
		opacity: 1;
		transform: scale(1);
	}

	:global(.leaflet-container) {
		font-family: var(--font-sans);
		background: var(--muted);
	}

	:global(.leaflet-control-zoom) {
		border: 1px solid var(--border) !important;
		border-radius: calc(var(--radius) - 4px) !important;
		overflow: hidden;
		box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.08) !important;
	}

	:global(.leaflet-control-zoom a) {
		background: var(--card) !important;
		color: var(--foreground) !important;
		border-bottom: 1px solid var(--border) !important;
		width: 28px !important;
		height: 28px !important;
		line-height: 28px !important;
		font-size: 14px !important;
		font-weight: 500 !important;
	}

	:global(.leaflet-control-zoom a:last-child) {
		border-bottom: 0 !important;
	}

	:global(.leaflet-control-zoom a:hover) {
		background: var(--muted) !important;
	}

	:global(.leaflet-control-attribution) {
		background: color-mix(in oklch, var(--card) 90%, transparent) !important;
		color: var(--muted-foreground) !important;
		font-size: 10px !important;
		padding: 2px 6px !important;
		border-radius: 4px !important;
		margin: 6px !important;
		backdrop-filter: blur(4px);
	}

	:global(.leaflet-control-attribution a) {
		color: var(--foreground) !important;
	}

	:global(.map-tooltip.leaflet-tooltip) {
		background: var(--card);
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) - 4px);
		padding: 6px 10px;
		font-size: 12px;
		line-height: 1.35;
		box-shadow: 0 6px 16px -6px rgb(0 0 0 / 0.18);
	}

	:global(.map-tooltip.leaflet-tooltip::before) {
		border-top-color: var(--card) !important;
	}

	:global(.map-tooltip .text-muted) {
		color: var(--muted-foreground);
	}
</style>
