<script lang="ts">
	import { events } from '$lib/data/events';

	const toneColors: Record<string, string> = {
		blue: 'border-l-primary',
		amber: 'border-l-warning',
		emerald: 'border-l-success'
	};
</script>

<svelte:head>
	<title>Calendario — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold tracking-tight">Calendario</h1>
		<p class="mt-1 text-sm text-muted-foreground">Eventi e appuntamenti</p>
	</div>

	<!-- Event list (placeholder for full calendar) -->
	<div class="space-y-3">
		{#each events as event}
			<div class="rounded-lg border border-border border-l-4 {toneColors[event.tone] ?? ''} bg-card p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-sm font-medium text-foreground">{event.title}</h3>
						<p class="mt-1 text-xs text-muted-foreground">{event.group} · {event.location}</p>
					</div>
					<div class="text-right">
						<p class="text-sm font-medium text-foreground">{event.date}</p>
						<p class="text-xs text-muted-foreground">{event.startTime} – {event.endTime}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<p class="mt-6 text-center text-xs text-muted-foreground">La vista calendario completa sarà implementata qui.</p>
</div>
