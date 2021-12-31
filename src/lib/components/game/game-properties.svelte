<div class="game-properties flex">
    <div class="game-round flex fd-col">
        <p>Round</p>
        <p>{round}/33</p>
    </div>
    <div class="game-players flex jc-end">
        <Players players={players} />
    </div>
</div>

<script lang="ts">
    import { makeGamePlayersAsObject } from "$lib/helpers";
    import Players from "./players.svelte";
    export let round: number | null = 0
    export let players = makeGamePlayersAsObject()
</script>

<style>
    .game-properties {
        width: 100%;
    }
    .game-players {
        position: fixed;
        top: 35px;
        right: 8vw;
    }
</style>