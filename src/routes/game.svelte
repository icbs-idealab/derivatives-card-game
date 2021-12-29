<script lang="ts">
    import Lobby from "$lib/components/game/lobby.svelte";
    import { currentGame, currentUser, gamePlayers } from "$lib/state";
    import { onMount } from "svelte";
    let exists = false
    let haveRequiredRoles = false
    let inLobby = false
    $:playable = haveRequiredRoles && exists

    currentGame.subscribe(game => {
        exists = game.game_id !== ""
        // playable = game.started && !game.ended
        inLobby = !game.started && !game.ended
    })

    gamePlayers.subscribe(players => {
        let roles = {
            clubs: null,
            diamonds: null,
            hearts: null,
            spades: null,
        }

        for(let pyr in players){
            let player = players[pyr]
            if(player && player.user_id){
                player.user_id 
                    && player.player_name 
                    && (roles[player.role] = player)
            }
        }

        if(
            roles.clubs 
            && roles.diamonds
            && roles.hearts
            && roles.spades
        ){
            haveRequiredRoles = true
        }
    })
</script>

<div class="page-wrapper">
    <!-- <h1>{$currentGame.game_id}</h1> -->
    <!-- if authed -->
    {#if playable}
        <div class="game-wrapper">
            <h3>A game is available</h3>
            <h1>{$currentGame.game_id}</h1>
        </div>
    {:else if exists && inLobby && !haveRequiredRoles}
        <ul class="lobby-details">
            <li>waiting for game data</li>
            <li>exists: {exists}</li>
            <li>game id: {$currentGame.game_id}</li>
            <li>Playable: {playable}</li>
            <li>In Lobby: {inLobby}</li>
        </ul>
        <Lobby 
            haveRequiredRoles={haveRequiredRoles}
        />
    {:else}
        <div class="loading-lobby flex">
            <div class="loading-lobby-inner flex fd-col">
                <h1>Loading Lobby</h1>
                <div class="is-loading loading-line"></div>
            </div>
        </div>
    {/if}
    <!-- else -->
</div>

<style>
    .loading-lobby {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .loading-lobby-inner {
        padding: 30px;
    }

    .loading-line{
        height: 4px;
        width: 300px;
    }

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