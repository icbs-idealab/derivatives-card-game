<Backdrop>
    <div class="content flex">
        <div class="modal-content flex fd-col ai-start">
            <h1>End Game</h1>
            <p>Are you sure you want to end the game? This will end the game for all players and is irreversible.</p>
            <div class="game-buttons auto-grid">
                <button on:click={end}>
                    Yes, <b>end game</b>
                </button>
                <button on:click={abort}>
                    No, continue game
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
        font-size: 1.4em;
        margin: 0 0 20px;
    }
    p {
        margin: 0 0 35px;
    }

    button {
        padding: 16px;
        border-radius: 8px;
        border: none;
        font-size: 1em;
        font-weight: 300;
    }
    button:first-child {
        background: var(--red);
        color: white;
    }
    button:last-child {
        background: transparent;
        border: solid thin
    }
</style>

<script lang="ts">
    import { endGame, setLoadingModal } from "$lib/actions";
    import { showEndGameModal } from "$lib/state";
    import Backdrop from "./backdrop.svelte";
    function abort(){
        showEndGameModal.set(false)
    }
    function end(){
        showEndGameModal.set(false)
        setLoadingModal(true)
        endGame()
        .then((result) => {
            console.log('result of ending game: ', result)
        })
        .catch((err) => {
            console.log('error ending game')
        })
        .finally(() => {
            console.log('ended game!')
        })
    }
</script>