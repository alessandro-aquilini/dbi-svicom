<script lang="ts">
    import { page } from '$app/state';
    import { services } from '$lib/data/services';
    import { chats, type Chat, type Message } from '$lib/data/chats';
    import { bookings, type Booking, inferBookingStatus } from '$lib/data/ticket/booking';
    import { getCurrentUser } from '$lib/auth';
    import { getUserById } from '$lib/data/users';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { 
        SentIcon, 
        AttachmentIcon, 
        UserIcon,
        ArrowLeft02Icon,
        Calendar03Icon,
        CheckmarkCircle02Icon,
        Cancel01Icon,
        Invoice02Icon,
        Dollar02Icon
    } from '@hugeicons/core-free-icons';
    import { invoices } from '$lib/data/embeds/invoices';
    import { payments } from '$lib/data/embeds/payments';
    import { quotes } from '$lib/data/embeds/quotes';

    const currentUser = getCurrentUser();
    const serviceId = page.url.searchParams.get('serviceId');
    const bookingIdFromUrl = page.url.searchParams.get('bookingId');
    const service = services.find(s => s.id === serviceId);
    const supplier = service ? getUserById(service.id) : null; // Wait, supplierId is in service

    const actualSupplier = service ? getUserById(service.supplierId) : null;

    // Find existing booking or simulate a new one
    let booking = $state<Booking | undefined>(
        bookingIdFromUrl 
        ? bookings.find(b => b.id === bookingIdFromUrl) 
        : bookings.find(b => b.serviceId === serviceId && b.residentId === currentUser?.id)
    );

    // Get chat associated with this service/booking
    // We look for a chat between resident and supplier
    let chat = $state<Chat | undefined>(
        chats.find(c => 
            c.participantIds.includes(currentUser?.id || '') && 
            c.participantIds.includes(service?.supplierId || '')
        )
    );

    let messages = $state<Message[]>(chat?.messages || []);
    let newMessage = $state('');
    let status = $derived(booking ? inferBookingStatus(booking) : 'unknown');

    function sendMessage() {
        if (!newMessage.trim()) return;
        const msg: Message = {
            id: `msg-${Date.now()}`,
            senderId: currentUser?.id || '',
            text: newMessage,
            timestamp: new Date().toISOString()
        };
        messages = [...messages, msg];
        newMessage = '';
    }

    function getSenderName(id: string) {
        if (id === currentUser?.id) return 'Io';
        return getUserById(id)?.name || 'Sconosciuto';
    }

    function formatTime(iso: string) {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Embed components helper
    function getEmbedData(msgText: string) {
        if (msgText.includes('tkt-') || msgText.includes('bkg-')) {
            const bkgId = msgText.match(/(bkg-\d+|tkt-\d+)/)?.[0];
            if (bkgId) {
                const b = bookings.find(x => x.id === bkgId);
                return { type: 'booking', id: bkgId, title: b ? 'Prenotazione' : 'Ticket', amount: null };
            }
        }
        if (msgText.includes('inv-')) {
            const invId = msgText.match(/(inv-\d+)/)?.[0];
            const inv = invoices.find(x => x.id === invId);
            return { type: 'invoice', id: invId, title: 'Fattura', amount: inv ? `${inv.amount} ${inv.currency}` : null };
        }
        if (msgText.includes('quo-')) {
            const quoId = msgText.match(/(quo-\d+)/)?.[0];
            const quo = quotes.find(x => x.id === quoId);
            return { type: 'quote', id: quoId, title: 'Preventivo', amount: quo ? `${quo.amount} ${quo.currency}` : null };
        }
        if (msgText.includes('pay-')) {
            const payId = msgText.match(/(pay-\d+)/)?.[0];
            const pay = payments.find(x => x.id === payId);
            return { type: 'payment', id: payId, title: 'Pagamento', amount: pay ? `${pay.amount} ${pay.currency}` : null };
        }
        return null;
    }

    // Actions based on status
    const actions = $derived.by(() => {
        switch (status) {
            case 'requested':
                return [
                    { label: 'Annulla Richiesta', icon: Cancel01Icon, class: 'text-red-600 bg-red-50' }
                ];
            case 'confirmed':
                return [
                    { label: 'Sposta Appuntamento', icon: Calendar03Icon, class: 'text-amber-600 bg-amber-50' },
                    { label: 'Annulla', icon: Cancel01Icon, class: 'text-red-600 bg-red-50' }
                ];
            case 'performed':
                return [
                    { label: 'Vedi Fattura', icon: Invoice02Icon, class: 'text-primary bg-primary/10' },
                    { label: 'Paga Ora', icon: Dollar02Icon, class: 'text-green-600 bg-green-50' }
                ];
            default:
                return [];
        }
    });

</script>

<svelte:head>
    <title>Chat con {actualSupplier?.name || 'Fornitore'} — Svicom</title>
</svelte:head>

<div class="flex flex-col h-[calc(100vh-64px)] bg-background">
    <!-- Header -->
    <header class="p-4 border-b border-border bg-card flex items-center gap-4">
        <a href="/resident/services" class="p-2 hover:bg-muted rounded-full transition-colors">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={20} />
        </a>
        <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <HugeiconsIcon icon={UserIcon} size={20} />
            </div>
            <div>
                <h1 class="text-sm font-bold leading-none">{actualSupplier?.name}</h1>
                <p class="text-[11px] text-muted-foreground mt-1">{service?.name}</p>
            </div>
        </div>
        
        {#if booking}
            <div class="ml-auto">
                <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider 
                    {status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                     status === 'requested' ? 'bg-amber-100 text-amber-700' : 
                     status === 'performed' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}">
                    {status}
                </span>
            </div>
        {/if}
    </header>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
        {#if messages.length === 0}
            <div class="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                <HugeiconsIcon icon={SentIcon} size={48} />
                <p class="text-sm font-medium">Inizia una conversazione con il fornitore</p>
            </div>
        {/if}

        {#each messages as msg}
            {@const isMe = msg.senderId === currentUser?.id}
            {@const embed = getEmbedData(msg.text)}
            <div class="flex {isMe ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[85%] sm:max-w-[70%] space-y-1">
                    <div class="flex items-baseline gap-2 px-1">
                        <span class="text-[10px] font-bold text-muted-foreground uppercase">{getSenderName(msg.senderId)}</span>
                        <span class="text-[10px] text-muted-foreground/60">{formatTime(msg.timestamp)}</span>
                    </div>
                    
                    <div class="p-3 rounded-2xl {isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border rounded-tl-none'} shadow-sm">
                        <p class="text-sm leading-relaxed">{msg.text}</p>
                    </div>

                    {#if embed}
                        <div class="mt-2 p-3 rounded-xl border border-border bg-card flex items-center gap-3 shadow-sm">
                            <div class="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 text-primary">
                                {#if embed.type === 'invoice'}<HugeiconsIcon icon={Invoice02Icon} size={20} />
                                {:else if embed.type === 'quote'}<HugeiconsIcon icon={AttachmentIcon} size={20} />
                                {:else if embed.type === 'payment'}<HugeiconsIcon icon={Dollar02Icon} size={20} />
                                {:else}<HugeiconsIcon icon={Calendar03Icon} size={20} />{/if}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-[10px] font-black text-primary/60 uppercase tracking-widest">{embed.title}</p>
                                <p class="text-[11px] font-bold text-foreground truncate">{embed.id}</p>
                                {#if embed.amount}
                                    <p class="text-[10px] text-muted-foreground font-medium">{embed.amount}</p>
                                {/if}
                            </div>
                            <button class="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors">
                                <span class="text-[10px] font-black uppercase tracking-wider px-1">Apri</span>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>

    <!-- Actions & Input -->
    <div class="p-4 bg-card border-t border-border space-y-4">
        {#if actions.length > 0}
            <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {#each actions as action}
                    <button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border border-transparent hover:border-current {action.class}">
                        <HugeiconsIcon icon={action.icon} size={14} />
                        {action.label}
                    </button>
                {/each}
            </div>
        {/if}

        <div class="flex items-end gap-2">
            <button class="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors shrink-0">
                <HugeiconsIcon icon={AttachmentIcon} size={20} />
            </button>
            <div class="flex-1 relative">
                <textarea 
                    bind:value={newMessage}
                    placeholder="Scrivi un messaggio..."
                    rows="1"
                    class="w-full bg-muted/50 border border-border rounded-2xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none max-h-32"
                ></textarea>
            </div>
            <button 
                onclick={sendMessage}
                disabled={!newMessage.trim()}
                class="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale shrink-0"
            >
                <HugeiconsIcon icon={SentIcon} size={20} />
            </button>
        </div>
    </div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
