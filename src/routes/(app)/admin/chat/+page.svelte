<script lang="ts">
    import { tick } from 'svelte';
    import { getCurrentUser } from '$lib/auth';
    import { chats, type Chat, type Message } from '$lib/data/chats';
    import { getTicketById, getSupplierRelevantTimeline, type Ticket, type TicketEvent } from '$lib/data/ticket/tickets';
    import { getPaymentById, type Payment } from '$lib/data/embeds/payments';
    import { getQuoteById, type Quote } from '$lib/data/embeds/quotes';
    import { getInvoiceById, type Invoice } from '$lib/data/embeds/invoices';
    import { getSupplierTaskById, type supplierTask } from '$lib/data/embeds/supplierTasks';
    import { getUserById, type User } from '$lib/data/users';
    import { propertySelection } from '$lib/state/property-selection.svelte';
    import { PropertyScopeChip } from '$lib/components/shared';

    const currentUser = getCurrentUser();
    const adminId = currentUser?.id ?? 'adm-giorgio-01';

    let selectedChatId = $state(chats[0]?.id ?? '');
    let composerText = $state('');
    let messagesEl: HTMLDivElement | undefined = $state();
    let localMessages = $state<Record<string, Message[]>>({});

    function getCounterpart(participantIds: string[]): User | undefined {
        const otherId = participantIds.find((id) => id !== adminId);
        return otherId ? getUserById(otherId) : undefined;
    }

    function formatDayLabel(iso: string) {
        const d = new Date(iso);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        if (sameDay(d, today)) return 'Oggi';
        if (sameDay(d, yesterday)) return 'Ieri';
        return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    }

    function isoDayKey(ts: number) {
        return new Date(ts).toISOString().slice(0, 10);
    }

    const selectedChat = $derived(chats.find((c) => c.id === selectedChatId));

    type TimelineEvent =
        | { type: 'message'; date: number; data: Message }
        | { type: 'ticket-event'; date: number; data: { ticket: Ticket; event: TicketEvent } }
        | { type: 'payment'; date: number; data: Payment }
        | { type: 'quote'; date: number; data: Quote }
        | { type: 'invoice'; date: number; data: Invoice }
        | { type: 'task'; date: number; data: supplierTask };

    function buildTimelineForChat(chat?: Chat): TimelineEvent[] {
        if (!chat) return [];
        const events: TimelineEvent[] = [];
        const otherId = chat.participantIds.find((id) => id !== adminId);
        const otherUser = otherId ? getUserById(otherId) : undefined;

        for (const m of chat.messages) events.push({ type: 'message', date: new Date(m.timestamp).getTime(), data: m });
        for (const m of (localMessages[chat.id] ?? [])) events.push({ type: 'message', date: new Date(m.timestamp).getTime(), data: m });

        for (const tid of chat.ticketIds ?? []) {
            const ticket = getTicketById(tid);
            if (!ticket) continue;

            const isSupplierChat = otherUser?.role === 'supplier';
            const supplierFilter = isSupplierChat ? otherId : undefined;

            const timeline = supplierFilter ? getSupplierRelevantTimeline(ticket, supplierFilter) : ticket.eventTimeline;
            for (const ev of timeline) events.push({ type: 'ticket-event', date: new Date(ev.at).getTime(), data: { ticket, event: ev } });

            for (const pid of ticket.paymentIds ?? []) {
                const p = getPaymentById(pid);
                if (!p) continue;
                if (supplierFilter && p.fromId !== supplierFilter && p.toId !== supplierFilter) continue;
                events.push({ type: 'payment', date: new Date(p.paidAt || p.dueDate).getTime(), data: p });
            }

            for (const qid of ticket.quoteIds ?? []) {
                const q = getQuoteById(qid);
                if (!q) continue;
                if (supplierFilter && q.supplierId !== supplierFilter) continue;
                events.push({ type: 'quote', date: new Date(q.sentAt).getTime(), data: q });
            }

            for (const iid of ticket.invoiceIds ?? []) {
                const inv = getInvoiceById(iid);
                if (!inv) continue;
                if (supplierFilter && inv.supplierId !== supplierFilter) continue;
                events.push({ type: 'invoice', date: new Date(inv.issueDate).getTime(), data: inv });
            }

            for (const intId of ticket.interventionIds ?? []) {
                const t = getSupplierTaskById(intId);
                if (!t) continue;
                if (supplierFilter && t.supplierId !== supplierFilter) continue;
                events.push({ type: 'task', date: new Date(`${t.date}T${t.startTime}:00`).getTime(), data: t });
            }
        }

        return events.sort((a, b) => a.date - b.date);
    }

    const grouped = $derived.by(() => {
        const tl = buildTimelineForChat(selectedChat);
        const map = new Map<string, { label: string; events: TimelineEvent[] }>();
        for (const ev of tl) {
            const key = isoDayKey(ev.date);
            if (!map.has(key)) map.set(key, { label: formatDayLabel(new Date(ev.date).toISOString()), events: [] });
            map.get(key)!.events.push(ev);
        }
        return Array.from(map.entries()).map(([dayKey, v]) => ({ dayKey, label: v.label, events: v.events }));
    });

    const scopedChats = $derived.by(() => {
        const property = propertySelection.selected;
        if (!property) return chats;
        const allowed = new Set(property.residentIds);
        return chats.filter((c) => {
            const other = c.participantIds.find((id) => id !== adminId);
            return other ? allowed.has(other) : false;
        });
    });

    function selectChat(id: string) {
        selectedChatId = id;
        composerText = '';
        queueMicrotask(scrollToBottom);
    }

    async function scrollToBottom() {
        await tick();
        if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function send() {
        const text = composerText.trim();
        if (!text || !selectedChat) return;
        const msg: Message = { id: `local-${Date.now()}`, senderId: adminId, text, timestamp: new Date().toISOString() };
        localMessages = { ...localMessages, [selectedChat.id]: [...(localMessages[selectedChat.id] ?? []), msg] };
        composerText = '';
        queueMicrotask(scrollToBottom);
    }
</script>

<style>
    .chat-shell { display: grid; grid-template-columns: 320px 1fr; gap: 1rem; padding: 1rem; }
    .list { border: 1px solid var(--border); border-radius: .5rem; background: var(--card); overflow: auto; }
    .list button { width: 100%; text-align: left; padding: .75rem; border: 0; background: transparent; }
    .panel { border: 1px solid var(--border); border-radius: .5rem; background: var(--card); display:flex; flex-direction: column; }
    .messages { padding: 1rem; overflow:auto; flex:1; }
    .composer { border-top: 1px solid var(--border); padding: .5rem; display:flex; gap:.5rem; }
    .day { font-size:.875rem; color:var(--muted-foreground); margin: .75rem 0 .5rem; }
    .msg { margin: .25rem 0; }
    .ev { margin: .35rem 0; font-size:.9rem; color:var(--foreground); }
</style>

<div class="chat-shell">
    <div class="list">
        <div style="padding:.75rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
            <strong>Conversazioni</strong>
            <PropertyScopeChip gap="0.5rem" />
        </div>
        {#each scopedChats as chat (chat.id)}
            {@const cp = getCounterpart(chat.participantIds)}
            <button type="button" onclick={() => selectChat(chat.id)} class:is-active={chat.id === selectedChatId}>
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:600">{cp?.name ?? '—'}</div>
                        <div style="font-size:.875rem;color:var(--muted-foreground)">{chat.messages[chat.messages.length-1]?.text ?? ''}</div>
                    </div>
                    <div style="font-size:.75rem;color:var(--muted-foreground)">{chat.messages[chat.messages.length-1]?.timestamp.slice(11,16)}</div>
                </div>
            </button>
        {/each}
    </div>

    <div class="panel">
        <div style="padding:1rem;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
            <div>
                {#if selectedChat}
                    {@const cp = getCounterpart(selectedChat.participantIds)}
                    <div style="font-weight:700">{cp?.name ?? 'Seleziona una conversazione'}</div>
                    <div style="font-size:.875rem;color:var(--muted-foreground)">{cp ? (cp.role ?? '') : ''}</div>
                {:else}
                    <div style="font-weight:700">Seleziona una conversazione</div>
                {/if}
            </div>
            <div style="font-size:.875rem;color:var(--muted-foreground)">ID: {selectedChatId}</div>
        </div>

        <div class="messages" bind:this={messagesEl}>
            {#if grouped.length === 0}
                <div style="padding:1rem;color:var(--muted-foreground)">Nessuna attività.</div>
            {/if}
            {#each grouped as day (day.dayKey)}
                <div class="day">{day.label}</div>
                {#each day.events as ev}
                    {#if ev.type === 'message'}
                        <div class="msg"><strong>{ev.data.senderId === adminId ? 'Tu' : getUserById(ev.data.senderId)?.name}</strong>: {ev.data.text} <span style="color:var(--muted-foreground);font-size:.75rem">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span></div>
                    {:else if ev.type === 'ticket-event'}
                        <div class="ev">[{ev.data.ticket.id}] {ev.data.event.kind} <span style="color:var(--muted-foreground);font-size:.8rem">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span></div>
                    {:else if ev.type === 'payment'}
                        <div class="ev">Pagamento: {ev.data.id} — {ev.data.amount.toFixed(2)} {ev.data.currency} <span style="color:var(--muted-foreground);font-size:.8rem">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span></div>
                    {:else if ev.type === 'quote'}
                        <div class="ev">Preventivo: {ev.data.id} — {ev.data.amount.toFixed(2)} {ev.data.currency} <span style="color:var(--muted-foreground);font-size:.8rem">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span></div>
                    {:else if ev.type === 'invoice'}
                        <div class="ev">Fattura: {ev.data.number} — {ev.data.amount.toFixed(2)} {ev.data.currency} <span style="color:var(--muted-foreground);font-size:.8rem">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span></div>
                    {:else if ev.type === 'task'}
                        <div class="ev">Intervento: {ev.data.id} — {ev.data.title} <span style="color:var(--muted-foreground);font-size:.8rem">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span></div>
                    {/if}
                {/each}
            {/each}
        </div>

        <div class="composer">
            <input bind:value={composerText} placeholder="Scrivi un messaggio..." style="flex:1;padding:.5rem;border:1px solid var(--border);border-radius:.375rem" />
            <button type="button" onclick={send} class="btn">Invia</button>
        </div>
    </div>
</div>
