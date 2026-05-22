<script lang="ts">
	import { tick } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Chat01Icon, Message01Icon } from '@hugeicons/core-free-icons';
	import { getCurrentUser } from '$lib/auth';
	import { getBookingById, getBookingsByResidentId, getBookingInfo, type BookingMessage } from '$lib/data/ticket/booking';
	import { getServiceById } from '$lib/data/services';
	import { getUserById } from '$lib/data/users';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ChatBubble from '$lib/components/shared/chat-cards/ChatBubble.svelte';
	import ChatQuoteCard from '$lib/components/shared/chat-cards/ChatQuoteCard.svelte';
	import ChatInvoiceCard from '$lib/components/shared/chat-cards/ChatInvoiceCard.svelte';
	import ChatPaymentCard from '$lib/components/shared/chat-cards/ChatPaymentCard.svelte';
	import ChatTimelineEvent from '$lib/components/shared/chat-cards/ChatTimelineEvent.svelte';
	import { StatusBadge } from '$lib/components/shared';
	import type { StatusVariant } from '$lib/types';

	const currentUser = getCurrentUser();
	const residentId = currentUser?.id ?? '';
	const allBookings = residentId ? getBookingsByResidentId(residentId) : [];

	const bookingChats = $derived.by(() => {
		return [...allBookings].sort((left, right) => {
			const leftInfo = getBookingInfo(left);
			const rightInfo = getBookingInfo(right);
			const leftDate = new Date(leftInfo.updatedAt ?? leftInfo.createdAt ?? '').getTime();
			const rightDate = new Date(rightInfo.updatedAt ?? rightInfo.createdAt ?? '').getTime();
			return rightDate - leftDate;
		});
	});

	const selectedBooking = $derived.by(() => {
		const selectedId = page.url.searchParams.get('id');
		if (selectedId) {
			const booking = getBookingById(selectedId);
			if (booking) return booking;
		}
		return allBookings[0];
	});

	const selectedBookingInfo = $derived.by(() => (selectedBooking ? getBookingInfo(selectedBooking) : undefined));
	const selectedService = $derived.by(() => (selectedBooking ? getServiceById(selectedBooking.serviceId) : undefined));
	const selectedSupplier = $derived.by(() => (selectedService ? getUserById(selectedService.supplierId) : undefined));

	let composerText = $state('');
	let localMessagesByBooking = $state<Record<string, BookingMessage[]>>({});
	let messagesEndEl: HTMLDivElement | null = $state(null);

	const timelineItems = $derived.by(() => {
		if (!selectedBooking) return [];

		const items: Array<{ type: 'message' | 'event' | 'quote' | 'invoice' | 'payment'; date: Date; data: any }> = [];

		for (const message of selectedBooking.messageTimeline ?? []) {
			items.push({ type: 'message', date: new Date(message.timestamp), data: message });
		}

		for (const event of selectedBooking.timeline ?? []) {
			items.push({ type: 'event', date: new Date(event.at), data: event });
		}

		for (const quoteId of selectedBooking.quoteIds ?? []) {
			const quote = getQuoteById(quoteId);
			if (quote) items.push({ type: 'quote', date: new Date(quote.createdAt), data: quote });
		}

		for (const invoiceId of selectedBooking.invoiceIds ?? []) {
			const invoice = getInvoiceById(invoiceId);
			if (invoice) items.push({ type: 'invoice', date: new Date(invoice.createdAt), data: invoice });
		}

		for (const paymentId of selectedBooking.paymentIds ?? []) {
			const payment = getPaymentById(paymentId);
			if (payment) {
				const dateString = payment.createdAt ?? payment.paidAt;
				if (dateString) {
					items.push({ type: 'payment', date: new Date(dateString), data: payment });
				}
			}
		}

		for (const message of localMessagesByBooking[selectedBooking.id] ?? []) {
			items.push({ type: 'message', date: new Date(message.timestamp), data: message });
		}

		return items.sort((left, right) => left.date.getTime() - right.date.getTime());
	});

	function selectBooking(id: string) {
		goto(`?id=${id}`, { replaceState: true });
	}

	function formatDateTime(isoString: string) {
		return new Intl.DateTimeFormat('it-IT', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(isoString));
	}

	function getStatusVariant(status: string | undefined): StatusVariant {
		return status === 'confirmed'
			? 'success'
			: status === 'requested'
			? 'warning'
			: status === 'closed'
			? 'muted'
			: status === 'cancelled'
			? 'destructive'
			: 'destructive';
	}

	async function scrollToBottom() {
		await tick();
		messagesEndEl?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}

	function sendMessage() {
		if (!selectedBooking || !currentUser) return;
		const text = composerText.trim();
		if (!text) return;

		const message: BookingMessage = {
			id: `local-${Date.now()}`,
			senderId: currentUser.id,
			text,
			timestamp: new Date().toISOString()
		};

		localMessagesByBooking = {
			...localMessagesByBooking,
			[selectedBooking.id]: [...(localMessagesByBooking[selectedBooking.id] ?? []), message]
		};
		composerText = '';
		queueMicrotask(scrollToBottom);
	}

	function handleComposerKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<svelte:head>
	<title>Chat servizi — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-6">
		<p class="text-sm uppercase tracking-[0.24em] text-primary">Servizi</p>
		<div class="mt-3 flex items-center gap-3">
			<div class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
				<HugeiconsIcon icon={Chat01Icon} size={20} />
			</div>
			<div>
				<h1 class="text-3xl font-semibold tracking-tight">Chat prenotazioni</h1>
				<p class="mt-1 text-sm text-muted-foreground">Segui la conversazione per ogni prenotazione richiesta ai fornitori.</p>
			</div>
		</div>
	</div>

	<div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
		<aside class="space-y-4">
			<div class="rounded-3xl border border-border bg-card p-4">
				<div class="flex items-center justify-between gap-4">
					<div>
						<p class="text-sm uppercase tracking-[0.24em] text-primary">Conversazioni</p>
						<h2 class="mt-2 text-lg font-semibold">Prenotazioni</h2>
					</div>
					<span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{bookingChats.length}</span>
				</div>
			</div>

			<div class="rounded-3xl border border-border bg-card overflow-hidden">
				{#if bookingChats.length > 0}
					{#each bookingChats as booking}
						{@const info = getBookingInfo(booking)}
						{@const service = getServiceById(booking.serviceId)}
						<button
							type="button"
							class="w-full text-left px-4 py-4 transition hover:bg-slate-50 {selectedBooking?.id === booking.id ? 'bg-slate-100' : ''}"
							onclick={() => selectBooking(booking.id)}
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="font-semibold text-slate-900 truncate">{service?.name ?? info.serviceName}</p>
									<p class="mt-1 text-xs text-slate-500 truncate">{getUserById(service?.supplierId ?? '')?.name ?? 'Fornitore'}</p>
								</div>
								<StatusBadge label={info.status === 'requested' ? 'Richiesta' : info.status === 'confirmed' ? 'Confermato' : info.status === 'closed' ? 'Chiuso' : info.status === 'cancelled' ? 'Annullato' : info.status} variant={getStatusVariant(info.status)} />
							</div>
							<p class="mt-3 text-xs leading-5 text-slate-500 line-clamp-2">{booking.messageTimeline?.at(-1)?.text ?? 'Nessun messaggio ancora.'}</p>
						</button>
					{/each}
				{:else}
					<div class="p-6 text-sm text-muted-foreground">Non hai ancora prenotazioni con conversazione.</div>
				{/if}
			</div>
		</aside>

		<main class="space-y-4">
			{#if selectedBooking}
				<div class="rounded-3xl border border-border bg-card p-5">
					<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div class="min-w-0">
							<p class="text-sm uppercase tracking-[0.24em] text-primary">Prenotazione</p>
							<h2 class="mt-2 text-2xl font-semibold tracking-tight">{selectedBookingInfo?.serviceName}</h2>
							<p class="mt-2 text-sm text-muted-foreground">{selectedSupplier?.name ?? 'Fornitore'} · {selectedBookingInfo?.status === 'closed' ? 'Servizio chiuso' : 'Messaggi booking'}</p>
						</div>
						<div class="flex items-center gap-2">
							<StatusBadge label={selectedBookingInfo?.status === 'requested' ? 'Richiesta' : selectedBookingInfo?.status === 'confirmed' ? 'Confermato' : selectedBookingInfo?.status === 'closed' ? 'Chiuso' : selectedBookingInfo?.status === 'cancelled' ? 'Annullato' : 'Da verificare'} variant={getStatusVariant(selectedBookingInfo?.status ?? 'unknown')} />
						</div>
					</div>

					<div class="mt-4 grid gap-3 sm:grid-cols-3">
						<div class="rounded-3xl bg-muted/30 p-4">
							<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Orario</p>
							<p class="mt-2 text-sm text-foreground">{selectedBookingInfo?.slot ? `${new Date(selectedBookingInfo.slot.start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} · ${new Date(selectedBookingInfo.slot.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} – ${new Date(selectedBookingInfo.slot.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : 'Orario da definire'}</p>
						</div>
						<div class="rounded-3xl bg-muted/30 p-4">
							<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Luogo</p>
							<p class="mt-2 text-sm text-foreground">{selectedBookingInfo?.place ?? 'Non definito'}</p>
						</div>
						<div class="rounded-3xl bg-muted/30 p-4">
							<p class="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Ultimo aggiornamento</p>
							<p class="mt-2 text-sm text-foreground">{selectedBookingInfo?.updatedAt ? formatDateTime(selectedBookingInfo.updatedAt) : '—'}</p>
						</div>
					</div>
				</div>

				<div class="rounded-3xl border border-border bg-card p-5 space-y-4">
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2 text-slate-600">
							<HugeiconsIcon icon={Message01Icon} size={18} />
							<p class="text-sm font-semibold">Cronologia conversazione</p>
						</div>
						<p class="text-xs text-muted-foreground">Messaggi, eventi e documenti collegati.</p>
					</div>

					{#if timelineItems.length > 0}
						<div class="space-y-4">
							{#each timelineItems as item, index}
								{#if item.type === 'message'}
									<ChatBubble message={item.data} isOwn={item.data.senderId === residentId} />
								{:else if item.type === 'event'}
									<ChatTimelineEvent event={item.data} />
								{:else if item.type === 'quote'}
									<ChatQuoteCard quote={item.data} isOwn={item.data.customerId === residentId} />
								{:else if item.type === 'invoice'}
									<ChatInvoiceCard invoice={item.data} isOwn={item.data.customerId === residentId} />
								{:else if item.type === 'payment'}
									<ChatPaymentCard payment={item.data} />
								{/if}
							{/each}
						</div>
					{:else}
						<div class="rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
							Questa prenotazione non ha ancora conversazioni o elementi collegati.
						</div>
					{/if}
				</div>

				<div class="rounded-3xl border border-border bg-card p-5">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="text-sm font-semibold">Invia un messaggio</p>
							<p class="text-xs text-muted-foreground">La chat non è persistente in questa demo.</p>
						</div>
						<button
							type="button"
							class="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
							onclick={sendMessage}
							disabled={!composerText.trim()}
						>
							Invia
						</button>
					</div>
					<textarea
						rows="4"
						value={composerText}
						oninput={(event) => (composerText = (event.currentTarget as HTMLTextAreaElement).value)}
						onkeydown={handleComposerKeydown}
						placeholder="Scrivi un messaggio..."
						class="mt-4 min-h-40 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
					></textarea>
				</div>
			{:else}
				<div class="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
					Non ci sono prenotazioni disponibili per la chat.<br />
					Torna alla pagina dei servizi per avviare una nuova richiesta.
				</div>
			{/if}
		</main>
	</div>
</div>
