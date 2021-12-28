<script lang="ts">
    import Authenticate from "$lib/components/auth/authenticate.svelte"
    import GameGraphic from '$lib/components/game/graphic.svelte'
    import GameFinder from '$lib/components/game/game-finder.svelte'
    import { currentUser } from "$lib/state";
</script>

<div class="page-wrapper" id="auth">
    <div class="graphic-container flex">
        <div class="g">
            <GameGraphic />
            <!-- <div class="game-graphic"></div> -->
        </div>
        {#if $currentUser && $currentUser.id}
            <div class="a">
                <GameFinder />
                <!-- <div class="game-finder flex">
                    <h1>Game Finder</h1>
                </div> -->
            </div>
            {:else}
            <div class="a">
                <Authenticate />
            </div>
        {/if}
    </div>
</div>

<style>
    .page-wrapper {
        padding-top: 80px;
        min-height: 100%;
        position: relative;
    }
    
    .g {
        position: absolute;
        z-index: 0;
        top: 80px;
    }
    .a {
        margin-top: 180px;
        position: relative;
        z-index: 1;
    }
</style>