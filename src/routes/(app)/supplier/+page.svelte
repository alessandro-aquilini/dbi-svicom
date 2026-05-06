<script lang="ts">
	import { tickets } from '$lib/data/tickets-admin';
	import { quotes } from '$lib/data/quotes';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const myJobs = tickets.filter((t) => t.supplierId === supplierId);
	const myQuotes = quotes.filter((q) => q.supplierId === supplierId);
	const pendingQuotes = myQuotes.filter((quote) => new Date(quote.expiresAt).getTime() >= Date.now());
</script>

<svelte:head>
	<title>Dashboard — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-8">
		<h1 class="text-2xl font-semibold tracking-tight">Dashboard fornitore</h1>
		<p class="mt-1 text-sm text-muted-foreground">Panoramica dei tuoi interventi e preventivi</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
			<p class="text-sm text-muted-foreground">Interventi assegnati</p>
			<p class="mt-2 text-2xl font-semibold text-foreground">{myJobs.length}</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
			<p class="text-sm text-muted-foreground">Preventivi inviati</p>
			<p class="mt-2 text-2xl font-semibold text-foreground">{myQuotes.length}</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
			<p class="text-sm text-muted-foreground">In attesa di risposta</p>
			<p class="mt-2 text-2xl font-semibold text-foreground">{pendingQuotes.length}</p>
		</div>
	</div>
</div>
