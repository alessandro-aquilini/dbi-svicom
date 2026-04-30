<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		DashboardSquare01Icon,
		Building03Icon,
		Note01Icon,
		Calendar03Icon,
		Wrench01Icon,
		BubbleChatIcon,
		CreditCardIcon,
		Settings02Icon
	} from '@hugeicons/core-free-icons';

	let { children } = $props();

	const navItems = [
		{ label: 'Dashboard', href: '/admin', icon: DashboardSquare01Icon },
		{ label: 'Condomìni', href: '/admin/properties', icon: Building03Icon },
		{ label: 'Pratiche', href: '/admin/tickets', icon: Note01Icon },
		{ label: 'Calendario', href: '/admin/calendar', icon: Calendar03Icon },
		{ label: 'Fornitori', href: '/admin/suppliers', icon: Wrench01Icon },
		{ label: 'Chat', href: '/admin/chat', icon: BubbleChatIcon },
		{ label: 'Pagamenti', href: '/admin/payments', icon: CreditCardIcon },
		{ label: 'Impostazioni', href: '/admin/settings', icon: Settings02Icon }
	];

	function isActive(href: string): boolean {
		if (href === '/admin') return page.url.pathname === '/admin';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Admin — Svicom Living Hub</title>
</svelte:head>

<!-- Desktop layout: wide sidebar + main content -->
<div class="flex h-screen overflow-hidden bg-background">
	<!-- Sidebar -->
	<aside class="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
		<!-- Brand -->
		<div class="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
			<img src="/svicom-logo.png" alt="Svicom" class="h-7 w-auto" />
			<span class="text-sm font-semibold text-sidebar-foreground">Living Hub</span>
		</div>

		<!-- Nav -->
		<nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {isActive(item.href)
						? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
						: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
				>
					<HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t border-sidebar-border px-4 py-3">
			<p class="text-xs text-muted-foreground">Studio Svicom Milano</p>
			<a href="/login" class="mt-1 text-xs text-primary hover:underline">Cambia profilo</a>
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
