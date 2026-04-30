<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { demoCredentials, loginUser, logoutUser } from '$lib/auth';

	onMount(() => {
		logoutUser();
	});

	function loginAs(profile: typeof demoCredentials[number]) {
		loginUser(profile.id);
		goto(`/${profile.role}`);
	}
</script>

<svelte:head>
	<title>Accedi — Svicom Living Hub</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4">
	<!-- Logo & Title -->
	<div class="mb-10 text-center">
		<img src="/svicom-logo.png" alt="Svicom" class="mx-auto mb-4 h-12 w-auto" />
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Svicom Living Hub</h1>
		<p class="mt-1 text-sm text-muted-foreground">Seleziona un profilo demo per accedere</p>
	</div>

	<!-- Role Cards -->
	<div class="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
		{#each demoCredentials as profile}
			<button
				onclick={() => loginAs(profile)}
				class="group flex flex-col items-start justify-between gap-3 rounded-lg border border-border bg-card p-6 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
			>
				<div>
					<p class="text-sm font-semibold text-foreground">{profile.label}</p>
					<p class="mt-1 text-xs text-muted-foreground">{profile.description}</p>
				</div>
				<div class="space-y-1 text-left text-xs text-muted-foreground">
					<p>{profile.email}</p>
					<p>Password: {profile.password}</p>
				</div>
			</button>
		{/each}
	</div>

	<p class="mt-8 text-xs text-muted-foreground">Demo mode — nessuna autenticazione reale richiesta</p>
</div>
