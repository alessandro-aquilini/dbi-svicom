	<script lang="ts">
	import {
		ResidentPaymentCard,
		formatMoney,
		formatPaymentDate,
		getPaymentFootnote,
		getResidentLatestReceipt,
		getResidentPaymentReminder,
		getResidentPaymentStatus,
		getResidentPaymentsContext
	} from '$lib/components/view-resident/payments';
	import {
		ResidentEmptyCard,
		ResidentPieChart
	} from '$lib/components/view-resident/resident';
	import { InfoTip } from '$lib/components/shared';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';
	import { getUserById } from '$lib/data/users';

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
	let paymentChartMode = $state<'movements' | 'amount'>('movements');

	const summaryCopy =
		context.property && context.resident
			? `${context.property.name}, ${context.resident.apartment}. Qui trovi le tue quote, i movimenti del condominio e i riferimenti utili.`
			: 'Profilo residente non disponibile.';
	const summaryStats = [
		{ label: 'Quote personali', value: context.personalPayments.length },
		{ label: 'Totale registrato', value: formatMoney(totalPaidByResident, 'EUR') },
		{ label: 'Da saldare', value: formatMoney(outstandingResidentTotal, 'EUR') }
	];
	const summaryChips = context.property
		? [
				context.property.address.street,
				context.admin ? `Admin: ${context.admin.name}` : 'Admin non disponibile',
				lastVisibleMovement
					? `Ultimo movimento ${formatPaymentDate(lastVisibleMovement.paidAt ?? lastVisibleMovement.createdAt)}`
					: 'Nessun movimento visibile'
			]
		: [];
	const paymentChartItems = $derived([
		{
			key: 'personal',
			label: 'Quote personali',
			value:
				paymentChartMode === 'movements'
					? context.personalPayments.length
					: context.personalPayments.reduce((total, payment) => total + payment.amount, 0),
			valueLabel:
				paymentChartMode === 'movements'
					? `${context.personalPayments.length} movimenti`
					: formatMoney(
							context.personalPayments.reduce((total, payment) => total + payment.amount, 0),
							'EUR'
						),
			color: 'var(--chart-1)',
			copy: 'Quota dei movimenti direttamente collegati al tuo profilo residente.'
		},
		{
			key: 'property',
			label: 'Movimenti stabile',
			value:
				paymentChartMode === 'movements'
					? context.propertyOperationalPayments.length
					: context.propertyOperationalPayments.reduce((total, payment) => total + payment.amount, 0),
			valueLabel:
				paymentChartMode === 'movements'
					? `${context.propertyOperationalPayments.length} movimenti`
					: formatMoney(
							context.propertyOperationalPayments.reduce((total, payment) => total + payment.amount, 0),
							'EUR'
						),
			color: 'var(--chart-2)',
			copy: 'Movimenti operativi visibili sul condominio per dare contesto alle spese.'
		}
	]);

	function getDocumentButtonLabel(documentStatus: string) {
		if (documentStatus === 'draft') return 'Modifica';
		if (documentStatus === 'published') return 'Visualizza';
		return 'Apri';
	}
</script>

<svelte:head>
	<title>Pagamenti - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<section class="report-page-header">
			<div class="report-page-header__main">
				<p class="report-page-header__eyebrow">Area economica</p>
				<div class="resident-heading-with-tip">
					<h1 class="report-page-header__title">Pagamenti</h1>
					<InfoTip text="Qui trovi le tue quote, i movimenti visibili sul condominio e i riferimenti utili per gestire pagamenti e verifiche." />
				</div>
				<p class="report-page-header__copy">{summaryCopy}</p>
			</div>

			<div class="report-page-header__stats" aria-label="Panoramica pagamenti">
				{#each summaryStats as stat}
					<div class="report-page-header__stat">
						<p class="report-page-header__stat-label">{stat.label}</p>
						<p class="report-page-header__stat-value">{stat.value}</p>
					</div>
				{/each}
			</div>

			{#if summaryChips.length > 0}
				<div class="report-page-header__chips">
					{#each summaryChips as chip}
						<span class="report-page-header__chip">{chip}</span>
					{/each}
				</div>
			{/if}
		</section>

		<section class="resident-module-section">
			<div class="resident-module-section__header">
				<div class="resident-heading-with-tip">
					<h2 class="resident-module-section__title">Panoramica movimenti</h2>
					<InfoTip text="Questa vista confronta le tue quote personali con i movimenti operativi che risultano visibili sul tuo stabile." />
				</div>
				<p class="resident-module-section__copy">
					Leggi la situazione per numero di movimenti oppure per importo economico complessivo.
				</p>
			</div>

			<div class="resident-chart-toggle">
				<Button
					type="button"
					size="sm"
					variant={paymentChartMode === 'movements' ? 'default' : 'outline'}
					class="resident-chart-toggle__button"
					onclick={() => (paymentChartMode = 'movements')}
				>
					Numero movimenti
				</Button>
				<Button
					type="button"
					size="sm"
					variant={paymentChartMode === 'amount' ? 'default' : 'outline'}
					class="resident-chart-toggle__button"
					onclick={() => (paymentChartMode = 'amount')}
				>
					Valore economico
				</Button>
			</div>

			<div class="payment-visibility-panel">
				<div class="payment-visibility-panel__chart">
					<ResidentPieChart
						items={paymentChartItems}
						totalLabel={paymentChartMode === 'movements' ? 'Movimenti visibili' : 'Importo visibile'}
						totalCopy={
							paymentChartMode === 'movements'
								? 'Quanti movimenti compaiono oggi nel profilo residente.'
								: 'Quanto valgono complessivamente i movimenti oggi visibili.'
						}
						formatValue={(value) =>
							paymentChartMode === 'movements' ? `${value} movimenti` : formatMoney(value, 'EUR')}
					/>
				</div>

				<div class="payment-visibility-panel__legend">
					{#each paymentChartItems as item}
						<div class="payment-visibility-panel__item">
							<div class="payment-visibility-panel__item-main">
								<div class="payment-visibility-panel__item-topline">
									<span
										class="payment-visibility-panel__item-dot"
										style={`background:${item.color};`}
										aria-hidden="true"
									></span>
									<p class="payment-visibility-panel__item-title">{item.label}</p>
								</div>
								<p class="payment-visibility-panel__item-copy">{item.copy}</p>
							</div>
							<p class="payment-visibility-panel__item-value">{item.valueLabel}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		{#if paymentReminder}
			<Card class="payment-reminder-card">
				<CardHeader class="payment-reminder-card__header">
					<div>
						<div class="resident-heading-with-tip resident-heading-with-tip--compact">
							<p class="payment-reminder-card__eyebrow">Prossima azione</p>
							<InfoTip text="Questo promemoria porta al flusso rapido di pagamento e alla ricevuta piu recente registrata sul browser." />
						</div>
						<CardTitle class="payment-reminder-card__title">{paymentReminder.title}</CardTitle>
						<CardDescription class="payment-reminder-card__copy">
							Scadenza {formatPaymentDate(paymentReminder.dueDate)} - {formatMoney(paymentReminder.amount, paymentReminder.currency)}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent class="payment-reminder-card__content">
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

		<section class="resident-module-section">
			<div class="resident-module-section__header">
				<h1 class="resident-module-section__title">Le tue quote</h1>
				<p class="resident-module-section__copy">Movimenti personali collegati al tuo profilo residente.</p>
			</div>

			<div class="payment-cards-stack">
				{#each context.personalPayments as payment}
					{@const footnote = getPaymentFootnote(payment)}
					<ResidentPaymentCard
						eyebrow="Quota residente"
						title={payment.description}
						description={`Operazione prevista per ${formatPaymentDate(payment.paidAt ?? payment.createdAt)}.`}
						amountLabel={formatMoney(payment.amount, payment.currency)}
						status={getResidentPaymentStatus(payment)}
						facts={[
							{ label: 'Da', value: context.currentUser?.name ?? 'Residente' },
							{ label: 'Verso', value: context.admin?.name ?? 'Svicom' }
						]}
						chips={[payment.id]}
						footerLabel={footnote.label}
						footerValue={footnote.value}
						href={`/resident/payments/${payment.id}`}
					/>
				{/each}
			</div>

			{#if context.personalPayments.length === 0}
				<ResidentEmptyCard
					title="Nessun pagamento registrato"
					copy="Quando saranno disponibili nuovi movimenti per il tuo profilo, li troverai qui."
				/>
			{/if}
		</section>

		{#if context.propertyOperationalPayments.length > 0}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<div class="resident-heading-with-tip">
						<h2 class="resident-module-section__title">Movimenti del condominio</h2>
						<InfoTip text="Mostra i movimenti operativi visibili sullo stabile, utili per contestualizzare quote, lavori e ripartizioni." />
					</div>
					<p class="resident-module-section__copy">
						Spese operative visibili sul tuo stabile per dare contesto a quote e ripartizioni.
					</p>
				</div>

				<div class="payment-cards-stack">
					{#each context.propertyOperationalPayments as payment}
						{@const footnote = getPaymentFootnote(payment)}
						<ResidentPaymentCard
							eyebrow="Movimento stabile"
							title={payment.description}
							description="Movimento operativo registrato sul condominio."
							amountLabel={formatMoney(payment.amount, payment.currency)}
							status={getResidentPaymentStatus(payment)}
							facts={[
								{ label: 'Da', value: getUserById(payment.fromId)?.name ?? payment.fromId },
								{ label: 'Verso', value: getUserById(payment.toId)?.name ?? payment.toId }
							]}
							chips={[payment.id]}
							footerLabel={footnote.label}
							footerValue={footnote.value}
							href={`/resident/payments/${payment.id}`}
						/>
					{/each}
				</div>
			</section>
		{/if}

		<div class="payment-support-grid">
			<Card class="payment-support-card">
				<CardHeader class="payment-support-card__header">
					<CardTitle class="payment-support-card__title">Documenti contabili</CardTitle>
					<CardDescription class="payment-support-card__copy">
						Riferimenti utili per verificare quote, regolamenti e ripartizioni.
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
											{getDocumentButtonLabel(document.status)}
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
						Il referente collegato al tuo stabile per richieste su quote e registrazioni.
					</CardDescription>
				</CardHeader>

				<CardContent class="payment-support-card__content">
					<div class="payment-support-card__facts">
						<div class="payment-support-card__fact">
							<p class="payment-support-card__fact-label">Amministratore</p>
							<p class="payment-support-card__fact-value">{context.admin?.name ?? 'Operatore Svicom'}</p>
						</div>
						<div class="payment-support-card__fact">
							<p class="payment-support-card__fact-label">Email</p>
							<p class="payment-support-card__fact-value">{context.admin?.email ?? 'Non disponibile'}</p>
						</div>
						<div class="payment-support-card__fact">
							<p class="payment-support-card__fact-label">Telefono</p>
							<p class="payment-support-card__fact-value">{context.admin?.phone ?? 'Non disponibile'}</p>
						</div>
						<div class="payment-support-card__fact">
							<p class="payment-support-card__fact-label">Condominio</p>
							<p class="payment-support-card__fact-value">{context.property?.name ?? 'Non disponibile'}</p>
						</div>
					</div>

					<div class="payment-support-card__actions">
						<Button href="/resident/chat" size="lg" class="payment-support-card__button">
							Contatta amministrazione
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
