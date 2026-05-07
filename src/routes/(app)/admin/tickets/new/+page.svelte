<script lang="ts">
	import { properties } from '$lib/data/properties';
	import type { TicketPriority } from '$lib/data/ticket/tickets';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { File01Icon, Tag01Icon, Location01Icon } from '@hugeicons/core-free-icons';
	import { InfoTip, DemoDialog } from '$lib/components/shared';

	let title = $state('');
	let description = $state('');
	let category = $state('impianti');
	let priority = $state<TicketPriority>('media');
	let propertyId = $state(properties[0]?.id ?? '');
	let location = $state('');
	let demoOpen = $state(false);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		demoOpen = true;
	}
</script>

<svelte:head>
	<title>Nuova pratica · Compila — Admin — Svicom Living Hub</title>
</svelte:head>

<form onsubmit={handleSubmit} class="max-w-2xl space-y-10">
	<!-- Sezione: Dettagli -->
	<section class="space-y-5">
		<header class="flex items-center gap-2 border-b border-border pb-2">
			<HugeiconsIcon icon={File01Icon} size={18} strokeWidth={2} class="text-primary" />
			<h2 class="text-sm font-semibold tracking-tight text-foreground">Dettagli</h2>
		</header>

		<div class="space-y-1.5">
			<label for="title" class="flex items-center gap-1.5 text-sm font-medium text-foreground">
				Titolo
				<InfoTip text='Sintetico e riconoscibile (es. "Perdita locale contatori").' />
			</label>
			<p class="text-xs text-muted-foreground">Una riga, max 80 caratteri.</p>
			<input
				id="title"
				type="text"
				required
				maxlength="80"
				bind:value={title}
				class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
			/>
		</div>

		<div class="space-y-1.5">
			<label
				for="description"
				class="flex items-center gap-1.5 text-sm font-medium text-foreground"
			>
				Descrizione
				<InfoTip text="Includi contesto, evidenze e quanto già verificato." />
			</label>
			<p class="text-xs text-muted-foreground">
				Cosa è successo, dove e da quando. Allegati gestibili dopo la creazione.
			</p>
			<textarea
				id="description"
				rows="4"
				bind:value={description}
				class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
			></textarea>
		</div>
	</section>

	<!-- Sezione: Classificazione -->
	<section class="space-y-5">
		<header class="flex items-center gap-2 border-b border-border pb-2">
			<HugeiconsIcon icon={Tag01Icon} size={18} strokeWidth={2} class="text-primary" />
			<h2 class="text-sm font-semibold tracking-tight text-foreground">Classificazione</h2>
		</header>

		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
			<div class="space-y-1.5">
				<label for="category" class="flex items-center gap-1.5 text-sm font-medium text-foreground">
					Categoria
					<InfoTip
						text="Impianti, Sicurezza, Amministrativo: determina la tipologia di ticket."
					/>
				</label>
				<p class="text-xs text-muted-foreground">Determina il flusso di gestione.</p>
				<select
					id="category"
					bind:value={category}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
				>
					<option value="impianti">Impianti</option>
					<option value="sicurezza">Sicurezza</option>
					<option value="amministrativo">Amministrativo</option>
					<option value="pulizie">Pulizie</option>
				</select>
			</div>

			<div class="space-y-1.5">
				<label for="priority" class="flex items-center gap-1.5 text-sm font-medium text-foreground">
					Priorità
					<InfoTip text='"Critica" attiva escalation immediata e notifica al supervisore.' />
				</label>
				<p class="text-xs text-muted-foreground">Influenza SLA e ordinamento in inbox.</p>
				<select
					id="priority"
					bind:value={priority}
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
				>
					<option value="bassa">Bassa</option>
					<option value="media">Media</option>
					<option value="alta">Alta</option>
					<option value="critica">Critica</option>
				</select>
			</div>
		</div>
	</section>

	<!-- Sezione: Posizione -->
	<section class="space-y-5">
		<header class="flex items-center gap-2 border-b border-border pb-2">
			<HugeiconsIcon icon={Location01Icon} size={18} strokeWidth={2} class="text-primary" />
			<h2 class="text-sm font-semibold tracking-tight text-foreground">Posizione</h2>
		</header>

		<div class="space-y-1.5">
			<label for="property" class="flex items-center gap-1.5 text-sm font-medium text-foreground">
				Condominio
			</label>
			<p class="text-xs text-muted-foreground">Stabile a cui è riferita la pratica.</p>
			<select
				id="property"
				bind:value={propertyId}
				required
				class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
			>
				{#each properties as property (property.id)}
					<option value={property.id}>{property.name}</option>
				{/each}
			</select>
		</div>

		<div class="space-y-1.5">
			<label for="location" class="flex items-center gap-1.5 text-sm font-medium text-foreground">
				Punto specifico
				<span class="text-xs font-normal text-muted-foreground">(opzionale)</span>
			</label>
			<p class="text-xs text-muted-foreground">Es. "Scala B – 3° piano", "Locale contatori".</p>
			<input
				id="location"
				type="text"
				bind:value={location}
				class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
			/>
		</div>
	</section>

	<div class="flex max-w-2xl items-center justify-end gap-3 border-t border-border pt-5">
		<a
			href="/admin/tickets"
			class="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
		>
			Annulla
		</a>
		<button
			type="submit"
			class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
		>
			Crea pratica
		</button>
	</div>
</form>

<DemoDialog bind:open={demoOpen} />
