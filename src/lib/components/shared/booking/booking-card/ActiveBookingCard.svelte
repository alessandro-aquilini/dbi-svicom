<script lang="ts">
	import { getUserById } from '$lib/data/users';
	import { getBookingInfo, type Booking, type BookingInfo } from '$lib/data/ticket/booking';
	import type { Service } from '$lib/data/services';
	import type { StatusVariant } from '$lib/types';
	import { StatusBadge } from '$lib/components/shared';

	const { booking, service, view }: {
		booking: Booking;
		service?: Service;
		view: 'supplier' | 'resident';
	} = $props();

	const info = $derived(getBookingInfo(booking));
	const resident = $derived(getUserById(booking.residentId));
	const supplier = $derived(service ? getUserById(service.supplierId) : undefined);
	const collaboratorLabel = $derived(view === 'supplier' ? 'Richiesto da' : 'Fornitore');
	const collaboratorName = $derived(
		view === 'supplier' ? resident?.name ?? 'Residente' : supplier?.name ?? 'Fornitore'
	);
	const statusLabel = $derived(
		info.status === 'requested'
			? 'Richiesta'
			: info.status === 'confirmed'
			? 'Confermato'
			: info.status === 'cancelled'
			? 'Annullato'
			: info.status === 'declined'
			? 'Rifiutato'
			: info.status === 'unknown'
			? 'Da verificare'
			: info.status
	);
	const statusVariant = $derived<StatusVariant>(
		info.status === 'confirmed'
			? 'success'
			: info.status === 'requested'
			? 'warning'
			: info.status === 'unknown'
			? 'muted'
			: 'destructive'
	);
	const chatLink = $derived(
		view === 'resident'
			? `/resident/services/chat?id=${booking.id}`
			: `/supplier/chat?id=${booking.residentId}`
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
		if (!slot) return 'Orario da definire';
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
		<StatusBadge label={statusLabel} variant={statusVariant} />
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-2">
		<a href={chatLink} class="inline-flex items-center rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20">
			Apri chat
		</a>
	</div>

	<div class="mt-4 space-y-3 text-sm text-muted-foreground">
		<div class="rounded-3xl bg-muted/30 p-4">
			<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Orario</p>
			<p class="mt-2 font-medium text-foreground">{formatSlot(info.slot)}</p>
		</div>

		{#if info.place}
			<div class="rounded-3xl bg-muted/30 p-4">
				<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Luogo</p>
				<p class="mt-2 font-medium text-foreground">{info.place}</p>
			</div>
		{/if}

		<div class="rounded-3xl bg-muted/30 p-4">
			<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Ultimo aggiornamento</p>
			<p class="mt-2 font-medium text-foreground">{formatDate(info.updatedAt)}</p>
		</div>

		{#if info.description}
			<div class="rounded-3xl bg-muted/30 p-4">
				<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Richiesta</p>
				<p class="mt-2 text-sm text-foreground">{info.description}</p>
			</div>
		{/if}
	</div>
</div>
