<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const navItems = [
		{ label: 'Home', href: '/resident', icon: '🏠' },
		{ label: 'Chat', href: '/resident/chat', icon: '💬' },
		{ label: 'Servizi', href: '/resident/services', icon: '✨' },
		{ label: 'Pagamenti', href: '/resident/payments', icon: '💳' },
		{ label: 'Profilo', href: '/resident/profile', icon: '👤' }
	];

	function isActive(href: string): boolean {
		if (href === '/resident') return page.url.pathname === '/resident';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Residente — Svicom Living Hub</title>
</svelte:head>

<!-- Mobile-first layout: content + bottom navigation -->
<div class="flex h-screen flex-col bg-background">
	<!-- Topbar -->
	<header class="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
		<div class="flex items-center gap-2">
			<img src="/svicom-logo.png" alt="Svicom" class="h-6 w-auto" />
			<span class="text-sm font-semibold text-foreground">Living Hub</span>
		</div>
		<a href="/login" class="text-xs text-muted-foreground hover:text-foreground">Esci</a>
	</header>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>

	<!-- Bottom navigation -->
	<nav class="shrink-0 border-t border-border bg-card">
		<div class="flex items-stretch">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors {isActive(item.href)
						? 'text-primary font-medium'
						: 'text-muted-foreground'}"
				>
					<span class="text-lg">{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
