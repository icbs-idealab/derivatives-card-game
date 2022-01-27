<script>
    import Icon from "../icon/icon.svelte";
import Tooltip from "./tooltip.svelte";
</script>

<div class="section-labels">
    <div class="section-label">
        <p class="column-title">Markets</p>
        <Tooltip 
            value="This is where you can buy or sell contracts in different markets" 
        />
            
    </div>
    <div class="section-label">
        <p class="column-title">Inventory</p>
        <div class="column-labels">
            <span></span>
            <p>My Contracts</p>
            <p>My Cards</p>
        </div>
        <Tooltip 
            value="This is private information which no other players can see" 
        />  
    </div>
    <div class="section-label">
        <p class="column-title">Deck</p>
        <div class="column-labels">
            <span></span>
            <p>Revealed</p>
            <p>Total</p>
        </div>
        <Tooltip
            value="This is public information and displays all revealed cards. Numbers in bold indicate a card has been revealed in the current round"
        />
    </div>
    <div class="section-label">
        <p class="column-title">Trades</p>
        <!-- <Icon icon="info" /> -->
        <!-- <div class="tooltip">
            This shows up to the last 20 trades
        </div> -->
        <Tooltip
            value="This shows up to the last 10 trades"
        />
    </div>
</div> 

<style>

    .column-title {
        font-size: 1em!important;
    }

    .column-labels {
        position: absolute;
        top: calc(100% + 20px);
        width: 100%;
        display: grid;
        grid-template-columns: 50px 1fr 1fr;
        gap: 5px;
        padding: 5px;
    }

    .column-labels p {
        width: 100%;
        text-align: center!important;
        font-size: 0.6em!important;
        line-height: 1.1;
    }

    .section-labels {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
        grid-gap: 15px;
        padding: 0 8vw;
        align-items: flex-start;
        position: relative;
    }

    .section-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        position: relative;
        /* opacity: 0.25; */
    }

    .section-label:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        border-bottom: dashed thin currentColor;
        opacity: 0.5;
    }

    .section-label p {
        font-size: 0.7em;
        margin: 0;
        opacity: 0.5;
    }
</style>