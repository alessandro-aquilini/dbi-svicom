<script lang="ts">
    import type { TicketEvent } from '$lib/data/ticket/tickets';
    import type { ReportEvent } from '$lib/data/ticket/reports';
    import TicketTimelineEvent from '$lib/components/shared/ticket/action-cards/TicketTimelineEvent.svelte';
    import ReportTimelineEvent from '$lib/components/shared/report/action-cards/ReportTimelineEvent.svelte';

    interface Props {
        event: TicketEvent | ReportEvent;
    }

    let { event }: Props = $props();
</script>

{#if 'kind' in event}
    {#if ['createTicket', 'assignToSupplier', 'accepted', 'declined', 'reportCompletion', 'closeTicket', 'archiveTicket'].includes(event.kind)}
        <TicketTimelineEvent event={event as TicketEvent} />
    {:else}
        <ReportTimelineEvent event={event as ReportEvent} />
    {/if}
{/if}
