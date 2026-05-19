<script lang="ts">
	import { Invoice01Icon, Agreement01Icon, Download01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import { getUserById } from '$lib/data/users';

	let { doc, type, onclick } = $props<{
		doc: any; // DocumentItem or raw doc
		type: 'invoice' | 'quote';
		onclick: () => void;
	}>();

	// Support being passed either a DocumentItem ({type, date, data}) or a raw document object
	const payload = $derived(() => (doc && 'data' in doc ? doc.data : doc));
	const customer = $derived(() => (payload() ? getUserById(payload().customerId) : null));
	const isInvoice = $derived(() => type === 'invoice');

	function formatTimeMaybe(value: string | number | Date | undefined | null) {
		if (!value) return '';
		const d = typeof value === 'number' ? new Date(value) : new Date(value as any);
		if (isNaN(d.getTime())) return '';
		return format(d, 'HH:mm', { locale: it });
	}

	const dateObj = $derived(() => {
		const p = payload();
		const created = p?.createdAt;
		const docDate = doc?.date;
		if (created) {
			const d = new Date(created);
			return isNaN(d.getTime()) ? null : d;
		}
		if (docDate) {
			const d2 = new Date(docDate);
			return isNaN(d2.getTime()) ? null : d2;
		}
		return null;
	});
</script>

<button
	class="flex w-full items-center justify-between py-4 text-left transition-opacity hover:opacity-70 active:scale-[0.98]"
	{onclick}
>
	<div class="flex items-center gap-4">
		<div
			class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full {isInvoice() ? 'bg-blue-500/5 text-blue-600' : 'bg-purple-500/5 text-purple-600'}"
		>
			<HugeiconsIcon icon={isInvoice() ? Invoice01Icon : Agreement01Icon} size={22} />
		</div>
		<div class="flex flex-col">
			<span class="text-[15px] font-semibold text-foreground">
				{isInvoice() ? payload()?.number ?? '—' : payload()?.title ?? '—'}
			</span>
			<span class="text-sm text-muted-foreground line-clamp-1">{customer()?.name ?? 'Cliente'}</span>
				<div class="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/60 uppercase tracking-wider">
					<span>{isInvoice() ? 'Fattura' : 'Preventivo'} • {formatTimeMaybe(dateObj())}</span>
				</div>
		</div>
	</div>
<!-- ...existing code... -->

			<div class="flex flex-col items-end">
				<span class="text-[16px] font-bold text-foreground">
					{payload()?.amount?.toLocaleString('it-IT', { style: 'currency', currency: payload()?.currency })}
				</span>
			</div>
</button>
