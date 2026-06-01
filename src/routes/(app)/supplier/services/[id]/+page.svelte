<script lang="ts">
	import { page } from '$app/state';
	import { getServiceById } from '$lib/data/services';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowLeft02Icon, PencilIcon, StarIcon } from '@hugeicons/core-free-icons';

	const serviceId = page.params.id || '';
	const service = getServiceById(serviceId);

	function handleBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>{service?.name || 'Servizio'} — Svicom Living Hub</title>
</svelte:head>

{#if service}
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mx-auto max-w-4xl space-y-6">
			<div class="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4 sm:p-6">
				<button
					type="button"
					onclick={handleBack}
					class="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
				>
					<HugeiconsIcon icon={ArrowLeft02Icon} size={18} /> Torna indietro
				</button>
				<button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
					<HugeiconsIcon icon={PencilIcon} size={18} /> Modifica
				</button>
			</div>

			<section class="rounded-3xl border border-border bg-card p-6 sm:p-8">
				<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
					<div class="min-w-0 space-y-5">
						<div class="inline-flex flex-wrap items-center gap-3">
							<span class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">{service.category.replace('-', ' ')}</span>
							<span class="inline-flex items-center gap-1 rounded-2xl bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
								<HugeiconsIcon icon={StarIcon} size={14} /> {service.rating.toFixed(1)}
							</span>
						</div>
						<h1 class="text-3xl font-black tracking-tight text-foreground leading-tight">{service.name}</h1>
						<p class="text-sm leading-6 text-muted-foreground">{service.description}</p>
					</div>

					<div class="sm:w-80">
						<div class="space-y-4 text-sm text-muted-foreground">
							<div>
								<p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Prezzo</p>
								<p class="mt-2 text-2xl font-black text-primary">{service.pricing}</p>
							</div>
							<div>
								<p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Disponibilità</p>
								<p class="mt-2 text-sm font-semibold text-foreground">{service.availabilityText || 'Su richiesta'}</p>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-8 grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
					{#if service.contactEmail}
						<div>
							<p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Email</p>
							<p class="mt-2 text-sm font-semibold text-foreground">{service.contactEmail}</p>
						</div>
					{/if}
					{#if service.contactPhone}
						<div>
							<p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Telefono</p>
							<p class="mt-2 text-sm font-semibold text-foreground">{service.contactPhone}</p>
						</div>
					{/if}
				</div>
			</section>

			<section class="space-y-4">
				<div class="flex items-center justify-between gap-4">
					<div>
						<h2 class="text-xl font-semibold">Recensioni</h2>
						<p class="mt-1 text-sm text-muted-foreground">Feedback ricevuti per questo servizio.</p>
					</div>
					<span class="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold">{service.comments.length} recensioni</span>
				</div>

				{#if service.comments.length > 0}
					<div class="grid gap-4">
						{#each service.comments as comment}
							<div class="rounded-3xl border border-border bg-card p-5">
								<div class="flex items-center justify-between gap-3">
									<p class="text-sm font-semibold text-foreground">{comment.authorId}</p>
									<p class="text-xs uppercase tracking-widest text-muted-foreground/70">{new Date(comment.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
								</div>
								<p class="mt-3 text-sm leading-6 text-muted-foreground">{comment.text}</p>
							</div>
						{/each}
					</div>
				{:else}
					<div class="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
						Ancora nessuna recensione per questo servizio.
					</div>
				{/if}
			</section>
		</div>
	</div>
{:else}
	<div class="p-4 sm:p-6 lg:p-8">
		<div class="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
			<p class="text-2xl font-black text-foreground">Servizio non trovato</p>
			<p class="mt-2 text-sm text-muted-foreground">Controlla l'URL o torna alla lista dei servizi.</p>
		</div>
	</div>
{/if}
