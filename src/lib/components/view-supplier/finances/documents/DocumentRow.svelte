<script lang="ts">
	import { Invoice01Icon, Agreement01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import { getUserById } from '$lib/data/users';

	let { doc, type, onclick } = $props<{
		doc: any;
		type: 'invoice' | 'quote';
		onclick: () => void;
	}>();

	const payload = () => (doc && 'data' in doc ? doc.data : doc);
	const customer = () => getUserById(payload()?.customerId);
	const isInvoice = () => type === 'invoice';
	const date = () => new Date(payload()?.createdAt || doc?.date || '');
</script>

<button
	class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-opacity hover:opacity-70 active:scale-[0.98]"
	{onclick}
>
	<div class="flex items-center gap-4">
		<div class="flex flex-col items-center justify-center rounded-3xl bg-muted/10 px-3 py-2 text-center text-muted-foreground">
			<span class="text-lg font-semibold text-foreground">{format(date(), 'd', { locale: it })}</span>
			<span class="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
				{format(date(), 'LLL', { locale: it })}
			</span>
		</div>
		<div class="min-w-0 flex-1">
			<p class="text-[15px] font-semibold text-foreground">
				{isInvoice() ? payload()?.number ?? 'Fattura' : payload()?.title ?? 'Preventivo'}
			</p>
			<p class="text-sm text-muted-foreground line-clamp-2">{customer()?.name ?? 'Cliente'}</p>
			<div class="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
				<span>{isInvoice() ? 'Fattura' : 'Preventivo'}</span>
				<span>{format(date(), 'HH:mm', { locale: it })}</span>
			</div>
		</div>
	</div>

	<div class="flex flex-col items-end">
		<span class="text-[16px] font-bold text-foreground">
			{payload()?.amount?.toLocaleString('it-IT', { style: 'currency', currency: payload()?.currency })}
		</span>
	</div>
</button>
