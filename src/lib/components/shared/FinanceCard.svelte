<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Invoice01Icon, 
		QuotesIcon as QuoteIcon, 
		CreditCardIcon, 
		ArrowRight02Icon,
		Download01Icon,
		Ticket01Icon,
		Share01Icon,
		PrinterIcon
	} from '@hugeicons/core-free-icons';
	import { getUserById } from '$lib/data/users';
	import { getPropertyById } from '$lib/data/properties';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	
	export type FinanceType = 'invoice' | 'quote' | 'payment';

	interface Props {
		type: FinanceType;
		date: string | number;
		amount: number;
		currency: string;
		title: string;
		description: string;
		customerId?: string;
		supplierId?: string;
		fromId?: string;
		toId?: string;
		propertyId?: string;
		ticketId?: string;
		status?: string;
		number?: string;
		dueDate?: string;
		expiresAt?: string;
		paidAt?: string;
	}

	let { 
		type, 
		date, 
		amount, 
		currency, 
		title, 
		description, 
		customerId, 
		supplierId,
		fromId,
		toId,
		propertyId,
		ticketId,
		status,
		number,
		dueDate,
		expiresAt,
		paidAt
	}: Props = $props();

	const formattedDate = $derived(new Date(date).toLocaleDateString('it-IT', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}));

	const formattedAmount = $derived(new Intl.NumberFormat('it-IT', {
		style: 'currency',
		currency: currency
	}).format(amount));

	const customer = $derived(customerId ? getUserById(customerId) : null);
	const supplier = $derived(supplierId ? getUserById(supplierId) : null);
	const fromUser = $derived(fromId ? getUserById(fromId) : null);
	const toUser = $derived(toId ? getUserById(toId) : null);
	const property = $derived(propertyId ? getPropertyById(propertyId) : null);

	const mainPerson = $derived(() => {
		if (type === 'payment') {
			return fromUser?.name || toUser?.name || '—';
		}
		return supplier?.name || customer?.name || '—';
	});

	const config = $derived(() => {
		switch (type) {
			case 'invoice':
				return {
					icon: Invoice01Icon,
					color: 'text-blue-600 bg-blue-50 border-blue-100',
					label: 'Fattura',
					secondaryText: number ? `N. ${number}` : ''
				};
			case 'quote':
				return {
					icon: QuoteIcon,
					color: 'text-purple-600 bg-purple-50 border-purple-100',
					label: 'Preventivo',
					secondaryText: expiresAt ? `Scade il ${new Date(expiresAt).toLocaleDateString('it-IT')}` : ''
				};
			case 'payment':
				return {
					icon: CreditCardIcon,
					color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
					label: 'Pagamento',
					secondaryText: paidAt ? `Saldato il ${new Date(paidAt).toLocaleDateString('it-IT')}` : ''
				};
		}
	});

	const cfg = $derived(config());

	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<button 
		class="group flex w-full items-center gap-5 rounded-3xl border border-border bg-card p-5 transition-all hover:bg-accent/50 hover:shadow-md" 
		onclick={() => (isOpen = true)}
	>
		<!-- Icon / Person Avatar placeholder -->
		<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
			{#if type === 'payment'}
				<HugeiconsIcon icon={cfg.icon} size={24} strokeWidth={1.5} />
			{:else}
				<div class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-background text-primary">
					<HugeiconsIcon icon={cfg.icon} size={24} strokeWidth={1.5} />
				</div>
			{/if}
		</div>

		<!-- Main Info -->
		<div class="flex flex-1 flex-col items-start overflow-hidden">
			<span class="text-lg font-bold text-foreground leading-tight">{mainPerson()}</span>
			<span class="text-sm font-medium text-foreground/80 line-clamp-1 truncate">{description}</span>
			<span class="text-xs text-muted-foreground mt-1">{formattedDate} • {cfg.label}</span>
		</div>

		<!-- Amount -->
		<div class="flex flex-col items-end shrink-0">
			<span class="text-xl font-bold tabular-nums text-foreground">
				{type === 'payment' ? '-' : ''}{formattedAmount}
			</span>
		</div>
	</button>

	<Dialog.Content class="sm:max-w-md max-h-[96vh] overflow-y-auto">
		<Dialog.Header class="space-y-1">
			<Dialog.Title class="text-center text-2xl font-bold tracking-tight">{mainPerson()}</Dialog.Title>
			<Dialog.Description class="text-center text-sm font-medium text-muted-foreground">
				{title}
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-4 space-y-4">
			<div class="flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-4">
				<span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Totale Transazione</span>
				<span class="text-3xl font-black tracking-tighter text-foreground mt-0.5">{formattedAmount}</span>
			</div>

			<div class="space-y-2.5 rounded-2xl border border-border p-4 shadow-sm">
				<div class="flex justify-between items-center text-xs">
					<span class="text-muted-foreground font-medium">Data creazione</span>
					<span class="font-bold text-foreground">{formattedDate}</span>
				</div>
				<Separator class="opacity-50" />
				<div class="flex justify-between items-center text-xs">
					<span class="text-muted-foreground font-medium">Stato</span>
					<div class="flex items-center gap-1.5">
						<div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
						<span class="font-bold text-foreground">{status || 'In attesa'}</span>
					</div>
				</div>
				<Separator class="opacity-50" />
				<div class="flex justify-between items-center text-xs">
					<span class="text-muted-foreground font-medium">Proprietà</span>
					<span class="font-bold text-foreground">{property?.name || 'N/D'}</span>
				</div>
				
				{#if type === 'payment'}
					<Separator class="opacity-50" />
					<div class="flex flex-col gap-2">
						<div class="flex justify-between items-center text-xs">
							<span class="text-muted-foreground">Da</span>
							<span class="font-bold text-foreground">{fromUser?.name || '—'}</span>
						</div>
						<div class="flex justify-between items-center text-xs">
							<span class="text-muted-foreground">A</span>
							<span class="font-bold text-foreground">{toUser?.name || '—'}</span>
						</div>
					</div>
				{:else}
					<Separator class="opacity-50" />
					<div class="flex justify-between items-center text-xs">
						<span class="text-muted-foreground">Destinatario</span>
						<span class="font-bold text-foreground">{customer?.name || '—'}</span>
					</div>
					<Separator class="opacity-50" />
					<div class="flex justify-between items-center text-xs">
						<span class="text-muted-foreground">Fornitore</span>
						<span class="font-bold text-foreground">{supplier?.name || 'Svicom'}</span>
					</div>
				{/if}

				{#if ticketId}
					<Separator class="opacity-50" />
					<div class="flex justify-between items-center text-xs">
						<span class="font-semibold text-primary">Ticket correlato</span>
						<a href="/admin/tickets/{ticketId}" class="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-[10px] text-primary transition-colors hover:bg-primary/20">
							<HugeiconsIcon icon={Ticket01Icon} size={12} />
							<span>Vedi</span>
						</a>
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer class="mt-6">
			<div class="flex w-full flex-col gap-1.5">
				<Button variant="outline" class="h-10 w-full justify-between px-4 rounded-xl border hover:bg-accent text-sm font-semibold">
					<div class="flex items-center gap-2.5">
						<HugeiconsIcon icon={Download01Icon} size={18} />
						<span>PDF Ricevuta</span>
					</div>
					<HugeiconsIcon icon={ArrowRight02Icon} size={16} />
				</Button>
				<Button variant="outline" class="h-10 w-full justify-between px-4 rounded-xl border hover:bg-accent text-sm font-semibold">
					<div class="flex items-center gap-2.5">
						<HugeiconsIcon icon={Share01Icon} size={18} />
						<span>Condividi</span>
					</div>
					<HugeiconsIcon icon={ArrowRight02Icon} size={16} />
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>