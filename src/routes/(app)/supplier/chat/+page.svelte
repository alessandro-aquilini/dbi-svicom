<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getChatsByUserId, type Message } from '$lib/data/chats';
	import { getUserById } from '$lib/data/users';
	import { getTicketsBySupplierId, type Ticket, type StatusHistoryEntry } from '$lib/data/tickets';
	import { getPaymentsByUserId, type Payment } from '$lib/data/payments';
	import { getQuotesBySupplierId, type Quote } from '$lib/data/quotes';
	import { getInvoicesBySupplierId, type Invoice } from '$lib/data/invoices';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const chats = getChatsByUserId(supplierId);
	let selectedChatId = $state(chats[0]?.id ?? '');
	const selectedChat = $derived(chats.find((c) => c.id === selectedChatId));

	const relatedTickets = $derived(getTicketsBySupplierId(supplierId));
	const relatedPayments = $derived(getPaymentsByUserId(supplierId));
	const relatedQuotes = $derived(getQuotesBySupplierId(supplierId));
	const relatedInvoices = $derived(getInvoicesBySupplierId(supplierId));

	type TimelineEvent =
		| { type: 'message'; date: number; data: Message }
		| { type: 'ticket_status'; date: number; data: { ticket: Ticket; history: StatusHistoryEntry } }
		| { type: 'payment'; date: number; data: Payment }
		| { type: 'quote'; date: number; data: Quote }
		| { type: 'invoice'; date: number; data: Invoice };

	const timeline = $derived(() => {
		if (!selectedChat) return [];

		const events: TimelineEvent[] = [];
		const otherUserId = selectedChat.participantIds.find((id) => id !== supplierId);

		// Add messages
		for (const msg of selectedChat.messages) {
			events.push({ type: 'message', date: new Date(msg.timestamp).getTime(), data: msg });
		}

		// Add tickets
		for (const ticket of relatedTickets) {
			if (ticket.creatorId === otherUserId) {
				for (const history of ticket.statusHistory) {
					events.push({
						type: 'ticket_status',
						date: new Date(history.at).getTime(),
						data: { ticket, history }
					});
				}
			}
		}

		// Add payments
		for (const payment of relatedPayments) {
			if (payment.fromId === otherUserId || payment.toId === otherUserId) {
				if (payment.dueDate) {
					events.push({ type: 'payment', date: new Date(payment.dueDate).getTime(), data: payment });
				}
			}
		}

		// Add quotes
		for (const quote of relatedQuotes) {
			if (quote.sentAt) {
				events.push({ type: 'quote', date: new Date(quote.sentAt).getTime(), data: quote });
			}
		}

		// Add invoices
		for (const invoice of relatedInvoices) {
			if (invoice.issueDate) {
				events.push({ type: 'invoice', date: new Date(invoice.issueDate).getTime(), data: invoice });
			}
		}

		return events.sort((a, b) => a.date - b.date);
	});

	function formatTime(timestamp: number | string) {
		return new Date(timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
	}

	function formatMoney(amount: number, currency: string = 'EUR') {
		return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(amount);
	}
</script>

<svelte:head>
	<title>Chat — Fornitore — Svicom Living Hub</title>
</svelte:head>

<!-- NOTE: Secondo me ci devo essere tre bottoni: aggiorna ticket (apri ticked) se non c'è alcun ticket aperto, scambia denaro, carica preventivo e/o fattura -->
<div class="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
	<!-- Chat list (sidebar on desktop, hidden on mobile when chat selected) -->
	<div class="shrink-0 border-b border-border bg-card md:w-72 md:border-b-0 md:border-r">
		<div class="border-b border-border px-4 py-3">
			<h2 class="text-sm font-medium text-foreground">Conversazioni</h2>
		</div>
		<ul class="divide-y divide-border">
			{#each chats as chat}
				{@const otherUser = getUserById(chat.participantIds.find((id) => id !== supplierId) ?? '')}
				<li>
					<button
						onclick={() => (selectedChatId = chat.id)}
						class="w-full px-4 py-3 text-left hover:bg-muted/50 {chat.id === selectedChatId ? 'bg-accent' : ''}"
					>
						<p class="text-sm font-medium text-foreground">{otherUser?.name ?? 'Utente'}</p>
						<p class="mt-0.5 truncate text-xs text-muted-foreground">{chat.messages[chat.messages.length - 1]?.text ?? ''}</p>
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Messages -->
	<div class="flex flex-1 flex-col">
		{#if selectedChat}
			{@const otherUser = getUserById(selectedChat.participantIds.find((id) => id !== supplierId) ?? '')}
			<div class="border-b border-border px-4 py-3">
				<p class="text-sm font-medium text-foreground">{otherUser?.name ?? 'Utente'}</p>
			</div>
			<div class="flex-1 space-y-4 overflow-y-auto p-4">
				{#each timeline() as event}
					{#if event.type === 'message'}
						{@const isMine = event.data.senderId === supplierId}
						<div class="flex flex-col {isMine ? 'items-end' : 'items-start'}">
							{#if event.data.text}
								<div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm {isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}">
									{event.data.text}
								</div>
								<span class="mt-1 text-[11px] text-muted-foreground mx-1">{formatTime(event.date)}</span>
							{/if}
						</div>
					{:else if event.type === 'ticket_status'}
						<div class="flex justify-center my-4">
							<span class="text-xs border border-border bg-card px-3 py-1.5 rounded-full text-muted-foreground shadow-sm">
								Il ticket <strong>{event.data.ticket.id}</strong> è stato spostato in <strong class="text-primary">{event.data.history.status}</strong>
							</span>
						</div>
					{:else if event.type === 'payment'}
						<div class="flex flex-col items-center my-4">
							<div class="w-full max-w-[280px] overflow-hidden rounded-xl border border-border bg-background p-4 text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer text-foreground">
								<div class="flex items-center justify-between gap-3 mb-2">
									<span class="font-semibold text-xs tracking-wider uppercase opacity-80">Pagamento</span>
									<span class="text-xs px-2 py-0.5 rounded-full {event.data.paidAt ? 'bg-green-500/20 text-green-700' : 'bg-orange-500/20 text-orange-700'}">
										{event.data.paidAt ? 'Saldato' : 'In attesa'}
									</span>
								</div>
								<p class="font-bold text-xl mb-1">{formatMoney(event.data.amount, event.data.currency)}</p>
								<p class="text-xs opacity-90 mb-3">{event.data.description}</p>
								<div class="border-t border-border pt-2 flex items-center justify-end text-xs font-semibold text-primary">
									Dettagli
								</div>
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground mx-1">{formatTime(event.date)}</span>
						</div>
					{:else if event.type === 'quote'}
						<div class="flex flex-col items-end my-4">
							<div class="w-full max-w-[280px] overflow-hidden rounded-xl border border-border bg-background p-4 text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer text-foreground">
								<div class="flex items-center justify-between gap-3 mb-2">
									<span class="font-semibold text-xs tracking-wider uppercase opacity-80">Preventivo Inviato</span>
									<span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{formatMoney(event.data.amount, event.data.currency)}</span>
								</div>
								<p class="font-medium pb-2 text-sm">{event.data.title}</p>
								<div class="border-t border-border pt-2 flex items-center justify-end text-xs font-semibold text-primary">
									Apri Documento
								</div>
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground mx-1">{formatTime(event.date)}</span>
						</div>
					{:else if event.type === 'invoice'}
						<div class="flex flex-col items-end my-4">
							<div class="w-full max-w-[280px] overflow-hidden rounded-xl border border-border bg-background p-4 text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer text-foreground">
								<div class="flex items-center justify-between gap-3 mb-2">
									<span class="font-semibold text-xs tracking-wider uppercase opacity-80">Fattura Emessa</span>
									<span class="text-xs px-2 py-0.5 rounded-full {event.data.paidAt ? 'bg-green-500/20 text-green-700' : 'bg-primary/10 text-primary'}">{event.data.number}</span>
								</div>
								<p class="font-bold text-xl mb-1">{formatMoney(event.data.amount, event.data.currency)}</p>
								<p class="text-xs opacity-90 mb-3">{event.data.description}</p>
								<div class="border-t border-border pt-2 flex items-center justify-end text-xs font-semibold text-primary">
									Scarica PDF
								</div>
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground mx-1">{formatTime(event.date)}</span>
						</div>
					{/if}
				{/each}
			</div>
			<div class="border-t border-border p-3">
				<div class="rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground">Scrivi un messaggio...</div>
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">Seleziona una conversazione</div>
		{/if}
	</div>
</div>
