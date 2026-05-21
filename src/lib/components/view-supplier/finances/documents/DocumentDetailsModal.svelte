<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Invoice01Icon, Agreement01Icon, Download01Icon } from '@hugeicons/core-free-icons';
	import { getUserById } from '$lib/data/users';
	import type { Invoice } from '$lib/data/embeds/invoices';
	import type { Quote } from '$lib/data/embeds/quotes';

	type DocumentItem =
		| { type: 'invoice'; date: number; data: Invoice }
		| { type: 'quote'; date: number; data: Quote };

	interface Props {
		document: DocumentItem | null;
		onclose: () => void;
	}

	let { document, onclose }: Props = $props();

	const isInv = $derived(document?.type === 'invoice');
	const customerName = $derived(document ? getUserById(document.data.customerId)?.name ?? 'Sconosciuto' : '');
</script>

{#if document}
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

			<div class="flex flex-col items-center border-b border-border/50 pb-8 text-center">
				<div
					class="mb-6 flex h-20 w-20 items-center justify-center rounded-full {isInv
						? 'bg-blue-500/5 text-blue-600'
						: 'bg-purple-500/5 text-purple-600'}"
				>
					<HugeiconsIcon icon={isInv ? Invoice01Icon : Agreement01Icon} size={32} />
				</div>
				<h2 class="text-xl font-bold text-foreground">{isInv ? (document.data as Invoice).number : (document.data as Quote).title}</h2>
				<h3 class="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground">
					{document.data.amount.toLocaleString('it-IT', { style: 'currency', currency: document.data.currency })}
				</h3>
			</div>

			<div class="space-y-5 py-8">
				<div class="flex items-center justify-between text-[15px]">
					<span class="text-muted-foreground">Tipo</span>
					<span class="font-semibold text-foreground">{isInv ? 'Fattura' : 'Preventivo'}</span>
				</div>
				<div class="flex items-center justify-between text-[15px]">
					<span class="text-muted-foreground">Cliente</span>
					<span class="font-semibold text-foreground">{customerName}</span>
				</div>
				<div class="flex items-center justify-between text-[15px]">
					<span class="text-muted-foreground">Emissione</span>
					<span class="font-semibold text-foreground">{new Date(document.date).toLocaleDateString('it-IT')}</span>
				</div>
				<div class="flex flex-col gap-1.5 pt-2 text-[15px]">
					<span class="text-muted-foreground">Descrizione</span>
					<span class="font-medium leading-relaxed text-foreground">{document.data.description}</span>
				</div>
			</div>

			<div class="mt-auto flex flex-col gap-3">
				<Button class="h-14 rounded-2xl text-[15px] font-bold shadow-lg">
					<HugeiconsIcon icon={Download01Icon} size={20} class="mr-2" />
					Scarica PDF
				</Button>
				<Button
					variant="ghost"
					class="h-14 rounded-2xl text-[15px] font-bold"
					onclick={onclose}
				>
					Chiudi
				</Button>
			</div>
		</div>
	</div>
{/if}
