<script lang="ts">
	import { getUserById } from '$lib/data/users';
	import { getBookingInfo, type Booking, type BookingInfo } from '$lib/data/ticket/booking';
	import type { Service } from '$lib/data/services';
	import { StatusBadge } from '$lib/components/shared';
	import { Clock01Icon, Location01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

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
		if (!slot) return 'Orario non definito';
		const starts = new Date(slot.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
		const ends = new Date(slot.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
		const day = new Date(slot.start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
		return `${day} · ${starts} – ${ends}`;
	}

	function getClosedDateParts(iso?: string) {
		if (!iso) return { day: '--', month: '---' };
		const date = new Date(iso);
		return {
			day: String(date.getDate()).padStart(2, '0'),
			month: date.toLocaleDateString('it-IT', { month: 'short' })
		};
	}
</script>

<div class="group grid gap-4 rounded-3xl border border-border bg-card p-4 text-left shadow-sm transition hover:shadow-lg sm:grid-cols-[96px_minmax(0,1fr)]">
	<div class="flex flex-col items-center justify-between rounded-3xl bg-primary/10 p-3 text-primary">
		<span class="text-2xl font-semibold">{getClosedDateParts(info.closedAt).day}</span>
		<span class="text-[10px] uppercase tracking-[0.3em]">{getClosedDateParts(info.closedAt).month}</span>
	</div>

	<div class="min-w-0">
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="truncate text-sm font-semibold text-foreground">{info.serviceName}</p>
				<p class="truncate text-xs text-muted-foreground">{collaboratorLabel} {collaboratorName}</p>
			</div>
			<StatusBadge label="Chiuso" variant="success" />
		</div>

		<div class="mt-4">
			<a href={chatLink} class="inline-flex items-center rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20">
				Apri chat
			</a>
		</div>

		<div class="mt-3 grid gap-2 sm:grid-cols-2">
			<div class="flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
				<HugeiconsIcon icon={Clock01Icon} size={14} />
				<span>{formatSlot(info.slot)}</span>
			</div>

			{#if info.place}
				<div class="flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
					<HugeiconsIcon icon={Location01Icon} size={14} />
					<span>{info.place}</span>
				</div>
			{/if}
		</div>

		{#if info.description}
			<p class="mt-3 line-clamp-2 text-sm text-muted-foreground">{info.description}</p>
		{/if}
	</div>
</div>
