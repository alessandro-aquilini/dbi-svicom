<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Cancel01Icon,
		Location01Icon,
		Clock01Icon,
		Ticket01Icon,
		Message01Icon,
		Tag01Icon,
		Note01Icon
	} from '@hugeicons/core-free-icons';
	import type { CalendarEvent, EventType } from './types';
	import { EVENT_COLORS_DOT, EVENT_COLORS } from './types';
	import { formatTime } from './utils';
	import { goto } from '$app/navigation';

	let { event, open = $bindable(false) } = $props<{
		event: CalendarEvent | null;
		open: boolean;
	}>();

	function navigateToChat() {
		if (event?.bookingId) {
			goto(`/supplier/chat?booking=${event.bookingId}`);
		} else if (event?.ticketId) {
			goto(`/supplier/chat?ticket=${event.ticketId}`);
		}
		open = false;
	}
</script>

{#if open && event}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button 
			class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
			onclick={() => (open = false)}
            aria-label="Close dialog"
		></button>
		
		<div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
			<!-- Header -->
			<div class="p-8 pb-4 flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-3">
						{#if event}
							<div class={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS_DOT[event.type as EventType]}`}></div>
						{/if}
						<span class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
							{event.type}
						</span>
					</div>
					<h2 class="text-2xl font-bold text-slate-900 leading-tight">
						{event.title}
					</h2>
				</div>
				<button
					onclick={() => (open = false)}
					class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
				>
					<HugeiconsIcon icon={Cancel01Icon} size="20" />
				</button>
			</div>

			<!-- Content -->
			<div class="px-8 pb-8 space-y-6">
				<div class="space-y-4">
					<div class="flex items-center gap-4 text-slate-600">
						<div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
							<HugeiconsIcon icon={Clock01Icon} size="20" />
						</div>
						<div>
							<div class="text-sm font-semibold text-slate-900">
								{new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(event.start)}
							</div>
							<div class="text-xs text-slate-500 font-medium">
								{formatTime(event.start)} — {formatTime(event.end)}
							</div>
						</div>
					</div>

					<div class="flex items-center gap-4 text-slate-600">
						<div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
							<HugeiconsIcon icon={Location01Icon} size="20" />
						</div>
						<div>
							<div class="text-sm font-semibold text-slate-900">Luogo</div>
							<div class="text-xs text-slate-500 font-medium">{event.location}</div>
						</div>
					</div>

					{#if event.description}
						<div class="flex items-start gap-4 text-slate-600">
							<div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
								<HugeiconsIcon icon={Note01Icon} size="20" />
							</div>
							<div>
								<div class="text-sm font-semibold text-slate-900">Dettagli</div>
								<div class="text-xs text-slate-500 font-medium leading-relaxed">{event.description}</div>
							</div>
						</div>
					{/if}
				</div>

				<div class="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
					<button
						onclick={navigateToChat}
						class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
					>
						<HugeiconsIcon icon={Message01Icon} size="18" />
						Vai alla chat
					</button>
					<button
						onclick={() => (open = false)}
						class="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
					>
						Chiudi
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
