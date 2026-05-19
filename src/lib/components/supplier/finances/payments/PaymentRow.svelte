<script lang="ts">
	import type { Payment } from '$lib/data/embeds/payments';
	import { getUserById } from '$lib/data/users';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import { ArrowUpRightIcon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	let { payment, onclick } = $props<{
		payment: Payment;
		onclick: () => void;
	}>();

	const user = $derived(getUserById(payment.fromId));
	const date = $derived(new Date(payment.paidAt || payment.createdAt || ''));
</script>

<button
	class="flex w-full items-center justify-between py-4 text-left transition-opacity hover:opacity-70 active:scale-[0.98]"
	{onclick}
>
	<div class="flex items-center gap-4">
		<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
			<HugeiconsIcon icon={ArrowUpRightIcon} size={20} />
		</div>
		<div class="flex flex-col">
			<span class="text-[15px] font-semibold text-foreground">{user?.name ?? 'Sconosciuto'}</span>
			<span class="text-sm text-muted-foreground">{payment.description}</span>
			<div class="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
				<span>{format(date, 'HH:mm')}</span>
				{#if payment.paidAt}
					<HugeiconsIcon icon={Tick02Icon} size={10} strokeWidth={3} class="text-emerald-500" />
				{/if}
			</div>
		</div>
	</div>
<!-- ...existing code... -->

	<div class="flex flex-col items-end">
		<span class="text-[16px] font-bold text-foreground">
			+ {payment.amount.toLocaleString('it-IT', { style: 'currency', currency: payment.currency })}
		</span>
	</div>
</button>
