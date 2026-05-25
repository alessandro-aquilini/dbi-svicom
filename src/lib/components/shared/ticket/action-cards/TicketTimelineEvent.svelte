<script lang="ts">
    import type { TicketEvent } from '$lib/data/ticket/tickets';
    import TicketCreatedCard from './TicketCreatedCard.svelte';
    import TicketAssignedCard from './TicketAssignedCard.svelte';
    import TicketAcceptedCard from './TicketAcceptedCard.svelte';
    import TicketDeclinedCard from './TicketDeclinedCard.svelte';
    import TicketCompletedCard from './TicketCompletedCard.svelte';
    import TicketCloseCard from './TicketCloseCard.svelte';
    import TicketArchivedCard from './TicketArchivedCard.svelte';

    interface Props {
        event: TicketEvent;
    }

    let { event }: Props = $props();
</script>

{#if event.kind === 'createTicket'}
    <TicketCreatedCard event={event} />
{:else if event.kind === 'assignToSupplier'}
    <TicketAssignedCard event={event} />
{:else if event.kind === 'accepted'}
    <TicketAcceptedCard event={event} />
{:else if event.kind === 'declined'}
    <TicketDeclinedCard event={event} />
{:else if event.kind === 'reportCompletion'}
    <TicketCompletedCard event={event} />
{:else if event.kind === 'closeTicket'}
    <TicketCloseCard event={event} />
{:else if event.kind === 'archiveTicket'}
    <TicketArchivedCard event={event} />
{:else}
    <div class="flex justify-center">
        <div class="rounded-3xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
            Azione ticket: {event.kind}
        </div>
    </div>
{/if}
