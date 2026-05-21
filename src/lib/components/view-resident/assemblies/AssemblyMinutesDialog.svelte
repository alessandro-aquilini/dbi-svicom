<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import type { Assembly } from '$lib/data/events/assemblies';
	import AssemblyMinutesHighlights from './AssemblyMinutesHighlights.svelte';
	import AssemblyTranscriptList from './AssemblyTranscriptList.svelte';
	import AssemblyTypeBadge from './AssemblyTypeBadge.svelte';
	import ResolutionOutcomeBadge from './ResolutionOutcomeBadge.svelte';
	import {
		formatAssemblyDate,
		formatAssemblySchedule,
		getResolutionVoteSummary,
		normalizeAssemblyText
	} from './presentation';

	let {
		assembly,
		propertyName,
		unitsCount,
		referenceAssemblyId,
		initiallyOpen = false
	}: {
		assembly: Assembly;
		propertyName: string;
		unitsCount?: number;
		referenceAssemblyId?: string;
		initiallyOpen?: boolean;
	} = $props();

	let isOpen = $state(false);

	$effect(() => {
		if (initiallyOpen) {
			isOpen = true;
		}
	});

	const isCurrentAssemblyMinutes = $derived(referenceAssemblyId === assembly.id);
	const minutes = $derived(assembly.minutes);
	const launcherEyebrow = $derived(
		isCurrentAssemblyMinutes ? 'Verbale disponibile' : 'Ultimo verbale disponibile'
	);
	const launcherTitle = $derived(
		isCurrentAssemblyMinutes ? 'Apri il verbale completo' : 'Consulta il verbale dell assemblea precedente'
	);
	const launcherCopy = $derived(
		minutes
			? `Verbale pubblicato il ${formatAssemblyDate(minutes.publishedAt)} con sintesi, passaggi chiave e delibere.`
			: 'Apri il verbale disponibile.'
	);
	const facts = $derived(
		minutes
			? [
					{
						label: 'Pubblicato il',
						value: formatAssemblyDate(minutes.publishedAt),
						copy: 'Data di messa a disposizione del verbale per i residenti.'
					},
					{
						label: 'Assemblea del',
						value: formatAssemblyDate(assembly.scheduledAt),
						copy: 'Sessione a cui fanno riferimento verbale, presenze e delibere.'
					},
					{
						label: 'Presenti',
						value:
							typeof unitsCount === 'number' && unitsCount > 0
								? `${minutes.attendeesCount}/${unitsCount}`
								: `${minutes.attendeesCount}`,
						copy:
							typeof unitsCount === 'number' && unitsCount > 0
								? `${minutes.attendeesCount} partecipanti registrati su ${unitsCount} unita.`
								: 'Numero di condomini registrati nel verbale.'
					},
					{
						label: 'Millesimi',
						value: `${minutes.millesimalPresent}`,
						copy: 'Quota millesimale presente e riportata nel verbale.'
					},
					{
						label: 'Delibere',
						value: `${minutes.resolutions.length}`,
						copy: 'Numero totale di votazioni formalizzate nella seduta.'
					}
				]
			: []
	);
	const badgeItems = $derived(
		minutes
			? [`Pubblicato il ${formatAssemblyDate(minutes.publishedAt)}`, `${minutes.resolutions.length} delibere`]
			: []
	);
</script>

<Card class="assembly-minutes-launcher">
	<CardContent class="assembly-minutes-launcher__content">
		<div class="assembly-minutes-launcher__main">
			<p class="assembly-minutes-launcher__eyebrow">{launcherEyebrow}</p>
			<h2 class="assembly-minutes-launcher__title">{launcherTitle}</h2>
			<p class="assembly-minutes-launcher__copy">{launcherCopy}</p>
		</div>

		<Button size="lg" class="assembly-minutes-launcher__button" onclick={() => (isOpen = true)}>
			Apri verbale
		</Button>
	</CardContent>
</Card>

<Dialog bind:open={isOpen}>
	<DialogContent class="assembly-minutes-dialog">
		<DialogHeader class="assembly-minutes-dialog__header">
			<p class="assembly-minutes-dialog__eyebrow">{propertyName}</p>
			<DialogTitle class="assembly-minutes-dialog__title">
				Ultimo verbale disponibile
			</DialogTitle>
			<DialogDescription class="assembly-minutes-dialog__copy">
				{formatAssemblySchedule(assembly.scheduledAt)} presso {normalizeAssemblyText(assembly.location)}.
			</DialogDescription>
			<div class="assembly-minutes-dialog__badge-row">
				<AssemblyTypeBadge type={assembly.type} />
				{#each badgeItems as item}
					<Badge variant="outline" class="assembly-minutes-dialog__meta-badge">{item}</Badge>
				{/each}
			</div>
		</DialogHeader>

		<div class="assembly-minutes-dialog__body">
			{#if minutes}
				<Card class="assembly-minutes-overview-card">
					<CardHeader class="assembly-minutes-overview-card__header">
						<div class="assembly-minutes-overview-card__heading">
							<CardTitle class="assembly-minutes-overview-card__title">Sintesi del verbale</CardTitle>
							<CardDescription class="assembly-minutes-overview-card__copy">
								Quadro introduttivo dell assemblea con dati chiave e testo di apertura del verbale.
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent class="assembly-minutes-overview-card__content">
						<div class="assembly-minutes-overview-card__layout">
							<div class="assembly-minutes-overview-card__summary-panel">
								<p class="assembly-minutes-overview-card__summary-label">Apertura verbale</p>
								<p class="assembly-minutes-overview-card__summary">
									{normalizeAssemblyText(minutes.text)}
								</p>
							</div>

							<div class="assembly-minutes-overview-card__facts-panel">
								<div class="assembly-minutes-overview-card__facts-list">
									{#each facts as fact}
										<div class="assembly-minutes-overview-card__fact-row">
											<div class="assembly-minutes-overview-card__fact-main">
												<p class="assembly-minutes-overview-card__fact-label">{fact.label}</p>
												<p class="assembly-minutes-overview-card__fact-copy">{fact.copy}</p>
											</div>
											<p class="assembly-minutes-overview-card__fact-value">{fact.value}</p>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<div class="assembly-minutes-dialog__layout">
					<div class="assembly-minutes-dialog__main">
						<Card class="assembly-transcript-card assembly-transcript-card--dialog">
							<CardHeader class="assembly-dialog-section__header">
								<CardTitle>Estratto dall ultimo verbale disponibile</CardTitle>
								<CardDescription>
									Sequenza dei passaggi piu rilevanti emersi dal verbale pubblicato.
								</CardDescription>
							</CardHeader>

							<CardContent class="assembly-transcript-card__content">
								<AssemblyTranscriptList {assembly} />
							</CardContent>
						</Card>
					</div>

					<div class="assembly-minutes-dialog__side">
						<Card class="assembly-minutes-card assembly-minutes-card--dialog">
							<CardHeader class="assembly-dialog-section__header">
								<CardTitle>Verbale in evidenza</CardTitle>
								<CardDescription>
									Sintesi immediata di presenze, focus e delibere del verbale pubblicato.
								</CardDescription>
							</CardHeader>

							<CardContent class="assembly-minutes-card__content">
								<AssemblyMinutesHighlights {assembly} {unitsCount} />
							</CardContent>
						</Card>

						<Card class="assembly-resolutions-card assembly-resolutions-card--dialog">
							<CardHeader class="assembly-dialog-section__header">
								<CardTitle>Delibere registrate</CardTitle>
								<CardDescription>
									Esito sintetico delle votazioni riportate nel verbale pubblicato.
								</CardDescription>
							</CardHeader>

							<CardContent class="assembly-resolutions-card__content">
								<div class="assembly-resolution-stack">
									{#each minutes.resolutions as resolution, index}
										<div class="assembly-resolution-row">
											<div class="assembly-resolution-row__header">
												<div class="assembly-resolution-row__heading">
													<p class="assembly-resolution-row__eyebrow">Delibera {index + 1}</p>
													<p class="assembly-resolution-row__title">
														{normalizeAssemblyText(resolution.title)}
													</p>
												</div>
												<ResolutionOutcomeBadge outcome={resolution.outcome} />
											</div>

											<div class="assembly-resolution-row__votes">
												<div class="assembly-resolution-row__vote">
													<p class="assembly-resolution-row__vote-label">Favorevoli</p>
													<p class="assembly-resolution-row__vote-value">{resolution.millesimalFor}</p>
												</div>
												<div class="assembly-resolution-row__vote">
													<p class="assembly-resolution-row__vote-label">Contrari</p>
													<p class="assembly-resolution-row__vote-value">{resolution.millesimalAgainst}</p>
												</div>
												<div class="assembly-resolution-row__vote">
													<p class="assembly-resolution-row__vote-label">Astenuti</p>
													<p class="assembly-resolution-row__vote-value">{resolution.millesimalAbstain}</p>
												</div>
											</div>

											<p class="assembly-resolution-row__copy">
												{getResolutionVoteSummary(resolution)}
											</p>

											{#if resolution.notes}
												<p class="assembly-resolution-row__notes">
													{normalizeAssemblyText(resolution.notes)}
												</p>
											{/if}
										</div>
									{/each}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			{/if}
		</div>
	</DialogContent>
</Dialog>
