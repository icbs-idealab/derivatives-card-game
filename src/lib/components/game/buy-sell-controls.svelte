<script lang="ts">
    import { processTrade, setLoadingModal } from "$lib/actions";
    import { currentGame, gamePlayers } from "$lib/state";
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

    // subscribe to game players to keep the prices up-to-date
    // gamePlayers.subscribe((newGamePlayers) => {
    //     // check all game players for matching
    // })
</script>
<div class="ask-buy inner-column">
    <TradeButton 
        label="BUY" 
        type="buy" 
        value={ buy } data-active={!disabled} 
        active={!disabled && $currentGame.started}
        handleTrade={() => handleTrade(suit, 'buy', buy)}
        />
        <!-- active={localGame.started && canTrade[roleData]} -->
</div>
<div class="bid-sell inner-column">
    <TradeButton 
        label="SELL" 
        type="sell" 
        value={ sell } data-active={!disabled} 
        active={!disabled && $currentGame.started}
        handleTrade={() => handleTrade(suit, 'sell', sell)}
    />
        <!-- active={localGame.started && canTrade[role]} -->
</div>
<div class="set inner-column"></div>