<script lang="ts">
	import { goto } from '$app/navigation';
	import { users } from '$lib/data/users';

	const roles = [
		{ label: 'Amministratore', path: '/admin', icon: '🏢', users: users.filter((u) => u.role === 'admin') },
		{ label: 'Residente', path: '/resident', icon: '🏠', users: users.filter((u) => u.role === 'resident') },
		{ label: 'Fornitore', path: '/supplier', icon: '🔧', users: users.filter((u) => u.role === 'supplier') }
	];

	function loginAs(path: string) {
		goto(path);
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
		<p class="mt-1 text-sm text-muted-foreground">Seleziona un profilo per accedere alla piattaforma</p>
	</div>

	<!-- Role Cards -->
	<div class="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
		{#each roles as role}
			<button
				onclick={() => loginAs(role.path)}
				class="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
			>
				<span class="text-3xl">{role.icon}</span>
				<span class="text-sm font-medium text-foreground">{role.label}</span>
				<span class="text-xs text-muted-foreground">{role.users.length} {role.users.length === 1 ? 'utente' : 'utenti'}</span>
			</button>
		{/each}
	</div>

	<p class="mt-8 text-xs text-muted-foreground">Demo mode — nessuna autenticazione richiesta</p>
</div>
