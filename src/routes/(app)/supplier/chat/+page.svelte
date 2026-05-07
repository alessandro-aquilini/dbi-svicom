<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getChatsByUserId, type Chat, type Message } from '$lib/data/chats';
	import { getUserById } from '$lib/data/users';
	import { getPaymentsByUserId, type Payment } from '$lib/data/embeds/payments';
	import { getQuotesBySupplierId, type Quote } from '$lib/data/embeds/quotes';
	import { getInvoicesBySupplierId, type Invoice } from '$lib/data/embeds/invoices';
	import { getMaintenanceWorkById, type MaintenanceWork, maintenanceWorks } from '$lib/data/events/maintenance-work';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const chats = getChatsByUserId(supplierId);
	const sortedChats = $derived(
		[...chats].sort(
			(a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
		)
	);

	let view = $state<'list' | 'chat' | 'draft-invoice' | 'draft-quote'>('list');
	let selectedChatId = $state(chats[0]?.id ?? '');
	const selectedChat = $derived(sortedChats.find((c) => c.id === selectedChatId));

	const relatedPayments = $derived(getPaymentsByUserId(supplierId));
	const relatedQuotes = $derived(getQuotesBySupplierId(supplierId));
	const relatedInvoices = $derived(getInvoicesBySupplierId(supplierId));
	const relatedMaintenanceWorks = $derived(
		maintenanceWorks.filter((m) => m.participantIds.includes(supplierId))
	);

	let actionsOpen = $state(true);
	let showEventModal = $state(false);
	let invoiceDraftMode = $state<'upload' | 'form'>('upload');
	let quoteDraftMode = $state<'upload' | 'form'>('upload');
	let messageText = $state('');

	type TimelineEvent =
		| { type: 'message'; date: number; data: Message }
		| { type: 'payment'; date: number; data: Payment }
		| { type: 'quote'; date: number; data: Quote }
		| { type: 'invoice'; date: number; data: Invoice }
		| { type: 'maintenance'; date: number; data: MaintenanceWork };

	const timeline = $derived(selectedChat ? buildTimeline(selectedChat) : []);

	const chatPreviews = $derived(
		sortedChats.map((chat) => {
			const otherUserId = chat.participantIds.find((id) => id !== supplierId) ?? '';
			const otherUser = getUserById(otherUserId);
			const chatTimeline = buildTimeline(chat);
			const lastEvent = chatTimeline[chatTimeline.length - 1];
			const unread =
				lastEvent?.type === 'message' && lastEvent.data.senderId !== supplierId ? 1 : 0;
			return {
				chat,
				otherUser,
				lastEvent,
				unread
			};
		})
	);

	function parseDateTime(date: string, time?: string) {
		if (!date) return 0;
		const value = time ? `${date}T${time}:00` : date;
		return new Date(value).getTime();
	}

	function buildTimeline(chat: Chat): TimelineEvent[] {
		const events: TimelineEvent[] = [];
		const otherUserId = chat.participantIds.find((id) => id !== supplierId);

		for (const msg of chat.messages) {
			events.push({ type: 'message', date: new Date(msg.timestamp).getTime(), data: msg });
		}

		// tickets removed from timeline: we don't show ticket history here anymore

		for (const payment of relatedPayments) {
			if (payment.fromId === otherUserId || payment.toId === otherUserId) {
				events.push({ type: 'payment', date: new Date(payment.dueDate).getTime(), data: payment });
			}
		}

		for (const quote of relatedQuotes) {
			if (quote.customerId === otherUserId) {
				events.push({ type: 'quote', date: new Date(quote.sentAt).getTime(), data: quote });
			}
		}

		for (const invoice of relatedInvoices) {
			if (invoice.customerId === otherUserId) {
				events.push({ type: 'invoice', date: new Date(invoice.issueDate).getTime(), data: invoice });
			}
		}

		for (const mw of relatedMaintenanceWorks) {
			if (!mw.participantIds.includes(supplierId)) continue;
			if (otherUserId && !mw.participantIds.includes(otherUserId)) continue;
			events.push({ type: 'maintenance', date: parseDateTime(mw.date, mw.startTime), data: mw });
		}

		return events.sort((a, b) => a.date - b.date);
	}

	function formatTime(timestamp: number | string) {
		return new Date(timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
	}

	function formatDate(timestamp: number | string) {
		return new Date(timestamp).toLocaleDateString('it-IT', {
			day: '2-digit',
			month: 'short'
		});
	}

	function formatMoney(amount: number, currency: string = 'EUR') {
		return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(amount);
	}

	function getPreviewText(event: TimelineEvent | undefined) {
		if (!event) return 'Nessuna attività recente';
		if (event.type === 'message') return event.data.text;
		if (event.type === 'payment') return `Pagamento • ${formatMoney(event.data.amount, event.data.currency)}`;
		if (event.type === 'quote') return `Preventivo • ${event.data.title}`;
		if (event.type === 'invoice') return `Fattura • ${event.data.number}`;
		if (event.type === 'maintenance') return `Intervento • ${event.data.title}`;
		return 'Aggiornamento';
	}

	function getPreviewBadge(event: TimelineEvent | undefined) {
		if (!event || event.type === 'message') return null;
		if (event.type === 'payment') return { label: '€', tone: 'bg-emerald-50 text-emerald-700' };
		if (event.type === 'quote') return { label: '📄', tone: 'bg-blue-50 text-blue-700' };
		if (event.type === 'invoice') return { label: '🧾', tone: 'bg-amber-50 text-amber-700' };
		if (event.type === 'maintenance') return { label: '📅', tone: 'bg-indigo-50 text-indigo-700' };
		return { label: '↗', tone: 'bg-muted text-muted-foreground' };
	}

	function getInitials(name?: string) {
		if (!name) return 'SV';
		const parts = name.split(' ');
		return parts
			.slice(0, 2)
			.map((part) => part[0])
			.join('')
			.toUpperCase();
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		target.style.height = 'auto';
		target.style.height = `${target.scrollHeight}px`;
	}

	function openChat(chatId: string) {
		selectedChatId = chatId;
		view = 'chat';
	}
</script>

<svelte:head>
	<title>Chat — Fornitore — Svicom Living Hub</title>
</svelte:head>

{#if view === 'list'}
	<div class="min-h-screen bg-muted/40 pb-6">
		<header class="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hub</p>
					<h1 class="text-xl font-semibold text-foreground">Conversazioni</h1>
				</div>
				<span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Support</span>
			</div>
		</header>
		<div class="px-3 pt-3">
			<div class="space-y-1.5">
				{#each chatPreviews as preview}
					{@const badge = getPreviewBadge(preview.lastEvent)}
					<button
						onclick={() => openChat(preview.chat.id)}
						class="flex w-full items-center gap-3 rounded-2xl bg-background px-4 py-3 text-left transition hover:bg-muted/40"
					>
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
							{getInitials(preview.otherUser?.name ?? 'Utente')}
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-semibold text-foreground">
								{preview.otherUser?.name ?? 'Utente'}
							</p>
							<div class="mt-1 flex items-center gap-2">
								{#if badge}
									<span class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold {badge.tone}">
										{badge.label}
									</span>
								{/if}
								<p class="truncate text-sm text-muted-foreground">
									{getPreviewText(preview.lastEvent)}
								</p>
							</div>
						</div>
						<div class="flex flex-col items-end gap-2">
							<p class="text-xs text-muted-foreground">
								{preview.lastEvent ? formatDate(preview.lastEvent.date) : '--'}
							</p>
							{#if preview.unread > 0}
								<span class="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
									{preview.unread}
								</span>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
{:else if view === 'chat' && selectedChat}
	{@const otherUser = getUserById(selectedChat.participantIds.find((id) => id !== supplierId) ?? '')}
	<div class="min-h-screen bg-muted/40">
		<header class="fixed top-0 z-20 flex w-full items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
			<button
				onclick={() => (view = 'list')}
				aria-label="Torna alle conversazioni"
				class="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
			</button>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
					{getInitials(otherUser?.name ?? 'Utente')}
				</div>
				<div>
					<p class="text-sm font-semibold text-foreground">{otherUser?.name ?? 'Utente'}</p>
					<p class="text-xs text-muted-foreground">Assistenza e pagamenti</p>
				</div>
			</div>
		</header>
		<main class="flex min-h-screen flex-col">
			<div class="flex-1 space-y-4 px-4 pb-40 pt-24">
				{#each timeline as event}
					{#if event.type === 'message'}
						{@const isMine = event.data.senderId === supplierId}
						<div class="flex flex-col {isMine ? 'items-end' : 'items-start'}">
							<div class="max-w-[85%] rounded-2xl bg-background px-4 py-3 text-[15px] leading-relaxed text-foreground shadow-sm {isMine ? 'border border-primary/10' : 'border border-border'}">
								{event.data.text}
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground">{formatTime(event.date)}</span>
						</div>

					{:else if event.type === 'payment'}
						{@const isMine = event.data.fromId === supplierId}
						<div class="flex flex-col {isMine ? 'items-end' : 'items-start'}">
							<div class="w-[85%] rounded-2xl border border-border bg-background p-4 shadow-sm">
								<div class="mb-2 flex items-center justify-between">
									<div class="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
										<span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">€</span>
										Pagamento
									</div>
									<span class="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
										{event.data.paidAt ? 'Saldato' : 'Da saldare'}
									</span>
								</div>
								<p class="text-xl font-semibold text-foreground">
									{formatMoney(event.data.amount, event.data.currency)}
								</p>
								<p class="mt-1 text-xs text-muted-foreground">{event.data.description}</p>
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground">{formatTime(event.date)}</span>
						</div>
					{:else if event.type === 'quote'}
						<div class="flex flex-col items-end">
							<div class="w-[85%] rounded-2xl border border-border bg-background p-4 shadow-sm">
								<div class="mb-2 flex items-center justify-between">
									<div class="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
										<span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">📄</span>
										Preventivo
									</div>
									<span class="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
										{new Date(event.data.expiresAt).getTime() < Date.now() ? 'Scaduto' : 'Inviato'}
									</span>
								</div>
								<p class="text-sm font-semibold text-foreground">{event.data.title}</p>
								<p class="mt-2 text-lg font-semibold text-foreground">
									{formatMoney(event.data.amount, event.data.currency)}
								</p>
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground">{formatTime(event.date)}</span>
						</div>
					{:else if event.type === 'invoice'}
						<div class="flex flex-col items-end">
							<div class="w-[85%] rounded-2xl border border-border bg-background p-4 shadow-sm">
								<div class="mb-2 flex items-center justify-between">
									<div class="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
										<span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">🧾</span>
										Fattura
									</div>
									<span class="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
										{event.data.paidAt ? 'Saldato' : 'In attesa'}
									</span>
								</div>
								<p class="text-sm font-semibold text-foreground">{event.data.number}</p>
								<p class="mt-2 text-lg font-semibold text-foreground">
									{formatMoney(event.data.amount, event.data.currency)}
								</p>
								<p class="mt-1 text-xs text-muted-foreground">{event.data.description}</p>
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground">{formatTime(event.date)}</span>
						</div>
					{:else if event.type === 'maintenance'}
						<div class="flex flex-col items-start">
							<div class="w-[85%] rounded-2xl border border-border bg-background p-4 shadow-sm">
								<div class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
									<span class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">📅</span>
									Intervento programmato
								</div>
								<p class="text-sm font-semibold text-foreground">{event.data.title}</p>
								<p class="mt-1 text-xs text-muted-foreground">{event.data.location}</p>
								<div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
									<span class="rounded-full bg-muted px-2 py-1">{formatDate(event.date)}</span>
									<span class="rounded-full bg-muted px-2 py-1">
										{event.data.startTime} - {event.data.endTime}
									</span>
								</div>
							</div>
							<span class="mt-1 text-[11px] text-muted-foreground">{formatTime(event.date)}</span>
						</div>
					{/if}
				{/each}
			</div>
		</main>

		<div class="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/90 px-4 pb-4 pt-3 backdrop-blur">
			<div class="flex items-center justify-between">
				<p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Azioni rapide</p>
				<button
					onclick={() => (actionsOpen = !actionsOpen)}
					class="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground"
				>
					{actionsOpen ? 'Chiudi' : 'Apri'}
				</button>
			</div>
			{#if actionsOpen}
				<div class="mt-3 flex gap-2 overflow-x-auto pb-1">
					<button
						onclick={() => (showEventModal = true)}
						class="flex h-12 items-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm"
					>
						<span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">+</span>
						Intervento
					</button>
					<button
						onclick={() => {
							view = 'draft-invoice';
							invoiceDraftMode = 'upload';
						}}
						class="flex h-12 items-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm"
					>
						<span class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">€</span>
						Fattura
					</button>
					<button
						onclick={() => {
							view = 'draft-quote';
							quoteDraftMode = 'upload';
						}}
						class="flex h-12 items-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm"
					>
						<span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">📄</span>
						Preventivo
					</button>
				</div>
			{/if}
			<div class="mt-4 flex items-end gap-2 rounded-2xl border border-input bg-background px-3 py-2">
				<textarea
					rows="1"
					bind:value={messageText}
					oninput={handleInput}
					placeholder="Scrivi un messaggio"
					class="max-h-32 w-full resize-none bg-transparent text-sm text-foreground outline-none"
				></textarea>
				<button
					disabled={!messageText.trim()}
					aria-label="Invia messaggio"
					class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2"/></svg>
				</button>
			</div>
		</div>
	</div>
{:else if view === 'draft-invoice'}
	<div class="min-h-screen bg-muted/40 pb-8">
		<header class="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
			<button
				onclick={() => (view = 'chat')}
				aria-label="Torna alla chat"
				class="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
			</button>
			<div>
				<p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Draft</p>
				<h2 class="text-lg font-semibold text-foreground">Nuova Fattura</h2>
			</div>
		</header>
		<div class="px-4 pt-6">
			<div class="flex rounded-full border border-border bg-background p-1 text-xs font-semibold text-muted-foreground">
				<button
					onclick={() => (invoiceDraftMode = 'upload')}
					class="flex-1 rounded-full px-3 py-2 {invoiceDraftMode === 'upload' ? 'bg-primary/10 text-primary' : ''}"
				>
					Manual Upload
				</button>
				<button
					onclick={() => (invoiceDraftMode = 'form')}
					class="flex-1 rounded-full px-3 py-2 {invoiceDraftMode === 'form' ? 'bg-primary/10 text-primary' : ''}"
				>
					Form
				</button>
			</div>

			<div class="mt-6 space-y-4">
				{#if invoiceDraftMode === 'upload'}
					<div class="rounded-2xl border border-dashed border-border bg-background p-6 text-center">
						<p class="text-sm font-semibold text-foreground">Carica PDF fattura</p>
						<p class="mt-2 text-xs text-muted-foreground">Trascina il file o seleziona manualmente.</p>
						<input type="file" class="mt-4 w-full text-xs text-muted-foreground" />
					</div>
					<div class="grid gap-4">
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Numero fattura
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="FT-2026-001" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Importo
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="€0,00" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Scadenza
							<input type="date" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
						</label>
					</div>
				{:else}
					<div class="grid gap-4">
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Numero fattura
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="FT-2026-001" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Cliente
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Condominio / Privato" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Condominio
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="cnd-marconi-14" />
						</label>

						<div class="grid grid-cols-2 gap-4">
							<label class="text-xs font-semibold uppercase text-muted-foreground">
								Data emissione
								<input type="date" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
							</label>
							<label class="text-xs font-semibold uppercase text-muted-foreground">
								Scadenza
								<input type="date" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
							</label>
						</div>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Importo
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="€0,00" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Descrizione
							<textarea rows="3" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Descrivi l'intervento"></textarea>
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Allegati
							<input type="file" class="mt-2 w-full text-xs text-muted-foreground" />
						</label>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else if view === 'draft-quote'}
	<div class="min-h-screen bg-muted/40 pb-8">
		<header class="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
			<button
				onclick={() => (view = 'chat')}
				aria-label="Torna alla chat"
				class="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
			</button>
			<div>
				<p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Draft</p>
				<h2 class="text-lg font-semibold text-foreground">Nuovo Preventivo</h2>
			</div>
		</header>
		<div class="px-4 pt-6">
			<div class="flex rounded-full border border-border bg-background p-1 text-xs font-semibold text-muted-foreground">
				<button
					onclick={() => (quoteDraftMode = 'upload')}
					class="flex-1 rounded-full px-3 py-2 {quoteDraftMode === 'upload' ? 'bg-primary/10 text-primary' : ''}"
				>
					Manual Upload
				</button>
				<button
					onclick={() => (quoteDraftMode = 'form')}
					class="flex-1 rounded-full px-3 py-2 {quoteDraftMode === 'form' ? 'bg-primary/10 text-primary' : ''}"
				>
					Form
				</button>
			</div>

			<div class="mt-6 space-y-4">
				{#if quoteDraftMode === 'upload'}
					<div class="rounded-2xl border border-dashed border-border bg-background p-6 text-center">
						<p class="text-sm font-semibold text-foreground">Carica PDF preventivo</p>
						<p class="mt-2 text-xs text-muted-foreground">Trascina il file o seleziona manualmente.</p>
						<input type="file" class="mt-4 w-full text-xs text-muted-foreground" />
					</div>
					<div class="grid gap-4">
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Titolo preventivo
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Intervento idraulico" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Importo
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="€0,00" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Scadenza
							<input type="date" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
						</label>
					</div>
				{:else}
					<div class="grid gap-4">
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Titolo
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Sostituzione pompa" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Cliente
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Condominio / Privato" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Condominio
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="cnd-marconi-14" />
						</label>

						<div class="grid grid-cols-2 gap-4">
							<label class="text-xs font-semibold uppercase text-muted-foreground">
								Data invio
								<input type="date" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
							</label>
							<label class="text-xs font-semibold uppercase text-muted-foreground">
								Scadenza
								<input type="date" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
							</label>
						</div>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Importo
							<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="€0,00" />
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Descrizione
							<textarea rows="3" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Descrivi il lavoro"></textarea>
						</label>
						<label class="text-xs font-semibold uppercase text-muted-foreground">
							Allegati
							<input type="file" class="mt-2 w-full text-xs text-muted-foreground" />
						</label>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- ticket modal removed -->

{#if showEventModal}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/40"
		aria-label="Chiudi nuovo intervento"
		onclick={() => (showEventModal = false)}
	></button>
	<div class="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-border bg-background p-6 shadow-lg">
		<div class="mx-auto mb-4 h-1 w-12 rounded-full bg-muted"></div>
		<h3 class="text-lg font-semibold text-foreground">Nuovo intervento</h3>
		<p class="mt-1 text-sm text-muted-foreground">Imposta data, luogo e orario.</p>
		<div class="mt-4 grid gap-4">
			<label class="text-xs font-semibold uppercase text-muted-foreground">
				Titolo
				<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Manutenzione impianto" />
			</label>
			<label class="text-xs font-semibold uppercase text-muted-foreground">
				Luogo
				<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Via Marconi 14" />
			</label>
			<label class="text-xs font-semibold uppercase text-muted-foreground">
				Gruppo
				<input class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Interventi programmati" />
			</label>
			<div class="grid grid-cols-2 gap-4">
				<label class="text-xs font-semibold uppercase text-muted-foreground">
					Data
					<input type="date" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
				</label>
				
			</div>
			<div class="grid grid-cols-2 gap-4">
				<label class="text-xs font-semibold uppercase text-muted-foreground">
					Ora inizio
					<input type="time" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
				</label>
				<label class="text-xs font-semibold uppercase text-muted-foreground">
					Ora fine
					<input type="time" class="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
				</label>
			</div>
		</div>
	</div>
{/if}
