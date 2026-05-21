<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Search01Icon } from '@hugeicons/core-free-icons';
	import { getUserById } from '$lib/data/users';
	import type { Payment } from '$lib/data/embeds/payments';

	interface Props {
		payment: Payment | null;
		onclose: () => void;
	}

	let { payment, onclose }: Props = $props();
	
	const user = $derived(payment ? getUserById(payment.fromId) : null);
</script>

{#if payment}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0" onclick={onclose}></div>

		<div
			class="relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-[2.5rem] bg-background p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-sm sm:rounded-[2.5rem]"
		>
			<div class="mx-auto mb-8 h-1.5 w-12 rounded-full bg-muted-foreground/20 sm:hidden"></div>

			<div class="flex flex-col items-center text-center">
				<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-primary">
					<HugeiconsIcon icon={Search01Icon} size={32} />
				</div>
				<h2 class="mb-1 text-3xl font-bold tracking-tight text-foreground">
					+ {payment.amount.toLocaleString('it-IT', {
						style: 'currency',
						currency: payment.currency
					})}
				</h2>
				<p class="text-[15px] font-medium text-emerald-500">Ricevuto</p>
			</div>

			<div class="mt-10 space-y-5 rounded-3xl bg-muted/40 p-6">
				<div class="flex items-center justify-between gap-4 text-sm">
					<span class="text-muted-foreground">Mittente</span>
					<span class="font-semibold text-foreground">{user?.name ?? 'Sconosciuto'}</span>
				</div>
				<div class="flex items-center justify-between gap-4 text-sm">
					<span class="text-muted-foreground">Stato</span>
					<div class="flex items-center gap-1.5 font-semibold text-foreground">
						<div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
						<span>Ricevuto</span>
					</div>
				</div>
				<div class="flex flex-col gap-1.5 text-sm">
					<span class="text-muted-foreground">Causale</span>
					<span class="font-semibold leading-relaxed text-foreground">{payment.description}</span>
				</div>
				<div class="flex items-center justify-between gap-4 pt-1 text-xs">
					<span class="text-muted-foreground">ID Transazione</span>
					<span class="font-mono font-medium uppercase text-muted-foreground">{payment.id}</span>
				</div>
			</div>

			<div class="mt-8 flex flex-col gap-3">
				<Button class="h-14 rounded-2xl text-[15px] font-bold shadow-lg" onclick={onclose}>
					Chiudi
				</Button>
			</div>
		</div>
	</div>
{/if}
