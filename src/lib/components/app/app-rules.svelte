<script>
    import { showGameRules } from "$lib/state";
    import Backdrop from "./backdrop.svelte";
    function hideRules(){
        showGameRules.set(false)
    }
</script>
<Backdrop>
    <div class="app-rules">
    </div>
    <div class="controls flex">
        <button class="close button" on:click={hideRules}>Close Rules</button>
    </div>
</Backdrop>

<style>
    .controls {
        position: fixed;
        bottom: 40px;
        width: 100%;
        height: 80px;
        left: 40px;
        right: 40px;
    }

    .app-rules {
        position: fixed;
        top: 40px;
        bottom: 150px;
        /* width: 100%; */
        /* height: calc(100% - 150px); */
        left: 40px;
        right: 40px;
        background-color: lightgray;
    }

</style>