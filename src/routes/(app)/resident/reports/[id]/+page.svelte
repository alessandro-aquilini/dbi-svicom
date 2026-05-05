<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { getCurrentUser } from '$lib/auth';
	import { page } from '$app/state';
	import {
		TicketPriorityBadge,
		TicketProgressSteps,
		TicketStatusBadge,
		TicketTimeline,
		formatTicketDate,
		getResidentTicketPresentationMetaById,
		getResidentVisibleTicketById,
		getLatestTicketStatus,
		ticketProgressValues
	} from '$lib/components/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import { getUserById } from '$lib/data/users';

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);
	const ticketId = $derived(page.params.id ?? '');
	const ticket = $derived(getResidentVisibleTicketById(ticketId));
	const presentationMeta = $derived(ticket ? getResidentTicketPresentationMetaById(ticket.id) : undefined);
	const isOwnedTicket = $derived(Boolean(ticket && currentUser && ticket.creatorId === currentUser.id));
	const latestStatus = $derived(ticket ? getLatestTicketStatus(ticket.statusHistory) : undefined);
	const latestUpdateAt = $derived(ticket?.statusHistory.at(-1)?.at);
	const progressValue = $derived(latestStatus ? ticketProgressValues[latestStatus] : 0);
	const isJustCreated = $derived(page.url.searchParams.get('created') === '1');

	function getAuthorLabel(authorId?: string): string {
		return authorId ? (getUserById(authorId)?.name ?? 'Operatore Svicom') : 'Operatore Svicom';
	}
</script>

<svelte:head>
	<title>Dettaglio segnalazione - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="reports-page reports-page--detail">
	<Button href="/resident/reports" variant="link" class="report-back-button">
		&lt; Tutte le segnalazioni
	</Button>

	{#if !currentUser || !resident || !property}
		<Card class="report-empty-card report-empty-card--detail">
			<CardContent class="report-empty-card__content">
				<p class="report-empty-card__title">Profilo residente non disponibile</p>
				<p class="report-empty-card__copy">Non e possibile recuperare i dati del residente per questa vista.</p>
			</CardContent>
		</Card>
	{:else if !ticket || !isOwnedTicket}
		<Card class="report-empty-card report-empty-card--detail">
			<CardContent class="report-empty-card__content">
				<p class="report-empty-card__title">Segnalazione non disponibile</p>
				<p class="report-empty-card__copy">La pratica richiesta non e visibile per questo profilo residente.</p>
			</CardContent>
		</Card>
	{:else}
		<div class="report-detail-stack">
			{#if isJustCreated}
				<Card class="report-created-card">
					<CardContent class="report-created-card__content">
						<div>
							<p class="report-created-card__title">Segnalazione inviata correttamente</p>
							<p class="report-created-card__copy">
								La pratica e stata registrata nel tuo flusso residente ed e gia visibile tra le segnalazioni.
							</p>
						</div>

						{#if presentationMeta}
							<div class="report-created-card__summary">
								<div class="report-created-card__summary-item">
									<p class="report-created-card__summary-label">Foto allegate</p>
									<p class="report-created-card__summary-value">{presentationMeta.attachments.length}</p>
								</div>
								<div class="report-created-card__summary-item">
									<p class="report-created-card__summary-label">Dettagli aggiuntivi</p>
									<p class="report-created-card__summary-value">{presentationMeta.fieldAnswers.length}</p>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}

			<Card class="report-hero-card">
				<CardHeader class="report-hero-card__header">
					<div class="report-hero-card__heading">
						<p class="report-hero-card__eyebrow">{ticket.id}</p>
						<CardTitle class="report-hero-card__title">{ticket.title}</CardTitle>
					</div>
					{#if latestStatus}
						<TicketStatusBadge status={latestStatus} />
					{/if}
				</CardHeader>

				<CardContent class="report-hero-card__content">
					<p class="report-hero-card__copy">{ticket.description}</p>

					<div class="report-progress-card">
						<div class="report-progress-card__row">
							<p class="report-progress-card__label">Avanzamento pratica</p>
							<p class="report-progress-card__value">{progressValue}%</p>
						</div>
						<Progress class="report-progress-card__track" value={progressValue} max={100} />
						<p class="report-progress-card__meta">Ultimo aggiornamento: {formatTicketDate(latestUpdateAt)}</p>
					</div>

					<TicketProgressSteps currentStatus={latestStatus} />

					<div class="report-hero-card__meta-grid">
						<div class="report-hero-card__meta-block">
							<p class="report-hero-card__meta-label">Immobile</p>
							<p class="report-hero-card__meta-value">{property.name}</p>
							<p class="report-hero-card__meta-copy">{resident.apartment}</p>
						</div>
						<div class="report-hero-card__meta-block">
							<p class="report-hero-card__meta-label">Fornitore assegnato</p>
							<p class="report-hero-card__meta-value">
								{ticket.supplierId ? (getUserById(ticket.supplierId)?.name ?? 'Da assegnare') : 'Da assegnare'}
							</p>
							<p class="report-hero-card__meta-copy">{property.address.street}, {property.address.city}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card class="report-section-card">
				<CardHeader class="report-section-card__header">
					<CardTitle class="report-section-card__title">Riepilogo rapido</CardTitle>
					<p class="report-section-card__copy">Informazioni essenziali della pratica.</p>
				</CardHeader>

				<CardContent class="report-section-card__content">
					<div class="report-facts-grid">
						<div class="report-fact-card">
							<p class="report-fact-card__label">Categoria</p>
							<p class="report-fact-card__value">{ticket.category}</p>
						</div>
						<div class="report-fact-card">
							<p class="report-fact-card__label">Priorita</p>
							<div class="report-fact-card__badge-row">
								<TicketPriorityBadge priority={ticket.priority} />
							</div>
						</div>
						<div class="report-fact-card">
							<p class="report-fact-card__label">Creato da</p>
							<p class="report-fact-card__value">{getUserById(ticket.creatorId)?.name ?? 'Utente non disponibile'}</p>
						</div>
						<div class="report-fact-card">
							<p class="report-fact-card__label">Step registrati</p>
							<p class="report-fact-card__value">{ticket.statusHistory.length}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{#if presentationMeta}
				<Card class="report-section-card">
					<CardHeader class="report-section-card__header">
						<CardTitle class="report-section-card__title">Dettagli inviati dal residente</CardTitle>
						<p class="report-section-card__copy">
							Informazioni aggiuntive e allegati raccolti in apertura della pratica.
						</p>
					</CardHeader>

					<CardContent class="report-section-card__content">
						{#if presentationMeta.fieldAnswers.length > 0}
							<div class="report-meta-grid">
								{#each presentationMeta.fieldAnswers as answer}
									<div class="report-meta-card">
										<p class="report-meta-card__label">{answer.label}</p>
										<p class="report-meta-card__value">{answer.value}</p>
									</div>
								{/each}
							</div>
						{/if}

						{#if presentationMeta.attachments.length > 0}
							<div class="report-attachments report-attachments--detail">
								{#each presentationMeta.attachments as attachment}
									<div class="report-attachments__item">
										<p class="report-attachments__name">{attachment.name}</p>
										<p class="report-attachments__meta">
											{attachment.typeLabel} · {attachment.sizeLabel}
										</p>
									</div>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}

			<Card class="report-section-card">
				<CardHeader class="report-section-card__header">
					<CardTitle class="report-section-card__title">Stato di avanzamento</CardTitle>
					<p class="report-section-card__copy">Cronologia completa della tua segnalazione.</p>
				</CardHeader>

				<CardContent class="report-section-card__content">
					<TicketTimeline history={ticket.statusHistory} {getAuthorLabel} formatDate={formatTicketDate} />
				</CardContent>
			</Card>

			<Card class="report-chat-card">
				<CardContent class="report-chat-card__content">
					<div>
						<p class="report-chat-card__title">Hai bisogno di un aggiornamento?</p>
						<p class="report-chat-card__copy">Apri la chat residente per contattare Svicom dal flusso operativo.</p>
					</div>
					<Button href="/resident/chat" size="lg" class="report-chat-card__button">
						Vai alla chat
					</Button>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
