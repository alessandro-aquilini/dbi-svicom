<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		StarIcon, 
		CheckmarkCircle02Icon,
		Settings01Icon
	} from '@hugeicons/core-free-icons';
	import type { Service, ServiceCategory } from '$lib/data/services';
	import { getUserById } from '$lib/data/users';
	import { properties } from '$lib/data/properties';

	interface Props {
		service: Service;
		isAdmin?: boolean;
		onToggleProperty?: (service: Service, propertyId: string) => void;
		selectedPropertyId?: string;
		isAllProperties?: boolean;
	}

	let { 
		service: s = $bindable(), 
		isAdmin = false,
		onToggleProperty, 
		selectedPropertyId, 
		isAllProperties 
	}: Props = $props();
	
	const supplier = $derived(getUserById(s.supplierId));

	function toggleProperty(service: Service, propertyId: string) {
		if (typeof onToggleProperty === 'function') {
			onToggleProperty(s, propertyId);
		}
	}
</script>

<div class="space-y-8 flex flex-col pt-2 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
	<!-- Hero Section -->
	<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-border/40 pb-6 px-1">
		<div class="space-y-4 flex-1">
			<div class="space-y-2">
				<h3 class="text-2xl font-black text-foreground tracking-tight leading-none">{s.name}</h3>
				<p class="text-[15px] leading-relaxed text-foreground/70">
					{s.description}
				</p>
			</div>
			
			<div class="flex flex-wrap items-center gap-3">
				<p class="text-xs text-muted-foreground font-medium flex items-center gap-2">
					Fornito da <span class="text-foreground font-bold underline underline-offset-2">{supplier?.name}</span>
				</p>
				<span class="text-muted-foreground/30">•</span>
				<div class="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-600 border border-amber-100">
					<HugeiconsIcon icon={StarIcon} size={11} />
					<span class="text-[11px] font-bold">{s.rating}</span>
				</div>
				<span class="text-muted-foreground/30">•</span>
				{#if s.availabilityText}
					<span class="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider border text-muted-foreground">
						{s.availabilityText}
					</span>
				{/if}
			</div>
		</div>
		<div class="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-center min-w-30 shrink-0">
			<p class="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">Prezzo Base</p>
			<p class="text-2xl font-black text-primary tracking-tight">{s.pricing}</p>
		</div>
	</div>

	<!-- Configuration & Contacts stacked -->
	<div class="space-y-8">
		{#if isAdmin}
			<!-- Settings rendered as a normal list (full-width) -->
			<section>
				<h4 class="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mb-4 px-1 flex items-center justify-between">
					<span>Abilitazione Condomini</span>
					<HugeiconsIcon icon={Settings01Icon} size={14} class="text-primary/70" />
				</h4>

				<div class="bg-muted/30 rounded-2xl border border-border/50 overflow-hidden">
					<div class="max-h-75 overflow-y-auto pr-1 small-scrollbar">
						{#if !isAllProperties && selectedPropertyId}
							{@const prop = properties.find(p => p.id === selectedPropertyId)}
							{#if prop && s.availableAtPropertyIds.includes(prop.id)}
								{@const isActive = s.enabledAtPropertyIds.includes(prop.id)}
								<div class="flex items-center justify-between p-4 bg-muted/20">
									<div class="min-w-0">
										<p class="text-sm font-bold text-foreground truncate">{prop.name}</p>
										<p class="text-[11px] text-muted-foreground font-medium">Condominio selezionato</p>
									</div>
									<button
										type="button"
										class={`h-6 w-11 rounded-full transition-all relative ${isActive ? 'bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]' : 'bg-muted-foreground/30'}`}
										onclick={() => toggleProperty(s, prop.id)}
										aria-label={isActive ? 'Disattiva servizio' : 'Attiva servizio'}
										title={isActive ? 'Disattiva servizio' : 'Attiva servizio'}
									>
										<span class={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></span>
									</button>
								</div>
							{:else if prop}
								<div class="p-8 text-center">
									<p class="text-xs text-muted-foreground italic">Questo condominio non è nel perimetro di questo servizio.</p>
								</div>
							{/if}
						{:else}
							<div class="divide-y divide-border/40">
								{#each properties.filter(p => s.availableAtPropertyIds.includes(p.id)) as prop}
									{@const isActive = s.enabledAtPropertyIds.includes(prop.id)}
									<div class="flex items-center justify-between p-4 transition-colors hover:bg-muted/40">
										<p class="text-sm font-semibold text-foreground truncate mr-4">{prop.name}</p>
										<button
											type="button"
											class={`h-6 w-11 rounded-full transition-all relative shrink-0 ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
											onclick={() => toggleProperty(s, prop.id)}
											aria-label={isActive ? 'Disattiva' : 'Attiva'}
										>
											<span class={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></span>
										</button>
									</div>
								{:else}
									<div class="p-8 text-center">
										<p class="text-xs text-muted-foreground italic">Nessun condominio disponibile per questo servizio.</p>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<p class="mt-4 px-1 text-[11px] text-muted-foreground leading-normal">
					Puoi abilitare o disabilitare il servizio solo per i condomini supportati dal fornitore.
				</p>
			</section>
		{/if}

		<!-- Contacts (full width) -->
		<section>
			<h3 class="text-[13px] font-extrabold uppercase tracking-widest text-muted-foreground mb-4 px-1">Supporto & Contatti</h3>
			<div class="divide-y divide-border/40 border-t border-b border-border/40">
				{#if s.contactEmail}
					<div class="flex items-center justify-between py-3 px-1">
						<span class="text-xs font-medium text-muted-foreground">Email di contatto</span>
						<span class="text-xs font-bold text-foreground selection:bg-primary/20">{s.contactEmail}</span>
					</div>
				{/if}
				{#if s.contactPhone}
					<div class="flex items-center justify-between py-3 px-1">
						<span class="text-xs font-medium text-muted-foreground">Telefono diretto</span>
						<span class="text-xs font-bold text-foreground">{s.contactPhone}</span>
					</div>
				{/if}
				<div class="flex items-center justify-between py-3 px-1">
					<span class="text-xs font-medium text-muted-foreground">Disponibilità</span>
					<span class="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} class="text-primary" />
						{s.availabilityText ?? 'Contattare il fornitore per orari'}
					</span>
				</div>
			</div>
		</section>
	</div>

	<!-- Feedback Section (at bottom) -->
	<section class="border-t border-border/40 pt-8 px-1">
		<h4 class="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mb-6 flex items-center justify-between">
			<span>Feedback Residenti</span>
			<span class="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full">{s.comments.length}</span>
		</h4>
		{#if s.comments.length > 0}
			<div class="space-y-6">
				{#each s.comments as comment}
					{@const author = getUserById(comment.authorId)}
					<div class="border-l-2 border-primary/20 pl-6 py-1">
						<p class="text-[15px] text-foreground/80 leading-relaxed italic mb-3">"{comment.text}"</p>
						<div class="flex items-center gap-2 text-[11px]">
							<span class="font-bold text-foreground">{author?.name || 'Residente'}</span>
							<span class="text-muted-foreground/40">•</span>
							<span class="text-muted-foreground">{new Date(comment.date).toLocaleDateString('it-IT')}</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="bg-muted/20 rounded-2xl p-8 text-center border border-dashed border-border/60">
				<p class="text-sm text-muted-foreground">Nessun feedback ancora disponibile per questo servizio.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 10px;
	}
	.small-scrollbar::-webkit-scrollbar {
		width: 3px;
	}
	.small-scrollbar::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 10px;
	}
</style>
