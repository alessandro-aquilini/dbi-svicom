<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Building01Icon,
		Notification01Icon,
		UserIcon
	} from '@hugeicons/core-free-icons';
	import { getCurrentUser } from '$lib/auth';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import { Button } from '$lib/components/ui/button';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';

	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;

	const accountRows = currentUser && resident
		? [
				{ label: 'Nome', value: currentUser.name },
				{ label: 'Email', value: currentUser.email },
				{ label: 'Telefono', value: currentUser.phone ?? 'Non disponibile' },
				{ label: 'Ruolo residente', value: resident.type },
				{ label: 'Unita abitativa', value: resident.apartment }
			]
		: [];

	const preferenceRows = resident
		? [
				{ label: 'Notifiche', value: resident.preferences?.notifications ? 'Attive' : 'Disattive' },
				{ label: 'Newsletter', value: resident.preferences?.newsletter ? 'Attiva' : 'Disattiva' }
			]
		: [];

	const propertyRows = property
		? [
				{ label: 'Condominio', value: property.name },
				{ label: 'Indirizzo', value: property.address.street },
				{ label: 'Citta', value: property.address.city },
				{ label: 'Unita totali', value: `${property.units}` },
				{
					label: 'Tag stabile',
					value: property.tags.length > 0 ? property.tags.join(', ') : 'Nessun tag disponibile'
				}
			]
		: [];
</script>

<svelte:head>
	<title>Profilo - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		{#if !currentUser || !resident || !property}
			<ResidentEmptyCard
				title="Profilo non disponibile"
				copy="Non e possibile recuperare i dati del residente per questa vista."
			/>
		{:else}
			<section class="resident-profile-screen" aria-label="Profilo residente">
				<div class="resident-profile-screen__hero">
					<div class="resident-profile-screen__identity">
						<div class="resident-profile-screen__avatar" aria-hidden="true">
							<HugeiconsIcon icon={UserIcon} size={20} strokeWidth={1.8} />
						</div>
						<div class="resident-profile-screen__heading">
							<p class="resident-profile-screen__eyebrow">Profilo residente</p>
							<h1 class="resident-profile-screen__title">{currentUser.name}</h1>
							<p class="resident-profile-screen__copy">
								{property.name}, {resident.apartment}
							</p>
						</div>
					</div>
				</div>

				<div class="resident-profile-group">
					<div class="resident-profile-group__header">
						<div class="resident-profile-group__title-row">
							<span class="resident-profile-group__icon" aria-hidden="true">
								<HugeiconsIcon icon={UserIcon} size={15} strokeWidth={1.8} />
							</span>
							<h2 class="resident-profile-group__title">Account</h2>
						</div>
					</div>
					<div class="resident-profile-list" role="list">
						{#each accountRows as row}
							<div class="resident-profile-row" role="listitem">
								<p class="resident-profile-row__label">{row.label}</p>
								<p class="resident-profile-row__value">{row.value}</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="resident-profile-group">
					<div class="resident-profile-group__header">
						<div class="resident-profile-group__title-row">
							<span class="resident-profile-group__icon" aria-hidden="true">
								<HugeiconsIcon icon={Notification01Icon} size={15} strokeWidth={1.8} />
							</span>
							<h2 class="resident-profile-group__title">Preferenze</h2>
						</div>
					</div>
					<div class="resident-profile-list" role="list">
						{#each preferenceRows as row}
							<div class="resident-profile-row" role="listitem">
								<p class="resident-profile-row__label">{row.label}</p>
								<p class="resident-profile-row__value">{row.value}</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="resident-profile-group">
					<div class="resident-profile-group__header">
						<div class="resident-profile-group__title-row">
							<span class="resident-profile-group__icon" aria-hidden="true">
								<HugeiconsIcon icon={Building01Icon} size={15} strokeWidth={1.8} />
							</span>
							<h2 class="resident-profile-group__title">Stabile</h2>
						</div>
					</div>
					<div class="resident-profile-list" role="list">
						{#each propertyRows as row}
							<div class="resident-profile-row" role="listitem">
								<p class="resident-profile-row__label">{row.label}</p>
								<p class="resident-profile-row__value">{row.value}</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="resident-profile-actions">
					<Button href="/login" variant="outline" size="lg" class="resident-profile-actions__button">
						Cambia profilo
					</Button>
				</div>
			</section>
		{/if}
	</div>
</div>
