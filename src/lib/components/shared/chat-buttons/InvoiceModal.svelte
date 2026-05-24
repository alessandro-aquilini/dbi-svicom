<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createInvoice } from '$lib/data/embeds/invoices';
	import { linkDocumentToBooking } from '$lib/data/ticket/booking';
	import { linkDocumentToTicket } from '$lib/data/ticket/tickets';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Invoice01Icon, 
		FileAttachmentIcon, 
		Upload01Icon, 
		Tick01Icon,
		Delete02Icon,
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

	let number = $state('');
	let amount = $state(0);
	let description = $state('');
	let isUploading = $state(false);
	let uploadedFile = $state<File | null>(null);

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			isUploading = true;
			// Simulation of upload progress
			setTimeout(() => {
				uploadedFile = target.files![0];
				isUploading = false;
				// Auto-fill some fields if possible (mocked)
				if (!number) number = `FT-${Math.floor(Math.random() * 1000)}`;
			}, 1000);
		}
	}

	function removeFile() {
		uploadedFile = null;
	}

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
		uploadedFile = null;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-xl rounded-xl p-0 overflow-hidden">
		<div class="p-6 space-y-6">
			<Dialog.Header class="space-y-4">
				<div class="flex items-center gap-4">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5D7D94]/10 text-[#5D7D94]">
						<HugeiconsIcon icon={Invoice01Icon} size="24" />
					</div>
					<div class="space-y-1">
						<Dialog.Title class="text-xl font-black tracking-tight text-foreground">
							Emetti Fattura
						</Dialog.Title>
						<Dialog.Description class="text-sm font-medium text-muted-foreground">
							Carica un PDF o inserisci i dettagli manualmente.
						</Dialog.Description>
					</div>
				</div>
			</Dialog.Header>

			<div class="space-y-6">
				<!-- File Upload Area -->
				<div class="relative">
					{#if !uploadedFile}
						<label 
							class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl bg-secondary/20 hover:bg-secondary/30 hover:border-[#5D7D94]/30 transition-all cursor-pointer group"
						>
							<div class="flex flex-col items-center justify-center pt-5 pb-6">
								{#if isUploading}
									<div class="h-8 w-8 animate-spin rounded-full border-2 border-[#5D7D94] border-t-transparent mb-2"></div>
									<p class="text-xs font-bold text-[#5D7D94] animate-pulse">Caricamento in corso...</p>
								{:else}
									<div class="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm mb-3 group-hover:scale-110 transition-transform">
										<HugeiconsIcon icon={Upload01Icon} size="20" class="text-[#5D7D94]" />
									</div>
									<p class="text-xs font-bold text-foreground">Trascina o clicca per caricare il PDF</p>
									<p class="text-[10px] text-muted-foreground mt-1 uppercase tracking-tight font-bold">PDF, max 10MB</p>
								{/if}
							</div>
							<input type="file" class="hidden" accept="application/pdf" onchange={handleFileChange} disabled={isUploading} />
						</label>
					{:else}
						<div class="flex items-center justify-between p-4 rounded-2xl bg-[#5D7D94]/5 border border-[#5D7D94]/20 animate-in fade-in slide-in-from-top-2 duration-300">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
									<HugeiconsIcon icon={FileAttachmentIcon} size="20" class="text-[#5D7D94]" />
								</div>
								<div class="min-w-0">
									<p class="text-sm font-bold text-foreground truncate">{uploadedFile.name}</p>
									<p class="text-[10px] font-bold text-[#5D7D94] uppercase flex items-center gap-1">
										<HugeiconsIcon icon={Tick01Icon} size="10" /> Documento pronto
									</p>
								</div>
							</div>
							<button 
								onclick={removeFile}
								class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
							>
								<HugeiconsIcon icon={Delete02Icon} size="18" />
							</button>
						</div>
					{/if}
				</div>

				<div class="relative py-2">
					<div class="absolute inset-0 flex items-center"><span class="w-full border-t border-border"></span></div>
					<div class="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"><span class="bg-card px-3">Dati Fattura</span></div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="grid gap-2">
						<Label for="number" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Numero</Label>
						<Input id="number" bind:value={number} placeholder="es. 2026/FT/001" class="rounded-xl border-border/50 bg-secondary/30 h-11" />
					</div>
					<div class="grid gap-2">
						<Label for="amount" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Importo (€)</Label>
						<Input id="amount" type="number" bind:value={amount} class="rounded-xl border-border/50 bg-secondary/30 h-11" />
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="description" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Descrizione / Note</Label>
					<Textarea id="description" bind:value={description} placeholder="Descrivi il servizio prestato o aggiungi note per il residente..." class="rounded-xl border-border/50 bg-secondary/30 min-h-[100px] resize-none" />
				</div>
			</div>
		</div>

		<Dialog.Footer class="px-8 pt-4 pb-8 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3">
			<Button variant="outline" onclick={() => (open = false)} class="rounded-xl h-12 font-bold flex-1 order-2 sm:order-1">Annulla</Button>
			<Button onclick={handleSubmit} class="rounded-xl h-12 font-black bg-[#5D7D94] hover:bg-[#5D7D94]/90 text-white flex-1 order-1 sm:order-2 shadow-lg shadow-[#5D7D94]/20 transition-all">
				Crea Fattura
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
