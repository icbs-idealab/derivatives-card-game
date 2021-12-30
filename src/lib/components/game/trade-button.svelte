<script lang="ts">
    export let value: number = 48;
    export let label: string = 'label';
    export let type: string = ''
    export let active: boolean = true
    export let trade: () => void = () => {console.log('clicked trade')}
    function beforeTrade(){
        console.log('before trade')
        active && trade()
    }
</script>

<div 
    class="trade-button value-container" 
    data-type={type} 
    data-active={active} 
    on:click={beforeTrade}
    >
    <div class="value flex fd-col">
        <span class="label">{label}</span>
        <p>{value}</p>
    </div>
    <!-- <div class="positioning-box"></div> -->
</div>

<style>
    .trade-button {
        background: var(--blue)!important;
        /* border: solid 1px rgba(175, 175, 175, 0.5); */
        width: 100%;
        height: 100%;
        border-radius: 6px;
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: 1fr;
    }

    .trade-button[data-active="false"],
    .trade-button:not([data-active="true"]) {
        background: gray!important;
        opacity: 0.75!important;
    }

    .trade-button:hover {
        box-shadow: var(--dm-container-shadow);
        opacity: 0.9;
    }

    .value {
        font-size: 1.25em;
        color: white;
    }

    .value p {
        margin: 0;
        line-height: 0.75;
    }

    .value span {
        text-align: center;
    }

    .value .label {
        font-size: 50%;
        line-height: 1;
        opacity: 0.5;
        color: white;
    }

    /* .positioning-box {
        height: 100%;
        width: 35px;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        grid-gap: 3px;
        padding: 5px;
    }

    .positioning-box:after {
        content: "";
        background: rgba(200, 200, 200, 0.1);
        height: 100%;
        width: 100%;
    } */
</style>