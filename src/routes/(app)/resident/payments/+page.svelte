<script lang="ts">
	import {
		ResidentPaymentCard,
		formatMoney,
		formatPaymentDate,
		getPaymentFootnote,
		getResidentLatestReceipt,
		getResidentPaymentReminder,
		getResidentPaymentStatus,
		getResidentPaymentsContext,
		type ResidentPaymentStatus
	} from '$lib/components/payments';
	import { ResidentEmptyCard, ResidentSummaryCard } from '$lib/components/resident';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';
	import type { SvicomDocument } from '$lib/data/documents';
	import type { Payment } from '$lib/data/payments';
	import { getTicketById } from '$lib/data/tickets';
	import { getUserById } from '$lib/data/users';

	type PaymentCardModel = {
		paymentId: string;
		eyebrow: string;
		title: string;
		description: string;
		amountLabel: string;
		status: ResidentPaymentStatus;
		facts: Array<{ label: string; value: string }>;
		chips: string[];
		footerLabel: string;
		footerValue: string;
	};

	const currentUser = getCurrentUser();
	const context = getResidentPaymentsContext(currentUser?.id);
	const paymentReminder = getResidentPaymentReminder(context);
	const latestReceipt = getResidentLatestReceipt(currentUser?.id);

	const totalPaidByResident = context.personalPayments
		.filter((payment) => Boolean(payment.paidAt))
		.reduce((total, payment) => total + payment.amount, 0);
	const outstandingResidentTotal = context.personalPayments
		.filter((payment) => !payment.paidAt)
		.reduce((total, payment) => total + payment.amount, 0);
	const lastVisibleMovement = context.allVisiblePayments[0];

	const summaryCopy =
		context.property && context.resident
			? `${context.property.name}, ${context.resident.apartment}. Consulta la tua quota registrata, i movimenti economici gia presenti per il condominio e i riferimenti contabili disponibili.`
			: 'Profilo residente non disponibile.';

	const summaryStats = [
		{ label: 'Saldo aperto', value: formatMoney(outstandingResidentTotal, 'EUR') },
		{ label: 'Versato da te', value: formatMoney(totalPaidByResident, 'EUR') },
		{ label: 'Movimenti nello stabile', value: context.allVisiblePayments.length }
	];

	const summaryChips = context.property
		? compactValues([
				context.property.address.street,
				context.admin ? `Amministratore: ${context.admin.name}` : undefined,
				lastVisibleMovement
					? `Ultima registrazione ${formatPaymentDate(lastVisibleMovement.paidAt ?? lastVisibleMovement.dueDate)}`
					: 'Nessun movimento registrato'
			])
		: [];

	const personalPaymentCards = context.personalPayments.map(buildPersonalPaymentCard);
	const propertyPaymentCards = context.propertyOperationalPayments.map(buildPropertyPaymentCard);

	function compactValues(values: Array<string | undefined>): string[] {
		return values.filter((value): value is string => Boolean(value));
	}

	function buildPersonalPaymentCard(payment: Payment): PaymentCardModel {
		const beneficiary = getUserById(payment.toId);
		const footnote = getPaymentFootnote(payment);
		const chips = compactValues([
			context.property?.name,
			context.resident?.apartment,
			paymentReminder?.sourcePaymentId === payment.id ? 'Quota di riferimento' : undefined
		]);

		return {
			paymentId: payment.id,
			eyebrow: 'Quota residente',
			title: payment.description,
			description: `Movimento registrato verso ${beneficiary?.name ?? 'amministrazione'} per ${context.property?.name ?? 'il tuo condominio'}.`,
			amountLabel: formatMoney(payment.amount, payment.currency),
			status: getResidentPaymentStatus(payment),
			facts: [
				{ label: 'Beneficiario', value: beneficiary?.name ?? 'Operatore Svicom' },
				{ label: 'Scadenza', value: formatPaymentDate(payment.dueDate) }
			],
			chips,
			footerLabel: footnote.label,
			footerValue: footnote.value
		};
	}

	function buildPropertyPaymentCard(payment: Payment): PaymentCardModel {
		const supplier = getUserById(payment.toId);
		const relatedTicket = payment.ticketId ? getTicketById(payment.ticketId) : undefined;
		const footnote = getPaymentFootnote(payment);
		const propertyLabel = context.property?.name;

		return {
			paymentId: payment.id,
			eyebrow: 'Spesa operativa',
			title: payment.description,
			description: relatedTicket
				? `Pagamento gestito dall'amministrazione e collegato alla pratica ${relatedTicket.id} nello stabile ${propertyLabel ?? ''}.`
				: `Pagamento gestito dall'amministrazione per ${propertyLabel ?? 'il condominio'}.`,
			amountLabel: formatMoney(payment.amount, payment.currency),
			status: getResidentPaymentStatus(payment),
			facts: [
				{ label: 'Fornitore', value: supplier?.name ?? 'Operatore non disponibile' },
				{ label: 'Ticket', value: relatedTicket ? relatedTicket.id : 'Nessun ticket collegato' }
			],
			chips: compactValues([propertyLabel, relatedTicket ? `Categoria ${relatedTicket.category}` : undefined]),
			footerLabel: footnote.label,
			footerValue: footnote.value
		};
	}

	function getDocumentButtonLabel(document: SvicomDocument): string {
		return document.category === 'bilancio' ? 'Apri ripartizione' : 'Apri riferimento';
	}
</script>

<svelte:head>
	<title>Pagamenti - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<ResidentSummaryCard
			eyebrow="Area residente"
			title="Pagamenti"
			copy={summaryCopy}
			stats={summaryStats}
			chips={summaryChips}
		/>

		{#if !context.currentUser || !context.resident || !context.property}
			<ResidentEmptyCard
				title="Profilo residente non disponibile"
				copy="Non e possibile recuperare i dati del residente per questa vista."
			/>
		{:else}
			{#if paymentReminder}
				<Card class="payment-reminder-card">
					<CardHeader class="payment-reminder-card__header">
						<div class="payment-reminder-card__heading">
							<p class="payment-reminder-card__eyebrow">Promemoria residente</p>
							<CardTitle class="payment-reminder-card__title">{paymentReminder.title}</CardTitle>
							<CardDescription class="payment-reminder-card__copy">
								{paymentReminder.description}
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent class="payment-reminder-card__content">
						<div class="payment-reminder-card__facts">
							<div class="payment-reminder-card__fact">
								<p class="payment-reminder-card__fact-label">Importo previsto</p>
								<p class="payment-reminder-card__fact-value">{paymentReminder.amountLabel}</p>
							</div>
							<div class="payment-reminder-card__fact">
								<p class="payment-reminder-card__fact-label">Scadenza in evidenza</p>
								<p class="payment-reminder-card__fact-value">
									{formatPaymentDate(paymentReminder.dueDate)}
								</p>
							</div>
						</div>

						<div class="payment-reminder-card__actions">
							<Button href="/resident/payments/checkout" size="lg" class="payment-reminder-card__button">
								Paga ora
							</Button>
							{#if latestReceipt}
								<Button
									href={`/resident/payments/receipt?reference=${latestReceipt.reference}`}
									variant="outline"
									size="lg"
									class="payment-reminder-card__button"
								>
									Ultima ricevuta
								</Button>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/if}

			{#if personalPaymentCards.length > 0}
				<section class="resident-module-section">
					<div class="resident-module-section__header">
						<h1 class="resident-module-section__title">La tua posizione</h1>
						<p class="resident-module-section__copy">
							Quote e movimenti registrati direttamente sul tuo profilo residente.
						</p>
					</div>

					<div class="payment-cards-stack">
						{#each personalPaymentCards as paymentCard}
							<ResidentPaymentCard
								eyebrow={paymentCard.eyebrow}
								title={paymentCard.title}
								description={paymentCard.description}
								amountLabel={paymentCard.amountLabel}
								status={paymentCard.status}
								facts={paymentCard.facts}
								chips={paymentCard.chips}
								footerLabel={paymentCard.footerLabel}
								footerValue={paymentCard.footerValue}
								href={`/resident/payments/${paymentCard.paymentId}`}
								ctaLabel="Apri movimento"
							/>
						{/each}
					</div>
				</section>
			{/if}

			{#if propertyPaymentCards.length > 0}
				<section class="resident-module-section">
					<div class="resident-module-section__header">
						<h2 class="resident-module-section__title">Spese operative nello stabile</h2>
						<p class="resident-module-section__copy">
							Movimenti gia registrati dall'amministrazione per interventi e attivita del tuo condominio.
						</p>
					</div>

					<div class="payment-cards-stack">
						{#each propertyPaymentCards as paymentCard}
							<ResidentPaymentCard
								eyebrow={paymentCard.eyebrow}
								title={paymentCard.title}
								description={paymentCard.description}
								amountLabel={paymentCard.amountLabel}
								status={paymentCard.status}
								facts={paymentCard.facts}
								chips={paymentCard.chips}
								footerLabel={paymentCard.footerLabel}
								footerValue={paymentCard.footerValue}
								href={`/resident/payments/${paymentCard.paymentId}`}
								ctaLabel="Apri dettaglio"
							/>
						{/each}
					</div>
				</section>
			{/if}

			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<h2 class="resident-module-section__title">Riferimenti utili</h2>
					<p class="resident-module-section__copy">
						Documenti contabili disponibili e contatti amministrativi per la gestione dei pagamenti.
					</p>
				</div>

				<div class="payment-support-grid">
					<Card class="payment-support-card">
						<CardHeader class="payment-support-card__header">
							<CardTitle class="payment-support-card__title">Documenti contabili</CardTitle>
							<CardDescription class="payment-support-card__copy">
								Materiali gia caricati nel backend e utili per verificare quote e ripartizioni.
							</CardDescription>
						</CardHeader>

						<CardContent class="payment-support-card__content">
							{#if context.accountingDocuments.length > 0}
								<div class="payment-support-list">
									{#each context.accountingDocuments as document}
										<div class="payment-support-list__item">
											<div class="payment-support-list__main">
												<p class="payment-support-list__eyebrow">{document.status}</p>
												<p class="payment-support-list__title">{document.title}</p>
												<p class="payment-support-list__copy">{document.summary}</p>
											</div>

											<div class="payment-support-list__meta">
												<p class="payment-support-list__meta-copy">
													Aggiornato {formatPaymentDate(document.updatedAt)}
												</p>
												<Button
													href={`/resident/documents/${document.id}`}
													variant="outline"
													size="lg"
													class="payment-support-list__button"
												>
													{getDocumentButtonLabel(document)}
												</Button>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<p class="payment-support-card__empty">Nessun documento contabile disponibile.</p>
							{/if}
						</CardContent>
					</Card>

					<Card class="payment-support-card">
						<CardHeader class="payment-support-card__header">
							<CardTitle class="payment-support-card__title">Supporto amministrativo</CardTitle>
							<CardDescription class="payment-support-card__copy">
								Il referente gia collegato al tuo condominio per richieste su quote e registrazioni.
							</CardDescription>
						</CardHeader>

						<CardContent class="payment-support-card__content">
							<div class="payment-support-card__facts">
								<div class="payment-support-card__fact">
									<p class="payment-support-card__fact-label">Amministratore</p>
									<p class="payment-support-card__fact-value">{context.admin?.name ?? 'Operatore Svicom'}</p>
								</div>
								<div class="payment-support-card__fact">
									<p class="payment-support-card__fact-label">Contatto email</p>
									<p class="payment-support-card__fact-value">{context.admin?.email ?? 'Non disponibile'}</p>
								</div>
								<div class="payment-support-card__fact">
									<p class="payment-support-card__fact-label">Telefono</p>
									<p class="payment-support-card__fact-value">{context.admin?.phone ?? 'Non disponibile'}</p>
								</div>
								<div class="payment-support-card__fact">
									<p class="payment-support-card__fact-label">Condominio</p>
									<p class="payment-support-card__fact-value">{context.property.name}</p>
								</div>
							</div>

							<div class="payment-support-card__actions">
								<Button href="/resident/chat" size="lg" class="payment-support-card__button">
									Apri assistenza pagamenti
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{#if personalPaymentCards.length === 0 && propertyPaymentCards.length === 0}
				<ResidentEmptyCard
					title="Nessun pagamento registrato"
					copy="Quando saranno disponibili nuovi movimenti per il tuo profilo o per il tuo stabile, li troverai qui."
				/>
			{/if}
		{/if}
	</div>
</div>
