<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createQuote } from '$lib/data/embeds/quotes';
	import { linkDocumentToBooking } from '$lib/data/ticket/booking';
	import { linkDocumentToTicket } from '$lib/data/ticket/tickets';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Invoice02Icon, 
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

	let title = $state('');
	let amount = $state(0);
	let description = $state('');
	let isUploading = $state(false);
	let uploadedFile = $state<File | null>(null);

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			isUploading = true;
			setTimeout(() => {
				uploadedFile = target.files![0];
				isUploading = false;
				if (!title) title = `PV-${Math.floor(Math.random() * 1000)}`;
			}, 1000);
		}
	}

	function removeFile() {
		uploadedFile = null;
	}

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
		uploadedFile = null;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-xl rounded-xl p-0 overflow-hidden">
		<div class="p-6 space-y-6">
			<Dialog.Header class="space-y-4">
				<div class="flex items-center gap-4">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5D7D94]/10 text-[#5D7D94]">
						<HugeiconsIcon icon={Invoice02Icon} size="24" />
					</div>
					<div class="space-y-1">
						<Dialog.Title class="text-xl font-black tracking-tight text-foreground">
							Invia Preventivo
						</Dialog.Title>
						<Dialog.Description class="text-sm font-medium text-muted-foreground">
							Allega un'offerta in PDF o descrivi i costi manualmente.
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
										<HugeiconsIcon icon={Tick01Icon} size="10" /> Preventivo allegato
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
					<div class="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"><span class="bg-card px-3">Dettagli Economici</span></div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="grid gap-2">
						<Label for="title" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Titolo / Riferimento</Label>
						<Input id="title" bind:value={title} placeholder="es. Riparazione caldaia" class="rounded-xl border-border/50 bg-secondary/30 h-11" />
					</div>
					<div class="grid gap-2">
						<Label for="amount" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Importo Stimato (€)</Label>
						<Input id="amount" type="number" bind:value={amount} class="rounded-xl border-border/50 bg-secondary/30 h-11" />
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="description" class="text-[10px] font-black uppercase tracking-widest text-[#5D7D94]">Descrizione Lavorazioni</Label>
					<Textarea id="description" bind:value={description} placeholder="Descrivi nel dettaglio gli interventi previsti..." class="rounded-xl border-border/50 bg-secondary/30 min-h-25 resize-none" />
				</div>
			</div>
		</div>

		<Dialog.Footer class="px-8 pt-4 pb-8 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3">
			<Button variant="outline" onclick={() => (open = false)} class="rounded-xl h-12 font-bold flex-1 order-2 sm:order-1">Annulla</Button>
			<Button onclick={handleSubmit} class="rounded-xl h-12 font-black bg-[#5D7D94] hover:bg-[#5D7D94]/90 text-white flex-1 order-1 sm:order-2 shadow-lg shadow-[#5D7D94]/20 transition-all">
				Invia Preventivo
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
