<script lang="ts">
    import { suits } from "$lib/constants";
    import type { SuitName } from "$lib/types";
    import ValueDisplay from "./value-display.svelte";
    export let suit: SuitName = 'clubs'
    export let contracts: number | null = null
    export let cardCount: number | null = null
</script>

<div class="inventory row-section">
    <div class="symbol inner-column">{@html `${suits[suit].symbol}`}</div>
    <ValueDisplay value={contracts} />
    <ValueDisplay value={cardCount} />
</div>

<style>
    .inventory { grid-template-columns: 50px 1fr 1fr }
</style>