<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		createResidentPaymentReceipt,
		formatPaymentDate,
		getResidentPaymentMethodOptions,
		getResidentPaymentReminder,
		getResidentPaymentsContext
	} from '$lib/components/view-resident/payments';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import { getCurrentUser } from '$lib/auth';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';

	const currentUser = getCurrentUser();
	const context = getResidentPaymentsContext(currentUser?.id);
	const reminder = getResidentPaymentReminder(context);
	const methodOptions = getResidentPaymentMethodOptions();

	let selectedMethod = $state(methodOptions[0]?.value ?? 'Carta condominiale');
	let isSubmitting = $state(false);

	const selectedMethodOption = $derived(
		methodOptions.find((option) => option.value === selectedMethod) ?? methodOptions[0]
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!reminder || !context.currentUser) return;

		isSubmitting = true;
		await new Promise((resolve) => setTimeout(resolve, 650));

		const receipt = createResidentPaymentReceipt({
			reminder,
			method: selectedMethod
		});

		await goto(`/resident/payments/receipt?reference=${receipt.reference}`);
	}
</script>

<svelte:head>
	<title>Paga ora - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<div class="payment-detail-actions">
			<Button href="/resident/payments" variant="ghost" class="payment-detail-actions__back">
				&lt; Tutti i pagamenti
			</Button>
		</div>

		{#if !context.currentUser || !context.resident || !context.property || !reminder}
			<ResidentEmptyCard
				title="Checkout non disponibile"
				copy="Non ci sono quote residenti disponibili per il pagamento in questa vista."
			/>
		{:else}
			<Card class="payment-detail-hero">
				<CardHeader class="payment-detail-hero__header">
					<div class="payment-detail-hero__heading">
						<p class="payment-detail-hero__eyebrow">Checkout residente</p>
						<CardTitle class="payment-detail-hero__title">{reminder.title}</CardTitle>
						<CardDescription class="payment-detail-hero__copy">
							Conferma il pagamento della quota residente collegata al tuo profilo.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent class="payment-detail-hero__content">
					<div class="payment-detail-hero__amount-block">
						<p class="payment-detail-hero__amount-label">Importo da confermare</p>
						<p class="payment-detail-hero__amount-value">{reminder.amountLabel}</p>
						<p class="payment-detail-hero__amount-copy">
							Scadenza residente: {formatPaymentDate(reminder.dueDate)}
						</p>
					</div>

					<div class="payment-detail-hero__facts">
						<div class="payment-detail-hero__fact">
							<p class="payment-detail-hero__fact-label">Condominio</p>
							<p class="payment-detail-hero__fact-value">{context.property.name}</p>
						</div>
						<div class="payment-detail-hero__fact">
							<p class="payment-detail-hero__fact-label">Unita</p>
							<p class="payment-detail-hero__fact-value">{context.resident.apartment}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card class="payment-detail-card">
				<CardHeader class="payment-detail-card__header">
					<CardTitle class="payment-detail-card__title">Metodo di pagamento</CardTitle>
					<CardDescription class="payment-detail-card__copy">
						Seleziona il canale con cui vuoi registrare il pagamento residente.
					</CardDescription>
				</CardHeader>

				<CardContent class="payment-detail-card__content">
					<form class="payment-form" onsubmit={handleSubmit}>
						<div class="payment-form__field">
							<Label for="payment-method-trigger">Canale di pagamento</Label>
							<Select type="single" bind:value={selectedMethod}>
								<SelectTrigger id="payment-method-trigger" class="payment-form__select-trigger">
									{selectedMethodOption?.label ?? 'Seleziona metodo'}
								</SelectTrigger>
								<SelectContent>
									{#each methodOptions as option}
										<SelectItem value={option.value} label={option.label} />
									{/each}
								</SelectContent>
							</Select>
							<p class="payment-form__hint">{selectedMethodOption?.copy}</p>
						</div>

						<div class="payment-form__actions">
							<Button type="submit" size="lg" class="payment-form__submit" disabled={isSubmitting}>
								{isSubmitting ? 'Registrazione in corso...' : 'Conferma pagamento'}
							</Button>
							<Button
								href="/resident/payments"
								variant="outline"
								size="lg"
								class="payment-form__cancel"
								disabled={isSubmitting}
							>
								Annulla
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
