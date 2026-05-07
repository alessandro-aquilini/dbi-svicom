<script lang="ts">
    import { tick } from 'svelte';
    import { getCurrentUser } from '$lib/auth';
    import { chats, type Chat, type Message } from '$lib/data/chats';
    import { getTicketById, getSupplierRelevantTimeline, getCurrentStatus, type Ticket, type TicketEvent } from '$lib/data/ticket/tickets';
    import { getReportById, type Report } from '$lib/data/ticket/reports';
    import { getPaymentById, type Payment } from '$lib/data/embeds/payments';
    import { getQuoteById, type Quote } from '$lib/data/embeds/quotes';
    import { getInvoiceById, type Invoice } from '$lib/data/embeds/invoices';
    import { getSupplierTaskById, type supplierTask } from '$lib/data/embeds/supplierTasks';
    import { getUserById, type User } from '$lib/data/users';
    import { propertySelection } from '$lib/state/property-selection.svelte';
    import { PropertyScopeChip } from '$lib/components/shared';
    import { page } from '$app/state';

    const currentUser = getCurrentUser();
    const adminId = currentUser?.id ?? 'adm-giorgio-01';

    let selectedChatId = $state(page.url.searchParams.get('id') ?? chats[0]?.id ?? '');
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
        | { type: 'task'; date: number; data: supplierTask }
        | { type: 'report-event'; date: number; data: { report: Report; status: string } };

    function buildTimelineForChat(chat?: Chat): TimelineEvent[] {
        if (!chat) return [];
        const events: TimelineEvent[] = [];
        const otherId = chat.participantIds.find((id) => id !== adminId);
        const otherUser = otherId ? getUserById(otherId) : undefined;

        for (const m of chat.messages) events.push({ type: 'message', date: new Date(m.timestamp).getTime(), data: m });
        for (const m of (localMessages[chat.id] ?? [])) events.push({ type: 'message', date: new Date(m.timestamp).getTime(), data: m });

        for (const rid of chat.reportIds ?? []) {
            const report = getReportById(rid);
            if (!report) continue;
            for (const h of report.statusHistory) {
                events.push({ type: 'report-event', date: new Date(h.at).getTime(), data: { report, status: h.status } });
            }
        }

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
        if (tl.length === 0 && selectedChat) {
            // If there's absolutely nothing, treat it as empty, 
            // but normally report-events or messages should exist.
            return [];
        }
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

    // Action buttons handlers (they add a local message to the conversation so the action is visible)
    function sendAction(action: string) {
        if (!selectedChat) return;
        const ticketId = selectedChat.ticketIds?.[0] ?? null;
        let text = '';
        switch (action) {
            case 'update-ticket-status':
                text = ticketId ? `Ticket ${ticketId}: status updated by admin.` : 'Ticket status updated by admin.';
                break;
            case 'reassign-ticket':
                text = ticketId ? `Ticket ${ticketId}: ticket reassigned by admin.` : 'Ticket reassigned by admin.';
                break;
            case 'pay':
                text = ticketId ? `Payment requested for ticket ${ticketId}.` : 'Payment requested.';
                break;
            case 'update-report':
                const reportId = selectedChat.reportIds?.[0] ?? null;
                text = reportId ? `Report ${reportId}: updated by admin.` : 'Report updated by admin.';
                break;
            default:
                text = action;
        }
        const msg: Message = { id: `local-${Date.now()}`, senderId: adminId, text, timestamp: new Date().toISOString() };
        localMessages = { ...localMessages, [selectedChat.id]: [...(localMessages[selectedChat.id] ?? []), msg] };
        queueMicrotask(scrollToBottom);
    }
</script>

<style>
    .chat-shell { 
        display: grid; 
        grid-template-columns: 350px 1fr; 
        height: calc(100vh - 4rem);
        background: var(--background);
    }
    .list { 
        border-right: 1px solid var(--border); 
        background: var(--card); 
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .list-scroll {
        overflow-y: auto;
        flex: 1;
    }
    .chat-item { 
        width: 100%; 
        text-align: left; 
        padding: 1rem; 
        border: 0; 
        background: transparent; 
        border-bottom: 1px solid var(--border);
        transition: background 0.2s;
        cursor: pointer;
    }
    .chat-item:hover {
        background: var(--muted)/0.5;
    }
    .chat-item.is-active {
        background: var(--primary)/0.05;
        border-right: 3px solid var(--primary);
    }
    
    .panel { 
        display: flex; 
        flex-direction: column; 
        background: #f8fafc;
        height: 100%;
    }
    
    .messages { 
        padding: 1.5rem; 
        overflow-y: auto; 
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    /* Message Bubbles */
    .bubble-wrapper {
        display: flex;
        flex-direction: column;
        max-width: 80%;
        margin-bottom: 0.5rem;
    }
    .bubble-wrapper.own {
        align-self: flex-end;
        align-items: flex-end;
    }
    .bubble-wrapper.other {
        align-self: flex-start;
        align-items: flex-start;
    }
    
    .bubble {
        padding: 0.75rem 1rem;
        border-radius: 1.25rem;
        font-size: 0.9375rem;
        line-height: 1.4;
        position: relative;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .own .bubble {
        background: var(--primary);
        color: white;
        border-bottom-right-radius: 0.25rem;
    }
    .other .bubble {
        background: white;
        color: var(--foreground);
        border-bottom-left-radius: 0.25rem;
        border: 1px solid var(--border);
    }
    
    .ts {
        font-size: 0.75rem;
        color: var(--muted-foreground);
        margin-top: 0.25rem;
        padding: 0 0.5rem;
    }

    /* Embed Boxes (Fintech Style) */
    .embed-card {
        background: white;
        border: 1px solid var(--border);
        border-radius: 1rem;
        padding: 1rem;
        margin: 1rem 0;
        width: 100%;
        max-width: 400px;
        align-self: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .embed-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted-foreground);
    }
    .embed-title {
        font-weight: 600;
        font-size: 1rem;
    }
    .embed-amount {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--foreground);
    }
    .embed-footer {
        border-top: 1px solid var(--border);
        padding-top: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8125rem;
    }

    .composer { 
        background: white;
        border-top: 1px solid var(--border); 
        padding: 1rem 1.5rem; 
        display: flex; 
        gap: 0.75rem; 
        align-items: center;
    }
    .composer input {
        background: #f1f5f9;
        border: none;
        padding: 0.75rem 1.25rem;
        border-radius: 2rem;
        flex: 1;
        outline: none;
        transition: background 0.2s;
    }
    .composer input:focus {
        background: #e2e8f0;
    }
    
    .day-divider {
        display: flex;
        align-items: center;
        margin: 1.5rem 0;
        color: var(--muted-foreground);
        font-size: 0.75rem;
        font-weight: 600;
    }
    .day-divider::before, .day-divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--border);
    }
    .day-divider span {
        padding: 0 1rem;
    }

    .btn-send {
        background: var(--primary);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .btn-send:hover {
        transform: scale(1.05);
    }
</style>

<div class="chat-shell">
    <div class="list">
        <div style="padding:1.5rem; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background: white;">
            <h2 style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em;">Messaggi</h2>
            <PropertyScopeChip gap="0.5rem" />
        </div>
        <div class="list-scroll">
            {#each scopedChats as chat (chat.id)}
                {@const cp = getCounterpart(chat.participantIds)}
                {@const lastMsg = chat.messages[chat.messages.length - 1]}
                <button type="button" onclick={() => selectChat(chat.id)} class="chat-item" class:is-active={chat.id === selectedChatId}>
                    <div style="display:flex; gap: 0.75rem; align-items:center">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--muted); display:flex; align-items:center; justify-content:center; font-weight: 600; color: var(--muted-foreground); flex-shrink: 0;">
                            {cp?.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() ?? ''}
                        </div>
                        <div style="flex:1; min-width: 0;">
                            <div style="display:flex; justify-content:space-between; align-items:baseline">
                                <span style="font-weight:700; font-size: 0.9375rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{cp?.name ?? '—'}</span>
                                <span style="font-size:.75rem; color:var(--muted-foreground); flex-shrink: 0;">{lastMsg?.timestamp.slice(11,16) ?? chat.lastMessageAt.slice(11,16)}</span>
                            </div>
                            <div style="font-size:.875rem; color:var(--muted-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                {lastMsg?.text ?? (chat.reportIds && chat.reportIds.length > 0 ? 'Nuova segnalazione' : 'Nessun messaggio')}
                            </div>
                        </div>
                    </div>
                </button>
            {/each}
        </div>
    </div>

    <div class="panel">
        {#if selectedChat}
            {@const cp = getCounterpart(selectedChat.participantIds)}
            <div style="padding:1rem 1.5rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background: white;">
                <div style="display:flex; align-items:center; gap: 0.75rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--muted); display:flex; align-items:center; justify-content:center; font-weight: 600; color: var(--muted-foreground);">
                        {cp?.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() ?? ''}
                    </div>
                    <div>
                        <div style="font-weight:800; font-size: 1rem;">{cp?.name ?? ''}</div>
                        <div style="font-size:.75rem; color:var(--muted-foreground); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">{cp?.role ?? ''}</div>
                    </div>
                </div>
            </div>

            <div class="messages" bind:this={messagesEl}>
                {#if grouped.length === 0}
                    <div style="padding:2rem; text-align: center; color:var(--muted-foreground);">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">💬</div>
                        <p>Nessun messaggio in questa conversazione.</p>
                    </div>
                {/if}
                {#each grouped as day (day.dayKey)}
                    <div class="day-divider"><span>{day.label}</span></div>
                    {#each day.events as ev}
                        {#if ev.type === 'message'}
                            {@const isOwn = ev.data.senderId === adminId}
                            <div class="bubble-wrapper" class:own={isOwn} class:other={!isOwn}>
                                <div class="bubble">
                                    {ev.data.text}
                                </div>
                                <div class="ts">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</div>
                            </div>
                        {:else if ev.type === 'ticket-event'}
                            {#if ['assigned','reassigned','status_update'].includes(ev.data.event.kind)}
                                <div class="embed-card" style="align-self: flex-end; max-width:480px;">
                                    <div class="embed-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/><path d="m10 12 2 2 4-4"/></svg>
                                        Ticket update
                                    </div>
                                    <div class="embed-title">[{ev.data.ticket.id}] {ev.data.event.kind.replace(/_/g,' ')}</div>
                                    <div style="font-size:0.9rem;color:var(--foreground)">
                                        {#if ev.data.event.kind === 'assigned'}
                                            <div style="font-weight:600">This ticket has been assigned to you.</div>
                                            <div>New status: <span style="color:var(--primary); text-transform: capitalize">{(ev.data.event.toStatus || 'open').replace(/_/g,' ')}</span></div>
                                        {:else if ev.data.event.kind === 'reassigned'}
                                            <div style="font-weight:600">This ticket has been reassigned.</div>
                                        {:else}
                                            <div style="font-weight:600">Status changed to <span style="color:var(--primary); text-transform: capitalize">{(ev.data.event.toStatus || '').replace(/_/g,' ')}</span></div>
                                        {/if}
                                    </div>
                                    <div class="embed-footer">
                                        <span style="color: var(--muted-foreground)">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span>
                                        <span style="font-weight: 600; color: var(--primary)">Details →</span>
                                    </div>
                                </div>
                            {:else}
                                <div class="embed-card" style="align-self: flex-end;">
                                    <div class="embed-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/><path d="m10 12 2 2 4-4"/></svg>
                                        Aggiornamento Ticket
                                    </div>
                                    <div class="embed-title">[{ev.data.ticket.id}] {ev.data.event.kind}</div>
                                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--foreground); display: flex; align-items: center; gap: 0.5rem;">
                                        Stato: <span style="text-transform: capitalize; color: var(--primary)">{(ev.data.event.toStatus || 'Aperto').replace(/_/g, ' ')}</span>
                                    </div>
                                    <div class="embed-footer">
                                        <span style="color: var(--muted-foreground)">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span>
                                        <span style="font-weight: 600; color: var(--primary)">Dettagli →</span>
                                    </div>
                                </div>
                            {/if}
                        {:else if ev.type === 'payment'}
                            <div class="embed-card" style="align-self: flex-end;">
                                <div class="embed-header" style="color: #10b981">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                    Pagamento
                                </div>
                                <div class="embed-title">Saldo Fattura {ev.data.id}</div>
                                <div class="embed-amount">{ev.data.amount.toLocaleString('it-IT', { style: 'currency', currency: ev.data.currency })}</div>
                                <div class="embed-footer">
                                    <span style="color: var(--muted-foreground)">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span>
                                    <span style="padding: 0.25rem 0.5rem; background: #ecfdf5; color: #059669; border-radius: 0.5rem; font-weight: 700;">ESEGUITO</span>
                                </div>
                            </div>
                        {:else if ev.type === 'quote'}
                            <div class="embed-card" style="align-self: flex-start;">
                                <div class="embed-header" style="color: #6366f1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                    Preventivo ricevuto
                                </div>
                                <div class="embed-title">Servizi di manutenzione</div>
                                <div class="embed-amount">{ev.data.amount.toLocaleString('it-IT', { style: 'currency', currency: ev.data.currency })}</div>
                                <div class="embed-footer">
                                    <span style="color: var(--muted-foreground)">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span>
                                    <button style="border: none; background: var(--primary); color: white; padding: 0.4rem 0.8rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.75rem;">Approva</button>
                                </div>
                            </div>
                        {:else if ev.type === 'report-event'}
                             {@const statusColors: Record<string, string> = {
                                'nuova': '#3b82f6',
                                'presa_in_carico': '#f59e0b',
                                'completata': '#10b981'
                             }}
                             {@const adminDone = ['presa_in_carico','completata'].includes(ev.data.status)}
                             <div class="embed-card" style="border-left: 4px solid {statusColors[ev.data.status] || '#f59e0b'}; align-self: {adminDone ? 'flex-end' : 'flex-start'};">
                                <div class="embed-header" style="color: {statusColors[ev.data.status] || '#f59e0b'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" x2="17" y1="17" y2="17.01"/></svg>
                                    Stato Segnalazione
                                </div>
                                <div class="embed-title">{ev.data.report.title}</div>
                                <div style="font-size: 0.875rem; font-weight: 600; color: var(--foreground); display: flex; align-items: center; gap: 0.5rem;">
                                    Nuovo stato: <span style="text-transform: capitalize; color: {statusColors[ev.data.status] || '#b45309'}">{ev.data.status.replace(/_/g, ' ')}</span>
                                </div>
                                <div class="embed-footer">
                                    <span style="color: var(--muted-foreground)">{new Date(ev.date).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}</span>
                                </div>
                            </div>
                        {/if}
                    {/each}
                {/each}
            </div>

            <!-- Role-aware action buttons (supplier vs resident) -->
            {#if selectedChat}
                {@const cpRole = cp?.role}
                {#if cpRole === 'supplier'}
                    <div style="padding:0.75rem 1.5rem; display:flex; gap:0.5rem; background: #fff; border-top:1px solid var(--border);">
                        <button type="button" onclick={() => sendAction('update-ticket-status')} style="background:#2563eb;color:white;border:none;padding:0.4rem 0.6rem;border-radius:0.5rem;font-weight:600;">Update ticket status</button>
                        <button type="button" onclick={() => sendAction('reassign-ticket')} style="background:#f59e0b;color:white;border:none;padding:0.4rem 0.6rem;border-radius:0.5rem;font-weight:600;">Reassign ticket</button>
                        <button type="button" onclick={() => sendAction('pay')} style="background:#10b981;color:white;border:none;padding:0.4rem 0.6rem;border-radius:0.5rem;font-weight:600;">Pay</button>
                    </div>
                {:else if cpRole === 'resident'}
                    <div style="padding:0.75rem 1.5rem; display:flex; gap:0.5rem; background: #fff; border-top:1px solid var(--border);">
                        <button type="button" onclick={() => sendAction('update-report')} style="background:#2563eb;color:white;border:none;padding:0.4rem 0.6rem;border-radius:0.5rem;font-weight:600;">Update report</button>
                    </div>
                {/if}
            {/if}

            <div class="composer">
                <button type="button" style="border:none; background:none; color: var(--muted-foreground)" aria-label="Allega file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <input bind:value={composerText} placeholder="Scrivi un messaggio..." onkeydown={(e) => e.key === 'Enter' && send()} />
                <button type="button" onclick={send} class="btn-send" aria-label="Invia messaggio">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 14-7-7 14-2-7-5-2Z"/></svg>
                </button>
            </div>
        {:else}
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color: var(--muted-foreground); background: white;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🗨️</div>
                <h3 style="font-weight: 700; color: var(--foreground);">Le tue conversazioni</h3>
                <p>Seleziona una chat per visualizzare i messaggi e le attività.</p>
            </div>
        {/if}
    </div>
</div>
