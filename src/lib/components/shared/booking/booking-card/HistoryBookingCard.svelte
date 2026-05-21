<script lang="ts">
	import { getUserById } from '$lib/data/users';
	import { getBookingInfo, type Booking, type BookingInfo } from '$lib/data/ticket/booking';
	import type { Service } from '$lib/data/services';
	import { StatusBadge } from '$lib/components/shared';

	const { booking, service, view }: {
		booking: Booking;
		service?: Service;
		view: 'supplier' | 'resident';
	} = $props();

	const info = $derived(getBookingInfo(booking));
	const resident = $derived(getUserById(booking.residentId));
	const supplier = $derived(service ? getUserById(service.supplierId) : undefined);
	const collaboratorLabel = $derived(view === 'supplier' ? 'Intervento per' : 'Fornitore');
	const collaboratorName = $derived(
		view === 'supplier' ? resident?.name ?? 'Residente' : supplier?.name ?? 'Fornitore'
	);

	function formatDate(iso?: string) {
		if (!iso) return 'Non definito';
		return new Date(iso).toLocaleString('it-IT', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatSlot(slot?: BookingInfo['slot']) {
		if (!slot) return 'Orario non definito';
		const starts = new Date(slot.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
		const ends = new Date(slot.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
		const day = new Date(slot.start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
		return `${day} · ${starts} – ${ends}`;
	}
</script>

<div class="rounded-3xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div class="space-y-1">
			<p class="text-sm font-semibold text-foreground">{info.serviceName}</p>
			<p class="text-xs text-muted-foreground">{collaboratorLabel} {collaboratorName}</p>
		</div>
		<StatusBadge label="Chiuso" variant="success" />
	</div>

	<div class="mt-4 space-y-3 text-sm text-muted-foreground">
		<div class="rounded-3xl bg-muted/30 p-4">
			<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Chiuso il</p>
			<p class="mt-2 font-medium text-foreground">{formatDate(info.closedAt)}</p>
		</div>

		{#if info.slot}
			<div class="rounded-3xl bg-muted/30 p-4">
				<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Orario</p>
				<p class="mt-2 font-medium text-foreground">{formatSlot(info.slot)}</p>
			</div>
		{/if}

		{#if info.place}
			<div class="rounded-3xl bg-muted/30 p-4">
				<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Indirizzo</p>
				<p class="mt-2 font-medium text-foreground">{info.place}</p>
			</div>
		{/if}

		{#if info.description}
			<div class="rounded-3xl bg-muted/30 p-4">
				<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Note</p>
				<p class="mt-2 text-sm text-foreground">{info.description}</p>
			</div>
		{/if}
	</div>
</div>
