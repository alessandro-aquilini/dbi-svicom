<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getCurrentUser } from '$lib/auth';
	import { getResidentById } from '$lib/data/residents';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Calendar03Icon,
		Chat01Icon,
		CreditCardIcon,
		Home01Icon,
		MenuSquareIcon,
		Megaphone01Icon,
		Notification01Icon,
		UserIcon,

        Bookmark01Icon

	} from '@hugeicons/core-free-icons';

	let { children } = $props();
	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;

	const navItems = [
		{ label: 'Home', href: '/resident', icon: Home01Icon },
		{ label: 'Chat', href: '/resident/chat', icon: Chat01Icon },
		{ label: 'Servizi', href: '/resident/services', icon: Bookmark01Icon },
		{ label: 'Pagamenti', href: '/resident/payments', icon: CreditCardIcon },
		{ label: 'Profilo', href: '/resident/profile', icon: UserIcon }
	];
	const profileMenuItems = [
		{ label: 'Il mio profilo', href: '/resident/profile', icon: UserIcon },
		{ label: 'Calendario', href: '/resident/calendar', icon: Calendar03Icon },
		{ label: 'Comunicazioni', href: '/resident/bulletin', icon: Notification01Icon }
	];
	let isProfileMenuOpen = $state(false);
	let profileMenuEl: HTMLDivElement | null = $state(null);
	let profileTriggerEl: HTMLButtonElement | null = $state(null);
	const profileInitials = currentUser?.name
		? currentUser.name
				.split(' ')
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase() ?? '')
				.join('')
		: 'RH';

	function isActive(href: string): boolean {
		if (href === '/resident') return page.url.pathname === '/resident';
		return page.url.pathname.startsWith(href);
	}

	function closeProfileMenu() {
		isProfileMenuOpen = false;
	}

	function toggleProfileMenu() {
		isProfileMenuOpen = !isProfileMenuOpen;
	}

	onMount(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

		const handlePointerDown = (event: MouseEvent) => {
			const target = event.target as Node | null;
			if (
				isProfileMenuOpen &&
				target &&
				profileMenuEl &&
				!profileMenuEl.contains(target) &&
				profileTriggerEl &&
				!profileTriggerEl.contains(target)
			) {
				closeProfileMenu();
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeProfileMenu();
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	afterNavigate(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
		closeProfileMenu();
	});
</script>

<svelte:head>
	<title>Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-mobile-shell">
	<header class="resident-mobile-topbar">
		<div class="resident-mobile-topbar__brand">
			<img src="/svicom-logo.png" alt="Svicom" class="resident-mobile-topbar__logo" />
			<span class="resident-mobile-topbar__title">Living Hub</span>
		</div>

		<div class="resident-mobile-topbar__profile">
			<button
				bind:this={profileTriggerEl}
				type="button"
				class="resident-mobile-topbar__profile-trigger"
				aria-label="Apri menu profilo residente"
				aria-expanded={isProfileMenuOpen}
				onclick={toggleProfileMenu}
			>
				<span class="resident-mobile-topbar__profile-badge" aria-hidden="true">{profileInitials}</span>
				<span class="resident-mobile-topbar__profile-label">Menu</span>
				<span class="resident-mobile-topbar__profile-menu-icon" aria-hidden="true">
					<HugeiconsIcon icon={MenuSquareIcon} size={16} strokeWidth={1.9} />
				</span>
			</button>

			{#if isProfileMenuOpen}
				<div bind:this={profileMenuEl} class="resident-profile-menu">
					<div class="resident-profile-menu__header">
						<p class="resident-profile-menu__title">{currentUser?.name ?? 'Profilo residente'}</p>
						<p class="resident-profile-menu__copy">
							{resident?.apartment ?? 'Profilo residente attivo'}
						</p>
					</div>

					<div class="resident-profile-menu__list">
						{#each profileMenuItems as item}
							<a href={item.href} class="resident-profile-menu__item">
								<span class="resident-profile-menu__icon" aria-hidden="true">
									<HugeiconsIcon icon={item.icon} size={15} strokeWidth={1.8} />
								</span>
								<span>{item.label}</span>
							</a>
						{/each}
					</div>

					<div class="resident-profile-menu__footer">
						<a href="/login" class="resident-profile-menu__logout">Esci</a>
					</div>
				</div>
			{/if}
		</div>
	</header>

	<main class="resident-mobile-content">
		{@render children()}
	</main>

	<nav class="resident-mobile-nav" aria-label="Navigazione residente">
		<div class="resident-mobile-nav__list">
			{#each navItems as item}
				<a href={item.href} class:active={isActive(item.href)} class="resident-mobile-nav__item">
					<span class="resident-mobile-nav__icon" aria-hidden="true">
						<HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.75} />
					</span>
					<span class="resident-mobile-nav__label">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
