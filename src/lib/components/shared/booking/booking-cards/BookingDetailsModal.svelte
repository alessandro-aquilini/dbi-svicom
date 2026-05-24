<script lang="ts">
	import { getUserById } from '$lib/data/users';
	import { getPropertyById } from '$lib/data/properties';
	import { getBookingInfo, type Booking, type BookingInfo } from '$lib/data/ticket/booking';
	import type { Service } from '$lib/data/services';
	import * as Dialog from '$lib/components/ui/dialog';
	import { StatusBadge } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Calendar03Icon,
		Location01Icon,
		Message01Icon,
		Tick01Icon,
		Clock01Icon,
		InformationCircleIcon,
		Cancel01Icon,
		PackageIcon
	} from '@hugeicons/core-free-icons';

	let { booking, service, view, open = $bindable(false) }: {
		booking: Booking;
		service?: Service;
		view: 'supplier' | 'resident';
		open?: boolean;
	} = $props();

	const info = $derived(getBookingInfo(booking));
	const resident = $derived(getUserById(booking.residentId));
	const supplier = $derived(service ? getUserById(service.supplierId) : undefined);
	const property = $derived(info.propertyId ? getPropertyById(info.propertyId) : undefined);
	const collaboratorLabel = $derived(view === 'supplier' ? 'Richiedente' : 'Fornitore');
	const collaboratorName = $derived(
		view === 'supplier' ? resident?.name ?? 'Residente' : supplier?.name ?? 'Fornitore'
	);
	const chatLink = $derived(
		view === 'resident'
			? `/resident/services/chat?id=${booking.id}`
			: `/supplier/chat?id=${booking.residentId}`
	);

	const propertyPlace = $derived(
		(property?.name ?? info.propertyId ?? 'Indirizzo non definito') + 
		(info.place ? `, ${info.place}` : '')
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
			: info.status === 'closed'
			? 'Chiuso'
			: info.status === 'unknown'
			? 'Da verificare'
			: info.status
	);

	const statusVariant = $derived<import('$lib/types').StatusVariant>(
		info.status === 'confirmed'
			? 'success'
			: info.status === 'requested'
			? 'warning'
			: info.status === 'closed'
			? 'success'
			: info.status === 'unknown'
			? 'muted'
			: 'destructive'
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

	function eventLabel(kind: string) {
		switch (kind) {
			case 'booking_created':
				return 'Richiesta inviata';
			case 'confirmed':
				return 'Confermato';
			case 'booking_updated':
				return 'Aggiornato';
			case 'cancelled':
				return 'Annullato';
			case 'declined':
				return 'Rifiutato';
			case 'closed':
				return 'Chiuso';
			default:
				return 'Evento';
		}
	}
</script>

<Dialog.Root bind:open={open}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto p-0 gap-0 sm:max-w-xl rounded-xl">
		<div class="relative p-6 space-y-8">
			<Dialog.Header class="space-y-6">
				<div class="space-y-4">
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0 space-y-1">
							<p class="text-[10px] font-bold uppercase tracking-widest text-[#5D7D94]/70">Dettagli Servizio</p>
							<Dialog.Title class="text-2xl font-black tracking-tight text-foreground leading-tight">
								{info.serviceName}
							</Dialog.Title>
						</div>
						<StatusBadge label={statusLabel} variant={statusVariant} />
					</div>
					
					<div class="flex flex-wrap gap-4 text-sm font-medium">
						<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
							<span class="text-muted-foreground">{collaboratorLabel}:</span>
							<span class="text-foreground">{collaboratorName}</span>
						</div>
					</div>
				</div>

				{#if info.description}
					<div class="rounded-2xl bg-[#5D7D94]/5 border border-[#5D7D94]/10 p-4">
						<div class="flex gap-3">
							<HugeiconsIcon icon={InformationCircleIcon} size="18" class="text-[#5D7D94] shrink-0 mt-0.5" />
							<p class="text-sm leading-relaxed text-foreground/80">{info.description}</p>
						</div>
					</div>
				{/if}
			</Dialog.Header>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="group flex items-center gap-4 rounded-2xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/40">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm group-hover:scale-110 transition-transform">
						<HugeiconsIcon icon={Calendar03Icon} size="20" class="text-[#5D7D94]" />
					</div>
					<div class="min-w-0">
						<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Programmato</p>
						<p class="text-[13px] font-bold text-foreground leading-tight">{formatSlot(info.slot)}</p>
						<p class="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Agg: {formatDate(info.updatedAt)}</p>
					</div>
				</div>

				<div class="group flex items-center gap-4 rounded-2xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/40">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm group-hover:scale-110 transition-transform">
						<HugeiconsIcon icon={Location01Icon} size="20" class="text-[#5D7D94]" />
					</div>
					<div class="min-w-0">
						<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Luogo</p>
						<p class="text-[13px] font-bold text-foreground leading-tight truncate">{propertyPlace}</p>
						{#if info.propertyId}
							<p class="text-[10px] text-muted-foreground mt-0.5 truncate">{info.propertyId}</p>
						{/if}
					</div>
				</div>
			</div>

			{#if booking.timeline?.length}
				<div class="space-y-6">
					<div class="flex items-center gap-2">
						<div class="h-px flex-1 bg-border"></div>
						<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 whitespace-nowrap">Timeline attività</p>
						<div class="h-px flex-1 bg-border"></div>
					</div>
					
					<div class="relative space-y-6 before:absolute before:left-2.75 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-linear-to-b before:from-[#5D7D94]/30 before:to-transparent">
						{#each booking.timeline as event (event.id)}
							<div class="relative pl-8">
								<div class="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-4 ring-card">
									<div class="h-2 w-2 rounded-full bg-[#5D7D94]"></div>
								</div>
								<div class="space-y-1.5">
									<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
										<span class="text-sm font-black text-foreground">{eventLabel(event.kind)}</span>
										<div class="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md">
											<HugeiconsIcon icon={Clock01Icon} size="12" />
											{formatDate(event.at)}
										</div>
									</div>
									{#if event.description}
										<p class="text-[13px] leading-relaxed text-muted-foreground">{event.description}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<Dialog.Footer class="px-6 pt-4 pb-6 border-t border-border bg-muted/20 sm:flex-row sm:items-center sm:justify-between gap-4">
			<a
				href={chatLink}
				class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5D7D94] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#5D7D94]/20 transition-all hover:bg-[#5D7D94]/90 active:scale-95"
			>
				<HugeiconsIcon icon={Message01Icon} size="18" />
				Vai alla conversazione
			</a>
			<button
				type="button"
				class="px-6 py-3 rounded-xl border border-border bg-background text-sm font-bold text-foreground transition-all hover:bg-muted hover:border-muted-foreground/20"
				onclick={() => (open = false)}
			>
				Chiudi
			</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
