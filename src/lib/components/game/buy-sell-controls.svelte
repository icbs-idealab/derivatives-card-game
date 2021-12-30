<script lang="ts">
    import type { PlayerRole, SuitName } from "$lib/types";
    import TradeButton from "./trade-button.svelte";
    export let buy: number = 40
    export let sell: number = 40
    export let disabled: boolean = false
    export let suit: SuitName | null
    export let processTrade = (suit, type) => {
        console.log('would process trade: ', suit, ' ', type)
    }
</script>
<div class="ask-buy inner-column">
    <TradeButton 
        label="BUY" 
        type="buy" 
        value={ buy } data-active={!disabled} 
        active={!disabled}
        trade={() => suit && processTrade(suit, 'buy')}
        />
        <!-- active={localGame.started && canTrade[roleData]} -->
</div>
<div class="bid-sell inner-column">
    <TradeButton 
        label="SELL" 
        type="sell" 
        value={ sell } data-active={!disabled} 
        active={!disabled}
        trade={() => suit && processTrade(suit, 'sell')}
    />
        <!-- active={localGame.started && canTrade[role]} -->
</div>
<div class="set inner-column"></div>