<!--
	PageHeader — Reusable page header with title, subtitle, and optional slot for actions.
	Usage:
		<PageHeader title="Dashboard" subtitle="Overview">
			<button>Add</button>
		</PageHeader>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, subtitle, children }: { title: string; subtitle?: string; children?: Snippet } = $props();
</script>

<div class="mb-6 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
		{#if subtitle}
			<p class="mt-1 text-sm text-muted-foreground">{subtitle}</p>
		{/if}
	</div>
	{#if children}
		<div class="flex items-center gap-2">
			{@render children()}
		</div>
	{/if}
</div>
