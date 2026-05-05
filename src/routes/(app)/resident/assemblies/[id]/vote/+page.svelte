<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		AssemblyAccessCard,
		AssemblyStatusBadge,
		AssemblyTypeBadge,
		getAssemblySessionCode,
		getAssemblyVotePreviewUrl,
		getResidentAssemblyContext,
		getResidentAssemblyVoteItems,
		getResidentAssemblyVoteRecord,
		residentAssemblyVoteOptions,
		saveResidentAssemblyVote,
		type ResidentAssemblyVoteChoice
	} from '$lib/components/assemblies';
	import { ResidentEmptyCard } from '$lib/components/resident';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const assemblyId = $derived(page.params.id ?? '');
	const context = $derived(getResidentAssemblyContext(currentUser?.id, assemblyId));
	const hasLiveAccess = $derived(context.assembly?.status === 'pianificata');
	const previewUrl = $derived(
		context.assembly ? getAssemblyVotePreviewUrl(context.assembly.id) : ''
	);
	const existingVoteRecord = $derived(
		context.assembly && currentUser
			? getResidentAssemblyVoteRecord(context.assembly.id, currentUser.id)
			: undefined
	);
	const accessFacts = $derived(
		context.assembly && context.resident
			? [
					{ label: 'Profilo abilitato', value: currentUser?.name ?? 'Residente' },
					{ label: 'Unita', value: context.resident.apartment },
					{ label: 'Punti in sessione', value: `${context.assembly.agenda.length}` }
				]
			: []
	);
	const voteItems = $derived(context.assembly ? getResidentAssemblyVoteItems(context.assembly) : []);

	let voteChoices = $state<Record<string, ResidentAssemblyVoteChoice>>({});
	let isSubmitting = $state(false);

	$effect(() => {
		const defaults: Record<string, ResidentAssemblyVoteChoice> = {};

		for (const item of voteItems) {
			const existingChoice = existingVoteRecord?.votes.find((vote) => vote.id === item.id)?.choice;
			defaults[item.id] = existingChoice ?? 'non_espresso';
		}

		voteChoices = defaults;
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!context.assembly || !currentUser) return;

		isSubmitting = true;
		await new Promise((resolve) => setTimeout(resolve, 550));

		saveResidentAssemblyVote({
			assemblyId: context.assembly.id,
			residentId: currentUser.id,
			submittedAt: new Date().toISOString(),
			votes: voteItems.map((item) => ({
				...item,
				choice: voteChoices[item.id] ?? 'non_espresso'
			}))
		});

		await goto(`/resident/assemblies/${context.assembly.id}?vote=1`);
	}
</script>

<svelte:head>
	<title>Piattaforma voto assemblea - Residente - Svicom Living Hub</title>
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
				title="Sessione voto non disponibile"
				copy="La piattaforma voto e disponibile solo per le assemblee future."
			/>
		{:else}
			<Card class="assembly-session-card">
				<CardHeader class="assembly-session-card__header">
					<div class="assembly-session-card__heading">
						<p class="assembly-session-card__eyebrow">Voto assembleare</p>
						<CardTitle class="assembly-session-card__title">{context.property.name}</CardTitle>
						<CardDescription class="assembly-session-card__copy">
							Accesso dedicato alla sessione di voto con codice {getAssemblySessionCode(context.assembly.id)}.
						</CardDescription>
					</div>

					<div class="assembly-session-card__badge-row">
						<AssemblyTypeBadge type={context.assembly.type} />
						<AssemblyStatusBadge status={context.assembly.status} />
					</div>
				</CardHeader>
			</Card>

			<AssemblyAccessCard
				eyebrow="Validita legale"
				title="Accesso alla piattaforma"
				copy="Entra nella sessione dedicata per consultare ordine del giorno e procedura di voto."
				sessionCode={getAssemblySessionCode(context.assembly.id)}
				previewUrl={previewUrl}
				buttonLabel="Apri piattaforma"
				href={previewUrl}
				target="_blank"
				rel="noreferrer"
				facts={accessFacts}
			/>

			<Card class="assembly-context-card">
				<CardHeader>
					<CardTitle>Preferenze di voto</CardTitle>
					<CardDescription>
						Salva il riepilogo del tuo orientamento sui punti gia presenti nella sessione.
					</CardDescription>
				</CardHeader>

				<CardContent class="assembly-context-card__content">
					<form class="assembly-vote-form" onsubmit={handleSubmit}>
						{#each voteItems as item}
							<div class="assembly-vote-form__item">
								<div class="assembly-vote-form__main">
									<p class="assembly-vote-form__title">{item.label}</p>
									<p class="assembly-vote-form__copy">{item.copy}</p>
								</div>

								<div class="assembly-vote-form__field">
									<Label for={`vote-${item.id}`}>Preferenza</Label>
									<Select type="single" bind:value={voteChoices[item.id]}>
										<SelectTrigger id={`vote-${item.id}`} class="assembly-vote-form__trigger">
											{residentAssemblyVoteOptions.find((option) => option.value === voteChoices[item.id])?.label ??
												'Seleziona preferenza'}
										</SelectTrigger>
										<SelectContent>
											{#each residentAssemblyVoteOptions as option}
												<SelectItem value={option.value} label={option.label} />
											{/each}
										</SelectContent>
									</Select>
								</div>
							</div>
						{/each}

						<div class="assembly-vote-form__actions">
							<Button type="submit" size="lg" class="assembly-vote-form__button" disabled={isSubmitting}>
								{isSubmitting ? 'Salvataggio in corso...' : 'Salva riepilogo voto'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
