<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		MoneyBag02Icon,
		ChartLineData01Icon,
		ArrowUpRight01Icon,
		ArrowDown01Icon
	} from '@hugeicons/core-free-icons';
	import {
		monthlyRecurringRevenue,
		intermediationRevenue,
		activationsRevenue,
		transactionalRevenue,
		totalAnnualizedRevenue,
		revenueTrend,
		revenueProjection,
		totalUnits,
		invoices,
		bookings,
		RECURRING_FEE_PER_UNIT,
		INTERMEDIATION_RATE,
		ACTIVATION_FEE,
		eurFormatter
	} from '$lib/svicom/metrics';

	const mrr = monthlyRecurringRevenue();
	const tx = transactionalRevenue();
	const intermed = intermediationRevenue();
	const activ = activationsRevenue();
	const arr = totalAnnualizedRevenue();
	const trend = revenueTrend();
	const projection = revenueProjection();

	const maxTrend = Math.max(...trend.map((t) => t.recurring + t.transactional));
	const maxProjection = Math.max(...projection.map((p) => p.total));
	const trendDelta = trend[trend.length - 1].recurring + trend[trend.length - 1].transactional
		- (trend[0].recurring + trend[0].transactional);
	const trendDeltaPct = Math.round(
		(trendDelta / (trend[0].recurring + trend[0].transactional)) * 100
	);

	const recurringShare = Math.round((mrr * 12 / arr) * 100);

	const streams = [
		{
			label: 'Management fee',
			value: mrr,
			period: '/mese',
			detail: `${totalUnits} unità × €${RECURRING_FEE_PER_UNIT.toFixed(2)}`,
			category: 'recurring'
		},
		{
			label: 'Intermediazione fornitori',
			value: intermed,
			period: 'YTD',
			detail: `${invoices.length} fatture · ${(INTERMEDIATION_RATE * 100).toFixed(0)}% sul fatturato`,
			category: 'transactional'
		},
		{
			label: 'Attivazione servizi',
			value: activ,
			period: 'YTD',
			detail: `${bookings.length} prenotazioni · €${ACTIVATION_FEE} per attivazione`,
			category: 'transactional'
		}
	];
</script>

<svelte:head>
	<title>Ricavi — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ricavi</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
				Dashboard commerciale
			</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				Composizione dei ricavi ricorrenti e transazionali, trend storici e proiezione triennale del prossimo trimestre.
			</p>
		</div>
		<span class="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
			<HugeiconsIcon icon={ArrowUpRight01Icon} size={12} strokeWidth={2} />
			+{trendDeltaPct}% YoY
		</span>
	</header>

	<!-- KPI row -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-muted-foreground">Ricavi annualizzati</span>
				<span class="rounded-md bg-primary/10 p-2 text-primary">
					<HugeiconsIcon icon={MoneyBag02Icon} size={18} strokeWidth={1.75} />
				</span>
			</div>
			<p class="mt-3 text-3xl font-semibold text-primary">{eurFormatter.format(arr)}</p>
			<p class="mt-1 text-xs text-muted-foreground">Run-rate sui ricavi correnti.</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<span class="text-sm text-muted-foreground">MRR ricorrente</span>
			<p class="mt-3 text-3xl font-semibold text-foreground">{eurFormatter.format(mrr)}</p>
			<p class="mt-1 text-xs text-muted-foreground">
				{recurringShare}% del totale annualizzato
			</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<span class="text-sm text-muted-foreground">Ricavi transazionali</span>
			<p class="mt-3 text-3xl font-semibold text-foreground">{eurFormatter.format(tx)}</p>
			<p class="mt-1 text-xs text-muted-foreground">Intermediazione + attivazioni</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<span class="text-sm text-muted-foreground">Unità sotto contratto</span>
			<p class="mt-3 text-3xl font-semibold text-foreground">{totalUnits}</p>
			<p class="mt-1 text-xs text-muted-foreground">Base produttiva del MRR</p>
		</div>
	</div>

	<!-- Trend chart -->
	<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
		<div class="flex items-baseline justify-between">
			<div>
				<h2 class="text-base font-semibold text-foreground">Trend ricavi · 12 mesi</h2>
				<p class="mt-1 text-xs text-muted-foreground">
					Composizione mensile: ricorrenti in primo piano, transazionali sovrapposti.
				</p>
			</div>
			<div class="flex items-center gap-4 text-xs text-muted-foreground">
				<span class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-sm bg-primary"></span>
					Ricorrenti
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-2.5 w-2.5 rounded-sm bg-primary/30"></span>
					Transazionali
				</span>
			</div>
		</div>

		<div class="mt-6 flex items-end gap-2">
			{#each trend as t}
				{@const total = t.recurring + t.transactional}
				{@const recPct = Math.round((t.recurring / maxTrend) * 100)}
				{@const txPct = Math.round((t.transactional / maxTrend) * 100)}
				<div class="flex flex-1 flex-col items-center gap-2">
					<div class="relative flex h-48 w-full flex-col-reverse overflow-hidden rounded-md bg-muted/30">
						<div class="bg-primary transition-all" style="height: {recPct}%"></div>
						<div class="bg-primary/30 transition-all" style="height: {txPct}%"></div>
					</div>
					<div class="flex flex-col items-center gap-0.5">
						<span class="text-[11px] font-medium tabular-nums text-foreground">
							{eurFormatter.format(total)}
						</span>
						<span class="text-[10px] text-muted-foreground">{t.month}</span>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Streams + projection -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 class="text-base font-semibold text-foreground">Flussi di ricavo</h2>
			<p class="mt-1 text-xs text-muted-foreground">
				Dettaglio per canale commerciale.
			</p>

			<ul class="mt-5 space-y-3">
				{#each streams as s}
					<li class="rounded-lg border border-border p-4">
						<div class="flex items-baseline justify-between">
							<div>
								<p class="text-sm font-medium text-foreground">{s.label}</p>
								<p class="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-semibold tabular-nums text-foreground">
									{eurFormatter.format(s.value)}
								</p>
								<p class="text-[10px] uppercase tracking-wider text-muted-foreground">
									{s.period}
								</p>
							</div>
						</div>
						<div class="mt-3 flex items-center gap-2">
							<span
								class="rounded-full px-2 py-0.5 text-[10px] font-medium {s.category === 'recurring'
									? 'bg-primary/10 text-primary'
									: 'bg-warning/15 text-foreground'}"
							>
								{s.category === 'recurring' ? 'Ricorrente' : 'Transazionale'}
							</span>
						</div>
					</li>
				{/each}
			</ul>
		</section>

		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-baseline justify-between">
				<div>
					<h2 class="text-base font-semibold text-foreground">Proiezione prossimo trimestre</h2>
					<p class="mt-1 text-xs text-muted-foreground">
						Estrapolazione lineare sui 6 mesi correnti.
					</p>
				</div>
				<HugeiconsIcon icon={ChartLineData01Icon} size={20} strokeWidth={1.5} class="text-primary" />
			</div>

			<div class="mt-6 space-y-4">
				{#each projection as p}
					{@const pct = Math.round((p.total / maxProjection) * 100)}
					<div>
						<div class="flex items-baseline justify-between">
							<span class="text-sm font-medium text-foreground">{p.month}</span>
							<span class="text-sm tabular-nums text-foreground">{eurFormatter.format(p.total)}</span>
						</div>
						<div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
							<div class="h-full bg-primary" style="width: {pct}%"></div>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs">
				<p class="font-medium text-foreground">Nota analitica</p>
				<p class="mt-1 text-muted-foreground">
					La proiezione presuppone stabilità del portafoglio attivo (nessuna chiusura) e crescita organica
					sulle attivazioni. Onboarding in corso non incluso nello scenario base.
				</p>
			</div>
		</section>
	</div>
</div>
