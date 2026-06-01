<script lang="ts">
	import { PageHeader, EmptyState } from '$lib/components/shared';
	import PropertiesMap from '$lib/components/shared/PropertiesMap.svelte';
	import { supplierTasks, type supplierTask } from '$lib/data/embeds/supplierTasks';
	import { getPropertyById, type Property } from '$lib/data/properties';
	import { getCurrentUserId } from '$lib/auth';
	import { formatTime } from '$lib/components/view-supplier/calendar/utils';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { MapPinIcon, Clock03Icon, Calendar03Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import { getServiceById } from '$lib/data/services';
	import {
		getBookingsBySupplierId,
		getActiveBookings
	} from '$lib/data/ticket/booking';
	import ActiveBookingCard from '$lib/components/shared/booking/booking-card/ActiveBookingCard.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	const supplierId = getCurrentUserId() || 'frn-idroclima-nord';

	// 1. Upcoming Intervention Tasks (sopralluoghi/interventi)
	const now = new Date();
	const upcomingTasks = $derived(
		supplierTasks
			.filter((t) => t.supplierId === supplierId)
			.map(
				(t) =>
					({ ...t, dateObj: new Date(`${t.date}T${t.startTime}`) } as unknown as supplierTask & {
						dateObj: Date;
					})
			)
			.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
			.filter((t) => t.dateObj >= now)
			.slice(0, 4)
	);

	// 2. Active Service Bookings (prenotazioni record)
	const allBookings = $derived(getBookingsBySupplierId(supplierId));
	const activeBookings = $derived(getActiveBookings(allBookings));

	// Unique properties for the map based on upcoming tasks
	const upcomingProperties = $derived(
		Array.from(new Set(upcomingTasks.map((t) => t.propertyId)))
			.map((id) => getPropertyById(id))
			.filter(Boolean) as Property[]
	);

	function taskDateLabel(t: supplierTask) {
		const d = new Date(`${t.date}T${t.startTime}`);
		return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
	}
</script>

<svelte:head>
	<title>Dashboard Fornitore — Svicom</title>
</svelte:head>

<div class="space-y-10 p-4 sm:p-6 lg:p-8">
	<PageHeader title="Dashboard" subtitle="Benvenuto. Ecco le tue attività prioritarie per oggi.">
		<Button variant="outline" size="sm" href="/supplier/calendar">
			<HugeiconsIcon icon={Calendar03Icon} size={16} class="mr-2" />
			Calendario completo
		</Button>
	</PageHeader>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
		<!-- Left: Main Activity Feed -->
		<div class="space-y-10 lg:col-span-8">
			
			<!-- Section: Active Bookings -->
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-xl font-bold tracking-tight">Servizi in corso</h2>
						<p class="text-sm text-muted-foreground">Richieste di prenotazione confermate o da gestire.</p>
					</div>
					{#if activeBookings.length > 0}
						<Badge variant="secondary" class="h-8 px-3 font-bold">
							{activeBookings.length}
						</Badge>
					{/if}
				</div>

				{#if activeBookings.length > 0}
					<div class="grid gap-4 sm:grid-cols-2">
						{#each activeBookings as booking (booking.id)}
							<ActiveBookingCard
								{booking}
								service={getServiceById(booking.serviceId)}
								view="supplier"
							/>
						{/each}
					</div>
				{:else}
					<EmptyState
						icon="✨"
						message="Ottimo lavoro! Non hai servizi in attesa di intervento al momento."
					/>
				{/if}
			</section>

			<!-- Section: Upcoming Event Tasks -->
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-xl font-bold tracking-tight">Prossimi interventi</h2>
						<p class="text-sm text-muted-foreground">Sopralluoghi e manutenzioni pianificate a calendario.</p>
					</div>
					<Button variant="ghost" size="sm" class="text-xs" href="/supplier/calendar">
						Vedi tutti
						<HugeiconsIcon icon={ArrowRight01Icon} size={14} class="ml-1" />
					</Button>
				</div>

				{#if upcomingTasks.length > 0}
					<div class="grid gap-3">
						{#each upcomingTasks as t}
							<div class="group flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 sm:flex-row sm:items-center">
								<div class="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-muted/50 px-4 py-3 text-center sm:w-20">
									<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">{taskDateLabel(t).split(' ')[1]}</span>
									<span class="text-2xl font-black text-foreground">{taskDateLabel(t).split(' ')[0]}</span>
								</div>
								
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<Badge variant="outline" class="h-5 px-1.5 text-[10px] font-bold uppercase tracking-tight">
											{t.type}
										</Badge>
										<span class="text-xs text-muted-foreground">{t.startTime} — {t.endTime}</span>
									</div>
									<h3 class="mt-1 text-lg font-bold leading-tight group-hover:text-primary transition-colors">{t.title}</h3>
									<div class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
										<HugeiconsIcon icon={MapPinIcon} size={14} />
										<span class="truncate">{t.location}</span>
									</div>
								</div>

								<div class="flex items-center gap-2 pt-2 sm:pt-0">
									<Button variant="secondary" size="sm" class="h-9 px-4 text-xs font-semibold">
										Dettagli
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<EmptyState message="Nessun sopralluogo o intervento pianificato per i prossimi giorni." />
				{/if}
			</section>
		</div>

		<!-- Right: Sidebar / Insights -->
		<aside class="space-y-8 lg:col-span-4">
			<!-- Map Section -->
			<div class="space-y-4">
				<h3 class="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Posizioni attive</h3>
				<div class="h-72 w-full overflow-hidden rounded-3xl border border-border bg-card p-1 shadow-sm">
					{#if upcomingProperties.length > 0}
						<PropertiesMap properties={upcomingProperties} />
					{:else}
						<div class="flex h-full items-center justify-center bg-muted/30 text-xs text-muted-foreground">
							Mappa non disponibile
						</div>
					{/if}
				</div>
				{#if upcomingProperties.length > 0}
					<div class="flex flex-wrap gap-2 pt-1">
						{#each upcomingProperties as p}
							<Badge variant="outline" class="rounded-lg bg-card/50 text-[11px]">
								{p.name}
							</Badge>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Quick Stats or Info -->
			<div class="rounded-3xl bg-primary/5 p-6 border border-primary/10">
				<h4 class="font-bold text-primary">Consiglio del giorno</h4>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
					Ricorda di scattare le foto prima e dopo ogni intervento tecnico per velocizzare la chiusura della pratica da parte dell'amministratore.
				</p>
			</div>
		</aside>
	</div>
</div>