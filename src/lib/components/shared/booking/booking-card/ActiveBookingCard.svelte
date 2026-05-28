<script lang="ts">
	import { goto } from '$app/navigation';
	import { getUserById } from '$lib/data/users';
	import { getBookingInfo, type Booking, type BookingInfo, updateBookingStatusAction } from '$lib/data/ticket/booking';
	import type { Service } from '$lib/data/services';
	import type { StatusVariant } from '$lib/types';
	import { StatusBadge } from '$lib/components/shared';
	import { Button } from '$lib/components/ui/button';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Calendar03Icon, Location01Icon, Message01Icon } from '@hugeicons/core-free-icons';

	const { booking, service, view }: {
		booking: Booking;
		service?: Service;
		view: 'supplier' | 'resident';
	} = $props();

	let isProcessingStatus = $state(false);

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
	const summaryDate = $derived(
		info.slot 
			? `${new Date(info.slot.start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} · ${new Date(info.slot.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
			: (info.createdAt ? new Date(info.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'Data non definita')
	);

	function formatSlot(slot?: BookingInfo['slot']) {
		if (!slot) return 'Orario da definire';
		const starts = new Date(slot.start).toLocaleTimeString('it-IT', {
			hour: '2-digit',
			minute: '2-digit'
		});
		const ends = new Date(slot.end).toLocaleTimeString('it-IT', {
			hour: '2-digit',
			minute: '2-digit'
		});
		const day = new Date(slot.start).toLocaleDateString('it-IT', {
			day: '2-digit',
			month: 'short'
		});
		return `${day} · ${starts} – ${ends}`;
	}

	function stopPropagation(event: MouseEvent) {
		event.stopPropagation();
	}

	function handleUpdateStatus(kind: any) {
		if (isProcessingStatus) return;
		isProcessingStatus = true;
		updateBookingStatusAction(booking.id, kind, view === 'supplier' ? (service?.supplierId ?? 'system') : booking.residentId);
		
		setTimeout(() => {
			isProcessingStatus = false;
		}, 100);
	}

	function openChat() {
		goto(chatLink);
	}
</script>

<div
	role="button"
	tabindex="0"
	class="group relative overflow-hidden rounded-[1.25rem] border border-border bg-card p-5 transition-all duration-300 hover:border-[#5D7D94]/30 active:scale-[0.98] cursor-pointer"
	onclick={openChat}
	onkeydown={(event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			openChat();
			event.preventDefault();
		}
	}}
>
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0">
			<div class="flex items-center gap-2">
				<h3 class="truncate text-base font-bold tracking-tight text-foreground">
					{info.serviceName}
				</h3>
				<StatusBadge label={statusLabel} variant={statusVariant} />
			</div>
			<p class="mt-1 text-xs font-medium text-muted-foreground">
				{collaboratorLabel} <span class="text-foreground">{collaboratorName}</span>
			</p>
		</div>
		<a
			href={chatLink}
			class="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 text-[#5D7D94] transition-colors hover:bg-[#5D7D94] hover:text-white"
			onclick={stopPropagation}
			aria-label="Apri chat"
		>
			<HugeiconsIcon icon={Message01Icon} size="18" />
		</a>
	</div>

	<div class="mt-5 grid gap-4 rounded-xl bg-secondary/30 p-3 sm:grid-cols-2">
		<div class="flex items-center gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-background shadow-sm">
				<HugeiconsIcon icon={Calendar03Icon} size="16" class="text-[#5D7D94]" />
			</div>
			<div>
				<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Data</p>
				<p class="text-xs font-semibold text-foreground">{summaryDate}</p>
			</div>
		</div>
		<div class="flex items-center gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-background shadow-sm">
				<HugeiconsIcon icon={Location01Icon} size="16" class="text-[#5D7D94]" />
			</div>
			<div class="min-w-0">
				<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Luogo</p>
				<p class="truncate text-xs font-semibold text-foreground">{info.place ?? 'Indirizzo non definito'}</p>
			</div>
		</div>
	</div>

	{#if view === 'supplier' && (info.status === 'requested' || ['confirmed', 'booking_updated'].includes(info.status))}
		<div class="mt-5 flex gap-2" onclick={stopPropagation} role="none">
			{#if info.status === 'requested'}
				<Button
					size="sm"
					class="h-9 flex-1 rounded-xl bg-[#5D7D94] text-xs font-bold hover:bg-[#5D7D94]/90"
					disabled={isProcessingStatus}
					onclick={() => handleUpdateStatus('confirmed')}
				>
					Accetta
				</Button>
				<Button
					size="sm"
					variant="outline"
					class="h-9 flex-1 rounded-xl border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
					disabled={isProcessingStatus}
					onclick={() => handleUpdateStatus('declined')}
				>
					Declina
				</Button>
			{:else}
				<Button
					size="sm"
					class="h-9 flex-1 rounded-xl bg-[#5D7D94] text-xs font-bold hover:bg-[#5D7D94]/90"
					disabled={isProcessingStatus}
					onclick={() => handleUpdateStatus('closed')}
				>
					Chiudi
				</Button>
				<Button
					size="sm"
					variant="outline"
					class="h-9 flex-1 rounded-xl border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
					disabled={isProcessingStatus}
					onclick={() => handleUpdateStatus('cancelled')}
				>
					Cancella
				</Button>
			{/if}
		</div>
	{/if}
</div>
