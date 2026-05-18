<script lang="ts">
	import { page } from '$app/state';
	import { getCurrentUser } from '$lib/auth';
	import { getUserById } from '$lib/data/users';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { DashboardSquare01Icon, BubbleChatIcon, Wrench01Icon, CreditCardIcon, File01Icon, Contact01Icon } from '@hugeicons/core-free-icons';

	let { children } = $props();

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const user = getUserById(supplierId);

	const navItems = [
		{ label: 'Home', href: '/supplier', icon: DashboardSquare01Icon },
		{ label: 'Chat', href: '/supplier/chat', icon: BubbleChatIcon },
		{ label: 'Calendario', href: '/supplier/calendar', icon: Wrench01Icon },
		{ label: 'Pagamenti', href: '/supplier/payments', icon: CreditCardIcon },
		{ label: 'Documenti', href: '/supplier/documents', icon: File01Icon }
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
					<HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} class="mr-2" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
		
		<div class="ml-auto flex items-center gap-3">
			<button 
				class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus:outline-none"
				onclick={() => {
					const menu = document.getElementById('profile-menu');
					if (menu) menu.classList.toggle('hidden');
				}}
				aria-label="Profile menu"
			>
				<HugeiconsIcon icon={Contact01Icon} size={18} strokeWidth={1.5} />
			</button>
		</div>

		<div id="profile-menu" class="hidden absolute right-4 top-14 w-64 rounded-xl border border-border bg-card shadow-lg z-50">
			<div class="border-b border-border p-4">
				<p class="font-medium text-foreground">{user?.name ?? 'Il tuo Profilo'}</p>
				<p class="text-xs text-muted-foreground truncate">{user?.email ?? 'fornitore@example.com'}</p>
			</div>
			<div class="p-2">
				<a href="/supplier/profile" class="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
					Edit Profile
				</a>
				<a href="/support" class="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
					Help / Support
				</a>
				<a href="/about" class="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
					About us
				</a>
			</div>
			<div class="border-t border-border p-2">
				<a href="/login" class="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
					Log Out
				</a>
			</div>
		</div>
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
					<HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} />
					<span>{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
