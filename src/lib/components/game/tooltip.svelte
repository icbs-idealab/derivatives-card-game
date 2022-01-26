<div class="tooltip flex">
    <div class="interaction-wrapper flex" on:mouseenter={activate} on:mouseleave={hide}>
        <Icon icon="info" />
    </div>
    <div class="tooltip-text" data-show={show}>
        {value}
    </div>
</div>

<script lang="ts">
    import Icon from "../icon/icon.svelte";
    export let value: string = "This is a demo tooltip!"
    let show = false
    const activate = () => show = true
    const hide = () => show = false
</script>

<style>
    .tooltip {
        /* position: relative; */
        width: auto;
        height: auto;
    }

    .tooltip-text {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: black;
        border: solid thin lightgray;
        border-radius: 4px;
        padding: 15px;
        color: white;
        font-size: 0.8em;
        z-index: 100;
        visibility: hidden;
    }
    .tooltip-text[data-show="true"]{
        visibility: visible;
    }
</style>