<script lang="ts">
    import type { supplierTask } from '$lib/data/embeds/supplierTasks';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { 
        Calendar03Icon, 
        Clock01Icon, 
        Location01Icon,
        WrenchIcon,
        ViewIcon
    } from '@hugeicons/core-free-icons';
    import { Badge } from '$lib/components/ui/badge';

    interface Props {
        task: supplierTask;
    }

    let { task }: Props = $props();

    const isVisit = $derived(task.type === 'sopralluogo');
</script>

<div class="flex flex-col items-center gap-2 py-4">
    <div class="h-px bg-slate-100 w-full mb-1"></div>
    
    <div class="w-full max-w-sm bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-4">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center {isVisit ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}">
                        <HugeiconsIcon icon={isVisit ? ViewIcon : WrenchIcon} size={20} />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-900">{task.title}</h4>
                        <Badge variant="secondary" class="text-[10px] h-4 px-1.5 uppercase font-bold mt-0.5">
                            {task.type}
                        </Badge>
                    </div>
                </div>
            </div>

            <div class="space-y-2.5">
                <div class="flex items-center gap-2 text-xs text-slate-600">
                    <HugeiconsIcon icon={Calendar03Icon} size={14} class="text-slate-400" />
                    <span class="font-medium">{task.date}</span>
                    <span class="mx-1 text-slate-300">•</span>
                    <HugeiconsIcon icon={Clock01Icon} size={14} class="text-slate-400" />
                    <span class="font-medium">{task.startTime} - {task.endTime}</span>
                </div>
                
                <div class="flex items-start gap-2 text-xs text-slate-500">
                    <HugeiconsIcon icon={Location01Icon} size={14} class="text-slate-400 mt-0.5" />
                    <span class="flex-1">{task.location}</span>
                </div>
            </div>
        </div>
        
        <div class="bg-slate-50 border-t border-slate-100 px-4 py-2 flex justify-between items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheda Intervento</span>
            <button class="text-[10px] font-bold text-primary hover:underline">VISUALIZZA DETTAGLI</button>
        </div>
    </div>
</div>
