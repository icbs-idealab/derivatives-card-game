<script lang="ts">
    import Trade from "./trade.svelte";
    export let trades = []
    export let ended = false

    // let usable = [...trades]
    // usable.length > 10 && (usable.length = 10)
</script>

<div class="game-ledger">
    <div class="ledger">
        {#if ended}
            <div class="ended flex">
                Please see the game archive to view trades
            </div>
        {:else}
            <div class="items">
                {#each trades as trade}
                    <Trade 
                        market={trade.market}
                        type={trade.type}
                        price={trade.price}
                    />
                {/each}
            </div>
        {/if}
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

    .ended {
        height: 100%;
        width: 100%;
        padding: 20px;
        text-align: center;
        opacity: 0.75
    }
</style>