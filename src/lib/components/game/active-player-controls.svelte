<script lang="ts">
import { currentGame } from "$lib/state";

    import ValueChanger from "./value-changer.svelte";
import ValueDisplay from "./value-display.svelte";
    import ValueSetter from "./value-setter.svelte";

    export let updateLocal: (value, type) => any = (value, type) => {
        console.log('updating local value')
    }
    export let maxSpread: number = 4
    export let buy = 30
    export let sell = 30
    export let localBuy = 30
    export let localSell = 30
    export let displayMaxSpreadWarning = () => {console.log('will display max spread warning')}
    export let saveNewPrices: (...props: any) => any 
        = () => {console.log('will update trade values in server')}
    function showMaxSpreadWarning(){
        displayMaxSpreadWarning()
    }
</script>

{#if $currentGame.started && !$currentGame.ended}
    <div class="ask-buy inner-column">
        <ValueChanger
            label="ASK" 
            value={buy} 
            onChange={(value) => updateLocal(value, 'buy')} 
        />
    </div>
    <div class="bid-sell inner-column">
        <ValueChanger 
            label="BID" 
            value={sell} 
            onChange={(value) => updateLocal(value, 'sell')}
        /> 
    </div>
    <div class="set inner-column">
        <ValueSetter 
            maxSpread={maxSpread}
            localBuy={localBuy}
            localSell={localSell}
            gameBuy={buy}
            gameSell={sell}
            submit={saveNewPrices}
            showMaxSpreadWarning={showMaxSpreadWarning}
        />
    </div>
{:else}
    <div class="inner-column">
        <ValueDisplay value={buy} label="Buy" />
    </div> 
    <div class="inner-column">
        <ValueDisplay value={sell} label="Sell" />
    </div> 
    <div class="inner-column"></div> 
{/if}
