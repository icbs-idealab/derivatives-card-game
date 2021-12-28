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
        <ul class="lobby-details">
            <li>waiting for game data</li>
            <li>exists: {exists}</li>
            <li>game id: {$currentGame.game_id}</li>
            <li>Playable: {playable}</li>
            <li>In Lobby: {inLobby}</li>
        </ul>
        <Lobby />
    {/if}
    <!-- else -->
</div>

<style>
    .lobby-details {
        display: grid;
        grid-auto-columns: auto;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
        position: fixed;
        top: 125px;
        left: 45px;
    }
    
    li {
        font-size: 0.8em;
    }

</style>