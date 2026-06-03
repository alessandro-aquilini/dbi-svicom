<script lang="ts">
	import { page } from "$app/state";
	import { getCurrentUser } from "$lib/auth";
	import {
		getServiceById,
		services,
		type Service,
		type ServiceCategory,
	} from "$lib/data/services";
	import {
		getBookingsBySupplierId,
		getActiveBookings,
		getRecentClosedBookings,
	} from "$lib/data/ticket/booking";
	import { PageHeader, EmptyState } from "$lib/components/shared";
	import ActiveBookingCard from "$lib/components/shared/booking/booking-card/ActiveBookingCard.svelte";
	import HistoryBookingCard from "$lib/components/shared/booking/booking-card/HistoryBookingCard.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { HugeiconsIcon } from "@hugeicons/svelte";
	import {
		ArrowRight01Icon,
		Calendar03Icon,
		Mail01Icon,
		SmartPhone01Icon,
		StarIcon,
	} from "@hugeicons/core-free-icons";

	const currentUser = getCurrentUser();
	const supplierId = $derived(
		page.url.searchParams.get("supplier") ??
			(currentUser?.role === "supplier"
				? currentUser?.id
				: "frn-idroclima-nord"),
	);
	const allBookings = $derived(getBookingsBySupplierId(supplierId));
	const activeBookings = $derived(getActiveBookings(allBookings));
	const recentHistory = $derived(getRecentClosedBookings(allBookings, 3));
	const supplierServices = $derived(
		services.filter((service) => service.supplierId === supplierId),
	);

	function getCategoryLabel(cat: ServiceCategory) {
		const labels: Record<ServiceCategory, string> = {
			"cura-animali": "Cura Animali",
			benessere: "Benessere",
			pulizie: "Pulizie",
			mobilita: "Mobilità",
		};
		return labels[cat] || cat;
	}
</script>

<svelte:head>
	<title>Servizi — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="space-y-10 p-4 sm:p-6 lg:p-8">
	<PageHeader
		title="Servizi"
		subtitle="Gestisci le richieste attive e i servizi offerti dal tuo profilo."
	/>

	<!-- Active Bookings -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-semibold text-foreground">
					Servizi in corso
				</h2>
				<p class="text-sm text-muted-foreground">
					Prenotazioni create e non ancora chiuse.
				</p>
			</div>
			<Badge variant="secondary" class="h-8 px-3 text-sm">
				<span class="mr-1 font-bold">{activeBookings.length}</span> richieste
			</Badge>
		</div>

		{#if activeBookings.length > 0}
			<div class="grid gap-4 md:grid-cols-2">
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
				message="Nessuna prenotazione attiva al momento. Torna qui quando riceverai nuove richieste."
			/>
		{/if}
	</section>

	<!-- Services List -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-semibold text-foreground">
					Servizi offerti
				</h2>
				<p class="text-sm text-muted-foreground">
					Elenco dei servizi pubblici caricati nel sistema.
				</p>
			</div>
			<Badge variant="outline" class="h-8 px-3 text-sm">
				<span class="mr-1 font-bold">{supplierServices.length}</span> servizi
			</Badge>
		</div>

		{#if supplierServices.length > 0}
			<div class="grid gap-4 xl:grid-cols-2">
				{#each supplierServices as service (service.id)}
					<a
						href={`/supplier/services/${service.id}`}
						class="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
					>
						<div class="space-y-4">
							<div class="flex items-start justify-between">
								<div class="flex flex-wrap gap-2">
									<Badge
										variant="secondary"
										class="uppercase tracking-wider"
										>{getCategoryLabel(
											service.category,
										)}</Badge
									>
									<Badge
										variant="outline"
										class="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-500"
									>
										<HugeiconsIcon
											icon={StarIcon}
											size={12}
										/>
										{service.rating.toFixed(1)}
									</Badge>
								</div>
								<div
									class="rounded-xl bg-muted/50 px-3 py-1 text-xs font-bold text-foreground"
								>
									{service.pricing}
								</div>
							</div>

							<div>
								<h3
									class="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary"
								>
									{service.name}
								</h3>
								<p
									class="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
								>
									{service.description}
								</p>
							</div>

							<div
								class="grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-2"
							>
								{#if service.availabilityText}
									<div
										class="flex items-center gap-2 text-xs text-muted-foreground"
									>
										<div
											class="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-foreground/70"
										>
											<HugeiconsIcon
												icon={Calendar03Icon}
												size={12}
											/>
										</div>
										{service.availabilityText}
									</div>
								{/if}
								{#if service.contactPhone}
									<div
										class="flex items-center gap-2 text-xs text-muted-foreground"
									>
										<div
											class="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-foreground/70"
										>
											<HugeiconsIcon
												icon={SmartPhone01Icon}
												size={12}
											/>
										</div>
										{service.contactPhone}
									</div>
								{/if}
								{#if service.contactEmail}
									<div
										class="flex items-center gap-2 text-xs text-muted-foreground"
									>
										<div
											class="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-foreground/70"
										>
											<HugeiconsIcon
												icon={Mail01Icon}
												size={12}
											/>
										</div>
										<span class="truncate"
											>{service.contactEmail}</span
										>
									</div>
								{/if}
							</div>
						</div>

						<div
							class="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold"
						>
							<span class="flex items-center gap-1 text-primary">
								Gestisci servizio
							</span>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground"
							>
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									size={16}
									strokeWidth={2.5}
								/>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<EmptyState
				message="Non ci sono servizi pubblicati per questo fornitore."
			/>
		{/if}

		<!-- History -->
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-xl font-semibold text-foreground">
						Cronologia recente
					</h2>
					<p class="text-sm text-muted-foreground">
						Le ultime prenotazioni completate.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					href="/supplier/services/history"
				>
					Vedi tutto
				</Button>
			</div>

			{#if recentHistory.length > 0}
				<div class="grid gap-4">
					{#each recentHistory as booking (booking.id)}
						<HistoryBookingCard
							{booking}
							service={getServiceById(booking.serviceId)}
							view="supplier"
						/>
					{/each}
				</div>
			{:else}
				<EmptyState
					message="Nessuna prenotazione nel registro storico."
				/>
			{/if}
		</section>
	</section>
</div>
