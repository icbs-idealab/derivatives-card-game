<script lang="ts">
    export let name: string = ''
    export let symbol: string = '&clubs'
    export let active: boolean = false
</script>

<div class="market-selector flex jc-between" data-active={active}>
    <div class="symbol">{@html symbol + ';'}</div>
    <p class="market-name">{name}</p> 
</div>

<style>
    .market-selector {
        min-width: 180px;
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        position: relative;
        border: solid thin;
        cursor: default;
    }

    /* .market-selector[data-active="false"] .market-name */
    .market-selector[data-active="false"] .symbol {
        opacity: 0.15;
    }

    .market-selector[data-active="false"] .market-name {
        opacity: 0.5;
        font-weight: 100;
    }

    .market-selector[data-active="true"]:before {
        content: "";
        border: solid 1px var(--dm-light);
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: 6px;;
    }

    p {
        margin: 0;
        font-size: 0.775em;
        font-weight: 100;
        text-transform: capitalize;
    }
</style>