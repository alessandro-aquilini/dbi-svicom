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

<div class="flex flex-col gap-3 py-4">
    <div class="h-px bg-slate-100 w-full"></div>
    <div class="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4">
            <div class="flex items-start gap-3">
                <div class="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                    <HugeiconsIcon icon={isVisit ? ViewIcon : WrenchIcon} size={20} />
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-slate-900">{task.title}</h4>
                    <Badge variant="secondary" class="text-[10px] h-5 px-2 uppercase font-semibold mt-1">
                        {task.type}
                    </Badge>
                </div>
            </div>
            <span class="text-xs font-semibold text-slate-500" title={formatChatTooltip(task.createdAt ?? `${task.date}T${task.startTime}`)}>
                {getTaskTime()}
            </span>
        </div>

        <div class="space-y-3 px-4 py-4 text-sm text-slate-600">
            <div class="flex flex-wrap items-center gap-2 text-sm">
                <HugeiconsIcon icon={Calendar03Icon} size={14} class="text-slate-400" />
                <span class="font-medium">{task.date}</span>
                <span class="mx-1 text-slate-300">·</span>
                <HugeiconsIcon icon={Clock01Icon} size={14} class="text-slate-400" />
                <span class="font-medium">{task.startTime} - {task.endTime}</span>
            </div>
            <div class="flex items-start gap-2 text-sm text-slate-500">
                <HugeiconsIcon icon={Location01Icon} size={14} class="text-slate-400 mt-0.5" />
                <span>{task.location}</span>
            </div>
        </div>

        <div class="border-t border-slate-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Scheda intervento
        </div>
    </div>
</div>
