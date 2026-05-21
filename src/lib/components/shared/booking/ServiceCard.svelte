<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { StarIcon } from '@hugeicons/core-free-icons';
	import type { Service, ServiceCategory } from '$lib/data/services';
	import { getUserById } from '$lib/data/users';

	interface Props {
		service: Service;
		onclick?: () => void;
	}

	let { service, onclick }: Props = $props();
	const supplier = $derived(getUserById(service.supplierId));

	function getCategoryLabel(cat: ServiceCategory) {
		const labels: Record<ServiceCategory, string> = {
			'cura-animali': 'Cura Animali',
			'benessere': 'Benessere',
			'pulizie': 'Pulizie',
			'mobilita': 'Mobilità'
		};
		return labels[cat] || cat;
	}
</script>

<button
	type="button"
	class="group relative flex flex-col justify-between p-4 rounded-2xl border border-border bg-card transition-all hover:bg-muted/20 hover:shadow-xl hover:-translate-y-1 text-left w-full h-full"
	{onclick}
>
	<div class="space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div class="space-y-1 pr-4">
				<h3 class="text-me font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
					{service.name}
				</h3>
				<div class="flex items-center gap-1.5 text-[10px]">
					<span class="font-bold text-primary/70 uppercase tracking-tight">{getCategoryLabel(service.category)}</span>
					<span class="opacity-20">|</span>
					<span class="font-medium text-muted-foreground truncate">{supplier?.name}</span>
				</div>
			</div>
			<div class="flex items-center ml-auto shrink-0">
				<div class="flex items-center gap-1 text-amber-500">
					<HugeiconsIcon icon={StarIcon} size={14} strokeWidth={2} class="fill-current" aria-hidden="true" />
					<span class="text-sm font-bold text-foreground">{service.rating.toFixed(1)}</span>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-8 flex items-end justify-between border-t border-border/40 pt-4">
		<div class="space-y-0.5">
			<p class="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Prezzo base</p>
			<p class="text-base font-black text-foreground">{service.pricing}</p>
		</div>
	</div>
</button>
