<script lang="ts">
	import { page } from '$app/state';
	import {
		formatPaymentDateTime,
		getResidentPaymentsContext,
		getResidentReceiptByReference
	} from '$lib/components/view-resident/payments';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const context = $derived(getResidentPaymentsContext(currentUser?.id));
	const reference = $derived(page.url.searchParams.get('reference') ?? '');
	const receipt = $derived(getResidentReceiptByReference(currentUser?.id, reference));
</script>

<svelte:head>
	<title>Ricevuta pagamento - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<div class="payment-detail-actions">
			<Button href="/resident/payments" variant="ghost" class="payment-detail-actions__back">
				&lt; Tutti i pagamenti
			</Button>
		</div>

		{#if !context.currentUser || !context.resident || !context.property || !receipt}
			<ResidentEmptyCard
				title="Ricevuta non disponibile"
				copy="La ricevuta richiesta non e disponibile per il profilo residente attivo."
			/>
		{:else}
			<Card class="payment-detail-hero">
				<CardHeader class="payment-detail-hero__header">
					<div class="payment-detail-hero__heading">
						<p class="payment-detail-hero__eyebrow">Ricevuta residente</p>
						<CardTitle class="payment-detail-hero__title">{receipt.title}</CardTitle>
						<CardDescription class="payment-detail-hero__copy">
							Ricevuta digitale registrata per {context.property.name}, {context.resident.apartment}.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent class="payment-detail-hero__content">
					<div class="payment-detail-hero__amount-block">
						<p class="payment-detail-hero__amount-label">Importo registrato</p>
						<p class="payment-detail-hero__amount-value">{receipt.displayAmount}</p>
						<p class="payment-detail-hero__amount-copy">
							Registrata il {formatPaymentDateTime(receipt.paidAt ?? receipt.createdAt)}
						</p>
					</div>

					<div class="payment-detail-hero__facts">
						<div class="payment-detail-hero__fact">
							<p class="payment-detail-hero__fact-label">Riferimento</p>
							<p class="payment-detail-hero__fact-value">{receipt.reference}</p>
						</div>
						<div class="payment-detail-hero__fact">
							<p class="payment-detail-hero__fact-label">Metodo</p>
							<p class="payment-detail-hero__fact-value">{receipt.method}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card class="payment-detail-card">
				<CardHeader class="payment-detail-card__header">
					<CardTitle class="payment-detail-card__title">Conferma registrazione</CardTitle>
					<CardDescription class="payment-detail-card__copy">
						Dati essenziali della ricevuta associata al checkout residente.
					</CardDescription>
				</CardHeader>

				<CardContent class="payment-detail-card__content">
					<div class="payment-detail-card__facts">
						<div class="payment-detail-card__fact">
							<p class="payment-detail-card__fact-label">Condominio</p>
							<p class="payment-detail-card__fact-value">{context.property.name}</p>
						</div>
						<div class="payment-detail-card__fact">
							<p class="payment-detail-card__fact-label">Residente</p>
							<p class="payment-detail-card__fact-value">{context.currentUser.name}</p>
						</div>
						<div class="payment-detail-card__fact">
							<p class="payment-detail-card__fact-label">Unita</p>
							<p class="payment-detail-card__fact-value">{context.resident.apartment}</p>
						</div>
						<div class="payment-detail-card__fact">
							<p class="payment-detail-card__fact-label">Descrizione</p>
							<p class="payment-detail-card__fact-value">{receipt.description}</p>
						</div>
					</div>

					<div class="payment-reminder-card__actions">
						<Button href="/resident/payments" size="lg" class="payment-reminder-card__button">
							Torna ai pagamenti
						</Button>
						<Button
							href={`/resident/payments/${receipt.sourcePaymentId}`}
							variant="outline"
							size="lg"
							class="payment-reminder-card__button"
						>
							Apri movimento storico
						</Button>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
