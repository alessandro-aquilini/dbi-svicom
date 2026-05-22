<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		CheckmarkCircle02Icon,
		Cancel01Icon,
		ShieldUserIcon
	} from '@hugeicons/core-free-icons';
	import { complianceMatrix, complianceRequirements } from '$lib/svicom/metrics';

	const matrix = complianceMatrix();
	const avgScore = Math.round(
		matrix.reduce((s, r) => s + r.scorePct, 0) / Math.max(matrix.length, 1)
	);
	const fullyCompliant = matrix.filter((r) => r.scorePct === 100).length;
	const atRisk = matrix.filter((r) => r.scorePct < 60).length;

	const processes = [
		{
			name: 'SLA risposta amministratori',
			target: '< 4h',
			current: '3.6h',
			ok: true
		},
		{
			name: 'SLA chiusura ticket critici',
			target: '< 48h',
			current: '42h',
			ok: true
		},
		{
			name: 'Tempo medio preventivazione',
			target: '< 24h',
			current: '31h',
			ok: false
		},
		{
			name: 'Disponibilità documentazione',
			target: '> 95%',
			current: '87%',
			ok: false
		},
		{
			name: 'Aggiornamento polizze fornitori',
			target: '100% in regola',
			current: '92%',
			ok: false
		}
	];

	const regulatory = [
		{
			label: 'Privacy (GDPR)',
			status: 'In regola',
			detail: 'DPIA aggiornata · ultimo audit gennaio 2026',
			tone: 'success'
		},
		{
			label: 'Antincendio',
			status: 'In scadenza',
			detail: '2 immobili con CPI in scadenza nei prossimi 60 giorni',
			tone: 'warning'
		},
		{
			label: 'Impianti elevatori',
			status: 'In regola',
			detail: 'Verifiche biennali tutte completate',
			tone: 'success'
		},
		{
			label: 'Energia (APE)',
			status: 'Attenzione',
			detail: '1 immobile in attesa di aggiornamento APE',
			tone: 'warning'
		}
	];

	const toneClass: Record<string, string> = {
		success: 'border-success/30 bg-success/10 text-success',
		warning: 'border-warning/40 bg-warning/10 text-foreground',
		destructive: 'border-destructive/30 bg-destructive/10 text-destructive'
	};

	function scoreClass(pct: number) {
		if (pct >= 80) return 'text-success';
		if (pct >= 60) return 'text-warning';
		return 'text-destructive';
	}

	function scoreBgClass(pct: number) {
		if (pct >= 80) return 'bg-success';
		if (pct >= 60) return 'bg-warning';
		return 'bg-destructive';
	}
</script>

<svelte:head>
	<title>Compliance — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				Compliance & quality
			</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
				Governance operativa
			</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				Monitoraggio degli standard operativi, dei processi definiti e dei requisiti normativi per il network
				di amministratori, fornitori e condomìni.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<HugeiconsIcon icon={ShieldUserIcon} size={20} strokeWidth={1.5} class="text-primary" />
		</div>
	</header>

	<!-- KPI -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<p class="text-sm text-muted-foreground">Score medio di compliance</p>
			<p class="mt-2 text-3xl font-semibold {scoreClass(avgScore)}">{avgScore}%</p>
			<p class="mt-1 text-xs text-muted-foreground">Aggregato sui {matrix.length} condomìni</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<p class="text-sm text-muted-foreground">Immobili in piena regola</p>
			<p class="mt-2 text-3xl font-semibold text-success">{fullyCompliant}</p>
			<p class="mt-1 text-xs text-muted-foreground">Tutti i documenti richiesti presenti</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<p class="text-sm text-muted-foreground">Immobili a rischio</p>
			<p class="mt-2 text-3xl font-semibold text-destructive">{atRisk}</p>
			<p class="mt-1 text-xs text-muted-foreground">Score sotto la soglia del 60%</p>
		</div>
	</div>

	<!-- Compliance matrix -->
	<section class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<div class="border-b border-border px-6 py-4">
			<h2 class="text-base font-semibold text-foreground">Matrice documentale per immobile</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				Presenza dei documenti chiave richiesti dagli standard Svicom.
			</p>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
					<tr>
						<th class="sticky left-0 z-10 bg-muted/30 px-5 py-3 font-medium">Immobile</th>
						{#each complianceRequirements as req}
							<th class="px-3 py-3 font-medium text-center">{req.label}</th>
						{/each}
						<th class="px-5 py-3 font-medium text-right">Score</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each matrix as row (row.property.id)}
						<tr class="hover:bg-muted/30">
							<td class="sticky left-0 z-10 bg-card px-5 py-3 font-medium text-foreground">
								{row.property.name}
							</td>
							{#each complianceRequirements as req}
								<td class="px-3 py-3 text-center">
									{#if row.checks[req.key]}
										<span class="inline-flex text-success" title={req.description}>
											<HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} strokeWidth={1.75} />
										</span>
									{:else}
										<span class="inline-flex text-destructive/70" title={req.description}>
											<HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.75} />
										</span>
									{/if}
								</td>
							{/each}
							<td class="px-5 py-3 text-right">
								<div class="inline-flex items-center gap-2">
									<div class="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
										<div class="h-full {scoreBgClass(row.scorePct)}" style="width: {row.scorePct}%"></div>
									</div>
									<span class="w-10 text-right tabular-nums text-xs font-medium {scoreClass(row.scorePct)}">
										{row.scorePct}%
									</span>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Process compliance -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-base font-semibold text-foreground">Standard di processo</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				Indicatori operativi misurati rispetto agli SLA contrattuali.
			</p>

			<ul class="mt-5 divide-y divide-border">
				{#each processes as p}
					<li class="flex items-center justify-between py-3">
						<div class="min-w-0">
							<p class="text-sm font-medium text-foreground">{p.name}</p>
							<p class="text-xs text-muted-foreground">Target {p.target}</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold tabular-nums {p.ok ? 'text-success' : 'text-destructive'}">
								{p.current}
							</span>
							<HugeiconsIcon
								icon={p.ok ? CheckmarkCircle02Icon : Cancel01Icon}
								size={16}
								strokeWidth={1.75}
								class={p.ok ? 'text-success' : 'text-destructive'}
							/>
						</div>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Regulatory -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-base font-semibold text-foreground">Compliance regolatoria</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				Vincoli normativi rilevanti per il settore residenziale e condominiale.
			</p>

			<ul class="mt-5 space-y-3">
				{#each regulatory as r}
					<li class="rounded-lg border p-4 {toneClass[r.tone]}">
						<div class="flex items-baseline justify-between gap-2">
							<p class="text-sm font-semibold">{r.label}</p>
							<span class="text-xs font-medium">{r.status}</span>
						</div>
						<p class="mt-1 text-xs opacity-80">{r.detail}</p>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>
