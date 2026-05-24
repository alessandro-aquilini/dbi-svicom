<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createQuote } from '$lib/data/embeds/quotes';
	import { linkDocumentToBooking } from '$lib/data/ticket/booking';
	import { linkDocumentToTicket } from '$lib/data/ticket/tickets';

	let {
		open = $bindable(false),
		bookingId,
		ticketId,
		supplierId,
		customerId,
		propertyId,
		onCreated
	} = $props<{
		open: boolean;
		bookingId?: string;
		ticketId?: string;
		supplierId: string;
		customerId: string;
		propertyId: string;
		onCreated?: () => void;
	}>();

	let title = $state('');
	let amount = $state(0);
	let description = $state('');

	function handleSubmit() {
		const quote = createQuote({
			title,
			supplierId,
			customerId,
			propertyId,
			bookingId,
			ticketId,
			amount,
			currency: 'EUR',
			description,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
		});

		if (bookingId) {
			linkDocumentToBooking(bookingId, 'quote', quote.id);
		} else if (ticketId) {
			linkDocumentToTicket(ticketId, 'quote', quote.id);
		}

		open = false;
		onCreated?.();
		// Reset
		title = '';
		amount = 0;
		description = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nuovo Preventivo</Dialog.Title>
			<Dialog.Description>Compila i dettagli per inviare un nuovo preventivo al residente.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="title">Titolo</Label>
				<Input id="title" bind:value={title} placeholder="es. Riparazione caldaia" />
			</div>
			<div class="grid gap-2">
				<Label for="amount">Importo Stimato (€)</Label>
				<Input id="amount" type="number" bind:value={amount} />
			</div>
			<div class="grid gap-2">
				<Label for="description">Dettagli</Label>
				<Textarea id="description" bind:value={description} placeholder="Descrivi le lavorazioni previste..." />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annulla</Button>
			<Button onclick={handleSubmit}>Crea Preventivo</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
