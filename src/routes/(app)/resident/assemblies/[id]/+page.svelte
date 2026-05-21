<script lang="ts">
	import { page } from '$app/state';
	import {
		AssemblyAccessCard,
		AssemblyMinutesDialog,
		AssemblyStatusBadge,
		AssemblyTypeBadge,
		ResidentAssemblyCard,
		assemblyTypeLabels,
		formatAssemblyDate,
		formatAssemblySchedule,
		formatAssemblyTimeRange,
		getAssemblyCalendarHref,
		getAssemblyCallHref,
		getAssemblySessionCode,
		getAssemblySummaryCopy,
		getAssemblyVoteHref,
		getResidentAssemblyContext,
		getResidentAssemblyProxyRecord,
		getResidentAssemblyVoteRecord,
		getResidentAssemblyVoteItems,
		residentAssemblyVoteOptions,
		normalizeAssemblyText
	} from '$lib/components/view-resident/assemblies';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const assemblyId = $derived(page.params.id ?? '');
	const context = $derived(getResidentAssemblyContext(currentUser?.id, assemblyId));
	const transcriptAssembly = $derived(
		context.assembly?.minutes ? context.assembly : context.latestMinutesAssembly
	);
	const hasLiveAccess = $derived(context.assembly?.status === 'pianificata');
	const autoOpenMinutes = $derived(page.url.searchParams.get('minutes') === '1');
	const voteRecord = $derived(
		context.assembly && currentUser
			? getResidentAssemblyVoteRecord(context.assembly.id, currentUser.id)
			: undefined
	);
	const proxyRecord = $derived(
		context.assembly && currentUser
			? getResidentAssemblyProxyRecord(context.assembly.id, currentUser.id)
			: undefined
	);
	const detailFacts = $derived(
		context.assembly && context.property
			? [
					{ label: 'Data assemblea', value: formatAssemblyDate(context.assembly.scheduledAt) },
					{
						label: 'Fascia oraria',
						value: formatAssemblyTimeRange(context.assembly.scheduledAt, context.assembly.endTime)
					},
					{ label: 'Sede', value: normalizeAssemblyText(context.assembly.location) },
					{ label: 'Unita convocate', value: `${context.property.units} unita` }
				]
			: []
	);
	const callFacts = $derived(
		context.assembly && context.resident
			? [
					{ label: 'Profilo', value: currentUser?.name ?? 'Residente' },
					{ label: 'Unita', value: context.resident.apartment },
					{
						label: 'Orario',
						value: formatAssemblyTimeRange(context.assembly.scheduledAt, context.assembly.endTime)
					}
				]
			: []
	);
	const voteFacts = $derived(
		context.assembly && context.property
			? [
					{ label: 'Sessione', value: getAssemblySessionCode(context.assembly.id) },
					{ label: 'Agenda', value: `${context.assembly.agenda.length} punti` },
					{ label: 'Condominio', value: context.property.name }
				]
			: []
	);
	const proxyFacts = $derived(
		context.assembly && context.property
			? [
					{ label: 'Delegato', value: proxyRecord?.delegateName ?? 'Nessuna delega registrata' },
					{ label: 'Contatto', value: proxyRecord?.delegateEmail ?? 'Da compilare' },
					{ label: 'Sessione', value: getAssemblySessionCode(context.assembly.id) }
				]
			: []
	);
	const voteSummaryItems = $derived(
		context.assembly && voteRecord
			? getResidentAssemblyVoteItems(context.assembly).map((item) => ({
					...item,
					choice:
						residentAssemblyVoteOptions.find(
							(option) => option.value === voteRecord.votes.find((vote) => vote.id === item.id)?.choice
						)?.label ?? 'Da definire'
				}))
			: []
	);
	const calendarHref = $derived(
		context.assembly && context.property
			? getAssemblyCalendarHref(context.assembly, context.property.name)
			: ''
	);
</script>

<svelte:head>
	<title>{context.assembly ? `${assemblyTypeLabels[context.assembly.type]} - Residente` : 'Assemblea - Residente'} - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<div class="assembly-detail-actions">
			<Button href="/resident/assemblies" variant="ghost" class="assembly-detail-actions__back">
				&lt; Tutte le assemblee
			</Button>
		</div>

		{#if !context.isAccessible || !context.assembly || !context.property || !context.resident}
			<ResidentEmptyCard
				title="Assemblea non disponibile"
				copy="La scheda richiesta non appartiene al profilo residente attivo o non e disponibile."
			/>
		{:else}
			<Card class="assembly-detail-card">
				<CardHeader class="assembly-detail-card__header">
					<div class="assembly-detail-card__heading">
						<p class="assembly-detail-card__eyebrow">{context.property.name}</p>
						<CardTitle class="assembly-detail-card__title">
							{assemblyTypeLabels[context.assembly.type]}
						</CardTitle>
						<CardDescription class="assembly-detail-card__copy">
							{formatAssemblySchedule(context.assembly.scheduledAt)} presso {normalizeAssemblyText(context.assembly.location)}.
						</CardDescription>
					</div>

					<div class="assembly-detail-card__badge-row">
						<AssemblyTypeBadge type={context.assembly.type} />
						<AssemblyStatusBadge status={context.assembly.status} />
					</div>
				</CardHeader>

				<CardContent class="assembly-detail-card__content">
					<p class="assembly-detail-card__summary">
						{getAssemblySummaryCopy(context.assembly)}
					</p>

					<div class="assembly-detail-card__facts">
						{#each detailFacts as fact}
							<div class="assembly-detail-card__fact">
								<p class="assembly-detail-card__fact-label">{fact.label}</p>
								<p class="assembly-detail-card__fact-value">{fact.value}</p>
							</div>
						{/each}
					</div>

					<div class="assembly-detail-card__agenda">
						<p class="assembly-detail-card__section-label">Ordine del giorno</p>
						<div class="assembly-detail-card__agenda-list">
							{#each context.assembly.agenda as agendaItem}
								<div class="assembly-detail-card__agenda-item">
									{normalizeAssemblyText(agendaItem)}
								</div>
							{/each}
						</div>
					</div>

					<div class="assembly-detail-card__actions">
						<Button
							href={calendarHref}
							variant="outline"
							size="lg"
							class="assembly-detail-card__action-button"
							download={`${context.assembly.id}.ics`}
						>
							Aggiungi al calendario
						</Button>
						{#if transcriptAssembly?.minutes}
							<Button
								href={`/resident/assemblies/${context.assembly.id}?minutes=1`}
								variant="outline"
								size="lg"
								class="assembly-detail-card__action-button"
							>
								Apri verbale
							</Button>
						{/if}
					</div>
				</CardContent>
			</Card>

			{#if hasLiveAccess}
				<div class="assembly-access-grid">
					<AssemblyAccessCard
						eyebrow="Partecipazione"
						title="Accesso alla chiamata"
						copy="Apri la sessione dedicata e accedi con il profilo residente gia registrato."
						sessionCode={getAssemblySessionCode(context.assembly.id)}
						previewUrl={`svicomliving://call/${getAssemblySessionCode(context.assembly.id)}`}
						buttonLabel="Apri accesso chiamata"
						href={getAssemblyCallHref(context.assembly.id)}
						buttonVariant="default"
						facts={callFacts}
					/>

					<AssemblyAccessCard
						eyebrow="Votazione"
						title="Piattaforma di voto"
						copy="Consulta la sessione dedicata e accedi al voto assembleare dal tuo profilo."
						sessionCode={getAssemblySessionCode(context.assembly.id)}
						previewUrl={`svicomliving://vote/${getAssemblySessionCode(context.assembly.id)}`}
						buttonLabel="Apri piattaforma voto"
						href={getAssemblyVoteHref(context.assembly.id)}
						buttonVariant="outline"
						facts={voteFacts}
					/>

					<AssemblyAccessCard
						eyebrow="Delega"
						title="Gestione proxy"
						copy="Registra un delegato e mantieni traccia dei riferimenti utili per la sessione."
						sessionCode={getAssemblySessionCode(context.assembly.id)}
						previewUrl={`svicomliving://proxy/${getAssemblySessionCode(context.assembly.id)}`}
						buttonLabel="Apri gestione delega"
						href={`/resident/assemblies/${context.assembly.id}/proxy`}
						buttonVariant="outline"
						facts={proxyFacts}
					/>
				</div>
			{/if}

			{#if voteRecord}
				<Card class="assembly-context-card">
					<CardHeader>
						<CardTitle>Riepilogo voto personale</CardTitle>
						<CardDescription>
							Preferenze salvate sul tuo profilo per la sessione assembleare corrente.
						</CardDescription>
					</CardHeader>

					<CardContent class="assembly-context-card__content">
						<div class="assembly-vote-summary">
							{#each voteSummaryItems as item}
								<div class="assembly-vote-summary__item">
									<p class="assembly-vote-summary__label">{item.label}</p>
									<p class="assembly-vote-summary__value">{item.choice}</p>
									<p class="assembly-vote-summary__copy">{item.copy}</p>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			{#if proxyRecord}
				<Card class="assembly-context-card">
					<CardHeader>
						<CardTitle>Delega registrata</CardTitle>
						<CardDescription>
							Riferimenti del delegato salvati nella gestione residente dell assemblea.
						</CardDescription>
					</CardHeader>

					<CardContent class="assembly-context-card__content">
						<div class="assembly-context-card__facts">
							<div class="assembly-context-card__fact">
								<p class="assembly-context-card__fact-label">Delegato</p>
								<p class="assembly-context-card__fact-value">{proxyRecord.delegateName}</p>
							</div>
							<div class="assembly-context-card__fact">
								<p class="assembly-context-card__fact-label">Email</p>
								<p class="assembly-context-card__fact-value">{proxyRecord.delegateEmail}</p>
							</div>
							<div class="assembly-context-card__fact">
								<p class="assembly-context-card__fact-label">Telefono</p>
								<p class="assembly-context-card__fact-value">{proxyRecord.delegatePhone}</p>
							</div>
							<div class="assembly-context-card__fact">
								<p class="assembly-context-card__fact-label">Note</p>
								<p class="assembly-context-card__fact-value">{proxyRecord.notes || 'Nessuna nota inserita'}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			{/if}

			{#if transcriptAssembly?.minutes}
				<AssemblyMinutesDialog
					assembly={transcriptAssembly}
					propertyName={context.property.name}
					unitsCount={context.property.units}
					referenceAssemblyId={context.assembly.id}
					initiallyOpen={autoOpenMinutes}
				/>
			{/if}

			{#if context.relatedAssemblies.length > 0}
				<section class="resident-module-section">
					<div class="resident-module-section__header">
						<h2 class="resident-module-section__title">Altre assemblee nello stabile</h2>
						<p class="resident-module-section__copy">
							Storico e convocazioni gia presenti per il tuo stesso condominio.
						</p>
					</div>

					<div class="assembly-cards-stack">
						{#each context.relatedAssemblies as assembly}
							<ResidentAssemblyCard
								assembly={assembly}
								href={`/resident/assemblies/${assembly.id}`}
								secondaryHref={assembly.minutes ? `/resident/assemblies/${assembly.id}?minutes=1` : undefined}
							/>
						{/each}
					</div>
				</section>
			{/if}
		{/if}
	</div>
</div>
