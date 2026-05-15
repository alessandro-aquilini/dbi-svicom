<script lang="ts">
	import { reports, inferReportStatus } from '$lib/data/ticket/reports';
	import { tickets, getCurrentStatus, getCurrentSupplier, getSupplierRelevantTimeline, getSuppliersForTicket } from '$lib/data/ticket/tickets';
	import { users } from '$lib/data/users';
	import { services } from '$lib/data/services';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getCurrentUser } from '$lib/auth';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		ArrowLeft01Icon, 
		InformationCircleIcon,
		Search01Icon,
		Message01Icon,
		UserCircleIcon,
		CustomerServiceIcon,
		Settings02Icon,
		SentIcon
	} from '@hugeicons/core-free-icons';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	
	import ChatBubble from '$lib/components/chat-cards/ChatBubble.svelte';
	import ChatQuoteCard from '$lib/components/chat-cards/ChatQuoteCard.svelte';
	import ChatInvoiceCard from '$lib/components/chat-cards/ChatInvoiceCard.svelte';
	import ChatPaymentCard from '$lib/components/chat-cards/ChatPaymentCard.svelte';
	import ChatTimelineEvent from '$lib/components/chat-cards/ChatTimelineEvent.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	const currentUser = getCurrentUser();
	const adminId = currentUser?.id ?? 'adm-giorgio-01';

	// State for active view and selection
	type ChatType = 'resident' | 'supplier';
	let activeTab = $state<ChatType>('resident');
	let selectedId = $state<string | null>(null);

	// Filter data for the sidebar
	const adminReports = $derived(reports.filter(r => r.adminId === adminId));

	// Build supplier-specific chat entries from all tickets: one chat per (ticket, supplier).
	const supplierChats = $derived.by(() => {
		const chats: any[] = [];
		for (const t of tickets) {
			// get suppliers that appear in the ticket's timeline
			const suppliers = getSuppliersForTicket(t);
			for (const sid of suppliers) {
				// compute supplier-relevant timeline; skip chats with empty relevance
				const rel = getSupplierRelevantTimeline(t, sid);
				if (rel.length === 0) continue;
				// find last activity (message from supplier/admin or last event)
				const msgs = (t.messageTimeline ?? []).filter(m => m.senderId === sid || m.senderId === adminId);
				let lastDate: Date | null = null;
				let lastMsgText: string | null = null;

				if (msgs.length) {
					const lastMsg = msgs[msgs.length - 1];
					lastDate = new Date(lastMsg.timestamp);
					lastMsgText = lastMsg.text;
				} else if (rel.length) {
					const lastEv = rel[rel.length - 1];
					lastDate = new Date(lastEv.at);
					lastMsgText = lastEv.body || lastEv.kind;
				}

				chats.push({ 
					id: `${t.id}::${sid}`, 
					ticket: t, 
					supplierId: sid, 
					lastDate, 
					lastMessageText: lastMsgText,
					rel 
				});
			}
		}
		// sort by lastDate desc
		return chats.sort((a, b) => (b.lastDate?.getTime() ?? 0) - (a.lastDate?.getTime() ?? 0));
	});

	// Keep convenience view for admin-owned tickets if still needed elsewhere
	const adminTickets = $derived(tickets.filter(t => t.creatorId === adminId));

	// Derived selection
	const selectedReport = $derived(activeTab === 'resident' ? adminReports.find(r => r.id === selectedId) : null);
	const selectedSupplierChat = $derived.by(() => {
		if (activeTab !== 'supplier' || !selectedId) return null;
		return supplierChats.find((c: any) => c.id === selectedId) || null;
	});

	const activeItem = $derived(activeTab === 'resident' ? selectedReport : selectedSupplierChat?.ticket);
	const counterparty = $derived(activeTab === 'resident' 
		? getUserInfo(selectedReport?.reportedById || '') 
		: getUserInfo(selectedSupplierChat?.supplierId || ''));

	// Unified timeline for the selected conversation
	const timelineItems = $derived.by(() => {
		const items: any[] = [];
		if (activeTab === 'resident' && selectedReport) {
			if (selectedReport.messageTimeline) {
				selectedReport.messageTimeline.forEach(msg => {
					items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
				});
			}
			if (selectedReport.timeline) {
				selectedReport.timeline.forEach(event => {
					items.push({ type: 'event', date: new Date(event.at), data: { kind: event.kind, at: event.at, authorId: event.authorId } });
				});
			}
		} else if (activeTab === 'supplier' && selectedSupplierChat) {
			const t = selectedSupplierChat.ticket;
			const sid = selectedSupplierChat.supplierId;

			// messages between admin and this supplier
			if (t.messageTimeline) {
				t.messageTimeline.filter((m: any) => m.senderId === sid || m.senderId === adminId).forEach((msg: any) => {
					items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
				});
			}

			// supplier-relevant events
			selectedSupplierChat.rel.forEach((event: any) => {
				items.push({ type: 'event', date: new Date(event.at), data: event });
			});

			if (t.quoteIds) {
				t.quoteIds.forEach((id: string) => {
					const quote = getQuoteById(id);
					if (quote) items.push({ type: 'quote', date: new Date(quote.sentAt), data: quote });
				});
			}
			if (t.invoiceIds) {
				t.invoiceIds.forEach((id: string) => {
					const invoice = getInvoiceById(id);
					if (invoice) items.push({ type: 'invoice', date: new Date(invoice.issueDate), data: invoice });
				});
			}
			if (t.paymentIds) {
				t.paymentIds.forEach((id: string) => {
					const payment = getPaymentById(id);
					if (payment && (payment.paidAt || payment.dueDate)) {
						items.push({ type: 'payment', date: new Date(payment.paidAt || payment.dueDate), data: payment });
					}
				});
			}
		}
		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	function getUserInfo(userId: string) {
		return users.find(u => u.id === userId);
	}

	function getLastMessage(item: any) {
		if (item.messageTimeline && item.messageTimeline.length > 0) {
			return item.messageTimeline[item.messageTimeline.length - 1];
		}
		return null;
	}

	const statusColors: Record<string, string> = {
		nuova: 'bg-amber-100 text-amber-700',
		presa_in_carico: 'bg-blue-100 text-blue-700',
		completata: 'bg-emerald-100 text-emerald-700',
		archiviata: 'bg-slate-100 text-slate-500',
		opened: 'bg-amber-100 text-amber-700',
		estimating: 'bg-blue-100 text-blue-700',
		approved: 'bg-emerald-100 text-emerald-700',
		in_progress: 'bg-indigo-100 text-indigo-700',
		completed: 'bg-emerald-100 text-emerald-700',
		paid: 'bg-slate-100 text-slate-700',
		closed: 'bg-slate-100 text-slate-500'
	};
</script>

<div class="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
	<!-- Sidebar: Conversation List -->
	<aside class="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-slate-50/30 {selectedId ? 'hidden md:flex' : 'flex'}">
		<div class="p-4 bg-white border-b border-border">
			<div class="flex items-center justify-between mb-4">
				<h1 class="text-xl font-bold text-slate-900">Messaggi</h1>
				<button class="p-2 rounded-full hover:bg-slate-100 text-slate-500">
					<HugeiconsIcon icon={Settings02Icon} size={20} />
				</button>
			</div>
			
			<div class="flex p-1 bg-slate-100 rounded-xl mb-4">
				<button 
					onclick={() => { activeTab = 'resident'; selectedId = null; }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'resident' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Residenti
				</button>
				<button 
					onclick={() => { activeTab = 'supplier'; selectedId = null; }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'supplier' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Fornitori
				</button>
			</div>

			<div class="relative">
				<HugeiconsIcon icon={Search01Icon} size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<Input 
					type="text" 
					placeholder="Cerca conversazioni..." 
					class="pl-10 bg-slate-100 border-none rounded-xl"
				/>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto">
			{#if activeTab === 'resident'}
				{#each adminReports as report}
					{@const resident = getUserInfo(report.reportedById)}
					{@const lastMsg = getLastMessage(report)}
					{@const status = inferReportStatus(report)}
					<button 
						onclick={() => selectedId = report.id}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === report.id ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
							<HugeiconsIcon icon={UserCircleIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{resident?.name || 'Residente'}</span>
								{#if lastMsg}
									<span class="text-[10px] text-slate-400">{format(new Date(lastMsg.timestamp), "HH:mm")}</span>
								{/if}
							</div>
							<div class="text-xs font-semibold text-primary mb-1 truncate">{report.title}</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Nessun messaggio...'}
							</p>
						</div>
					</button>
				{/each}
			{:else}
				{#each supplierChats as chat}
					{@const supplier = getUserInfo(chat.supplierId)}
					{@const lastMsgText = chat.lastMessageText ?? (chat.rel?.length ? chat.rel[chat.rel.length-1].body : null)}
					{@const status = getCurrentStatus(chat.ticket)}
					<button 
						onclick={() => selectedId = chat.id}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === chat.id ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
							<HugeiconsIcon icon={CustomerServiceIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{supplier?.name || 'Fornitore'}</span>
								{#if chat.lastDate}
									<span class="text-[10px] text-slate-400">{format(new Date(chat.lastDate), "HH:mm")}</span>
								{/if}
							</div>
							<div class="text-xs font-semibold text-primary mb-1 truncate">{chat.ticket.title}</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsgText ?? 'Attesa aggiornamenti...'}
							</p>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- Main Chat Area -->
	<main class="flex-1 flex flex-col bg-slate-50/50 {selectedId ? 'flex' : 'hidden md:flex'}">
		{#if selectedId}
			<header class="h-16 shrink-0 bg-white border-b border-border px-4 flex items-center gap-3 relative z-10">
				<button 
					onclick={() => selectedId = null}
					class="p-2 -ml-2 rounded-full hover:bg-slate-100 md:hidden"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
				</button>
				
				<div class="w-10 h-10 rounded-full {activeTab === 'resident' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0">
					<HugeiconsIcon icon={activeTab === 'resident' ? UserCircleIcon : CustomerServiceIcon} size={24} />
				</div>
				
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h2 class="font-bold text-slate-900 text-sm truncate">{counterparty?.name || 'Caricamento...'}</h2>
						{#if activeItem}
							{@const status = activeTab === 'resident' 
								? inferReportStatus(activeItem as any) 
								: getCurrentStatus(activeItem as any)}
							<Badge variant="secondary" class="text-[10px] uppercase {statusColors[status]}">
								{status.replace(/_/g, ' ')}
							</Badge>
						{/if}
					</div>
					<p class="text-[11px] text-slate-500 truncate">{activeItem?.title}</p>
				</div>

				<div class="flex items-center gap-1">
					<Button variant="ghost" size="icon" class="text-slate-400">
						<HugeiconsIcon icon={InformationCircleIcon} size={20} />
					</Button>
				</div>
			</header>

			<div class="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
				{#each timelineItems as item}
					{#if item.type === 'message'}
						<ChatBubble 
							message={item.data} 
							isOwn={item.data.senderId === adminId}
						/>
					{:else if item.type === 'event'}
						<ChatTimelineEvent event={item.data} />
					{:else if item.type === 'quote'}
						<ChatQuoteCard 
							quote={item.data} 
							isOwn={false} 
						/>
					{:else if item.type === 'invoice'}
						<ChatInvoiceCard 
							invoice={item.data} 
							isOwn={false} 
						/>
					{:else if item.type === 'payment'}
						<ChatPaymentCard payment={item.data} />
					{/if}
				{/each}
			</div>

			<footer class="p-4 bg-white border-t border-border">
				<div class="flex gap-3 max-w-4xl mx-auto items-center">
					<div class="bg-slate-50 flex items-center gap-2 border border-slate-200 rounded-2xl p-1.5 w-full">
						<input 
							type="text" 
							placeholder="Scrivi a {activeTab === 'resident' ? 'Marco' : 'Idroclima'}..." 
							class="flex-1 bg-transparent border-none px-3 py-1.5 text-sm focus:ring-0 text-slate-900 placeholder:text-slate-400"
						/>
						<Button size="icon" class="rounded-xl h-9 w-9">
							<HugeiconsIcon icon={SentIcon} size={18} />
						</Button>
					</div>
				</div>
			</footer>
		{:else}
			<div class="flex-1 flex flex-col items-center justify-center text-center p-8">
				<div class="w-16 h-16 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 mb-6">
					<HugeiconsIcon icon={Message01Icon} size={32} />
				</div>
				<h3 class="text-lg font-bold text-slate-900">Centro Messaggi Amministratore</h3>
				<p class="text-sm text-slate-500 max-w-xs mt-2">
					Seleziona una segnalazione residente o un ticket fornitore per visualizzare la cronologia e rispondere.
				</p>
			</div>
		{/if}
	</main>
</div>
