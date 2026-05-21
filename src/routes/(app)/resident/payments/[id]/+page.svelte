<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentUser } from '$lib/auth';
	import { page } from '$app/state';
	import {
		getCurrentStatus as getTicketCurrentStatus,
		getTicketById,
		getCurrentSupplier
	} from '$lib/data/ticket/tickets';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getSupplierTaskById } from '$lib/data/embeds/supplierTasks';
	import { getUserById } from '$lib/data/users';
	import {
		getResidentPaymentStatus,
		getResidentPaymentReminder,
		getResidentLatestReceipt,
		getPaymentFootnote,
		isResidentPersonalPayment,
		getResidentPaymentsContext,
		getResidentVisiblePaymentById,
		PaymentStatusBadge
	} from '$lib/components/view-resident/payments';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { formatMoney, formatPaymentDate, formatPaymentDateTime } from '$lib/components/view-resident/payments/presentation';

	const currentUser = getCurrentUser();
	const paymentId = $derived(page.params.id ?? '');
	const context = $derived(getResidentPaymentsContext(currentUser?.id));
	const payment = $derived(getResidentVisiblePaymentById(currentUser?.id, paymentId));
	const status = $derived(payment ? getResidentPaymentStatus(payment) : undefined);
	const footnote = $derived(payment ? getPaymentFootnote(payment) : undefined);
	const isPersonal = $derived(payment ? isResidentPersonalPayment(context, payment) : false);
	const payer = $derived(payment ? getUserById(payment.fromId) : undefined);
	const beneficiary = $derived(payment ? getUserById(payment.toId) : undefined);
	const relatedTicket = $derived(payment?.ticketId ? getTicketById(payment.ticketId) : undefined);
	const relatedTicketStatus = $derived(relatedTicket ? getTicketCurrentStatus(relatedTicket) : undefined);
	const relatedQuotes = $derived(
		relatedTicket
			? relatedTicket.quoteIds.map((id) => getQuoteById(id)).filter((quote) => quote !== undefined)
			: []
	);
	const relatedInvoices = $derived(
		relatedTicket
			? relatedTicket.invoiceIds
					.map((id) => getInvoiceById(id))
					.filter((invoice) => invoice !== undefined)
			: []
	);
	const relatedTasks = $derived(
		relatedTicket
			? relatedTicket.interventionIds
					.map((id) => getSupplierTaskById(id))
					.filter((task) => task !== undefined)
			: []
	);
	const paymentReminder = $derived(getResidentPaymentReminder(context));
	const latestReceipt = $derived(getResidentLatestReceipt(currentUser?.id));
	const accountingDocument = $derived(context.accountingDocuments.find((document) => document.category === 'bilancio'));
	const breakdownItems = $derived(
		accountingDocument
			? accountingDocument.summary
					.replace('Dettaglio costi per ', '')
					.replace(/\.$/, '')
					.split(',')
					.map((item) => item.trim())
					.filter(Boolean)
			: []
	);
	const detailFacts = $derived(
		payment && context.property
			? [
					{ label: 'Pagatore', value: payer?.name ?? 'Operatore Svicom' },
					{ label: 'Beneficiario', value: beneficiary?.name ?? 'Operatore Svicom' },
					{ label: 'Condominio', value: context.property.name },
					{
						label: isPersonal ? 'Unita residente' : 'Riferimento movimento',
						value: isPersonal
							? (context.resident?.apartment ?? 'Non disponibile')
							: (relatedTicket?.id ?? 'Movimento stabile')
					}
				]
			: []
	);
	const ticketStatusLabels: Record<string, string> = {
		opened: 'Aperto',
		estimating: 'In preventivazione',
		approved: 'Approvato',
		in_progress: 'In corso',
		completed: 'Completato',
		paid: 'Pagato',
		closed: 'Chiuso'
	};

	onMount(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
	});
</script>

<svelte:head>
	<title>Dettaglio pagamento - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<div class="payment-detail-actions">
			<Button href="/resident/payments" variant="ghost" class="payment-detail-actions__back">
				&lt; Tutti i pagamenti
			</Button>
		</div>

		{#if !context.currentUser || !context.resident || !context.property}
			<ResidentEmptyCard
				title="Profilo residente non disponibile"
				copy="Non e possibile recuperare i dati del residente per questa vista."
			/>
		{:else if !payment || !status || !footnote}
			<ResidentEmptyCard
				title="Pagamento non disponibile"
				copy="Il movimento richiesto non appartiene al profilo residente attivo o non e disponibile."
			/>
		{:else}
			<Card class="payment-detail-hero">
				<CardHeader class="payment-detail-hero__header">
					<div class="payment-detail-hero__heading">
						<p class="payment-detail-hero__eyebrow">
							{isPersonal ? 'Pagamento residente' : 'Movimento condominio'}
						</p>
						<CardTitle class="payment-detail-hero__title">{payment.description}</CardTitle>
						<CardDescription class="payment-detail-hero__copy">
							{#if isPersonal}
								Movimento registrato sul tuo profilo per {context.property.name}, {context.resident.apartment}.
							{:else}
								Movimento registrato dall'amministrazione per il tuo condominio {context.property.name}.
							{/if}
						</CardDescription>
					</div>

					<div class="payment-detail-hero__badge-row">
						<PaymentStatusBadge {status} />
					</div>
				</CardHeader>

				<CardContent class="payment-detail-hero__content">
					<div class="payment-detail-hero__amount-block">
						<p class="payment-detail-hero__amount-label">Importo registrato</p>
						<p class="payment-detail-hero__amount-value">{formatMoney(payment.amount, payment.currency)}</p>
						<p class="payment-detail-hero__amount-copy">{footnote.label}: {footnote.value}</p>
					</div>

					<div class="payment-detail-hero__facts">
						{#each detailFacts as fact}
							<div class="payment-detail-hero__fact">
								<p class="payment-detail-hero__fact-label">{fact.label}</p>
								<p class="payment-detail-hero__fact-value">{fact.value}</p>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			{#if isPersonal && paymentReminder}
				<Card class="payment-reminder-card">
					<CardHeader class="payment-reminder-card__header">
						<div class="payment-reminder-card__heading">
							<p class="payment-reminder-card__eyebrow">Scadenza in evidenza</p>
							<CardTitle class="payment-reminder-card__title">{paymentReminder.title}</CardTitle>
							<CardDescription class="payment-reminder-card__copy">
								Promemoria calcolato a partire dall'ultima quota disponibile sul tuo profilo.
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
								<p class="payment-reminder-card__fact-label">Scadenza</p>
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
									Apri ricevuta
								</Button>
							{/if}
						</div>
					</CardContent>
				</Card>
			{/if}

			{#if latestReceipt && isPersonal}
				<Card class="payment-detail-card">
					<CardHeader class="payment-detail-card__header">
						<CardTitle class="payment-detail-card__title">Ricevuta residente</CardTitle>
						<CardDescription class="payment-detail-card__copy">
							Ultima ricevuta digitale generata dal checkout residente.
						</CardDescription>
					</CardHeader>

					<CardContent class="payment-detail-card__content">
						<div class="payment-detail-card__facts">
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Riferimento</p>
								<p class="payment-detail-card__fact-value">{latestReceipt.reference}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Metodo</p>
								<p class="payment-detail-card__fact-value">{latestReceipt.method}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Registrata il</p>
								<p class="payment-detail-card__fact-value">{formatPaymentDateTime(latestReceipt.paidAt ?? latestReceipt.createdAt)}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Importo</p>
								<p class="payment-detail-card__fact-value">{latestReceipt.displayAmount}</p>
							</div>
						</div>

						<Button
							href={`/resident/payments/receipt?reference=${latestReceipt.reference}`}
							variant="outline"
							size="lg"
							class="payment-detail-documents__button"
						>
							Apri ricevuta completa
						</Button>
					</CardContent>
				</Card>
			{/if}

			{#if relatedTicket}
				<Card class="payment-detail-card">
					<CardHeader class="payment-detail-card__header">
						<CardTitle class="payment-detail-card__title">Intervento collegato</CardTitle>
						<CardDescription class="payment-detail-card__copy">
							Il movimento e collegato alla filiera operativa del ticket amministrativo presente sul condominio.
						</CardDescription>
					</CardHeader>

					<CardContent class="payment-detail-card__content">
						<div class="payment-detail-card__facts">
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Ticket</p>
								<p class="payment-detail-card__fact-value">{relatedTicket.id}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Stato pratica</p>
								<p class="payment-detail-card__fact-value">
									{relatedTicketStatus ? ticketStatusLabels[relatedTicketStatus] : 'Non disponibile'}
								</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Categoria</p>
								<p class="payment-detail-card__fact-value">{relatedTicket.category}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Fornitore assegnato</p>
								<p class="payment-detail-card__fact-value">
									{getCurrentSupplier(relatedTicket)
										? (getUserById(getCurrentSupplier(relatedTicket)!)?.name ?? 'Non disponibile')
										: 'Da assegnare'}
								</p>
							</div>
						</div>

						<div class="payment-detail-card__notes">
							<p class="payment-detail-card__notes-label">Descrizione pratica</p>
							<p class="payment-detail-card__notes-copy">{relatedTicket.title}. {relatedTicket.description}</p>
						</div>

						{#if relatedQuotes.length > 0 || relatedInvoices.length > 0 || relatedTasks.length > 0}
							<div class="payment-ticket-chain">
								{#if relatedQuotes.length > 0}
									<div class="payment-ticket-chain__panel">
										<p class="payment-ticket-chain__title">Preventivi collegati</p>
										<div class="payment-ticket-chain__list">
											{#each relatedQuotes as quote}
												<div class="payment-ticket-chain__item">
													<p class="payment-ticket-chain__label">{quote.title}</p>
													<p class="payment-ticket-chain__value">
														{formatMoney(quote.amount, quote.currency)} · scade {formatPaymentDate(quote.expiresAt)}
													</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if relatedInvoices.length > 0}
									<div class="payment-ticket-chain__panel">
										<p class="payment-ticket-chain__title">Fatture collegate</p>
										<div class="payment-ticket-chain__list">
											{#each relatedInvoices as invoice}
												<div class="payment-ticket-chain__item">
													<p class="payment-ticket-chain__label">{invoice.number}</p>
													<p class="payment-ticket-chain__value">
														{formatMoney(invoice.amount, invoice.currency)} · emessa {formatPaymentDate(invoice.createdAt)}
													</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								{#if relatedTasks.length > 0}
									<div class="payment-ticket-chain__panel">
										<p class="payment-ticket-chain__title">Sopralluoghi e interventi</p>
										<div class="payment-ticket-chain__list">
											{#each relatedTasks as task}
												<div class="payment-ticket-chain__item">
													<p class="payment-ticket-chain__label">{task.title}</p>
													<p class="payment-ticket-chain__value">
														{task.type} · {task.date} · {task.startTime}-{task.endTime}
													</p>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}

			{#if isPersonal}
				<Card class="payment-detail-card">
					<CardHeader class="payment-detail-card__header">
						<CardTitle class="payment-detail-card__title">Ripartizione quota</CardTitle>
						<CardDescription class="payment-detail-card__copy">
							Lettura guidata delle voci economiche gia disponibili per il tuo stabile.
						</CardDescription>
					</CardHeader>

					<CardContent class="payment-detail-card__content">
						<p class="payment-detail-card__narrative">
							La quota registrata per {context.property.name} si inserisce nel quadro economico del
							condominio descritto nella documentazione disponibile. Il documento piu recente evidenzia
							{#if accountingDocument}
								{' '}{accountingDocument.summary.toLowerCase()}
							{:else}
								{' '}le principali voci di costo comuni del tuo stabile.
							{/if}
						</p>

						{#if breakdownItems.length > 0}
							<div class="payment-breakdown-list">
								{#each breakdownItems as item}
									<div class="payment-breakdown-list__item">
										<p class="payment-breakdown-list__label">Voce di ripartizione</p>
										<p class="payment-breakdown-list__value">{item}</p>
									</div>
								{/each}
							</div>
						{/if}

						{#if accountingDocument}
							<Button
								href={`/resident/documents/${accountingDocument.id}`}
								variant="outline"
								size="lg"
								class="payment-detail-documents__button"
							>
								Apri documento di ripartizione
							</Button>
						{/if}
					</CardContent>
				</Card>
			{/if}

			<div class="payment-detail-panels">
				<Card class="payment-detail-card">
					<CardHeader class="payment-detail-card__header">
						<CardTitle class="payment-detail-card__title">Riferimenti del movimento</CardTitle>
						<CardDescription class="payment-detail-card__copy">
							Dati disponibili per consultare scadenza, registrazione e soggetti coinvolti.
						</CardDescription>
					</CardHeader>

					<CardContent class="payment-detail-card__content">
						<div class="payment-detail-card__facts">
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Scadenza</p>
								<p class="payment-detail-card__fact-value">{formatPaymentDate(payment.paidAt ?? payment.createdAt)}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Registrazione</p>
								<p class="payment-detail-card__fact-value">{formatPaymentDateTime(payment.paidAt ?? payment.createdAt)}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Email beneficiario</p>
								<p class="payment-detail-card__fact-value">{beneficiary?.email ?? 'Non disponibile'}</p>
							</div>
							<div class="payment-detail-card__fact">
								<p class="payment-detail-card__fact-label">Telefono beneficiario</p>
								<p class="payment-detail-card__fact-value">{beneficiary?.phone ?? 'Non disponibile'}</p>
							</div>
						</div>
					</CardContent>
				</Card>

			</div>

			<Card class="payment-chat-card">
				<CardContent class="payment-chat-card__content">
					<div>
						<p class="payment-chat-card__title">Serve un chiarimento su questo movimento?</p>
						<p class="payment-chat-card__copy">
							Apri l assistenza residente per contattare l amministrazione sul movimento selezionato.
						</p>
					</div>
					<Button href="/resident/chat" size="lg" class="payment-chat-card__button">
						Apri assistenza
					</Button>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
