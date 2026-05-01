<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getChatsByUserId } from '$lib/data/chats';
	import { getUserById } from '$lib/data/users';
	import { getTicketById } from '$lib/data/tickets';
	import { getPaymentById } from '$lib/data/payments';
	import { getQuoteById } from '$lib/data/quotes';
	import { getInvoiceById } from '$lib/data/invoices';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const chats = getChatsByUserId(supplierId);
	let selectedChatId = $state(chats[0]?.id ?? '');
	const selectedChat = $derived(chats.find((c) => c.id === selectedChatId));

	function formatTime(isoString: string) {
		return new Date(isoString).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
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
				{#each selectedChat.messages as msg}
					{@const isMine = msg.senderId === supplierId}
					<div class="flex flex-col {isMine ? 'items-end' : 'items-start'}">
						{#if msg.text}
							<div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm {isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}">
								{msg.text}
							</div>
						{/if}
						
						{#if msg.action}
							<div class="{msg.text ? 'mt-2' : ''} max-w-[85%] overflow-hidden rounded-xl border border-border bg-background p-3 pb-2 text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer text-foreground">
								{#if msg.action.type === 'ticket'}
									{@const ticket = getTicketById(msg.action.referenceId)}
									{#if ticket}
										<div class="flex items-center justify-between gap-3 mb-2">
											<span class="font-semibold text-xs tracking-wider uppercase opacity-80">Ticket</span>
											<span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{ticket.status}</span>
										</div>
										<p class="font-medium pb-1">{ticket.title}</p>
									{/if}
								{:else if msg.action.type === 'payment'}
									{@const payment = getPaymentById(msg.action.referenceId)}
									{#if payment}
										<div class="flex items-center justify-between gap-3 mb-2">
											<span class="font-semibold text-xs tracking-wider uppercase opacity-80">Pagamento</span>
											<span class="text-xs px-2 py-0.5 rounded-full {payment.status === 'paid' ? 'bg-green-500/20 text-green-700' : 'bg-orange-500/20 text-orange-700'}">{payment.status === 'paid' ? 'Saldato' : 'In attesa'}</span>
										</div>
										<p class="font-bold text-lg">{formatMoney(payment.amount, payment.currency)}</p>
										<p class="text-xs opacity-90 truncate">{payment.description}</p>
									{/if}
								{:else if msg.action.type === 'quote'}
									{@const quote = getQuoteById(msg.action.referenceId)}
									{#if quote}
										<div class="flex items-center justify-between gap-3 mb-2">
											<span class="font-semibold text-xs tracking-wider uppercase opacity-80">Preventivo</span>
											<span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{formatMoney(quote.amount, quote.currency)}</span>
										</div>
										<p class="font-medium pb-1">{quote.title}</p>
									{/if}
								{:else if msg.action.type === 'invoice'}
									{@const invoice = getInvoiceById(msg.action.referenceId)}
									{#if invoice}
										<div class="flex items-center justify-between gap-3 mb-2">
											<span class="font-semibold text-xs tracking-wider uppercase opacity-80">Fattura</span>
											<span class="text-xs px-2 py-0.5 rounded-full {invoice.status === 'paid' ? 'bg-green-500/20 text-green-700' : 'bg-primary/10 text-primary'}">{invoice.number}</span>
										</div>
										<p class="font-bold text-lg">{formatMoney(invoice.amount, invoice.currency)}</p>
										<p class="text-xs opacity-90 truncate">{invoice.description}</p>
									{/if}
								{/if}
								
								<div class="mt-2 flex items-center justify-end text-xs font-semibold text-primary">
									{msg.action.label} 
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
								</div>
							</div>
						{/if}
						<span class="mt-1 text-[11px] text-muted-foreground mx-1">{formatTime(msg.timestamp)}</span>
					</div>
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
