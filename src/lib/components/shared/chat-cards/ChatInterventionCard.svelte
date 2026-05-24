<script lang="ts">
    import type { supplierTask } from '$lib/data/embeds/supplierTasks';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import {
        Calendar03Icon,
        Clock01Icon,
        Location01Icon,
        WrenchIcon,
        ViewIcon,
    } from '@hugeicons/core-free-icons';
    import { Badge } from '$lib/components/ui/badge';
    import { formatChatTime, formatChatTooltip } from '$lib/utils/dates';

    interface Props {
        task: supplierTask;
    }

    let { task }: Props = $props();

    const isVisit = $derived(task.type === 'sopralluogo');

    function getTaskTime() {
        if (task.createdAt) return formatChatTime(task.createdAt);
        return formatChatTime(`${task.date}T${task.startTime}`);
    }
</script>

<div class="flex flex-col items-center w-full mb-4">
    <div class="w-full max-w-85 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center justify-between gap-3 px-4 py-4 bg-slate-50/50">
            <div class="flex items-center gap-3">
                <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                    <HugeiconsIcon icon={isVisit ? ViewIcon : WrenchIcon} size={18} />
                </div>
                <div>
                    <h4 class="text-sm font-bold text-slate-900 leading-tight">{task.title}</h4>
                    <Badge variant="outline" class="text-[9px] h-4.5 px-1.5 uppercase font-bold mt-1 text-slate-500 border-slate-200">
                        {task.type}
                    </Badge>
                </div>
            </div>
        </div>

        <div class="space-y-3 px-4 py-4 text-xs font-medium">
            <div class="flex items-center gap-2.5 text-slate-700">
                <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                    <HugeiconsIcon icon={Calendar03Icon} size={14} />
                </div>
                <span>{task.date}</span>
                <span class="text-slate-200 font-light">|</span>
                <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                    <HugeiconsIcon icon={Clock01Icon} size={14} />
                </div>
                <span>{task.startTime} - {task.endTime}</span>
            </div>
            <div class="flex items-center gap-2.5 text-slate-500">
                <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                    <HugeiconsIcon icon={Location01Icon} size={14} />
                </div>
                <span class="line-clamp-1">{task.location}</span>
            </div>
        </div>

        <div class="mx-4 mb-4 p-3 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-100">
            Accedi ai dettagli dell'intervento
        </div>
    </div>
    <span class="mt-1 text-[10px] font-medium text-slate-400 text-center w-full">
        {getTaskTime()}
    </span>
</div>
