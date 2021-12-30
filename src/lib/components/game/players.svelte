<div class="game-players flex">
    <div class="player-roles">
        <!-- <SuitIcon suit={suit} /> -->
        {#each roleKeys as role}
            <div class="player-role-icon flex fd-col">
                <div class="suit-wrapper flex">
                    <SuitIcon suit={role} />
                </div>
                <p> {$gamePlayers[role].player_name || 'Unassigned'} </p>
            </div>
        {/each}
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
    import { 
        // defaultGamePlayers, 
        gamePlayers 
    } from "$lib/state";
    // $:players = $gamePlayers
    // players
</script>

<style>
    :root {
        --size: 40px;
    }
    .game-players {
        width: auto;
        height: auto;
    }

    .player-roles {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 10px;
    }

    .suit-wrapper{
        height: var(--size);
        width: var(--size);
        border: solid thin;
        border-radius: var(--size);
    }

    p {
        margin: 8px 0 0;
        font-size: 0.6em;
        opacity: 0.5;
        font-weight: 100;
    }
</style>