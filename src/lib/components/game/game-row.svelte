<script lang="ts">
    import { makeGamePlayersAsObject } from "$lib/helpers";
    import PlayerHand from "./player-hand.svelte";
    import PlayerInventory from "./player-inventory.svelte";
    import ValueChanger from "./value-changer.svelte";
    import type { AppGamePlayer, PlayerRole, SuitName } from "$lib/types"
    import { defaultGamePlayer, emptyHand, suits } from "$lib/constants";
    import BuySellControls from "./buy-sell-controls.svelte";
    import ActivePlayerControls from "./active-player-controls.svelte";
    
    export let isActivePlayer = false
    export let maxSpread = 3
    export let roleData: AppGamePlayer = {...defaultGamePlayer}
    export let localRates = {
        buy: 40,
        sell: 40,
    }
    export let suit: SuitName | null
    export let canTrade = false
    export let playerCards = emptyHand
    export let revealed = 0
    $:cardCount = suit ? playerCards[suit] : 0
    $:buy = localRates.buy !== roleData.buy ? localRates.buy : roleData.buy
    $:sell = localRates.sell !== roleData.sell ? localRates.sell : roleData.sell
    function updateLocal(value, type){
        console.log('would update value: ', value, type)
        localRates[type] = value
    }
    function processTrade(value, type){
        console.log('would update value in backend: ', value, type)
    }

    function saveNewPrices(value, type){
        console.log('would update value in backend: ', value, type)
    }

    let maxSpreadWarning = ''

    function displayMaxSpreadWarning(){
        maxSpreadWarning = `The maximum 'spread' between buy and sell values is set to ${maxSpread} for this game` 
    }
</script>

<div class="row">
    <!-- market values -->
    <div class="market-values row-section">
        <div class="symbol inner-column">
            {#if suit}
                {@html `${suits[suit].symbol}`}
            {:else}
                {@html `${suits.default.symbol}`}
            {/if}
        </div>

        {#if isActivePlayer}
            <ActivePlayerControls 
                buy={roleData.buy}
                sell={roleData.sell}
                localBuy={localRates.buy}
                localSell={localRates.sell}
                maxSpread={maxSpread}
                displayMaxSpreadWarning={displayMaxSpreadWarning}
                updateLocal={updateLocal}
                saveNewPrices={saveNewPrices}
            />
        {:else}
            <BuySellControls 
                buy={roleData.buy}
                sell={roleData.sell}
                disabled={!canTrade}
                processTrade={processTrade}
                suit={suit}
            />
        {/if}
    </div>
    <!-- player inventory -->
    <PlayerInventory 
        cardCount={cardCount}
    />
    <!-- deck info -->
    <PlayerHand 
        revealed={revealed}
    />

    {#if isActivePlayer && maxSpreadWarning}
        <div class="max-spread-warning"></div>
    {/if}
</div>

<style global>
    /* .row .inventory { grid-template-columns: 50px 1fr 1fr } */
    .row {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr;
        grid-template-rows: 100%;
        grid-gap: 15px;
        cursor: default;
        position: relative;
    }

    .game-markets {
        position: relative;
        /* border: solid thin lightgray; */
        /* background: cornflowerblue; */
        height: 100%;
        height: calc((85px * 4) + (3 * 10px) + 100px);
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(4, 85px);
        grid-gap: 10px;
        max-width: 1000px;
    }

    .row .row-section {
        display: grid;
        grid-gap: 5px;
        padding: 5px;
        border-radius: 6px;
    }

    .row > div {
        /* background: rgb(255, 200, 30, 0.94); */
        /* background: cornflowerblue; */
        background: rgba(255, 255, 255, 0.25);
        width: 100%;
        height: 100%;
    }

    .row .market-values { grid-template-columns: 50px 4fr 4fr 3fr }

    .inner-column {
        display: flex;
        align-items: stretch;
        justify-content: center;
        flex-direction: column;
    }

    .row-section {
        position: relative;
    }

    .row-section .symbol {
        font-size: 1em;
        text-align: center;
        opacity: 0.125;
    }
</style>