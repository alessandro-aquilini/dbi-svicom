<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createPayment } from '$lib/data/embeds/payments';
	import { linkDocumentToBooking } from '$lib/data/ticket/booking';

	let { open = $bindable(false), bookingId, fromId, toId, propertyId, onCreated } = $props<{
		open: boolean;
		bookingId: string;
		fromId: string;
		toId: string;
		propertyId: string;
		onCreated?: () => void;
	}>();

	let amount = $state(0);
	let description = $state('');

	function handleSubmit() {
		const payment = createPayment({
			fromId,
			toId,
			amount,
			currency: 'EUR',
			bookingId,
			propertyId,
			description
		});
		linkDocumentToBooking(bookingId, 'payment', payment.id);
		open = false;
		onCreated?.();
		// Reset
		amount = 0;
		description = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nuovo Pagamento</Dialog.Title>
			<Dialog.Description>Registra un nuovo pagamento relativo a questo servizio.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="amount">Importo (€)</Label>
				<Input id="amount" type="number" bind:value={amount} />
			</div>
			<div class="grid gap-2">
				<Label for="description">Descrizione/Causale</Label>
				<Textarea id="description" bind:value={description} placeholder="es. Saldo intervento idraulico..." />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annulla</Button>
			<Button onclick={handleSubmit}>Invia Pagamento</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
