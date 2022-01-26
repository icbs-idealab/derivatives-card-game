<script lang="ts">
    import SuitIcon from "$lib/components/suit/suit-icon.svelte";
    import { divBy100AsString } from "$lib/helpers";
    import type { SuitName } from "$lib/types";
    export let market: SuitName = 'clubs'
    export let type: string = 'buy'
    export let price: number = 0.43
    
    
</script>

<div class="trade">
    <div class="market flex">
        <SuitIcon suit={market} />
    </div>
    <div class="market-name flex jc-start">
        <p>{market}</p>
    </div>
    <div class="trade-type flex">
        <p>{type}</p>
    </div>
    <div class="trade-price flex" data-type={type}>
        <p>${divBy100AsString(price)}</p>
    </div>
</div>

<style>
    .trade {
        background: var(--lm-lighter);
        padding: 2px;
        display: grid;
        grid-template-columns: 30px 1fr 45px 45px;
        grid-gap: 5px;
        border-radius: 4px;
        overflow: hidden
    }

    p {
        font-size: 0.8em;
        font-weight: lighter;
    }

    .trade-price {
        text-align: center;
        color: currentColor;
        width: 100%;
        border-radius: 4px;
        background: lightgray;
    }

    [data-type="buy"]{
        background: var(--green);
    }
    [data-type="sell"]{
        background: var(--yellow);
    }
</style>