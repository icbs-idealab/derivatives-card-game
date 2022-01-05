<script lang="ts">
    import type { SuitName } from "$lib/types";
    import Icon from "../icon/icon.svelte";
    export let role: SuitName = 'clubs'
    export let type: string = 'default'
    export let message: string = 'The default message goes here!'
    export let clearMessage: (...props: any) => any = () => console.log('will clear message')
</script>

<div class="row-message" data-for={role} data-type={type}>
    <div class="message-content">
        {#if type}
            <p class="message-type">{type}</p>
        {/if}
        <p class="message-body">{message}</p>
    </div>
    <div class="message-control flex">
        <div class="flex" on:click={() => clearMessage(role)}>
            <Icon icon="close" />
        </div>
    </div>
</div>