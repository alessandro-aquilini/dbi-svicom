<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { StarIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
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
	class="group relative flex flex-col p-5 rounded-3xl border-2 border-border bg-card transition-all active:scale-[0.98] text-left w-full hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
	{onclick}
>
	<div class="flex items-start justify-between w-full mb-4">
		<div class="space-y-1.5 min-w-0 pr-4">
			<span class="inline-block text-[10px] font-black uppercase tracking-widest text-primary/60">
				{getCategoryLabel(service.category)}
			</span>
			<h3 class="text-xl font-black text-foreground truncate leading-tight">
				{service.name}
			</h3>
		</div>
		<div class="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100/50">
			<HugeiconsIcon icon={StarIcon} size={14} class="fill-current" />
			<span class="text-xs font-black text-amber-700">{service.rating.toFixed(1)}</span>
		</div>
	</div>

	<p class="text-sm font-medium text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
		{service.description}
	</p>

	<div class="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
		<div class="flex flex-col">
			<span class="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">A partire da</span>
			<span class="text-lg font-black text-primary">{service.pricing}</span>
		</div>
		
		<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/50 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
			<HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={2.5} />
		</div>
	</div>
</button>
