<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		File01Icon,
		BubbleChatIcon
	} from '@hugeicons/core-free-icons';

	let { children } = $props();

	const tabs = [
		{ href: '/admin/tickets/new', label: 'Compila', icon: File01Icon },
		{ href: '/admin/tickets/new/chat', label: 'Racconta', icon: BubbleChatIcon }
	];

	function isActive(href: string): boolean {
		if (href === '/admin/tickets/new') return page.url.pathname === '/admin/tickets/new';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="p-6 lg:p-8">
	<div class="mb-6 max-w-2xl">
		<a
			href="/admin/tickets"
			class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
		>
			<HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
			Pratiche
		</a>
		<h1 class="mt-2 text-2xl font-semibold tracking-tight">Nuova pratica</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Scegli come vuoi creare la pratica: compila i campi, o raccontaci cos'è successo.
		</p>

		<!-- Apple-style segmented control -->
		<div class="mode-segmented" role="tablist" aria-label="Modalità di creazione">
			{#each tabs as tab (tab.href)}
				{@const active = isActive(tab.href)}
				<a
					href={tab.href}
					role="tab"
					aria-selected={active}
					class="mode-segmented__option"
					class:is-active={active}
				>
					<HugeiconsIcon icon={tab.icon} size={14} strokeWidth={2} />
					<span>{tab.label}</span>
				</a>
			{/each}
		</div>
	</div>

	{@render children()}
</div>

<style>
	.mode-segmented {
		display: inline-flex;
		margin-top: 1.25rem;
		padding: 3px;
		gap: 2px;
		background: var(--muted);
		border-radius: 9999px;
		border: 1px solid var(--border);
	}

	.mode-segmented__option {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.875rem;
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--muted-foreground);
		transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
	}

	.mode-segmented__option:hover {
		color: var(--foreground);
	}

	.mode-segmented__option.is-active {
		background: var(--card);
		color: var(--foreground);
		box-shadow:
			0 1px 2px oklch(0 0 0 / 0.06),
			0 1px 3px oklch(0 0 0 / 0.08);
	}
</style>
