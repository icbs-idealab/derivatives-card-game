<script>
import Loader from "./loader.svelte";

</script>
<div class="modal flex">
    <div class="content">
        <Loader />
    </div>
</div>

<style>
    .modal {
        position: fixed;
        z-index: 888;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: var(--modal-bg);
    }

    .content {
        border-radius: 6px;
        position: relative;
        padding: 40px;
        /* overflow-y: scroll; */
        width: auto;
        min-width: 150px;
        height: auto;
        max-width: 700px;
        max-height: 85vh;
        padding-bottom: 100px;
    }
</style>