<script lang="ts">
	import { tick } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowUp01Icon,
		Chat01Icon,
		CreditCardIcon,
		Megaphone01Icon,
		Notification01Icon
	} from '@hugeicons/core-free-icons';
	import { getCurrentUser } from '$lib/auth';
	import { ResidentEmptyCard } from '$lib/components/resident';
	import { InfoTip } from '$lib/components/shared';
	import { Button } from '$lib/components/ui/button';
	import { getChatsByUserId, type Message } from '$lib/data/chats';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getReportById, inferReportStatus } from '$lib/data/ticket/reports';
	import { getTicketById } from '$lib/data/ticket/tickets';
	import { getUserById } from '$lib/data/users';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const currentUser = getCurrentUser();
	const residentId = currentUser?.id ?? '';
	const baseChats = residentId
		? [...getChatsByUserId(residentId)].sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt))
		: [];

	const selectedChatId = $derived(page.url.searchParams.get('id') ?? baseChats[0]?.id ?? '');
	let composerText = $state('');
	let localMessagesByChat = $state<Record<string, Message[]>>({});
	let messagesEndEl: HTMLDivElement | null = $state(null);

	const userChats = $derived.by(() => {
		return [...baseChats]
			.map((chat) => {
				const localMessages = localMessagesByChat[chat.id] ?? [];
				const allMessages = [...chat.messages, ...localMessages].sort((left, right) =>
					left.timestamp.localeCompare(right.timestamp)
				);
				const lastMessage = allMessages.at(-1);

				return {
					...chat,
					messages: allMessages,
					lastMessageAt: lastMessage?.timestamp ?? chat.lastMessageAt
				};
			})
			.sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt));
	});

	const selectedChat = $derived(userChats.find((chat) => chat.id === selectedChatId));
	const contactUser = $derived(
		selectedChat ? getUserById(selectedChat.participantIds.find((id) => id !== residentId) ?? '') : undefined
	);
	const relatedReports = $derived(
		(selectedChat?.reportIds ?? [])
			.map((id) => getReportById(id))
			.filter((report) => report !== undefined)
	);
	const relatedPayments = $derived.by(() => {
		const payments = new Map<string, NonNullable<ReturnType<typeof getPaymentById>>>();

		for (const ticket of (selectedChat?.ticketIds ?? [])
			.map((id) => getTicketById(id))
			.filter((ticket) => ticket !== undefined)) {
			for (const paymentId of ticket.paymentIds) {
				const payment = getPaymentById(paymentId);
				if (payment) payments.set(payment.id, payment);
			}
		}

		return [...payments.values()];
	});

	const selectedThreadFacts = $derived(
		selectedChat
			? [
					{ label: 'Ultimo aggiornamento', value: formatDateTime(selectedChat.lastMessageAt) },
					{ label: 'Messaggi visibili', value: `${selectedChat.messages.length}` },
					{ label: 'Segnalazioni', value: `${relatedReports.length}` },
					{ label: 'Pagamenti', value: `${relatedPayments.length}` }
				]
			: []
	);

	function formatTime(isoString: string) {
		return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(
			new Date(isoString)
		);
	}

	function formatDateTime(isoString: string) {
		return new Intl.DateTimeFormat('it-IT', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(isoString));
	}

	function formatDayLabel(isoString: string) {
		const date = new Date(isoString);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		const sameDay = (left: Date, right: Date) =>
			left.getFullYear() === right.getFullYear() &&
			left.getMonth() === right.getMonth() &&
			left.getDate() === right.getDate();

		if (sameDay(date, today)) return 'Oggi';
		if (sameDay(date, yesterday)) return 'Ieri';

		return new Intl.DateTimeFormat('it-IT', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}

	function getThreadInitials(name: string | undefined) {
		return (
			name
				?.split(' ')
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase() ?? '')
				.join('') ?? 'AM'
		);
	}

	const groupedMessages = $derived.by(() => {
		if (!selectedChat) return [];

		const groups = new Map<string, { label: string; messages: Message[] }>();
		for (const message of selectedChat.messages) {
			const dayKey = message.timestamp.slice(0, 10);
			if (!groups.has(dayKey)) {
				groups.set(dayKey, {
					label: formatDayLabel(message.timestamp),
					messages: []
				});
			}
			groups.get(dayKey)?.messages.push(message);
		}

		return [...groups.entries()].map(([dayKey, group]) => ({
			dayKey,
			label: group.label,
			messages: group.messages
		}));
	});

	function selectChat(id: string) {
		goto(`?id=${id}`, { replaceState: true });
	}

	async function scrollToBottom() {
		await tick();
		messagesEndEl?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}

	function sendMessage() {
		const text = composerText.trim();
		if (!text || !selectedChat || !currentUser) return;

		const message: Message = {
			id: `local-${Date.now()}`,
			senderId: currentUser.id,
			text,
			timestamp: new Date().toISOString()
		};

		localMessagesByChat = {
			...localMessagesByChat,
			[selectedChat.id]: [...(localMessagesByChat[selectedChat.id] ?? []), message]
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
	<title>Assistenza - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<section class="report-page-header">
			<div class="report-page-header__main">
				<p class="report-page-header__eyebrow">Assistenza residente</p>
				<div class="resident-heading-with-tip">
					<h1 class="report-page-header__title">Chat</h1>
					<InfoTip text="Seleziona un thread per leggere la conversazione e inviare nuovi messaggi nella demo corrente." />
				</div>
				<p class="report-page-header__copy">
					Qui trovi le conversazioni con l amministrazione e puoi continuare lo scambio direttamente dalla vista residente.
				</p>
			</div>
		</section>

		{#if !currentUser || userChats.length === 0}
			<ResidentEmptyCard
				title="Nessuna conversazione disponibile"
				copy="Quando saranno presenti aggiornamenti per il tuo profilo, li troverai qui."
			/>
		{:else if selectedChat}
			<section class="resident-chat-layout">
				<div class="resident-chat-thread-panel">
					<div class="resident-chat-thread-panel__header">
						<div class="resident-heading-with-tip resident-heading-with-tip--compact">
							<h2 class="resident-module-section__title">Conversazioni</h2>
							<InfoTip text="Apri un thread per vedere i messaggi e i riferimenti collegati." />
						</div>
						<p class="resident-module-section__copy">
							{userChats.length} conversazioni disponibili.
						</p>
					</div>

					<div class="resident-chat-thread-list">
						{#each userChats as chat}
							{@const peer = getUserById(chat.participantIds.find((id) => id !== residentId) ?? '')}
							{@const isActive = chat.id === selectedChatId}
							<button
								type="button"
								class="resident-chat-thread-card"
								class:resident-chat-thread-card--active={isActive}
								onclick={() => selectChat(chat.id)}
							>
								<div class="resident-chat-thread-card__avatar" aria-hidden="true">
									{getThreadInitials(peer?.name)}
								</div>
								<div class="resident-chat-thread-card__main">
									<p class="resident-chat-thread-card__title">{peer?.name ?? 'Amministrazione'}</p>
									<p class="resident-chat-thread-card__copy">
										{chat.messages.at(-1)?.text ?? 'Nessun messaggio disponibile.'}
									</p>
								</div>
								<div class="resident-chat-thread-card__meta">
									<p class="resident-chat-thread-card__time">{formatTime(chat.lastMessageAt)}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<div class="resident-chat-conversation">
					<div class="resident-chat-conversation__header">
						<div class="resident-chat-conversation__identity">
							<div class="resident-chat-conversation__avatar" aria-hidden="true">
								{getThreadInitials(contactUser?.name)}
							</div>
							<div>
								<p class="resident-chat-conversation__title">{contactUser?.name ?? 'Amministrazione'}</p>
								<p class="resident-chat-conversation__subtitle">
									{contactUser?.role === 'admin' ? 'Amministrazione del tuo stabile' : 'Contatto attivo'}
								</p>
							</div>
						</div>

						<div class="resident-chat-summary-grid">
							{#each selectedThreadFacts as fact}
								<div class="resident-chat-summary-card">
									<p class="resident-chat-summary-card__label">{fact.label}</p>
									<p class="resident-chat-summary-card__value">{fact.value}</p>
								</div>
							{/each}
						</div>
					</div>

					<div class="resident-chat-messages">
						{#each groupedMessages as group (group.dayKey)}
							<div class="resident-chat-day-divider">
								<span>{group.label}</span>
							</div>

							{#each group.messages as message (message.id)}
								{@const isMine = message.senderId === currentUser.id}
								<div class="resident-chat-message" class:resident-chat-message--mine={isMine}>
									<div class="resident-chat-message__bubble">
										<p class="resident-chat-message__author">
											{isMine ? 'Tu' : (getUserById(message.senderId)?.name ?? 'Amministrazione')}
										</p>
										<p class="resident-chat-message__text">{message.text}</p>
										<p class="resident-chat-message__time">{formatTime(message.timestamp)}</p>
									</div>
								</div>
							{/each}
						{/each}
						<div bind:this={messagesEndEl}></div>
					</div>

					<div class="resident-chat-composer">
						<textarea
							rows="2"
							value={composerText}
							oninput={(event: Event) => (composerText = (event.currentTarget as HTMLTextAreaElement).value)}
							onkeydown={handleComposerKeydown}
							placeholder="Scrivi un messaggio..."
							class="resident-chat-composer__input"
						></textarea>
						<button
							type="button"
							class="resident-chat-composer__send"
							disabled={!composerText.trim()}
							onclick={sendMessage}
							aria-label="Invia messaggio"
						>
							<HugeiconsIcon icon={ArrowUp01Icon} size={16} strokeWidth={2.4} />
						</button>
					</div>
				</div>
			</section>

			{#if relatedReports.length > 0}
				<section class="resident-module-section">
					<div class="resident-module-section__header">
						<div class="resident-heading-with-tip">
							<h2 class="resident-module-section__title">Segnalazioni collegate</h2>
							<InfoTip text="Da qui puoi aprire direttamente le segnalazioni richiamate nella conversazione." />
						</div>
						<p class="resident-module-section__copy">
							Le richieste citate nella conversazione restano consultabili anche dalla sezione Segnalazioni.
						</p>
					</div>

					<div class="resident-chat-reference-list">
						{#each relatedReports as report}
							<div class="resident-chat-reference-card">
								<div class="resident-chat-reference-card__main">
									<div class="resident-chat-reference-card__row">
										<span class="resident-chat-reference-card__icon" aria-hidden="true">
											<HugeiconsIcon icon={Megaphone01Icon} size={14} strokeWidth={1.75} />
										</span>
										<p class="resident-chat-reference-card__title">{report.title}</p>
									</div>
									<p class="resident-chat-reference-card__copy">{report.description}</p>
								</div>
								<div class="resident-chat-reference-card__meta">
									<p class="resident-chat-reference-card__meta-copy">
										Stato: {inferReportStatus(report).replaceAll('_', ' ')}
									</p>
									<Button href={`/resident/reports/${report.id}`} variant="outline" size="sm">
										Apri segnalazione
									</Button>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if relatedPayments.length > 0}
				<section class="resident-module-section">
					<div class="resident-module-section__header">
						<div class="resident-heading-with-tip">
							<h2 class="resident-module-section__title">Pagamenti collegati</h2>
							<InfoTip text="Se una conversazione richiama un movimento economico, puoi aprirlo direttamente da qui." />
						</div>
						<p class="resident-module-section__copy">
							Movimenti utili da consultare insieme agli aggiornamenti ricevuti.
						</p>
					</div>

					<div class="resident-chat-reference-grid">
						{#each relatedPayments as payment}
							<div class="resident-chat-mini-panel">
								<div class="resident-chat-mini-panel__row">
									<span class="resident-chat-mini-panel__icon" aria-hidden="true">
										<HugeiconsIcon icon={CreditCardIcon} size={14} strokeWidth={1.75} />
									</span>
									<p class="resident-chat-mini-panel__title">{payment.description}</p>
								</div>
								<div class="resident-chat-mini-panel__item">
									<p class="resident-chat-mini-panel__label">Riferimento</p>
									<p class="resident-chat-mini-panel__value">{payment.id}</p>
								</div>
								<div class="resident-chat-mini-panel__item">
									<p class="resident-chat-mini-panel__label">Scadenza</p>
									<p class="resident-chat-mini-panel__value">{formatDateTime((payment.paidAt ?? payment.createdAt) as string)}</p>
								</div>
								<div class="resident-chat-payment-actions">
									<Button href={`/resident/payments/${payment.id}`} variant="outline" size="lg">
										Apri pagamento
									</Button>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</div>
</div>
