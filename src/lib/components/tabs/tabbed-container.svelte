<div class="tabbed-container">
    <div 
        class="direction flex" 
        style={`
            flex-direction: ${flexDirection}; 
            overflow: ${hideOverflow ? 'hidden' : 'initial'}
        `}>
        <slot />    
    </div>
</div>

<script lang="ts">
    export let direction: 'vertical' | 'horizontal' = 'vertical'
    export let hideOverflow: boolean = false;
    $: flexDirection = direction === 'vertical' ? 'column' : 'row'
</script>

<style>
    .tabbed-container {
        padding: var(--container-padding);
        border-radius: 18px;
        min-width: 450px;
    }
</style>