<script lang="ts">
    import type { SuitName } from '$lib/types';
    let config = {
        clubs: {
            symbol: '&clubs;',
            color: 'var(--dm-white)',
        },
        spades: {
            symbol: '&spades;',
            color: 'var(--dm-white)',
        },
        diamonds: {
            symbol: '&diams;',
            color: 'var(--red)',
        },
        hearts: {
            symbol: '&hearts;',
            color: 'var(--red)',
        },

    } 
    export let active: boolean = true
    export let name: SuitName = 'clubs'
    export let height: string = '60px'
    export let width: string = '100%'
    // let color: string = active ? config[name].color : 'var(--dm-mid)'
    $:color = active ? config[name].color : 'var(--dm-mid)' as string
    $:opacity = active ? 1 : 0.1
    let symbol = config[name].symbol

</script>

<div class="suit flex" data-active={active} style={`height: ${height}; width: ${width}`}>
    <h1 style={`color: ${color}; opacity: ${opacity};`} class="symbol">
        {@html symbol}
    </h1>
</div>

<style>
    .suit {
        padding: 10px;
        margin: 5px;
        border: solid thin gray;
        border-radius: 5px;
        height: 60px;
        width: 100%;
        cursor: default;
    }


    .suit:not([data-active="true"]){
        border-color: rgba(40, 40, 40, 0.75)!important;
    }

    .symbol {
        font-size: 0.9em;
        margin: 0;
        text-shadow: 0.1px 1px var(--dm-light);
    }

    .suit:hover h1 {
        opacity: 0.5!important;
    }
</style>