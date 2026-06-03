<script lang="ts">
	import { getCurrentStatus, getTicketsBySupplierId, type Ticket } from '$lib/data/ticket/tickets';
	import { bookings, inferBookingStatus } from '$lib/data/ticket/booking';
	import { quotes } from '$lib/data/embeds/quotes';
	import { getCurrentUser } from '$lib/auth';
	import { services } from '$lib/data/services';
	import { getUserById } from '$lib/data/users';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Wrench01Icon, 
		LegalDocumentIcon, 
		Clock01Icon, 
		CheckListIcon,
		AlertCircleIcon
	} from '@hugeicons/core-free-icons';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';

	// Filters
	const myTickets = getTicketsBySupplierId(supplierId);
	const myBookings = bookings.filter((b) => {
		const service = services.find((s) => s.id === b.serviceId);
		return service?.supplierId === supplierId;
	});
	const myQuotes = quotes.filter((q) => q.supplierId === supplierId);

	// Stats
	const activeTickets = myTickets.filter((t) => {
		const status = getCurrentStatus(t);
		return status !== 'closed' && status !== 'completed' && status !== 'paid';
	});

	const pendingBookings = myBookings.filter((b) => inferBookingStatus(b) === 'requested');

	const stats = [
		{
			label: 'Interventi attivi',
			value: activeTickets.length,
			icon: Wrench01Icon,
			color: 'text-primary',
			bg: 'bg-primary/10'
		},
		{
			label: 'Richieste servizi',
			value: pendingBookings.length,
			icon: Clock01Icon,
			color: 'text-warning',
			bg: 'bg-warning/10'
		},
		{
			label: 'Preventivi in sospeso',
			value: myQuotes.filter(q => new Date(q.expiresAt).getTime() >= Date.now()).length,
			icon: LegalDocumentIcon,
			color: 'text-info',
			bg: 'bg-info/10'
		}
	];

	// Recent activity (mix of tickets and bookings)
	const recentActivity = [
		...activeTickets.map(t => ({ 
			id: t.id, 
			title: t.title, 
			subtitle: 'Intervento tecnico', 
			date: t.eventTimeline[t.eventTimeline.length - 1]?.at || '',
			type: 'ticket',
			status: getCurrentStatus(t)
		})),
		...myBookings.map(b => {
			const service = services.find(s => s.id === b.serviceId);
			const resident = getUserById(b.residentId);
			return {
				id: b.id,
				title: service?.name || 'Servizio',
				subtitle: `Richiesto da ${resident?.name || 'Residente'}`,
				date: b.timeline?.[b.timeline.length - 1]?.at || '',
				type: 'booking',
				status: inferBookingStatus(b)
			};
		})
	].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

	function formatTime(iso: string) {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
	}

	const statusColors: Record<string, string> = {
		requested: 'bg-warning/10 text-warning border-warning/20',
		confirmed: 'bg-primary/10 text-primary border-primary/20',
		performed: 'bg-success/10 text-success border-success/20',
		open: 'bg-primary/10 text-primary border-primary/20',
		'in-progress': 'bg-warning/10 text-warning border-warning/20'
	};
</script>

<svelte:head>
	<title>Dashboard — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="flex flex-col gap-6 p-4 lg:p-8">
	<!-- Welcome Header -->
	<div class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Benvenuto, {currentUser?.name?.split(' ')[0] || 'Team'}</h1>
		<p class="text-sm text-muted-foreground">Ecco cosa sta succedendo oggi nei tuoi condomìni.</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each stats as stat}
			<div class="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md">
				<div class="flex items-center justify-between">
					<div class="flex flex-col gap-1">
						<span class="text-sm font-medium text-muted-foreground">{stat.label}</span>
						<span class="text-3xl font-bold tracking-tight">{stat.value}</span>
					</div>
					<div class="flex h-12 w-12 items-center justify-center rounded-xl {stat.bg} {stat.color}">
						<HugeiconsIcon icon={stat.icon} size={24} strokeWidth={1.5} />
					</div>
				</div>
				<!-- Decorative pattern -->
				<div class="absolute -bottom-2 -right-2 opacity-[0.03] transition-transform group-hover:scale-110 pointer-events-none">
					<HugeiconsIcon icon={stat.icon} size={80} strokeWidth={1} />
				</div>
			</div>
		{/each}
	</div>

	<!-- Main Content Area -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		
		<!-- Activities Card -->
		<div class="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
			<div class="flex items-center justify-between border-b border-border px-5 py-4">
				<div class="flex items-center gap-2">
					<HugeiconsIcon icon={CheckListIcon} size={20} class="text-muted-foreground" />
					<h2 class="font-semibold">Attività Recenti</h2>
				</div>
				<a href="/supplier/jobs" class="text-xs font-medium text-primary hover:underline">Vedi tutto</a>
			</div>
			
			<div class="flex flex-col divide-y divide-border">
				{#each recentActivity as item}
					<div class="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<HugeiconsIcon icon={item.type === 'ticket' ? Wrench01Icon : Clock01Icon} size={18} />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<h3 class="truncate text-sm font-medium">{item.title}</h3>
								{#if item.status}
									<span class="rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold {statusColors[item.status] || 'bg-muted text-muted-foreground border-border'}">
										{item.status}
									</span>
								{/if}
							</div>
							<p class="truncate text-xs text-muted-foreground">{item.subtitle}</p>
						</div>
						<span class="shrink-0 text-[10px] font-medium text-muted-foreground">{formatTime(item.date)}</span>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
						<HugeiconsIcon icon={AlertCircleIcon} size={32} class="mb-2 opacity-20" />
						<p class="text-sm">Nessuna attività recente</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Quick Actions / Info -->
		<div class="flex flex-col gap-6">
			<!-- Banner info -->
			<div class="rounded-2xl bg-primary px-6 py-8 text-primary-foreground shadow-lg shadow-primary/20">
				<h3 class="text-lg font-bold">Hai bisogno di aiuto?</h3>
				<p class="mt-2 text-sm text-primary-foreground/80">Contatta il team di gestione Svicom per qualsiasi dubbio sui pagamenti o sui nuovi interventi assegnati.</p>
				<button class="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary transition-transform active:scale-95">
					Apri Assistenza
				</button>
			</div>

			<!-- Mobile optimization hint -->
			<div class="rounded-2xl border border-dashed border-border p-6 text-center">
				<HugeiconsIcon icon={LegalDocumentIcon} size={24} class="mx-auto mb-3 text-muted-foreground" />
				<h4 class="text-sm font-medium">Gestione Documenti</h4>
				<p class="mt-1 text-xs text-muted-foreground">Carica le tue fatture e i DURC direttamente dallo smartphone scattando una foto.</p>
			</div>
		</div>

	</div>
</div>

<style>
	/* Custom animations or utilities if needed */
</style>
