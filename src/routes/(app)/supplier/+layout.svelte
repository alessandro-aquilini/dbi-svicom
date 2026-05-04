<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const navItems = [
		{ label: 'Home', href: '/supplier', icon: '📊' },
		{ label: 'Chat', href: '/supplier/chat', icon: '💬' },
		{ label: 'Interventi', href: '/supplier/jobs', icon: '🔧' },
		{ label: 'Pagamenti', href: '/supplier/payments', icon: '💳' },
		{ label: 'Documenti', href: '/supplier/documents', icon: '🗎' },
		{ label: 'Profilo', href: '/supplier/profile', icon: '👤' }
	];

	function isActive(href: string): boolean {
		if (href === '/supplier') return page.url.pathname === '/supplier';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Fornitore — Svicom Living Hub</title>
</svelte:head>

<!-- Supplier layout: simple topbar + content -->
<div class="flex h-screen flex-col bg-background">
	<!-- Topbar -->
	<header class="flex h-14 shrink-0 items-center border-b border-border px-4">
		<div class="flex items-center gap-2">
			<img src="/svicom-logo.png" alt="Svicom" class="h-6 w-auto" />
			<span class="text-sm font-semibold text-foreground">Living Hub</span>
			<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">Fornitore</span>
		</div>
		<nav class="ml-8 hidden gap-1 md:flex">
			{#each navItems as item}
				<a
					href={item.href}
					class="rounded-md px-3 py-1.5 text-sm transition-colors {isActive(item.href)
						? 'bg-accent text-accent-foreground font-medium'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<a href="/login" class="ml-auto text-xs text-muted-foreground hover:text-foreground">Esci</a>
	</header>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>

	<!-- Mobile nav (visible on small screens) -->
	<nav class="shrink-0 border-t border-border bg-card md:hidden">
		<div class="flex items-stretch">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs {isActive(item.href) ? 'text-primary font-medium' : 'text-muted-foreground'}"
				>
					<span class="text-lg">{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
