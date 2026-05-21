<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Notification01Icon, PinIcon } from '@hugeicons/core-free-icons';
	import { getCurrentUser } from '$lib/auth';
	import { getResidentVisibleAnnouncements } from '$lib/components/view-resident/resident/announcements';
	import { getAnnouncementsByPropertyId } from '$lib/data/announcements';
	import { getAssembliesByPropertyId } from '$lib/data/events/assemblies';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import { getUserById } from '$lib/data/users';

	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const residentAssemblies = property ? getAssembliesByPropertyId(property.id) : [];
	const announcements = property
		? getResidentVisibleAnnouncements(getAnnouncementsByPropertyId(property.id), residentAssemblies)
		: [];
</script>

<svelte:head>
	<title>Bacheca - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-bulletin-page">
	<div class="resident-bulletin-hero">
		<div class="resident-bulletin-hero__header">
			<span class="resident-bulletin-hero__icon" aria-hidden="true">
				<HugeiconsIcon icon={Notification01Icon} size={18} strokeWidth={1.75} />
			</span>
			<p class="resident-bulletin-hero__eyebrow">Comunicazioni</p>
		</div>
		<h1 class="resident-bulletin-hero__title">Bacheca</h1>
		<p class="resident-bulletin-hero__copy">
			Comunicazioni per {property?.name ?? 'il tuo condominio'}
		</p>
	</div>

	<div class="resident-bulletin-list">
		{#each announcements as ann}
			{@const author = getUserById(ann.createdBy)}
			<div class:resident-bulletin-card--pinned={ann.pinned} class="resident-bulletin-card">
				{#if ann.pinned}
					<span class="resident-bulletin-card__pin">
						<HugeiconsIcon icon={PinIcon} size={12} strokeWidth={2} />
						In evidenza
					</span>
				{/if}
				<h3 class="resident-bulletin-card__title">{ann.title}</h3>
				<p class="resident-bulletin-card__copy">{ann.content}</p>
				<p class="resident-bulletin-card__meta">{author?.name} - {ann.category}</p>
			</div>
		{/each}
		{#if announcements.length === 0}
			<p class="resident-bulletin-list__empty">Nessuna comunicazione.</p>
		{/if}
	</div>
</div>
