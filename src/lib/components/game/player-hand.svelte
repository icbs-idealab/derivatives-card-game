<script lang="ts">
    import { suits } from "$lib/constants";
    import type { SuitName } from "$lib/types";
    import ValueDisplay from "./value-display.svelte";
    export let role: SuitName = 'clubs'
    export let revealed: number | null = null
</script>

<div class="deck row-section">
    <div class="symbol inner-column">{@html `${suits[role].symbol}`}</div>
    <ValueDisplay value={revealed} />
    <ValueDisplay value={13} />
</div>

<style>
    .deck { grid-template-columns: 50px 1fr 1fr }
</style>