<div class="game-players flex">
    <div class="player-roles">
        <!-- <SuitIcon suit={suit} /> -->
        {#if players}
            {#each roleKeys as role}
                <div class="player-role-icon flex jc-start">
                    <div class="suit-wrapper flex">
                        <SuitIcon suit={role} size={18} />
                    </div>
                    <p> {players[role].player_name || 'Unassigned'} </p>
                </div>
            {/each}
        {/if}
    </div>
    <div class="player-speculators">
        <!-- <SuitIcon suit={suit} /> -->
        <!-- {#each roleKeys as role}
        {/each} -->
    </div>
</div>

<script lang="ts">
    import SuitIcon from "$lib/components/suit/suit-icon.svelte";
    import type { AppGamePlayers } from "$lib/types";
    import { roleKeys, speculatorKeys } from "$lib/constants";
    import { makeGamePlayersAsObject } from "$lib/helpers";
    export let players
</script>

<style>
    :root {
        --size: 25px;
    }
    .game-players {
        width: auto;
        height: auto;
    }

    .player-role-icon {
        /* border: solid thin gray; */
        background: lightgray;
        border-radius: 15px;
        /* padding-right: 5px; */
        overflow: hidden;
    }

    .player-roles {
        display: grid;
        grid-template-columns: repeat(5, auto);
        grid-gap: 10px;
    }

    .suit-wrapper{
        height: var(--size);
        /* width: var(--size); */
        /* border: solid thin gray; */
        /* background: gray; */
        margin: 0 5px 0 15px;
        padding-bottom: 2px;
        border-radius: var(--size);
    }

    p {
        margin: 0 15px 0 0px;
        font-size: 0.7em;
        opacity: 0.5;
        font-weight: 100;
    }
</style>