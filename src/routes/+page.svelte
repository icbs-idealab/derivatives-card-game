<script lang="ts">
    import Authenticate from "$lib/components/auth/authenticate.svelte"
    import GameGraphic from '$lib/components/game/graphic.svelte'
    import GameFinder from '$lib/components/game/game-finder.svelte'
    import { currentUser } from "$lib/state";
</script>

<div class="page-wrapper" id="auth">
    <div class="auth-and-graphic flex fd-col">
        <div class="g-graphic">
            <GameGraphic />
        </div>
        {#if $currentUser && $currentUser.id}
            <div class="a">
                <GameFinder />
            </div>
            {:else}
            <div class="auth-container">
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
    
    .g-graphic {
        position: relative;
        z-index: 0;
        margin-bottom: 40px;
    }
    .auth-container {
        position: relative;
        z-index: 1;
    }
</style>