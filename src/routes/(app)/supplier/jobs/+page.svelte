<script lang="ts">
	import { supplierTasks } from '$lib/data/embeds/supplierTasks';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	
	// Filter for maintenance works matching the supplier ID
	const myJobs = supplierTasks.filter((e) => e.supplierId === supplierId);

	// Date context
	const TODAY = '2026-05-05';
	
	let activeTab = $state<'upcoming' | 'past'>('upcoming');

	let displayedJobs = $derived(
		myJobs.filter((job) => {
			if (activeTab === 'upcoming') return job.date >= TODAY;
			return job.date < TODAY;
		})
	);

	function formatDuration(start: string, end: string) {
		return `${start} - ${end}`;
	}

	// tone removed — maintenance works don't have tone; use neutral primary token for dot
</script>

<svelte:head>
	<title>Interventi — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="flex min-h-full flex-col bg-slate-50">
	<div class="px-6 pt-8 pb-4">
		<h1 class="text-[28px] font-bold text-slate-900 tracking-tight">Interventi</h1>
	</div>

	<!-- Segmented Control (Revolut style) -->
	<div class="px-6 mb-6">
		<div class="flex rounded-xl bg-slate-200/60 p-1">
			<button 
				class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all {activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
				onclick={() => activeTab = 'upcoming'}
			>
				In Programma
			</button>
			<button 
				class="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all {activeTab === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
				onclick={() => activeTab = 'past'}
			>
				Storico
			</button>
		</div>
	</div>

	<!-- List View -->
	<div class="flex-1 px-4 pb-8">
		<div class="flex flex-col gap-3">
			{#each displayedJobs as job}
				<div class="flex items-center rounded-2xl bg-white p-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] transition-active active:scale-[0.98] cursor-pointer">
					<!-- Time block -->
					<div class="flex flex-col items-center justify-center pr-4">
						<span class="text-sm font-bold text-slate-900">{job.startTime}</span>
						<span class="text-[10px] font-medium text-slate-400 mt-0.5">{job.date.split('-').slice(1).reverse().join('/')}</span>
					</div>

					<!-- Separator & Dot -->
					<div class="relative mr-4 flex flex-col items-center self-stretch">
						<div class="absolute inset-y-0 w-px bg-slate-100"></div>
						<div class="z-10 my-auto h-3 w-3 rounded-full border-2 border-white bg-primary"></div>
					</div>

					<!-- Content block -->
					<div class="flex-1 flex flex-col justify-center py-1">
						<h3 class="text-[15px] font-semibold text-slate-900 leading-tight">{job.title}</h3>
						<p class="text-[13px] text-slate-500 mt-1 line-clamp-1">{job.location}</p>
					</div>

					<!-- Action chevron -->
					<div class="pl-2">
						<svg class="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-16 px-6 text-center">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50 text-2xl">
						🗓️
					</div>
					<h3 class="text-lg font-bold text-slate-900">Nessun intervento</h3>
					<p class="mt-2 text-sm text-slate-500">Non ci sono interventi {activeTab === 'upcoming' ? 'in programma.' : 'nello storico.'}</p>
					
					{#if activeTab === 'upcoming'}
						<button class="mt-8 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md active:scale-95 transition-all">
							+ Proponi Intervento
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
