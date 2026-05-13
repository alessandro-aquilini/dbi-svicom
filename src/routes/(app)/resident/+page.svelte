<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Calendar01Icon,
		Chat01Icon,
		File01Icon,
		Home01Icon,
		Notification01Icon,
		PinIcon,
		Megaphone01Icon
	} from '@hugeicons/core-free-icons';
	import { InfoTip } from '$lib/components/shared';
	import { getCurrentUser } from '$lib/auth';
	import { getResidentVisibleAnnouncements } from '$lib/components/resident/announcements';
	import { getAnnouncementsByPropertyId } from '$lib/data/announcements';
	import { getAssembliesByPropertyId } from '$lib/data/events/assemblies';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';

	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const residentAssemblies = property ? getAssembliesByPropertyId(property.id) : [];
	const announcements = property
		? getResidentVisibleAnnouncements(getAnnouncementsByPropertyId(property.id), residentAssemblies).slice(0, 3)
		: [];
	const quickActions = [
		{ label: 'Segnala', href: '/resident/reports', icon: Megaphone01Icon },
		{ label: 'Chat', href: '/resident/chat', icon: Chat01Icon },
		{ label: 'Assemblee', href: '/resident/assemblies', icon: Calendar01Icon },
		{ label: 'Documenti', href: '/resident/documents', icon: File01Icon }
	];
	const residentName = currentUser ? currentUser.name.split(' ')[0] : 'ospite';
</script>

<svelte:head>
	<title>Home - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-home-page">
	<header class="resident-home-header">
		<div class="resident-home-header__main">
			<p class="resident-home-header__eyebrow">Home residente</p>
			<h1 class="resident-home-header__title">Ciao, {residentName}</h1>
			{#if property}
				<p class="resident-home-header__copy">{property.name} · {resident?.apartment}</p>
			{/if}
		</div>

		{#if property}
			<div class="resident-home-header__meta">
				<div class="resident-home-header__meta-item">
					<span class="resident-home-header__meta-icon" aria-hidden="true">
						<HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={1.75} />
					</span>
					<p>{property.address.street}</p>
				</div>
				<div class="resident-home-header__meta-item">
					<span class="resident-home-header__meta-icon" aria-hidden="true">
						<HugeiconsIcon icon={Notification01Icon} size={14} strokeWidth={1.75} />
					</span>
					<p>{announcements.length} comunicazioni recenti</p>
				</div>
			</div>
		{/if}
	</header>

	<div class="resident-home-section">
		<div class="resident-home-section__header">
			<div class="resident-heading-with-tip">
				<h2 class="resident-home-section__title">Accessi rapidi</h2>
				<InfoTip text="Raccoglie i flussi che un residente usa piu spesso: segnalazioni, chat, assemblee e documenti." />
			</div>
			<p class="resident-home-section__copy">
				I flussi principali del tuo condominio, a portata di tocco.
			</p>
		</div>

		<div class="resident-quick-grid">
			{#each quickActions as action}
				<a href={action.href} class="resident-quick-card">
					<span class="resident-quick-card__icon" aria-hidden="true">
						<HugeiconsIcon icon={action.icon} size={20} strokeWidth={1.75} />
					</span>
					<p class="resident-quick-card__label">{action.label}</p>
				</a>
			{/each}
		</div>
	</div>

	<div class="resident-home-section">
		<div class="resident-home-section__heading-row">
			<div class="resident-home-section__heading-main">
				<span class="resident-home-section__heading-icon" aria-hidden="true">
					<HugeiconsIcon icon={Notification01Icon} size={16} strokeWidth={1.75} />
				</span>
				<div class="resident-heading-with-tip">
					<h2 class="resident-home-section__title">Bacheca</h2>
					<InfoTip text="Qui trovi gli avvisi inviati dall'amministrazione per il tuo stabile. Gli elementi fissati restano in evidenza." />
				</div>
			</div>
			<a href="/resident/bulletin" class="resident-home-section__link">Vedi tutte</a>
		</div>

		<div class="resident-home-bulletin">
			{#each announcements as ann}
				<div class:resident-home-bulletin__item--pinned={ann.pinned} class="resident-home-bulletin__item">
					{#if ann.pinned}
						<span class="resident-home-bulletin__pin" aria-hidden="true">
							<HugeiconsIcon icon={PinIcon} size={12} strokeWidth={2} />
						</span>
					{/if}
					<h3 class="resident-home-bulletin__title">{ann.title}</h3>
					<p class="resident-home-bulletin__copy">{ann.content}</p>
				</div>
			{/each}
			{#if announcements.length === 0}
				<p class="resident-home-bulletin__empty">Nessuna comunicazione recente.</p>
			{/if}
		</div>
	</div>
</div>
