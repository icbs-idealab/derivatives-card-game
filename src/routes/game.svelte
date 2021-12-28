<script lang="ts">
    import Lobby from "$lib/components/game/lobby.svelte";
    import { currentGame, currentUser } from "$lib/state";
    import { onMount } from "svelte";
    let exists = false
    let playable = false
    let inLobby = false

    currentGame.subscribe(game => {
        exists = game.game_id !== ""
        playable = game.started && !game.ended
        inLobby = !game.started && !game.ended
    })

    // onMount(() => {
    //     watch()
    // })
</script>

<div class="page-wrapper">
    <!-- <h1>{$currentGame.game_id}</h1> -->
    <!-- if authed -->
    {#if playable}
        <div class="game-wrapper">
            <h3>A game is available</h3>
            <h1>{$currentGame.game_id}</h1>
        </div>
    {:else}
        <div class="">
            <div class="is-loading"></div>
            <p>waiting for game data</p>
            <p>exists: {exists}</p>
            <p>game id: {$currentGame.game_id}</p>
            <p>Playable: {playable}</p>
            <p>In Lobby: {inLobby}</p>
        </div>
        <!-- <Lobby /> -->
    {/if}
    <!-- else -->
</div>