<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { createSupplierTask } from '$lib/data/embeds/supplierTasks';
	import { linkDocumentToBooking } from '$lib/data/ticket/booking';
	import { linkDocumentToTicket } from '$lib/data/ticket/tickets';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Calendar03Icon,
		Clock01Icon,
		Location01Icon,
		Task01Icon,
		InformationCircleIcon
	} from '@hugeicons/core-free-icons';

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
	<Dialog.Content class="sm:max-w-xl rounded-xl p-0 overflow-hidden">
		<div class="p-6 space-y-6">
			<Dialog.Header class="space-y-4">
				<div class="flex items-center gap-4">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5D7D94]/10 text-[#5D7D94]">
						<HugeiconsIcon icon={Task01Icon} size="24" />
					</div>
					<div class="space-y-1">
						<Dialog.Title class="text-xl font-black tracking-tight text-foreground">
							Pianifica Attività
						</Dialog.Title>
						<Dialog.Description class="text-sm font-medium text-muted-foreground">
							Organizza un nuovo sopralluogo o intervento.
						</Dialog.Description>
					</div>
				</div>
			</Dialog.Header>

			<div class="space-y-5">
				<div class="grid gap-2">
					<Label for="title" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Titolo Attività</Label>
					<Input id="title" bind:value={title} placeholder="es. Riparazione in loco" class="rounded-xl border-border/50 bg-secondary/30 h-11" />
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="grid gap-2">
						<Label class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Tipo Intervento</Label>
						<Select type="single" bind:value={type}>
							<SelectTrigger class="rounded-xl border-border/50 bg-secondary/30 h-11 font-bold">
								{type === 'sopralluogo' ? 'Sopralluogo' : 'Intervento'}
							</SelectTrigger>
							<SelectContent class="rounded-xl">
								<SelectItem value="sopralluogo" class="rounded-lg">Sopralluogo</SelectItem>
								<SelectItem value="intervento" class="rounded-lg">Intervento</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div class="grid gap-2">
						<Label for="date" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Data</Label>
						<div class="relative">
							<HugeiconsIcon icon={Calendar03Icon} size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
							<Input id="date" type="date" bind:value={date} class="rounded-xl border-border/50 bg-secondary/30 h-11 pl-10" />
						</div>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="grid gap-2">
						<Label for="start" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Inizio</Label>
						<div class="relative">
							<HugeiconsIcon icon={Clock01Icon} size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
							<Input id="start" type="time" bind:value={startTime} class="rounded-xl border-border/50 bg-secondary/30 h-11 pl-10" />
						</div>
					</div>
					<div class="grid gap-2">
						<Label for="end" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Fine</Label>
						<div class="relative">
							<HugeiconsIcon icon={Clock01Icon} size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
							<Input id="end" type="time" bind:value={endTime} class="rounded-xl border-border/50 bg-secondary/30 h-11 pl-10" />
						</div>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="location" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Indirizzo / Note Luogo</Label>
					<div class="relative">
						<HugeiconsIcon icon={Location01Icon} size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
						<Input id="location" bind:value={location} placeholder="es. Scala B - Int 5" class="rounded-xl border-border/50 bg-secondary/30 h-11 pl-10" />
					</div>
				</div>
			</div>
		</div>

		<Dialog.Footer class="px-8 pt-4 pb-8 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3">
			<Button variant="outline" onclick={() => (open = false)} class="rounded-xl h-12 font-bold flex-1 order-2 sm:order-1">Annulla</Button>
			<Button onclick={handleSubmit} class="rounded-xl h-12 font-black bg-[#5D7D94] hover:bg-[#5D7D94]/90 text-white flex-1 order-1 sm:order-2 shadow-lg shadow-[#5D7D94]/20 transition-all">
				Salva Attività
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
