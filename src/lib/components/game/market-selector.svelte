<div class="market-options">
    <div class="markets">
        {#each markets as market}
            <ClickWrapper handler={() => select(market)}>
                <MarketButton name={market.name} active={market.name === selected.name} />
            </ClickWrapper>
        {/each}
    </div>
</div>

<style>
    .markets {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;
    }
</style>

<script lang="ts">
    import ClickWrapper from "$lib/components/interaction/click-wrapper.svelte";
    import type { MarketButtonParameters } from "$lib/types";
    import MarketButton from "./market-button.svelte";
    export let markets: MarketButtonParameters[] = [
        {
            name: 'clubs',
            icon: '&clubs'
        },
        {
            name: 'diamonds',
            icon: '&diamonds'
        },
        {
            name: 'hearts',
            icon: '&hearts'
        },
        {
            name: 'spades',
            icon: '&spades'
        },
    ]

    export let selected: MarketButtonParameters = {
        name: 'clubs',
        icon: '&clubs',
    }

    export let onSelect = (option: MarketButtonParameters) => {}

    function select(option){
        if(onSelect){
            onSelect(option)
            console.log(selected)
        }
    }

    
</script>