<Backdrop>
    <div class="content flex">
        <div class="modal-content flex fd-col ai-start">
            <h1>Error</h1>
            <p>{message.message}</p>
            <p>{message.errorMessage}</p>
            <div class="game-buttons auto-grid">
                <button on:click={close}>
                    Okay
                </button>
            </div>
        </div>
    </div>
</Backdrop>

<style>
    .content {
        height: 100%;
        width: 100%;
    }

    .modal-content {
        background: lightgray;
        padding: 30px;
        border-radius: 8px;
        width: 550px;
    }

    h1 {
        font-size: 1.6em;
        margin: 0 0 25px;
    }

    p {
        margin: 0 0 20px;
    }

    button {
        padding: 16px;
        border-radius: 8px;
        border: none;
        font-size: 1em;
        font-weight: 300;
    }

    button {
        background: var(--dm-dark);
        color: white;
    }

</style>

<script lang="ts">
    import { setShowAppMessage, showMessage } from "$lib/actions";
    import { defaultErrorMessage } from "$lib/constants";
    import { Logger } from "$lib/helpers";
    import { appMessage } from "$lib/state";
    import Backdrop from "./backdrop.svelte";
    
    $:message = $appMessage

    function close(){
        setShowAppMessage(false)
        showMessage(defaultErrorMessage)
    }
</script>