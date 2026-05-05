<script lang="ts">
	import { reports } from '$lib/data/reports';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const myReports = currentUser ? reports.filter((report) => report.reportedById === currentUser.id) : [];
</script>

<svelte:head>
	<title>Segnalazioni — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<h1 class="mb-1 text-xl font-semibold text-foreground">Le mie segnalazioni</h1>
	<p class="mb-4 text-sm text-muted-foreground">{myReports.length} segnalazioni inviate</p>

	<div class="space-y-3">
		{#each myReports as report}
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<h3 class="text-sm font-medium text-foreground">{report.title}</h3>
					<span class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{report.status}</span>
				</div>
				<p class="mt-1 text-xs text-muted-foreground">{report.description}</p>
				<div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
					<span>{report.category}</span>
					{#if report.location}
						<span>· {report.location}</span>
					{/if}
				</div>
			</div>
		{/each}
		{#if myReports.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">Non hai ancora inviato segnalazioni.</p>
		{/if}
	</div>
</div>
