<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { BubbleChatIcon } from '@hugeicons/core-free-icons';
</script>

<svelte:head>
	<title>Nuova pratica · Racconta — Admin — Svicom Living Hub</title>
</svelte:head>

<div
	class="flex min-h-[24rem] max-w-2xl flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center"
>
	<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
		<HugeiconsIcon icon={BubbleChatIcon} size={24} strokeWidth={1.75} />
	</div>
	<h2 class="mt-4 text-base font-semibold text-foreground">Modalità conversazione</h2>
	<p class="mt-2 max-w-md text-sm text-muted-foreground">
		Qui potrai descrivere la pratica in linguaggio naturale e l'assistente compilerà i campi al
		posto tuo. In arrivo.
	</p>
</div>
