<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { createSupplierTask } from '$lib/data/embeds/supplierTasks';
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
	let type = $state<'sopralluogo' | 'intervento'>('intervento');
	let date = $state('');
	let startTime = $state('09:00');
	let endTime = $state('10:00');
	let location = $state('');

	function handleSubmit() {
		const task = createSupplierTask({
			title,
			type,
			date,
			startTime,
			endTime,
			location,
			supplierId,
			customerId,
			propertyId,
			bookingId,
			ticketId
		});

		if (bookingId) {
			linkDocumentToBooking(bookingId, 'intervention', task.id);
		} else if (ticketId) {
			linkDocumentToTicket(ticketId, 'intervention', task.id);
		}

		open = false;
		onCreated?.();
		// Reset
		title = '';
		date = '';
		location = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nuovo Intervento/Sopralluogo</Dialog.Title>
			<Dialog.Description>Pianifica un nuovo appuntamento relativo a questo servizio.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="title">Titolo Attività</Label>
				<Input id="title" bind:value={title} placeholder="es. Riparazione in loco" />
			</div>
			<div class="grid gap-2">
				<Label>Tipo</Label>
				<Select type="single" bind:value={type}>
					<SelectTrigger>
						{type === 'sopralluogo' ? 'Sopralluogo' : 'Intervento'}
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="sopralluogo">Sopralluogo</SelectItem>
						<SelectItem value="intervento">Intervento</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div class="grid gap-2">
				<Label for="date">Data</Label>
				<Input id="date" type="date" bind:value={date} />
			</div>
			<div class="flex gap-4">
				<div class="grid gap-2 flex-1">
					<Label for="start">Ora Inizio</Label>
					<Input id="start" type="time" bind:value={startTime} />
				</div>
				<div class="grid gap-2 flex-1">
					<Label for="end">Ora Fine</Label>
					<Input id="end" type="time" bind:value={endTime} />
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="location">Luogo</Label>
				<Input id="location" bind:value={location} placeholder="es. Scala B - Int 5" />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annulla</Button>
			<Button onclick={handleSubmit}>Pianifica</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
