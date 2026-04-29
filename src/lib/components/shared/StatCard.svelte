<!--
	StatCard — A card displaying a single KPI with icon.
	Usage: <StatCard label="Condomìni" value={7} icon="🏢" />
-->
<script lang="ts">
	let { label, value, icon }: { label: string; value: string | number; icon?: string } = $props();
</script>

<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
	<div class="flex items-center justify-between">
		<span class="text-sm text-muted-foreground">{label}</span>
		{#if icon}
			<span class="text-xl">{icon}</span>
		{/if}
	</div>
	<p class="mt-2 text-2xl font-semibold text-foreground">{value}</p>
</div>
