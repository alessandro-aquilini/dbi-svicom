	<script lang="ts">
	import {
		ResidentAssemblyCard,
		formatAssemblyDate,
		formatAssemblySchedule,
		getAssemblyCalendarHref,
		getAssemblyCallHref,
		getAssemblyVoteHref,
		getResidentAssemblyProxyRecord,
		getResidentAssemblyVoteRecord
	} from '$lib/components/view-resident/assemblies';
	import {
		ResidentEmptyCard
	} from '$lib/components/view-resident/resident';
	import { InfoTip } from '$lib/components/shared';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';
	import { getAssembliesByPropertyId } from '$lib/data/events/assemblies';
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
	let completedSearch = $state('');
	let completedFilter = $state<'all' | 'minutes' | 'ordinaria' | 'straordinaria'>('all');
	const filteredCompletedAssemblies = $derived.by(() => {
		const query = completedSearch.trim().toLowerCase();

		return completedAssemblies.filter((assembly) => {
			if (completedFilter === 'minutes' && !assembly.minutes) return false;
			if (completedFilter === 'ordinaria' && assembly.type !== 'ordinaria') return false;
			if (completedFilter === 'straordinaria' && assembly.type !== 'straordinaria') return false;

			if (!query) return true;

			const searchableText = [
				assembly.location,
				assembly.type,
				...assembly.agenda,
				assembly.minutes?.text ?? '',
				...(assembly.minutes?.resolutions.map((resolution) => `${resolution.title} ${resolution.notes ?? ''}`) ?? [])
			]
				.join(' ')
				.toLowerCase();

			return searchableText.includes(query);
		});
	});
</script>

<svelte:head>
	<title>Assemblee - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<section class="report-page-header">
			<div class="report-page-header__main">
				<p class="report-page-header__eyebrow">Governance</p>
				<div class="resident-heading-with-tip">
					<h1 class="report-page-header__title">Assemblee</h1>
					<InfoTip text="Qui trovi convocazioni, verbali, delibere e accessi rapidi alle prossime assemblee del tuo stabile." />
				</div>
				<p class="report-page-header__copy">{summaryCopy}</p>
			</div>

			<div class="report-page-header__stats" aria-label="Panoramica assemblee">
				{#each summaryStats as stat}
					<div class="report-page-header__stat">
						<p class="report-page-header__stat-label">{stat.label}</p>
						<p class="report-page-header__stat-value">{stat.value}</p>
					</div>
				{/each}
			</div>

			{#if summaryChips.length > 0}
				<div class="report-page-header__chips">
					{#each summaryChips as chip}
						<span class="report-page-header__chip">{chip}</span>
					{/each}
				</div>
			{/if}
		</section>

		{#if nextAssembly}
			<Card class="assembly-hero-card">
				<CardHeader class="assembly-hero-card__header">
					<div class="assembly-hero-card__heading">
						<div class="resident-heading-with-tip resident-heading-with-tip--compact">
							<p class="assembly-hero-card__eyebrow">Prossima assemblea</p>
							<InfoTip text="Quando l'assemblea e pianificata, da qui puoi aprire scheda, chiamata, voto e delega." />
						</div>
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
						{#each nextAssembly.agenda.slice(0, 3) as agendaItem}
							<div class="assembly-hero-card__agenda-item">
								<span class="assembly-hero-card__agenda-dot" aria-hidden="true"></span>
								<p>{agendaItem}</p>
							</div>
						{/each}
					</div>
					{#if nextAssembly.agenda.length > 3}
						<p class="assembly-hero-card__note">
							Altri {nextAssembly.agenda.length - 3} punti disponibili nella scheda completa.
						</p>
					{/if}

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
					<div class="resident-heading-with-tip">
						<h2 class="resident-module-section__title">Storico e verbali</h2>
						<InfoTip text="Cerca per luogo o contenuto e filtra solo le assemblee che ti interessa rivedere." />
					</div>
					<p class="resident-module-section__copy">Assemblee concluse con verbali, presenze e delibere registrate.</p>
				</div>

				<div class="assembly-history-toolbar">
					<div class="assembly-history-toolbar__search">
						<Input
							placeholder="Cerca per luogo, ODG o verbale"
							value={completedSearch}
							oninput={(event: Event) => (completedSearch = (event.currentTarget as HTMLInputElement).value)}
							class="assembly-history-toolbar__input"
						/>
					</div>

					<div class="assembly-history-toolbar__filters">
						<Button
							type="button"
							size="sm"
							variant={completedFilter === 'all' ? 'default' : 'outline'}
							class="assembly-history-toolbar__button"
							onclick={() => (completedFilter = 'all')}
						>
							Tutte
						</Button>
						<Button
							type="button"
							size="sm"
							variant={completedFilter === 'minutes' ? 'default' : 'outline'}
							class="assembly-history-toolbar__button"
							onclick={() => (completedFilter = 'minutes')}
						>
							Con verbale
						</Button>
						<Button
							type="button"
							size="sm"
							variant={completedFilter === 'ordinaria' ? 'default' : 'outline'}
							class="assembly-history-toolbar__button"
							onclick={() => (completedFilter = 'ordinaria')}
						>
							Ordinarie
						</Button>
						<Button
							type="button"
							size="sm"
							variant={completedFilter === 'straordinaria' ? 'default' : 'outline'}
							class="assembly-history-toolbar__button"
							onclick={() => (completedFilter = 'straordinaria')}
						>
							Straordinarie
						</Button>
					</div>
				</div>

				<div class="assembly-cards-stack">
					{#each filteredCompletedAssemblies as assembly}
						<ResidentAssemblyCard
							assembly={assembly}
							href={`/resident/assemblies/${assembly.id}`}
							secondaryHref={assembly.minutes ? `/resident/assemblies/${assembly.id}?minutes=1` : undefined}
						/>
					{/each}

					{#if filteredCompletedAssemblies.length === 0}
						<ResidentEmptyCard
							title="Nessuna assemblea trovata"
							copy="Prova a cambiare filtro o a cercare con un termine diverso."
						/>
					{/if}
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
