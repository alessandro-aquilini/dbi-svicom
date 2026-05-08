<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Chat01Icon,
		CreditCardIcon,
		Megaphone01Icon,
		Notification01Icon
	} from '@hugeicons/core-free-icons';
	import { getCurrentUser } from '$lib/auth';
	import { ResidentEmptyCard } from '$lib/components/resident';
	import { InfoTip } from '$lib/components/shared';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { getChatsByUserId } from '$lib/data/chats';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getReportById } from '$lib/data/ticket/reports';
	import { getTicketById } from '$lib/data/ticket/tickets';
	import { getUserById } from '$lib/data/users';

	const currentUser = getCurrentUser();
	const residentId = currentUser?.id;
	const userChats = residentId
		? [...getChatsByUserId(residentId)].sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt))
		: [];

	let selectedChatId = $state(userChats[0]?.id ?? '');
	const selectedChat = $derived(userChats.find((chat) => chat.id === selectedChatId));
	const contactUser = $derived(
		selectedChat ? getUserById(selectedChat.participantIds.find((id) => id !== residentId) ?? '') : undefined
	);
	const relatedReports = $derived(
		(selectedChat?.reportIds ?? []).map((id) => getReportById(id)).filter((report) => report !== undefined)
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
	const conversationFacts = $derived(
		selectedChat
			? [
					{ label: 'Ultimo aggiornamento', value: formatDateTime(selectedChat.lastMessageAt) },
					{ label: 'Messaggi visibili', value: `${selectedChat.messages.length}` },
					{ label: 'Segnalazioni collegate', value: `${relatedReports.length}` },
					{ label: 'Pagamenti collegati', value: `${relatedPayments.length}` }
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

	function selectChat(chatId: string) {
		selectedChatId = chatId;
	}
</script>

<svelte:head>
	<title>Assistenza - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<Card class="resident-chat-hero">
			<CardHeader class="resident-chat-hero__header">
				<div class="resident-chat-hero__heading">
					<span class="resident-chat-hero__icon" aria-hidden="true">
						<HugeiconsIcon icon={Chat01Icon} size={18} strokeWidth={1.75} />
					</span>
					<div>
						<p class="resident-chat-hero__eyebrow">Assistenza residente</p>
						<CardTitle class="resident-chat-hero__title">Messaggi e aggiornamenti</CardTitle>
					</div>
				</div>
				<CardDescription class="resident-chat-hero__copy">
					Qui trovi le conversazioni con l amministrazione e i riferimenti utili collegati alle tue richieste.
				</CardDescription>
			</CardHeader>
		</Card>

		{#if !currentUser || userChats.length === 0}
			<ResidentEmptyCard
				title="Nessuna conversazione disponibile"
				copy="Quando saranno presenti aggiornamenti per il tuo profilo, li troverai qui."
			/>
		{:else if selectedChat}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<div class="resident-heading-with-tip">
						<h2 class="resident-module-section__title">Conversazioni attive</h2>
						<InfoTip text="Apri una conversazione per leggere gli ultimi aggiornamenti e i riferimenti collegati." />
					</div>
					<p class="resident-module-section__copy">
						Seleziona la conversazione che vuoi consultare.
					</p>
				</div>

				<div class="resident-chat-thread-list">
					{#each userChats as chat}
						{@const peer = getUserById(chat.participantIds.find((id) => id !== residentId) ?? '')}
						<button
							type="button"
							class:resident-chat-thread-card--active={chat.id === selectedChatId}
							class="resident-chat-thread-card"
							onclick={() => selectChat(chat.id)}
						>
							<div class="resident-chat-thread-card__main">
								<p class="resident-chat-thread-card__title">{peer?.name ?? 'Amministrazione'}</p>
								<p class="resident-chat-thread-card__copy">
									{chat.messages.at(-1)?.text ?? 'Nessun messaggio disponibile.'}
								</p>
							</div>
							<div class="resident-chat-thread-card__meta">
								<p class="resident-chat-thread-card__time">{formatTime(chat.lastMessageAt)}</p>
								<p class="resident-chat-thread-card__refs">
									{(chat.reportIds?.length ?? 0) + (chat.ticketIds?.length ?? 0)} riferimenti
								</p>
							</div>
						</button>
					{/each}
				</div>
			</section>

			<Card class="resident-chat-thread">
				<CardHeader class="resident-chat-thread__header">
					<div class="resident-chat-thread__heading">
						<p class="resident-chat-thread__eyebrow">Conversazione selezionata</p>
						<CardTitle class="resident-chat-thread__title">{contactUser?.name ?? 'Amministrazione'}</CardTitle>
						<CardDescription class="resident-chat-thread__copy">
							Aggiornata il {formatDateTime(selectedChat.lastMessageAt)}.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent class="resident-chat-thread__content">
					<div class="resident-chat-summary-grid">
						{#each conversationFacts as fact}
							<div class="resident-chat-summary-card">
								<p class="resident-chat-summary-card__label">{fact.label}</p>
								<p class="resident-chat-summary-card__value">{fact.value}</p>
							</div>
						{/each}
					</div>

					<div class="resident-chat-message-list">
						{#each selectedChat.messages as message}
							{@const isMine = message.senderId === currentUser.id}
							<div class:resident-chat-message--mine={isMine} class="resident-chat-message">
								<div class="resident-chat-message__bubble">
									<p class="resident-chat-message__author">
										{isMine ? 'Tu' : (getUserById(message.senderId)?.name ?? 'Amministrazione')}
									</p>
									<p class="resident-chat-message__text">{message.text}</p>
									<p class="resident-chat-message__time">{formatTime(message.timestamp)}</p>
								</div>
							</div>
						{/each}
					</div>

					<div class="resident-chat-readonly">
						<p class="resident-chat-readonly__label">Invio messaggi</p>
						<p class="resident-chat-readonly__copy">
							Per questa demo la conversazione e consultabile. Qui vedi gli aggiornamenti gia disponibili per il tuo profilo.
						</p>
					</div>
				</CardContent>
			</Card>

			{#if relatedReports.length > 0}
				<Card class="resident-chat-context-card">
					<CardHeader class="resident-chat-context-card__header">
						<div class="resident-heading-with-tip">
							<CardTitle class="resident-chat-context-card__title">Segnalazioni collegate</CardTitle>
							<InfoTip text="Da qui puoi aprire direttamente le segnalazioni richiamate nella conversazione." />
						</div>
						<CardDescription class="resident-chat-context-card__copy">
							Le richieste citate nella conversazione restano consultabili anche dalla sezione Segnalazioni.
						</CardDescription>
					</CardHeader>

					<CardContent class="resident-chat-context-card__content">
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
											Stato: {report.status.replaceAll('_', ' ')}
										</p>
										<Button href={`/resident/reports/${report.id}`} variant="outline" size="sm">
											Apri segnalazione
										</Button>
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			{#if relatedPayments.length > 0}
				<Card class="resident-chat-context-card">
					<CardHeader class="resident-chat-context-card__header">
						<div class="resident-heading-with-tip">
							<CardTitle class="resident-chat-context-card__title">Pagamenti collegati</CardTitle>
							<InfoTip text="Se una conversazione richiama un movimento economico, puoi aprirlo direttamente da qui." />
						</div>
						<CardDescription class="resident-chat-context-card__copy">
							Movimenti utili da consultare insieme agli aggiornamenti ricevuti.
						</CardDescription>
					</CardHeader>

					<CardContent class="resident-chat-context-card__content">
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
										<p class="resident-chat-mini-panel__value">{formatDateTime(payment.dueDate)}</p>
									</div>
									<div class="resident-chat-payment-actions">
										<Button href={`/resident/payments/${payment.id}`} variant="outline" size="lg">
											Apri pagamento
										</Button>
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			{#if relatedReports.length === 0 && relatedPayments.length === 0}
				<Card class="resident-chat-context-card">
					<CardHeader class="resident-chat-context-card__header">
						<CardTitle class="resident-chat-context-card__title">Riferimenti utili</CardTitle>
						<CardDescription class="resident-chat-context-card__copy">
							Questa conversazione non ha ancora rimandi ad altre sezioni.
						</CardDescription>
					</CardHeader>

					<CardContent class="resident-chat-context-card__content">
						<div class="resident-chat-readonly">
							<p class="resident-chat-readonly__label">Nessun collegamento disponibile</p>
							<p class="resident-chat-readonly__copy">
								Quando una conversazione richiama una segnalazione o un pagamento, il collegamento comparira qui.
							</p>
						</div>
					</CardContent>
				</Card>
			{/if}
		{/if}
	</div>
</div>
