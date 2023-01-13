<div class="tabbed-container">
    <div class="tab-buttons">
        {#if tabButtons}
            {#each tabButtons as tabButton}
                <Button 
                    type="tab" 
                    label={tabButton.label} 
                    action={tabButton.action} 
                    active={tabButton.active}
                />
            {/each}
        {/if}
    </div>
    <div class="tab-output">
        <div 
            class="direction flex" 
            style={`
                flex-direction: ${flexDirection}; 
                overflow: ${hideOverflow ? 'hidden' : 'initial'}
            `}>
            <slot />    
        </div>
    </div>
</div>

<script lang="ts">
	import Button from "../button/button.svelte";
    export let direction: 'vertical' | 'horizontal' = 'vertical'
    export let hideOverflow: boolean = false;
    export let tabButtons: {action: any, label: string, active: boolean}[]
    $: flexDirection = direction === 'vertical' ? 'column' : 'row'
    
</script>

<style>
    .tabbed-container {
        border-radius: 18px;
        min-width: 450px;
        overflow: hidden;
    }
    .tab-output {
        padding: var(--container-padding);
        /* min-width: 450px; */
    }

    .tab-buttons {
        display: flex;
        justify-content: center;
        gap: 0;
        align-items: center;
        overflow: hidden;
    }
</style>