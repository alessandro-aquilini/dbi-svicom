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
			if (quote.customerId === otherUserId) {
				if (quote.sentAt) {
					events.push({ type: 'quote', date: new Date(quote.sentAt).getTime(), data: quote });
				}
			}
		}

		// Add invoices
		for (const invoice of relatedInvoices) {
			if (invoice.customerId === otherUserId) {
				if (invoice.issueDate) {
					events.push({ type: 'invoice', date: new Date(invoice.issueDate).getTime(), data: invoice });
				}
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

	let showInvoiceModal = $state(false);
	let showQuoteModal = $state(false);
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
			<div class="flex-1 space-y-4 overflow-y-auto p-4 flex flex-col">
				{#each timeline() as event}
					{#if event.type === 'message'}
						{@const isMine = event.data.senderId === supplierId}
						<div class="flex flex-col {isMine ? 'self-end items-end' : 'self-start items-start'}">
							{#if event.data.text}
								<div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm {isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}">
									{event.data.text}
								</div>
								<span class="mt-1 text-[11px] text-muted-foreground mx-1">{formatTime(event.date)}</span>
							{/if}
						</div>
					{:else if event.type === 'ticket_status'}
						{@const isMine = event.data.history.authorId === supplierId}
						{@const author = getUserById(event.data.history.authorId ?? '')}
						<div class="flex flex-col items-center my-3 w-full">
							<div class="max-w-[85%] rounded-xl px-4 py-2 text-[13px] text-muted-foreground bg-muted/30 border border-border/50 text-center flex flex-col sm:flex-row items-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary shrink-0 mb-1 sm:mb-0"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
								<span>
									{#if event.data.history.status === 'opened'}
										<span class="font-medium text-foreground">{author?.name ?? 'Utente'}</span> ha aperto un nuovo ticket (<span class="font-mono text-xs font-semibold text-foreground">{event.data.ticket.id}</span>).
									{:else}
										<span class="font-medium text-foreground">{author?.name ?? 'Utente'}</span> ha aggiornato lo stato del ticket in: <span class="uppercase tracking-wider font-semibold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-md ml-1">{event.data.history.status}</span>
									{/if}
								</span>
							</div>
							<span class="mt-1 text-[10px] text-muted-foreground/70">{formatTime(event.date)}</span>
						</div>
					{:else if event.type === 'payment'}
						{@const isMine = event.data.fromId === supplierId}
						<div class="flex flex-col {isMine ? 'self-end items-end' : 'self-start items-start'} my-2">
							<div class="w-full min-w-60 max-w-70 overflow-hidden rounded-xl border border-border bg-background p-4 text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer text-foreground">
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
						<div class="flex flex-col self-end items-end my-2">
							<div class="w-full min-w-60 max-w-70 overflow-hidden rounded-xl border border-border bg-background p-4 text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer text-foreground">
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
						<div class="flex flex-col self-end items-end my-2">
							<div class="w-full min-w-60 max-w-70 overflow-hidden rounded-xl border border-border bg-background p-4 text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer text-foreground">
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
			<div class="border-t border-border bg-card p-3 flex flex-col gap-3 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
				<div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
					<button onclick={() => (showInvoiceModal = true)} class="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
						Nuova Fattura
					</button>
					<button onclick={() => (showQuoteModal = true)} class="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
						Nuovo Preventivo
					</button>
				</div>
				<div class="rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-muted-foreground">Scrivi un messaggio...</div>
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">Seleziona una conversazione</div>
		{/if}
	</div>
</div>

{#if showInvoiceModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-bold text-foreground">Nuova Fattura</h2>
			<p class="mb-6 text-sm text-muted-foreground">Carica un file PDF o compila i dati manualmente per emettere una nuova fattura.</p>
			<div class="flex flex-col gap-3">
				<button class="w-full rounded-xl bg-primary/10 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20">Carica PDF</button>
				<button class="w-full rounded-xl border border-input py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50">Compila Manualmente</button>
				<button class="w-full py-2 text-sm text-muted-foreground hover:text-foreground" onclick={() => (showInvoiceModal = false)}>Annulla</button>
			</div>
		</div>
	</div>
{/if}

{#if showQuoteModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-bold text-foreground">Nuovo Preventivo</h2>
			<p class="mb-6 text-sm text-muted-foreground">Carica un file PDF o inserisci le voci di costo per creare un nuovo preventivo.</p>
			<div class="flex flex-col gap-3">
				<button class="w-full rounded-xl bg-primary/10 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20">Carica PDF</button>
				<button class="w-full rounded-xl border border-input py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50">Compila Manualmente</button>
				<button class="w-full py-2 text-sm text-muted-foreground hover:text-foreground" onclick={() => (showQuoteModal = false)}>Annulla</button>
			</div>
		</div>
	</div>
{/if}
