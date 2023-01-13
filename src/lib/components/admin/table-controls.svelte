<script lang="ts">
    import type { AdminControlButton } from "$lib/types";
    import Button from "../button/button.svelte";
    export let buttons: AdminControlButton[] = []
    export let count: number = 0
</script>

<div class="controls flex jc-between">
    <div class="item-count">
        {#if count > 0}
            <p class="items-found">Found {count} item(s)</p>
        {:else}
            <p class="no-items-found">No items found!</p>
        {/if}
    </div>

    <div class="button">
        {#each buttons as button}
            <Button 
                label={button.label}
                icon={button.icon}
                action={button.action}
                disabled={button.disabled}
            />
        {/each}
    </div>
</div>

<style>
    .controls {
        width: 100%;
        height: 50px;
        margin: 40px 0 0;
    }

    .item-count {
        padding: 10px;
        font-size: 12pt;
        font-weight: bold;
    }
</style>