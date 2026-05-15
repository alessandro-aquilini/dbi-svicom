<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { getCurrentUser } from '$lib/auth';
	import { page } from '$app/state';
	import {
		getReportUpdatedAt,
		inferReportStatus
	} from '$lib/data/ticket/reports';
	import {
		TicketPriorityBadge,
		TicketProgressSteps,
		TicketStatusBadge,
		TicketTimeline,
		formatTicketDate,
		getResidentTicketPresentationMetaById,
		getResidentVisibleTicketById,
		getCurrentStatus,
		getReportOperationalContext,
		ticketProgressValues
	} from '$lib/components/reports';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getSupplierTaskById } from '$lib/data/embeds/supplierTasks';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import { getUserById } from '$lib/data/users';

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);
	const ticketId = $derived(page.params.id ?? '');
	const ticket = $derived(getResidentVisibleTicketById(ticketId));
	const presentationMeta = $derived(ticket ? getResidentTicketPresentationMetaById(ticket.id) : undefined);
	const isOwnedTicket = $derived(Boolean(ticket && currentUser && ticket.reportedById === currentUser.id));
	const latestStatus = $derived(ticket ? getCurrentStatus(ticket) : undefined);
	const latestUpdateAt = $derived(ticket ? getReportUpdatedAt(ticket) : undefined);
	const progressValue = $derived(latestStatus ? ticketProgressValues[latestStatus] : 0);
	const isJustCreated = $derived(page.url.searchParams.get('created') === '1');
	const operationalContext = $derived(ticket ? getReportOperationalContext(ticket) : undefined);
	const operationalQuotes = $derived(
		operationalContext
			? operationalContext.ticket.quoteIds
					.map((id) => getQuoteById(id))
					.filter((quote) => quote !== undefined)
			: []
	);
	const operationalInvoices = $derived(
		operationalContext
			? operationalContext.ticket.invoiceIds
					.map((id) => getInvoiceById(id))
					.filter((invoice) => invoice !== undefined)
			: []
	);
	const operationalPayments = $derived(
		operationalContext
			? operationalContext.ticket.paymentIds
					.map((id) => getPaymentById(id))
					.filter((payment) => payment !== undefined)
			: []
	);
	const operationalTasks = $derived(
		operationalContext
			? operationalContext.ticket.interventionIds
					.map((id) => getSupplierTaskById(id))
					.filter((task) => task !== undefined)
			: []
	);

	function getAuthorLabel(authorId?: string): string {
		return authorId ? (getUserById(authorId)?.name ?? 'Operatore Svicom') : 'Operatore Svicom';
	}

	// Build a lightweight timeline from timeline so TicketTimeline can render it
	const timelineEvents = $derived(
		ticket
			? (ticket.timeline || []).map((ev, idx) => ({
					id: ev.id,
					kind: 'status',
					at: ev.at,
					actorId: ev.authorId,
					toStatus: inferReportStatus(ticket) // Placeholder as individual status history is now derived
				}))
			: []
	);
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
									{operationalContext?.supplierLabel ?? 'Da assegnare'}
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
							<p class="report-fact-card__value">{getUserById(ticket.reportedById)?.name ?? 'Utente non disponibile'}</p>
						</div>
						<div class="report-fact-card">
							<p class="report-fact-card__label">Step registrati</p>
							<p class="report-fact-card__value">{(ticket.timeline || []).length}</p>
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
					<TicketTimeline events={timelineEvents} {getAuthorLabel} formatDate={formatTicketDate} />
				</CardContent>
			</Card>

			{#if operationalContext}
				<Card class="report-section-card">
					<CardHeader class="report-section-card__header">
						<CardTitle class="report-section-card__title">Gestione tecnica della segnalazione</CardTitle>
						<p class="report-section-card__copy">
							Questa segnalazione e gia stata presa in gestione dall amministrazione e inoltrata al fornitore incaricato.
						</p>
					</CardHeader>

					<CardContent class="report-section-card__content">
						<div class="report-operational-summary">
							<div class="report-operational-summary__main">
								<p class="report-operational-summary__eyebrow">Pratica tecnica {operationalContext.ticket.id}</p>
								<p class="report-operational-summary__title">{operationalContext.ticket.title}</p>
								<p class="report-operational-summary__copy">
									{operationalContext.ticket.description}
								</p>
								<p class="report-operational-summary__message">
									Il tuo aggiornamento principale e questo: la segnalazione non e piu solo in attesa,
									ma e gia dentro un flusso tecnico operativo.
								</p>
							</div>
							<div class="report-operational-summary__meta">
								<TicketStatusBadge status={operationalContext.status} />
								<p class="report-operational-summary__meta-copy">
									Fornitore incaricato: {operationalContext.supplierLabel}
								</p>
							</div>
						</div>

						<div class="report-facts-grid">
							<div class="report-fact-card">
								<p class="report-fact-card__label">Stato della gestione tecnica</p>
								<p class="report-fact-card__value">
									{operationalContext.status ? ticketProgressValues[operationalContext.status] : 0}% completato
								</p>
							</div>
							<div class="report-fact-card">
								<p class="report-fact-card__label">Fornitore incaricato</p>
								<p class="report-fact-card__value">{operationalContext.supplierLabel}</p>
							</div>
							<div class="report-fact-card">
								<p class="report-fact-card__label">Interventi registrati</p>
								<p class="report-fact-card__value">{operationalTasks.length}</p>
							</div>
							<div class="report-fact-card">
								<p class="report-fact-card__label">Documenti amministrativi</p>
								<p class="report-fact-card__value">
									{operationalQuotes.length + operationalInvoices.length + operationalPayments.length}
								</p>
							</div>
						</div>

						{#if operationalQuotes.length > 0 || operationalInvoices.length > 0 || operationalTasks.length > 0}
							<div class="report-operational-grid">
								{#if operationalQuotes.length > 0}
									<div class="report-operational-panel">
										<p class="report-operational-panel__title">Preventivi registrati</p>
										<div class="report-operational-panel__list">
											{#each operationalQuotes as quote}
												<div class="report-operational-panel__item">
													<p class="report-operational-panel__label">{quote.title}</p>
													<p class="report-operational-panel__value">
														{quote.amount.toFixed(2)} {quote.currency} · inviato {formatTicketDate(quote.createdAt)}
													</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if operationalInvoices.length > 0}
									<div class="report-operational-panel">
										<p class="report-operational-panel__title">Fatture registrate</p>
										<div class="report-operational-panel__list">
											{#each operationalInvoices as invoice}
												<div class="report-operational-panel__item">
													<p class="report-operational-panel__label">{invoice.number}</p>
													<p class="report-operational-panel__value">
														{invoice.amount.toFixed(2)} {invoice.currency} · emessa {formatTicketDate(invoice.createdAt)}
													</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if operationalTasks.length > 0}
									<div class="report-operational-panel">
										<p class="report-operational-panel__title">Sopralluoghi e interventi registrati</p>
										<div class="report-operational-panel__list">
											{#each operationalTasks as task}
												<div class="report-operational-panel__item">
													<p class="report-operational-panel__label">{task.title}</p>
													<p class="report-operational-panel__value">
														{task.type} · {task.date} · {task.startTime}-{task.endTime}
													</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}

						{#if operationalPayments.length > 0}
							<div class="report-operational-actions">
								{#each operationalPayments as payment}
									<Button href={`/resident/payments/${payment.id}`} variant="outline" size="lg">
										Apri dettaglio pagamento {payment.id}
									</Button>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}

			<Card class="report-chat-card">
				<CardContent class="report-chat-card__content">
					<div>
						<p class="report-chat-card__title">Hai bisogno di un aggiornamento?</p>
						<p class="report-chat-card__copy">Apri l assistenza residente per contattare l amministrazione.</p>
					</div>
					<Button href="/resident/chat" size="lg" class="report-chat-card__button">
						Apri assistenza
					</Button>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
