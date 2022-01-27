<script lang="ts">
    import { suits } from "$lib/constants";
    import type { SuitName } from "$lib/types";
    import ValueDisplay from "./value-display.svelte";
    export let suit: SuitName = 'clubs'
    export let revealed: number | null = null
    export let isLastRevealed: boolean = false
</script>

<div class="deck row-section" data-is-last-revealed={isLastRevealed}>
    <div class="symbol inner-column" data-suit={suit}>{@html `${suits[suit].symbol}`}</div>
    <ValueDisplay value={revealed} />
    <ValueDisplay value={13} />
</div>

<style>
    .deck { grid-template-columns: 50px 1fr 1fr }
    
    [data-is-last-revealed="true"] .symbol {
        color: var(--green)!important;
        opacity: 1!important;
    }

    [data-is-last-revealed="true"].row-section {
        border: solid 1px var(--green)!important;
    }
</style>