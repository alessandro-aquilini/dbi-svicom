<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createInvoice } from '$lib/data/embeds/invoices';
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

	let number = $state('');
	let amount = $state(0);
	let description = $state('');

	function handleSubmit() {
		const invoice = createInvoice({
			number,
			supplierId,
			customerId,
			propertyId,
			bookingId,
			ticketId,
			amount,
			currency: 'EUR',
			description
		});

		if (bookingId) {
			linkDocumentToBooking(bookingId, 'invoice', invoice.id);
		} else if (ticketId) {
			linkDocumentToTicket(ticketId, 'invoice', invoice.id);
		}

		open = false;
		onCreated?.();
		// Reset
		number = '';
		amount = 0;
		description = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nuova Fattura</Dialog.Title>
			<Dialog.Description>Compila i dettagli per emettere una nuova fattura per questo servizio.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="number">Numero Fattura</Label>
				<Input id="number" bind:value={number} placeholder="es. 2026/FT/001" />
			</div>
			<div class="grid gap-2">
				<Label for="amount">Importo (€)</Label>
				<Input id="amount" type="number" bind:value={amount} />
			</div>
			<div class="grid gap-2">
				<Label for="description">Descrizione</Label>
				<Textarea id="description" bind:value={description} placeholder="Descrivi il servizio prestato..." />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annulla</Button>
			<Button onclick={handleSubmit}>Crea Fattura</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
