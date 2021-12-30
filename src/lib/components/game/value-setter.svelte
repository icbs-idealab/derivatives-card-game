<script lang="ts">
    export let localBuy: number = 0
    export let localSell: number = 0
    export let gameBuy: number = 0
    export let gameSell: number = 0
    // import maxSpread from game settings
    export let maxSpread = 4;
    export let submit = () => console.log('<ValueSetter /> submit()');
    export let showMaxSpreadWarning = () => {
        console.log('would show max spread warning')
    }

    let handler = () => {
        // console.log('setting!')
        canTrade ? 
            submit()
            : showMaxSpreadWarning()
    }

    $:sellValue = localSell !== null ? localSell : gameSell
    $:buyValue = localBuy !== null ? localBuy : gameBuy
    $:isDiff = () => sellValue !== buyValue
    $:diffValue = () => Math.abs(sellValue - buyValue)
    $:canTrade = isDiff() && diffValue() < maxSpread

    // afterUpdate(() => {
    //     console.table({
    //         isDiff: isDiff(),
    //         diffValue: diffValue(),
    //         canTrade,
    //     })
    // })
</script>

<div class="value-setter flex" data-diff={canTrade} on:click={handler}>
    <p>Set</p>
</div>

<style>
    .value-setter{
        background: lightgray;
        color: gray;
        text-transform: uppercase;
        height: 100%;
        width: 100%;
        border-radius: var(--button-border-radius);
    }
    
    [data-diff="true"]{
        background: var(--green);
        color: white;
    }
</style>