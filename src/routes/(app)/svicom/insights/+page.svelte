<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AiBeautifyIcon,
		AlertDiamondIcon,
		StarIcon,
		Calendar03Icon
	} from '@hugeicons/core-free-icons';
	import {
		recurringIssues,
		bestSuppliersByCategory,
		seasonalityHints,
		anomalies
	} from '$lib/svicom/metrics';
	import { getPropertyById } from '$lib/data/properties';

	const issues = recurringIssues();
	const best = bestSuppliersByCategory();
	const hints = seasonalityHints();
	const anom = anomalies();
	const maxIssueCount = Math.max(...issues.map((i) => i.count), 1);

	const toneClass: Record<string, string> = {
		alta: 'border-destructive/40 bg-destructive/5 text-destructive',
		media: 'border-warning/40 bg-warning/10 text-foreground',
		bassa: 'border-primary/30 bg-primary/5 text-foreground'
	};

	const hintTone: Record<string, string> = {
		warning: 'border-warning/40 bg-warning/10',
		info: 'border-primary/30 bg-primary/5'
	};
</script>

<svelte:head>
	<title>Insights — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				Cross-condominium intelligence
			</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
				Insights di ecosistema
			</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				Pattern emergenti dai dati aggregati: problemi ricorrenti, fornitori top per categoria,
				stagionalità delle richieste e anomalie operative che richiedono attenzione del platform team.
			</p>
		</div>
	</header>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Recurring issues -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-base font-semibold text-foreground">Problemi ricorrenti</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				Categorie di intervento più frequenti aggregando ticket e segnalazioni.
			</p>

			<ul class="mt-5 space-y-3">
				{#each issues as issue}
					{@const pct = Math.round((issue.count / maxIssueCount) * 100)}
					<li>
						<div class="flex items-baseline justify-between text-sm">
							<span class="font-medium text-foreground">{issue.category}</span>
							<span class="text-xs text-muted-foreground">
								{issue.count} segnalazioni · {issue.properties} immobili
							</span>
						</div>
						<div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
							<div class="h-full bg-primary" style="width: {pct}%"></div>
						</div>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Best suppliers -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-base font-semibold text-foreground">Top fornitore per categoria</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				Partner con il rating più alto in ciascuna verticale di servizio.
			</p>

			<ul class="mt-5 divide-y divide-border">
				{#each best as entry}
					<li class="flex items-center justify-between py-3">
						<div>
							<p class="text-xs uppercase tracking-wider text-muted-foreground">
								{entry.category}
							</p>
							<p class="mt-0.5 text-sm font-medium text-foreground line-clamp-1">
								{entry.supplier.description.split(':')[0]}
							</p>
							<p class="text-xs text-muted-foreground">
								Disponibile su {entry.supplier.propertyIds.length} immobili
							</p>
						</div>
						<span class="flex items-center gap-1 rounded-md bg-success/10 px-2.5 py-1 text-sm font-medium text-success">
							<HugeiconsIcon icon={StarIcon} size={14} strokeWidth={1.75} />
							{entry.supplier.rating.toFixed(1)}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Seasonality -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-baseline justify-between">
				<h2 class="text-base font-semibold text-foreground">Stagionalità delle richieste</h2>
				<HugeiconsIcon icon={Calendar03Icon} size={18} strokeWidth={1.5} class="text-primary" />
			</div>
			<p class="mt-1 text-xs text-muted-foreground">
				Pattern previsti dai modelli storici per pianificare capacità e stock fornitori.
			</p>

			<ul class="mt-5 space-y-3">
				{#each hints as h}
					<li class="rounded-lg border p-4 {hintTone[h.tone]}">
						<p class="text-sm font-medium text-foreground">{h.label}</p>
						<p class="mt-1 text-xs text-muted-foreground">{h.copy}</p>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Anomalies -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-baseline justify-between">
				<h2 class="text-base font-semibold text-foreground">Anomalie da approfondire</h2>
				<HugeiconsIcon icon={AlertDiamondIcon} size={18} strokeWidth={1.5} class="text-destructive" />
			</div>
			<p class="mt-1 text-xs text-muted-foreground">
				Segnali fuori distribuzione rilevati nei dati operativi dell'ultimo mese.
			</p>

			<ul class="mt-5 space-y-3">
				{#each anom as a (a.propertyId + a.title)}
					{@const property = getPropertyById(a.propertyId)}
					<li class="rounded-lg border p-4 {toneClass[a.severity]}">
						<div class="flex items-baseline justify-between gap-2">
							<p class="text-sm font-medium text-foreground">{a.title}</p>
							<span class="rounded-full bg-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
								{a.severity}
							</span>
						</div>
						<p class="mt-1 text-xs text-muted-foreground">{a.description}</p>
						{#if property}
							<a
								href="/svicom/portfolio"
								class="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
							>
								Apri scheda immobile →
							</a>
						{/if}
					</li>
				{:else}
					<li class="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
						Nessuna anomalia rilevata.
					</li>
				{/each}
			</ul>
		</section>
	</div>

	<!-- Footer: methodology -->
	<section class="rounded-xl border border-dashed border-border bg-muted/30 p-5">
		<div class="flex items-start gap-3">
			<HugeiconsIcon icon={AiBeautifyIcon} size={18} strokeWidth={1.75} class="mt-0.5 text-primary" />
			<div>
				<p class="text-sm font-medium text-foreground">Come leggere questa pagina</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Le elaborazioni combinano clustering categoriale, scoring fornitori e rilevamento outlier sui ticket attivi.
					Le insight sono ricalcolate ogni 24 ore e disponibili anche via export verso il team analytics.
				</p>
			</div>
		</div>
	</section>
</div>
