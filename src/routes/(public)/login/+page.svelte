<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		UserSettings01Icon,
		UserMultipleIcon,
		Wrench01Icon,
		ArrowRight01Icon
	} from '@hugeicons/core-free-icons';
	import { demoCredentials, loginUser, logoutUser } from '$lib/auth';

	const roleIcons: Record<string, typeof UserSettings01Icon> = {
		admin: UserSettings01Icon,
		resident: UserMultipleIcon,
		supplier: Wrench01Icon
	};

	let selectedId = $state(demoCredentials[0].id);

	onMount(() => {
		logoutUser();
	});

	function submit() {
		const profile = demoCredentials.find((c) => c.id === selectedId);
		if (!profile) return;
		loginUser(profile.id);
		goto(`/${profile.role}`);
	}
</script>

<svelte:head>
	<title>Accedi — Svicom Living Hub</title>
</svelte:head>

<div class="login-shell">
	<!-- Hero (left on desktop, top on mobile) -->
	<aside class="login-hero">
		<div class="login-hero__brand">
			<img src="/svicom-logo-dark.png" alt="Svicom" class="h-9 w-auto" />
			<span class="login-hero__product">Living Hub</span>
		</div>

		<h2 class="login-hero__headline">
			La regia del condominio,<br />in un'unica piattaforma.
		</h2>

		<p class="login-hero__copy">© {new Date().getFullYear()} Svicom</p>
	</aside>

	<!-- Form (right on desktop, bottom on mobile) -->
	<main class="login-form">
		<div class="login-form__inner">
			<h1 class="login-form__title">Accedi</h1>
			<p class="login-form__subtitle">
				Scegli un profilo demo. Nessuna autenticazione reale richiesta.
			</p>

			<div class="role-grid" role="radiogroup" aria-label="Profilo demo">
				{#each demoCredentials as profile}
					<button
						type="button"
						role="radio"
						aria-checked={selectedId === profile.id}
						class="role-button"
						class:role-button--active={selectedId === profile.id}
						onclick={() => (selectedId = profile.id)}
					>
						<HugeiconsIcon icon={roleIcons[profile.role]} size={18} strokeWidth={1.5} />
						<span>{profile.label}</span>
					</button>
				{/each}
			</div>

			<button type="button" class="login-cta" onclick={submit}>
				<span>Accedi</span>
				<HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
			</button>
		</div>
	</main>
</div>
