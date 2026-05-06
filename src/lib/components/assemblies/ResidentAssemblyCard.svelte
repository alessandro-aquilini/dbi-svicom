<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardAction,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import type { Assembly } from '$lib/data/assemblies';
	import { formatAssemblyDate, formatAssemblySchedule, normalizeAssemblyText } from './presentation';
	import AssemblyStatusBadge from './AssemblyStatusBadge.svelte';
	import AssemblyTypeBadge from './AssemblyTypeBadge.svelte';
	import ResolutionOutcomeBadge from './ResolutionOutcomeBadge.svelte';

	let {
		assembly,
		href,
		secondaryHref,
		secondaryLabel = 'Apri verbale'
	}: {
		assembly: Assembly;
		href?: string;
		secondaryHref?: string;
		secondaryLabel?: string;
	} = $props();

	const scheduleLabel = $derived(formatAssemblySchedule(assembly.scheduledAt));
	const minutesPublishedLabel = $derived(
		assembly.minutes ? formatAssemblyDate(assembly.minutes.publishedAt) : undefined
	);
</script>

<Card class="assembly-card-shell">
	<CardHeader class="assembly-card-shell__header">
		<div class="assembly-card-shell__header-main">
			<div class="assembly-card-shell__badge-row">
				<AssemblyTypeBadge type={assembly.type} />
			</div>
			<CardTitle class="assembly-card-shell__title">{normalizeAssemblyText(assembly.location)}</CardTitle>
			<CardDescription class="assembly-card-shell__description">{scheduleLabel}</CardDescription>
		</div>
		<CardAction>
			<AssemblyStatusBadge status={assembly.status} />
		</CardAction>
	</CardHeader>

	<CardContent class="assembly-card-shell__content">
		<div class="assembly-card-shell__facts">
			<div class="assembly-card-shell__fact">
				<p class="assembly-card-shell__fact-label">Data</p>
				<p class="assembly-card-shell__fact-value">{formatAssemblyDate(assembly.scheduledAt)}</p>
			</div>
			<div class="assembly-card-shell__fact">
				<p class="assembly-card-shell__fact-label">Ordine del giorno</p>
				<p class="assembly-card-shell__fact-value">{assembly.agenda.length} punti</p>
			</div>
		</div>

		<div class="assembly-card-shell__section">
			<p class="assembly-card-shell__section-label">Ordine del giorno</p>
			<ul class="assembly-card-shell__agenda-list">
				{#each assembly.agenda as agendaItem}
					<li class="assembly-card-shell__agenda-item">{normalizeAssemblyText(agendaItem)}</li>
				{/each}
			</ul>
		</div>

		{#if assembly.minutes}
			<Separator class="assembly-card-shell__separator" />

			<div class="assembly-card-shell__section">
				<p class="assembly-card-shell__section-label">Verbale disponibile</p>
				<p class="assembly-card-shell__minutes-copy">{normalizeAssemblyText(assembly.minutes.text)}</p>

				<div class="assembly-card-shell__facts">
					<div class="assembly-card-shell__fact">
						<p class="assembly-card-shell__fact-label">Presenti</p>
						<p class="assembly-card-shell__fact-value">
							{assembly.minutes.attendeesCount} condomini
						</p>
					</div>
					<div class="assembly-card-shell__fact">
						<p class="assembly-card-shell__fact-label">Millesimi</p>
						<p class="assembly-card-shell__fact-value">{assembly.minutes.millesimalPresent}</p>
					</div>
				</div>

				<div class="assembly-card-shell__resolution-list">
					{#each assembly.minutes.resolutions as resolution}
						<div class="assembly-card-shell__resolution">
							<div class="assembly-card-shell__resolution-main">
								<p class="assembly-card-shell__resolution-title">
									{normalizeAssemblyText(resolution.title)}
								</p>
								{#if resolution.notes}
									<p class="assembly-card-shell__resolution-notes">
										{normalizeAssemblyText(resolution.notes)}
									</p>
								{/if}
							</div>
							<ResolutionOutcomeBadge outcome={resolution.outcome} />
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</CardContent>

	<CardFooter class="assembly-card-shell__footer">
		<div class="assembly-card-shell__footer-main">
			<p class="assembly-card-shell__footer-copy">
				{#if minutesPublishedLabel}
					Verbale pubblicato il {minutesPublishedLabel}
				{:else}
					Assemblea in programma
				{/if}
			</p>
		</div>

		<div class="assembly-card-shell__footer-actions">
			{#if secondaryHref}
				<Button href={secondaryHref} variant="outline" size="lg" class="assembly-card-shell__button">
					{secondaryLabel}
				</Button>
			{/if}
			{#if href}
				<Button href={href} size="lg" class="assembly-card-shell__button">
					Apri scheda
				</Button>
			{/if}
		</div>
	</CardFooter>
</Card>
