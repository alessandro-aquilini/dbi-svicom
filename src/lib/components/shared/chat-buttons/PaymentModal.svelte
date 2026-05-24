<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createPayment } from '$lib/data/embeds/payments';
	import { linkDocumentToBooking } from '$lib/data/ticket/booking';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Wallet02Icon,
		Cash01Icon,
		InformationCircleIcon
	} from '@hugeicons/core-free-icons';

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
	<Dialog.Content class="sm:max-w-md rounded-xl p-0 overflow-hidden">
		<div class="p-6 space-y-6">
			<Dialog.Header class="space-y-4">
				<div class="flex items-center gap-4">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
						<HugeiconsIcon icon={Wallet02Icon} size="24" />
					</div>
					<div class="space-y-1">
						<Dialog.Title class="text-xl font-black tracking-tight text-foreground">
							Nuovo Pagamento
						</Dialog.Title>
						<Dialog.Description class="text-sm font-medium text-muted-foreground">
							Registra un pagamento per questo intervento.
						</Dialog.Description>
					</div>
				</div>
			</Dialog.Header>

			<div class="space-y-4">
				<div class="grid gap-2">
					<Label for="amount" class="text-[10px] font-black uppercase tracking-widest text-success">Importo (€)</Label>
					<div class="relative">
						<HugeiconsIcon icon={Cash01Icon} size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
						<Input id="amount" type="number" bind:value={amount} class="rounded-xl border-border/50 bg-secondary/30 h-12 pl-10 font-bold text-lg" />
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="description" class="text-[10px] font-black uppercase tracking-widest text-success">Causale</Label>
					<Textarea id="description" bind:value={description} placeholder="es. Saldo intervento idraulico..." class="rounded-xl border-border/50 bg-secondary/30 min-h-24 resize-none" />
				</div>

				<div class="rounded-2xl bg-success/5 border border-success/10 p-4">
					<div class="flex gap-3">
						<HugeiconsIcon icon={InformationCircleIcon} size="18" class="text-success shrink-0 mt-0.5" />
						<p class="text-[11px] leading-relaxed text-success/80">
							Il pagamento verrà registrato immediatamente nel sistema e sarà visibile ad entrambe le parti.
						</p>
					</div>
				</div>
			</div>
		</div>

		<Dialog.Footer class="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3">
			<Button variant="outline" onclick={() => (open = false)} class="rounded-xl h-12 font-bold flex-1 order-2 sm:order-1">Annulla</Button>
			<Button onclick={handleSubmit} class="rounded-xl h-12 font-black bg-success hover:bg-success/90 text-white flex-1 order-1 sm:order-2 shadow-lg shadow-success/20 transition-all">
				Invia Pagamento
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
