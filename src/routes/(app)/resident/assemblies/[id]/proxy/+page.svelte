<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		AssemblyStatusBadge,
		AssemblyTypeBadge,
		getResidentAssemblyContext,
		getResidentAssemblyProxyRecord,
		saveResidentAssemblyProxy
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
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const assemblyId = $derived(page.params.id ?? '');
	const context = $derived(getResidentAssemblyContext(currentUser?.id, assemblyId));
	const existingProxy = $derived(
		context.assembly && currentUser
			? getResidentAssemblyProxyRecord(context.assembly.id, currentUser.id)
			: undefined
	);
	const hasLiveAccess = $derived(context.assembly?.status === 'pianificata');

	let delegateName = $state('');
	let delegateEmail = $state('');
	let delegatePhone = $state('');
	let notes = $state('');
	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);

	$effect(() => {
		delegateName = existingProxy?.delegateName ?? '';
		delegateEmail = existingProxy?.delegateEmail ?? '';
		delegatePhone = existingProxy?.delegatePhone ?? '';
		notes = existingProxy?.notes ?? '';
	});

	function validateForm(): boolean {
		const nextErrors: Record<string, string> = {};

		if (delegateName.trim().length < 4) nextErrors.delegateName = 'Inserisci nome e cognome del delegato.';
		if (!delegateEmail.includes('@')) nextErrors.delegateEmail = 'Inserisci un indirizzo email valido.';
		if (delegatePhone.trim().length < 6) nextErrors.delegatePhone = 'Inserisci un contatto telefonico valido.';

		errors = nextErrors;
		return Object.keys(nextErrors).length === 0;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!context.assembly || !currentUser || !validateForm()) return;

		isSubmitting = true;
		await new Promise((resolve) => setTimeout(resolve, 550));

		saveResidentAssemblyProxy({
			assemblyId: context.assembly.id,
			residentId: currentUser.id,
			delegateName: delegateName.trim(),
			delegateEmail: delegateEmail.trim(),
			delegatePhone: delegatePhone.trim(),
			notes: notes.trim(),
			submittedAt: new Date().toISOString()
		});

		await goto(`/resident/assemblies/${context.assembly.id}?proxy=1`);
	}
</script>

<svelte:head>
	<title>Gestione delega assemblea - Residente - Svicom Living Hub</title>
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
				title="Delega non disponibile"
				copy="La delega residente e disponibile solo per le assemblee future."
			/>
		{:else}
			<Card class="assembly-session-card">
				<CardHeader class="assembly-session-card__header">
					<div class="assembly-session-card__heading">
						<p class="assembly-session-card__eyebrow">Gestione delega</p>
						<CardTitle class="assembly-session-card__title">{context.property.name}</CardTitle>
						<CardDescription class="assembly-session-card__copy">
							Registra i riferimenti del delegato associato alla tua partecipazione.
						</CardDescription>
					</div>

					<div class="assembly-session-card__badge-row">
						<AssemblyTypeBadge type={context.assembly.type} />
						<AssemblyStatusBadge status={context.assembly.status} />
					</div>
				</CardHeader>
			</Card>

			<Card class="assembly-context-card">
				<CardHeader>
					<CardTitle>Riferimenti del delegato</CardTitle>
					<CardDescription>
						Questi dati restano associati al tuo profilo residente come promemoria della delega impostata.
					</CardDescription>
				</CardHeader>

				<CardContent class="assembly-context-card__content">
					<form class="assembly-proxy-form" onsubmit={handleSubmit}>
						<div class="assembly-proxy-form__grid">
							<div class="assembly-proxy-form__field">
								<Label for="proxy-name">Nome del delegato</Label>
								<Input
									id="proxy-name"
									value={delegateName}
									oninput={(event: Event) => (delegateName = (event.currentTarget as HTMLInputElement).value)}
									aria-invalid={errors.delegateName ? 'true' : undefined}
									class="assembly-proxy-form__input"
								/>
								{#if errors.delegateName}
									<p class="assembly-proxy-form__error">{errors.delegateName}</p>
								{/if}
							</div>

							<div class="assembly-proxy-form__field">
								<Label for="proxy-email">Email</Label>
								<Input
									id="proxy-email"
									type="email"
									value={delegateEmail}
									oninput={(event: Event) => (delegateEmail = (event.currentTarget as HTMLInputElement).value)}
									aria-invalid={errors.delegateEmail ? 'true' : undefined}
									class="assembly-proxy-form__input"
								/>
								{#if errors.delegateEmail}
									<p class="assembly-proxy-form__error">{errors.delegateEmail}</p>
								{/if}
							</div>

							<div class="assembly-proxy-form__field">
								<Label for="proxy-phone">Telefono</Label>
								<Input
									id="proxy-phone"
									value={delegatePhone}
									oninput={(event: Event) => (delegatePhone = (event.currentTarget as HTMLInputElement).value)}
									aria-invalid={errors.delegatePhone ? 'true' : undefined}
									class="assembly-proxy-form__input"
								/>
								{#if errors.delegatePhone}
									<p class="assembly-proxy-form__error">{errors.delegatePhone}</p>
								{/if}
							</div>
						</div>

						<div class="assembly-proxy-form__field">
							<Label for="proxy-notes">Note per il delegato</Label>
							<Textarea
								id="proxy-notes"
								rows={5}
								value={notes}
								oninput={(event: Event) => (notes = (event.currentTarget as HTMLTextAreaElement).value)}
								class="assembly-proxy-form__textarea"
							/>
						</div>

						<div class="assembly-proxy-form__actions">
							<Button type="submit" size="lg" class="assembly-proxy-form__button" disabled={isSubmitting}>
								{isSubmitting ? 'Salvataggio in corso...' : 'Salva delega'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
