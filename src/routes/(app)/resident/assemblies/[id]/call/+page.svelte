<script lang="ts">
	import { page } from '$app/state';
	import {
		AssemblyAccessCard,
		AssemblyStatusBadge,
		AssemblyTypeBadge,
		formatAssemblySchedule,
		formatAssemblyTimeRange,
		getAssemblyCallPreviewUrl,
		getAssemblySessionCode,
		getResidentAssemblyContext,
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
	const hasLiveAccess = $derived(context.assembly?.status === 'pianificata');
	const previewUrl = $derived(
		context.assembly ? getAssemblyCallPreviewUrl(context.assembly.id) : ''
	);
	const accessFacts = $derived(
		context.assembly && context.resident
			? [
					{ label: 'Profilo registrato', value: currentUser?.name ?? 'Residente' },
					{ label: 'Unita', value: context.resident.apartment },
					{
						label: 'Fascia oraria',
						value: formatAssemblyTimeRange(context.assembly.scheduledAt, context.assembly.endTime)
					}
				]
			: []
	);
	const supportFacts = $derived(
		context.assembly && context.property
			? [
					{ label: 'Sede assemblea', value: normalizeAssemblyText(context.assembly.location) },
					{ label: 'Condominio', value: context.property.name },
					{ label: 'Amministratore', value: context.admin?.name ?? 'Studio Svicom' },
					{ label: 'Telefono assistenza', value: context.admin?.phone ?? 'Non disponibile' }
				]
			: []
	);
	const checklistItems = $derived(
		context.assembly?.status === 'pianificata'
			? [
					'Accedi con il profilo residente gia associato alla tua unita.',
					'Tieni pronta la convocazione ricevuta e verifica l orario della sessione.',
					'Se il collegamento non si apre, usa il contatto rapido dell amministratore.'
				]
			: [
					'La sessione risulta archiviata ma il codice di accesso resta consultabile.',
					'Puoi usare questa pagina per recuperare i riferimenti della riunione.',
					'Per supporto diretto resta disponibile il contatto dell amministratore.'
				]
	);
</script>

<svelte:head>
	<title>Accesso chiamata assemblea - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<div class="assembly-detail-actions">
			<Button
				href={context.assembly ? `/resident/assemblies/${context.assembly.id}` : '/resident/assemblies'}
				variant="ghost"
				class="assembly-detail-actions__back"
			>
				&lt; Scheda assemblea
			</Button>
		</div>

		{#if !context.isAccessible || !context.assembly || !context.property || !context.resident || !hasLiveAccess}
			<ResidentEmptyCard
				title="Accesso non disponibile"
				copy="Il collegamento chiamata e disponibile solo per le assemblee future."
			/>
		{:else}
			<Card class="assembly-session-card">
				<CardHeader class="assembly-session-card__header">
					<div class="assembly-session-card__heading">
						<p class="assembly-session-card__eyebrow">Chiamata assemblea</p>
						<CardTitle class="assembly-session-card__title">{context.property.name}</CardTitle>
						<CardDescription class="assembly-session-card__copy">
							{formatAssemblySchedule(context.assembly.scheduledAt)} presso {normalizeAssemblyText(context.assembly.location)}.
						</CardDescription>
					</div>

					<div class="assembly-session-card__badge-row">
						<AssemblyTypeBadge type={context.assembly.type} />
						<AssemblyStatusBadge status={context.assembly.status} />
					</div>
				</CardHeader>
			</Card>

			<AssemblyAccessCard
				eyebrow="Sessione"
				title="Collegamento residente"
				copy="Apri il collegamento della chiamata e accedi al presidio digitale della tua assemblea."
				sessionCode={getAssemblySessionCode(context.assembly.id)}
				previewUrl={previewUrl}
				buttonLabel="Apri collegamento"
				href={previewUrl}
				target="_blank"
				rel="noreferrer"
				facts={accessFacts}
			/>

			<div class="assembly-session-panels">
				<Card class="assembly-context-card">
					<CardHeader>
						<CardTitle>Credenziali e assistenza</CardTitle>
						<CardDescription>
							Dati utili per entrare nella sessione e gestire eventuali problemi di accesso.
						</CardDescription>
					</CardHeader>

					<CardContent class="assembly-context-card__content">
						<div class="assembly-context-card__facts">
							{#each supportFacts as fact}
								<div class="assembly-context-card__fact">
									<p class="assembly-context-card__fact-label">{fact.label}</p>
									<p class="assembly-context-card__fact-value">{fact.value}</p>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<Card class="assembly-context-card">
					<CardHeader>
						<CardTitle>Prima di entrare</CardTitle>
						<CardDescription>
							Check rapido per arrivare alla chiamata con i dati gia allineati.
						</CardDescription>
					</CardHeader>

					<CardContent class="assembly-context-card__content">
						<div class="assembly-checklist">
							{#each checklistItems as item}
								<div class="assembly-checklist__item">{item}</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			</div>
		{/if}
	</div>
</div>
