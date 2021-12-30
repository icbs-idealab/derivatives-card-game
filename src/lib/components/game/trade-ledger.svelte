<script lang="ts">
    import Trade from "./trade.svelte";
    export let trades = []

    $:usable = [...trades]
    usable && (usable.length = 10)
</script>

<div class="game-ledger">
    <div class="ledger">
        <div class="items">
            {#each usable as trade}
                <Trade {...trade} />
            {/each}
        </div>
    </div>
</div>

<style>
    .game-ledger {
        background: transparent;
        height: 100%;
        height: calc((85px * 4) + (3 * 10px) + 100px);
        width: 100%
    }

    .ledger {
        height: 100%;
        width: 100%;
        /* background: var(--white-opaque-1); */
        background: var(--lm-white);
        border-radius: 8px;
        padding: 10px;
    }

    .items {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(10, 1fr);
        grid-gap: 5px;
        height: 100%;
        width: 100%;
    }
</style>