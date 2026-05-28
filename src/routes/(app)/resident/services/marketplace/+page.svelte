<script lang="ts">
	import { services, type ServiceCategory } from '$lib/data/services';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import ServiceCard from '$lib/components/view-resident/marketplace/ServiceCard.svelte';
	import { ResidentProBadge } from '$lib/components/view-resident/resident';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Search01Icon, FilterIcon } from '@hugeicons/core-free-icons';

	const categories: { key: ServiceCategory | 'all'; label: string }[] = [
		{ key: 'all', label: 'Tutti' },
		{ key: 'cura-animali', label: 'Animali' },
		{ key: 'benessere', label: 'Benessere' },
		{ key: 'pulizie', label: 'Pulizie' },
		{ key: 'mobilita', label: 'Mobilità' }
	];

	let searchQuery = $state('');
	let selectedCategory = $state<ServiceCategory | 'all'>('all');

	// Filter services based on enabled property, category and search
	const filteredServices = $derived(
		services.filter((s) => {
			// Must be enabled for the current property (if selected) or available anywhere (if "Tutti")
			const isAvailable = propertySelection.selectedId
				? s.enabledAtPropertyIds.includes(propertySelection.selectedId)
				: true; // Market view: show all enabled anywhere? Or just all? 
				// Actually, if "Tutti" is selected, we show all services available in ANY property the user has.
			
			if (!isAvailable) return false;

			const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
			const matchesSearch =
				s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.description.toLowerCase().includes(searchQuery.toLowerCase());

			return matchesCategory && matchesSearch;
		})
	);

	function navigateToDetail(id: string) {
		window.location.href = `/resident/services/marketplace/${id}`;
	}
</script>

<svelte:head>
	<title>Marketplace — Svicom Living Hub</title>
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-8 pb-24">
	<div class="mb-8">
		<a href="/resident/services" class="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2 mb-4">
			<span class="rotate-180 inline-block">→</span> Le mie prenotazioni
		</a>
		<div class="flex flex-wrap items-center gap-2">
			<h1 class="text-4xl font-black tracking-tight text-foreground">Marketplace</h1>
			<ResidentProBadge />
		</div>
		<p class="mt-2 text-[15px] leading-relaxed text-muted-foreground/80">Scopri e prenota i servizi esclusivi per il tuo condominio.</p>
	</div>

	<!-- Search and Filters -->
	<div class="sticky top-0 z-10 -mx-4 mb-8 bg-background/80 px-4 py-4 backdrop-blur-md">
		<div class="space-y-4">
			<div class="relative group">
				<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground transition-colors group-focus-within:text-primary">
					<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={2.5} />
				</div>
				<input
					type="text"
					placeholder="Cerca un servizio..."
					bind:value={searchQuery}
					class="w-full h-12 bg-muted/30 border-2 border-transparent rounded-2xl pl-12 pr-4 text-[15px] font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
				/>
			</div>

			<div class="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide no-scrollbar">
				{#each categories as cat}
					<button
						type="button"
						onclick={() => (selectedCategory = cat.key)}
						class="whitespace-nowrap px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all {selectedCategory === cat.key ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-background border-border text-muted-foreground/70 hover:border-primary/30 hover:text-primary'}"
					>
						{cat.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Results -->
	{#if filteredServices.length > 0}
		<div class="grid grid-cols-1 gap-4">
			{#each filteredServices as service (service.id)}
				<ServiceCard {service} onclick={() => navigateToDetail(service.id)} />
			{/each}
		</div>
	{:else}
		<div class="py-20 text-center">
			<div class="mx-auto w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground mb-4">
				<HugeiconsIcon icon={FilterIcon} size={24} />
			</div>
			<p class="font-bold text-foreground">Nessun servizio trovato</p>
			<p class="text-sm text-muted-foreground mt-1">Prova a cambiare i filtri o la ricerca.</p>
		</div>
	{/if}
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
