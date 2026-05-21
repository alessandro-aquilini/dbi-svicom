<script lang="ts">
	import { ticketStatusLabels } from './presentation';

	// Use report statuses
	const ticketFlow: string[] = ['nuova', 'presa_in_carico', 'completata'];

	let { currentStatus }: { currentStatus?: string } = $props();

	const currentIndex = $derived(currentStatus ? ticketFlow.indexOf(currentStatus) : -1);
</script>

<div class="ticket-progress-steps" aria-label="Fasi della pratica">
	{#each ticketFlow as status, index}
		<div class={`ticket-progress-steps__item ${index <= currentIndex ? 'ticket-progress-steps__item--active' : ''}`}>
			<div class="ticket-progress-steps__dot" aria-hidden="true"></div>
			<p class="ticket-progress-steps__label">{ticketStatusLabels[status]}</p>
		</div>
	{/each}
</div>
