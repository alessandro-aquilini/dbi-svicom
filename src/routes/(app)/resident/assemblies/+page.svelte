<script lang="ts">
	import {
		AssemblyMinutesHighlights,
		ResidentAssemblyCard,
		formatAssemblyDate,
		formatAssemblySchedule,
		getAssemblyCalendarHref,
		getAssemblyCallHref,
		getAssemblyVoteHref,
		getResidentAssemblyProxyRecord,
		getResidentAssemblyVoteRecord
	} from '$lib/components/assemblies';
	import { ResidentEmptyCard, ResidentSummaryCard } from '$lib/components/resident';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';
	import { getAssembliesByPropertyId } from '$lib/data/assemblies';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';

	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const assemblies = property ? getAssembliesByPropertyId(property.id) : [];

	const orderedAssemblies = [...assemblies].sort((left, right) =>
		right.scheduledAt.localeCompare(left.scheduledAt)
	);
	const plannedAssemblies = orderedAssemblies.filter((assembly) => assembly.status === 'pianificata');
	const completedAssemblies = orderedAssemblies.filter((assembly) => assembly.status === 'svolta');
	const nextAssembly = [...plannedAssemblies].sort((left, right) =>
		left.scheduledAt.localeCompare(right.scheduledAt)
	)[0];
	const remainingPlannedAssemblies = plannedAssemblies.filter(
		(assembly) => assembly.id !== nextAssembly?.id
	);
	const latestMinutesAssembly = [...completedAssemblies].find((assembly) => assembly.minutes);
	const savedVotesCount = currentUser
		? plannedAssemblies.filter((assembly) => getResidentAssemblyVoteRecord(assembly.id, currentUser.id)).length
		: 0;
	const savedProxyCount = currentUser
		? plannedAssemblies.filter((assembly) => getResidentAssemblyProxyRecord(assembly.id, currentUser.id)).length
		: 0;

	const summaryCopy =
		property && resident
			? `${property.name}, ${resident.apartment}. Qui trovi convocazioni, verbali, delibere e accessi rapidi alle prossime assemblee.`
			: 'Profilo residente non disponibile.';

	const summaryStats = [
		{ label: 'Assemblee totali', value: orderedAssemblies.length },
		{ label: 'In programma', value: plannedAssemblies.length },
		{ label: 'Verbali disponibili', value: completedAssemblies.filter((assembly) => assembly.minutes).length }
	];

	const summaryChips = property
		? [
				property.address.street,
				nextAssembly ? `Prossima: ${formatAssemblyDate(nextAssembly.scheduledAt)}` : 'Nessuna assemblea pianificata',
				savedVotesCount > 0 ? `${savedVotesCount} voto personale salvato` : 'Nessun voto personale salvato',
				savedProxyCount > 0 ? `${savedProxyCount} delega registrata` : 'Nessuna delega registrata'
			]
		: [];
</script>

<svelte:head>
	<title>Assemblee - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<ResidentSummaryCard
			eyebrow="Governance"
			title="Assemblee"
			copy={summaryCopy}
			stats={summaryStats}
			chips={summaryChips}
		/>

		{#if nextAssembly}
			<Card class="assembly-hero-card">
				<CardHeader class="assembly-hero-card__header">
					<div class="assembly-hero-card__heading">
						<p class="assembly-hero-card__eyebrow">Prossima assemblea</p>
						<CardTitle class="assembly-hero-card__title">{property?.name}</CardTitle>
						<CardDescription class="assembly-hero-card__copy">
							{formatAssemblySchedule(nextAssembly.scheduledAt)} presso {nextAssembly.location}.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent class="assembly-hero-card__content">
					<div class="assembly-hero-card__facts">
						<div class="assembly-hero-card__fact">
							<p class="assembly-hero-card__fact-label">Ordine del giorno</p>
							<p class="assembly-hero-card__fact-value">{nextAssembly.agenda.length} punti</p>
						</div>
						<div class="assembly-hero-card__fact">
							<p class="assembly-hero-card__fact-label">Unita coinvolte</p>
							<p class="assembly-hero-card__fact-value">{property?.units ?? 0} unita</p>
						</div>
					</div>

					<div class="assembly-hero-card__agenda">
						{#each nextAssembly.agenda as agendaItem}
							<p class="assembly-hero-card__agenda-item">{agendaItem}</p>
						{/each}
					</div>

					<div class="assembly-hero-card__actions">
						<Button href={`/resident/assemblies/${nextAssembly.id}`} size="lg" class="assembly-hero-card__button">
							Apri scheda
						</Button>
						<Button href={getAssemblyCallHref(nextAssembly.id)} variant="outline" size="lg" class="assembly-hero-card__button">
							Link di chiamata
						</Button>
						<Button href={getAssemblyVoteHref(nextAssembly.id)} variant="outline" size="lg" class="assembly-hero-card__button">
							Piattaforma voto
						</Button>
						<Button href={`/resident/assemblies/${nextAssembly.id}/proxy`} variant="outline" size="lg" class="assembly-hero-card__button">
							Gestisci delega
						</Button>
						<Button
							href={getAssemblyCalendarHref(nextAssembly, property?.name ?? 'Assemblea')}
							variant="outline"
							size="lg"
							class="assembly-hero-card__button"
							download={`${nextAssembly.id}.ics`}
						>
							Aggiungi al calendario
						</Button>
					</div>
				</CardContent>
			</Card>
		{/if}

		{#if latestMinutesAssembly?.minutes}
			<Card class="assembly-highlight-card">
				<CardHeader>
					<CardTitle>Ultimo verbale disponibile</CardTitle>
					<CardDescription>
						Verbale pubblicato il {formatAssemblyDate(latestMinutesAssembly.minutes.publishedAt)} con i punti principali gia estratti dalla scheda assemblea.
					</CardDescription>
				</CardHeader>

				<CardContent class="assembly-highlight-card__content">
					<AssemblyMinutesHighlights
						assembly={latestMinutesAssembly}
						unitsCount={property?.units}
					/>

					<Button href={`/resident/assemblies/${latestMinutesAssembly.id}?minutes=1`} variant="outline" size="lg" class="assembly-highlight-card__button">
						Apri verbale completo
					</Button>
				</CardContent>
			</Card>
		{/if}

		{#if remainingPlannedAssemblies.length > 0}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<h1 class="resident-module-section__title">Altre assemblee in programma</h1>
					<p class="resident-module-section__copy">
						Calendario delle ulteriori convocazioni gia registrate per il tuo stabile.
					</p>
				</div>

				<div class="assembly-cards-stack">
					{#each remainingPlannedAssemblies as assembly}
						<ResidentAssemblyCard assembly={assembly} href={`/resident/assemblies/${assembly.id}`} />
					{/each}
				</div>
			</section>
		{/if}

		{#if completedAssemblies.length > 0}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<h2 class="resident-module-section__title">Storico e verbali</h2>
					<p class="resident-module-section__copy">
						Assemblee concluse con verbali, presenze e delibere registrate.
					</p>
				</div>

				<div class="assembly-cards-stack">
					{#each completedAssemblies as assembly}
						<ResidentAssemblyCard
							assembly={assembly}
							href={`/resident/assemblies/${assembly.id}`}
							secondaryHref={assembly.minutes ? `/resident/assemblies/${assembly.id}?minutes=1` : undefined}
						/>
					{/each}
				</div>
			</section>
		{/if}

		{#if orderedAssemblies.length === 0}
			<ResidentEmptyCard
				title="Nessuna assemblea disponibile"
				copy="Quando il calendario condominiale verra aggiornato, troverai qui convocazioni, verbali e delibere."
			/>
		{/if}
	</div>
</div>
