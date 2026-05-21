<script lang="ts">
	import { ArrowRightIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';

	let { title, items, viewAllHref } = $props<{
		title: string;
		items: any[];
		viewAllHref: string;
	}>();
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between px-1">
		<h3 class="text-sm font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
		<Button variant="ghost" size="sm" href={viewAllHref} class="h-8 text-xs">
			Mostra tutto
			<HugeiconsIcon icon={ArrowRightIcon} size={14} class="ml-1" />
		</Button>
	</div>

	<div class="grid gap-3">
		{#each items as item}
			<div
				class="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
			>
				<div class="flex flex-col gap-1">
					<span class="text-sm font-medium leading-none">{item.description || item.title}</span>
					<span class="text-xs text-muted-foreground">
						{format(new Date(item.paidAt || item.updatedAt), 'PPP', { locale: it })}
					</span>
				</div>
				<div class="text-right">
					{#if item.amount}
						<span class="text-sm font-bold text-primary">
							+ {item.amount.toLocaleString('it-IT', { style: 'currency', currency: item.currency })}
						</span>
					{:else}
						<span class="text-xs font-medium uppercase text-muted-foreground">{item.type || item.category}</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
