<script lang="ts">
    import { processTrade, setLoadingModal } from "$lib/actions";
    import type { PlayerRole, SuitName } from "$lib/types";
    import TradeButton from "./trade-button.svelte";
    export let buy: number = 40
    export let sell: number = 40
    export let disabled: boolean = false
    export let suit: SuitName | null
    let handleTrade = (suit, type, value) => {
        console.log('would process trade')
        console.table({suit, type, value})

        if(suit && type && value){
            processTrade({market: suit, type, value})
        }
    }
</script>
<div class="ask-buy inner-column">
    <TradeButton 
        label="BUY" 
        type="buy" 
        value={ buy } data-active={!disabled} 
        active={!disabled}
        handleTrade={() => handleTrade(suit, 'buy', buy)}
        />
        <!-- active={localGame.started && canTrade[roleData]} -->
</div>
<div class="bid-sell inner-column">
    <TradeButton 
        label="SELL" 
        type="sell" 
        value={ sell } data-active={!disabled} 
        active={!disabled}
        handleTrade={() => handleTrade(suit, 'sell', sell)}
    />
        <!-- active={localGame.started && canTrade[role]} -->
</div>
<div class="set inner-column"></div>