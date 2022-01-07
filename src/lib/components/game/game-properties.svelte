<div class="game-properties flex ai-stretch">
    <div class="game-round flex fd-col jc-start">
        {#if !endState}
            <p>Round</p>
            <p>{round}/33</p>
        {:else}
            <p class="text-2">{endState}</p>
        {/if}
    </div>
    <div class="game-players flex jc-end">
        <Players players={players} />
    </div>
</div>

<script lang="ts">
    import { makeGamePlayersAsObject } from "$lib/helpers";
    import type { GameEndState } from "$lib/types";
    import Players from "./players.svelte";
    export let round: number | null = 0
    export let endState: GameEndState = ''
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