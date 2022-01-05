<script>
    import Icon from "../icon/icon.svelte";
</script>

<div class="section-labels">
    <div class="section-label">
        <p>Markets</p>
        <Icon icon="info" />
    </div>
    <div class="section-label">
        <p>Inventory</p>
        <Icon icon="info" />
        <div class="column-labels">
            <span></span>
            <p>My Contracts</p>
            <p>My Cards</p>
        </div>
    </div>
    <div class="section-label">
        <p>Deck</p>
        <Icon icon="info" />
        <div class="column-labels">
            <span></span>
            <p>Revealed</p>
            <p>Total</p>
        </div>
    </div>
    <div class="section-label">
        <p>Trades</p>
        <Icon icon="info" />
    </div>
</div> 

<style>
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
    }

    .section-labels {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
        grid-gap: 15px;
        padding: 0 8vw;
        align-items: flex-start;
    }

    .section-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        position: relative;
        opacity: 0.25;
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
    }
</style>