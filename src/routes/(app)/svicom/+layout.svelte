<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		DashboardSquare01Icon,
		Building03Icon,
		ChartLineData01Icon,
		PackageMovingIcon,
		MoneyBag02Icon,
		AiBeautifyIcon,
		ShieldUserIcon,
		UserAdd02Icon,
		Settings02Icon
	} from '@hugeicons/core-free-icons';

	let { children } = $props();

	const navItems = [
		{ label: 'Dashboard', href: '/svicom', icon: DashboardSquare01Icon },
		{ label: 'Portfolio', href: '/svicom/portfolio', icon: Building03Icon },
		{ label: 'Performance', href: '/svicom/performance', icon: ChartLineData01Icon },
		{ label: 'Catalogo servizi', href: '/svicom/catalogue', icon: PackageMovingIcon },
		{ label: 'Ricavi', href: '/svicom/revenue', icon: MoneyBag02Icon },
		{ label: 'Insights', href: '/svicom/insights', icon: AiBeautifyIcon },
		{ label: 'Compliance', href: '/svicom/compliance', icon: ShieldUserIcon },
		{ label: 'Onboarding', href: '/svicom/onboarding', icon: UserAdd02Icon },
		{ label: 'Impostazioni', href: '/svicom/settings', icon: Settings02Icon }
	];

	function isActive(href: string): boolean {
		if (href === '/svicom') return page.url.pathname === '/svicom';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Svicom — Living Hub</title>
</svelte:head>

<!-- Desktop-first orchestration shell: wide sidebar + main content -->
<div class="flex h-screen overflow-hidden bg-background">
	<aside class="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
		<!-- Brand -->
		<div class="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
			<img src="/svicom-logo.png" alt="Svicom" class="h-7 w-auto" />
			<div class="flex flex-col leading-tight">
				<span class="text-sm font-semibold text-sidebar-foreground">Living Hub</span>
				<span class="text-[10px] uppercase tracking-wider text-muted-foreground">
					Platform orchestrator
				</span>
			</div>
		</div>

		<!-- Scope badge -->
		<div class="border-b border-sidebar-border px-4 py-3">
			<div
				class="flex items-center justify-between rounded-md bg-primary/8 px-3 py-2 text-xs"
			>
				<span class="font-medium text-primary">Vista ecosistema</span>
				<span class="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
					ALL
				</span>
			</div>
		</div>

		<!-- Nav -->
		<nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {isActive(
						item.href
					)
						? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
						: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
				>
					<HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t border-sidebar-border px-3 py-3">
			<div class="px-1">
				<p class="text-xs font-medium text-foreground">Svicom HQ · Milano</p>
				<a href="/login" class="mt-1 text-xs text-primary hover:underline">Cambia profilo</a>
			</div>
		</div>
	</aside>

	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
