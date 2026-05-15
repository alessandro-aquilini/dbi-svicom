<script lang="ts">
	import { reports, inferReportStatus } from '$lib/data/ticket/reports';
	import { tickets, getCurrentStatus, getCurrentSupplier, getSupplierRelevantTimeline } from '$lib/data/ticket/tickets';
	import { users } from '$lib/data/users';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { services } from '$lib/data/services';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getSupplierTaskById } from '$lib/data/embeds/supplierTasks';
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
	import ChatInterventionCard from '$lib/components/chat-cards/ChatInterventionCard.svelte';
	import ChatTimelineEvent from '$lib/components/chat-cards/ChatTimelineEvent.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	const currentUser = getCurrentUser();
	const adminId = currentUser?.id ?? 'adm-giorgio-01';

	// State for active view and selection
	type ChatType = 'resident' | 'supplier';
	let activeTab = $state<ChatType>('resident');
	
	// Synchronization with URL
	const selectedId = $derived(page.url.searchParams.get('id'));

	// Grouped Resident Chats: all reports and tickets for a resident
	const residentChats = $derived.by(() => {
		const groups = new Map<string, { userId: string, lastDate: Date, reports: any[] }>();
		
		reports.filter(r => r.adminId === adminId).forEach(r => {
			const userId = r.reportedById;
			if (!groups.has(userId)) {
				groups.set(userId, { userId, lastDate: new Date(0), reports: [] });
			}
			const g = groups.get(userId)!;
			g.reports.push(r);
			const updatedAt = new Date(r.timeline?.[r.timeline.length - 1]?.at || 0);
			if (updatedAt > g.lastDate) g.lastDate = updatedAt;
		});

		return Array.from(groups.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
	});

	// Grouped Supplier Chats: all tickets for a supplier
	const supplierChats = $derived.by(() => {
		const groups = new Map<string, { supplierId: string, lastDate: Date, tickets: any[] }>();
		
		for (const t of tickets) {
			const sid = getCurrentSupplier(t);
			if (!sid) continue;
			
			if (!groups.has(sid)) {
				groups.set(sid, { supplierId: sid, lastDate: new Date(0), tickets: [] });
			}
			const g = groups.get(sid)!;
			g.tickets.push(t);
			
			const rel = getSupplierRelevantTimeline(t, sid);
			const msgs = (t.messageTimeline ?? []).filter(m => m.senderId === sid || m.senderId === adminId);
			let lastActivity = new Date(0);
			if (msgs.length) lastActivity = new Date(msgs[msgs.length - 1].timestamp);
			else if (rel.length) lastActivity = new Date(rel[rel.length - 1].at);
			
			if (lastActivity > g.lastDate) g.lastDate = lastActivity;
		}

		return Array.from(groups.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
	});

	function selectChat(id: string, type: ChatType) {
		activeTab = type;
		goto(`?id=${id}`, { replaceState: true });
	}

	// Derived selection
	const activeChat = $derived.by(() => {
		if (!selectedId) return null;
		if (activeTab === 'resident') return residentChats.find(c => c.userId === selectedId);
		return supplierChats.find(c => c.supplierId === selectedId);
	});

	const counterparty = $derived(activeChat 
		? getUserInfo(activeTab === 'resident' ? (activeChat as any).userId : (activeChat as any).supplierId) 
		: null);

	// Unified timeline for the selected conversation
	const timelineItems = $derived.by(() => {
		const items: any[] = [];
		if (!activeChat) return [];

		if (activeTab === 'resident') {
			const chat = activeChat as any;
			chat.reports.forEach((r: any) => {
				if (r.messageTimeline) {
					r.messageTimeline.forEach((msg: any) => {
						items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
					});
				}
			});
		} else {
			const chat = activeChat as any;
			const sid = chat.supplierId;
			chat.tickets.forEach((t: any) => {
				if (t.messageTimeline) {
					t.messageTimeline.filter((m: any) => m.senderId === sid || m.senderId === adminId).forEach((msg: any) => {
						items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
					});
				}
				// Events
				const rel = getSupplierRelevantTimeline(t, sid);
				rel.forEach((event: any) => {
					items.push({ type: 'event', date: new Date(event.at), data: event });
				});
				// Embeds
				if (t.quoteIds) t.quoteIds.forEach((id: string) => {
					const quote = getQuoteById(id);
					if (quote && quote.createdAt) items.push({ type: 'quote', date: new Date(quote.createdAt), data: quote });
				});
				if (t.invoiceIds) t.invoiceIds.forEach((id: string) => {
					const invoice = getInvoiceById(id);
					if (invoice && invoice.createdAt) items.push({ type: 'invoice', date: new Date(invoice.createdAt), data: invoice });
				});
				if (t.paymentIds) t.paymentIds.forEach((id: string) => {
					const payment = getPaymentById(id);
					const dateStr = payment ? (payment.createdAt ?? payment.paidAt) : undefined;
					if (payment && dateStr) items.push({ type: 'payment', date: new Date(dateStr), data: payment });
				});
				if (t.interventionIds) t.interventionIds.forEach((id: string) => {
					const task = getSupplierTaskById(id);
					if (task) items.push({ type: 'intervention', date: new Date(`${task.date}T${task.startTime}`), data: task });
				});
			});
		}
		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	function getUserInfo(userId: string) {
		return users.find(u => u.id === userId);
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
					onclick={() => { activeTab = 'resident'; goto('?', { replaceState: true }); }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'resident' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Residenti
				</button>
				<button 
					onclick={() => { activeTab = 'supplier'; goto('?', { replaceState: true }); }}
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
				{#each residentChats as group}
					{@const resident = getUserInfo(group.userId)}
					{@const lastReport = group.reports[group.reports.length - 1]}
					{@const lastMsg = lastReport?.messageTimeline?.[lastReport.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(group.userId, 'resident')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === group.userId ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
							<HugeiconsIcon icon={UserCircleIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{resident?.name || 'Residente'}</span>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] text-slate-400">{format(group.lastDate, "HH:mm")}</span>
								{/if}
							</div>
							<div class="text-xs font-semibold text-primary mb-1 truncate">
								{group.reports.length} segnalazioni
							</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Vedi cronologia...'}
							</p>
						</div>
					</button>
				{/each}
			{:else}
				{#each supplierChats as group}
					{@const supplier = getUserInfo(group.supplierId)}
					{@const lastTicket = group.tickets[group.tickets.length - 1]}
					{@const lastMsg = lastTicket?.messageTimeline?.[lastTicket.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(group.supplierId, 'supplier')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === group.supplierId ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
							<HugeiconsIcon icon={CustomerServiceIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{supplier?.name || 'Fornitore'}</span>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] text-slate-400">{format(group.lastDate, "HH:mm")}</span>
								{/if}
							</div>
							<div class="text-xs font-semibold text-primary mb-1 truncate">
								{group.tickets.length} interventi
							</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Vedi cronologia...'}
							</p>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- Main Chat Area -->
	<main class="flex-1 flex flex-col bg-slate-50/50 {selectedId ? 'flex' : 'hidden md:flex'}">
		{#if selectedId && counterparty}
			<header class="h-16 shrink-0 bg-white border-b border-border px-4 flex items-center gap-3 relative z-10">
				<button 
					onclick={() => goto('?', { replaceState: true })}
					class="p-2 -ml-2 rounded-full hover:bg-slate-100 md:hidden"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
				</button>
				
				<div class="w-10 h-10 rounded-full {activeTab === 'resident' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0">
					<HugeiconsIcon icon={activeTab === 'resident' ? UserCircleIcon : CustomerServiceIcon} size={24} />
				</div>
				
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h2 class="font-bold text-slate-900 truncate">{counterparty.name}</h2>
					</div>
					<p class="text-[11px] text-slate-500 truncate">
						{activeTab === 'resident' ? 'Residente' : 'Fornitore'}
					</p>
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
					{:else if item.type === 'intervention'}
						<ChatInterventionCard task={item.data} />
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
