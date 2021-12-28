<script lang="ts">
    import type { SuitName } from '$lib/types';
    let config = {
        clubs: {
            symbol: '&clubs;',
            color: 'var(--dm-dark)',
        },
        spades: {
            symbol: '&spades;',
            color: 'var(--dm-dark)',
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

    export let suit: SuitName = 'clubs'
    export let size: number = 16
    let symbol = config[suit].symbol

</script>

<div class="suit flex" style={`font-size: ${size}px; color: ${ config[suit].color };`}>
    {@html symbol}
</div>

<style>
    .suit {
        cursor: default;
        margin: 0;
        padding: 0;
        /* text-shadow: -0.5px -0.5px blueviolet; */
    }
</style>