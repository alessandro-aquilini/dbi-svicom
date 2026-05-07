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
import type { PropertyDocument } from '$lib/data/documents';
import type { Payment } from '$lib/data/embeds/payments';
import { getTicketById } from '$lib/data/ticket/tickets';
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

// local alias used by the template
const myPayments = context.personalPayments;

const statusColors: Record<string, string> = {
	paid: 'bg-success/15 text-success',
	pending: 'bg-warning/15 text-warning',
	overdue: 'bg-destructive/15 text-destructive',
	cancelled: 'bg-muted text-muted-foreground'
};

const statusLabels: Record<string, string> = {
	paid: 'Pagato',
	pending: 'In sospeso',
	overdue: 'Scaduto',
	cancelled: 'Annullato'
};

function getDocumentButtonLabel(document: PropertyDocument) {
	// Simple helper to decide label for accounting documents
	if (document.status === 'draft') return 'Modifica';
	if (document.status === 'published') return 'Visualizza';
	return 'Apri';
}

function getPaymentStatus(payment: Payment) {
	if (payment.paidAt) return 'paid';
	if (new Date(payment.dueDate).getTime() < Date.now()) return 'overdue';
	return 'pending';
}
</script>

<svelte:head>
	<title>Pagamenti - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<h1 class="mb-1 text-xl font-semibold text-foreground">Pagamenti</h1>
	<p class="mb-4 text-sm text-muted-foreground">{myPayments.length} transazioni</p>

	<div class="space-y-3">
		{#each myPayments as payment}
			{@const paymentStatus = getPaymentStatus(payment)}
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-sm font-medium text-foreground">{payment.description}</h3>
						<p class="text-xs text-muted-foreground">Scadenza: {payment.dueDate}</p>
					</div>
					<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusColors[paymentStatus] ?? ''}">
						{statusLabels[paymentStatus] ?? paymentStatus}
					</span>
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
									<!-- <p class="payment-support-card__fact-value">{context.property.name}</p> -->
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
			</div>
		{/each}

		{#if myPayments.length === 0}
			<ResidentEmptyCard
				title="Nessun pagamento registrato"
				copy="Quando saranno disponibili nuovi movimenti per il tuo profilo o per il tuo stabile, li troverai qui."
			/>
		{/if}
	</div>
</div>
