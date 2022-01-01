<main data-ui-mode={ui}>
    {#if authChecked}
        <RedirectHandler>
            <slot />
        </RedirectHandler>
    {:else}
        <div class="checking-auth flex">
            <h1>loading</h1>
        </div>
    {/if}

    <!-- user details -->

    <div class="user-details">
        <div class="current-game">
            <p>Game ID: <span>{activeGame.game_id || 'Not in game'}</span></p>
        </div>
        <div class="current-user">
            <p>UID: <span>{activeUser.id}</span> </p>
            <p>Email: <span>{activeUser.email}</span> </p>  
        </div>
    </div>

    <!-- game menu -->

    {#if activeUser && activeUser.id}
        <AppMenu 
            hasGame={activeUser.user_metadata.game_id}
            isAuthenticated={activeUser.id !== null}
        />
    {/if}

    {#if $showLoadingModal}
        <LoadingModal />
    {/if}
</main>

<script lang="ts">
    import '@fontsource/public-sans';
    import '@fontsource/public-sans/100.css';
    import '@fontsource/public-sans/200.css';
    import '@fontsource/public-sans/300.css';
    import '@fontsource/public-sans/400.css';
    import '@fontsource/public-sans/600.css';
    import { getAndWatchGame, getAuthenticatedUser } from "$lib/actions";
    import AppMenu from "$lib/components/app/app-menu.svelte";
    import RedirectHandler from "$lib/components/util/redirect-handler.svelte";
    import { redirect } from "$lib/helpers";
    import { currentGame, currentUser, reloadAfterRedirect, serverSubscriptions, showLoadingModal } from "$lib/state";
    import { afterUpdate, onMount } from "svelte";
    import LoadingModal from '$lib/components/app/loading-modal.svelte';
    import { page } from '$app/stores';
    import type { AppGame, SupabaseUser } from '$lib/types';
    import { defaultGame } from '$lib/constants';
    import { get } from 'svelte/store';
    import { browser } from '$app/env';

    // let subs = get(serverSubscriptions)
    $:ui = 'light'
    let authChecked = false
    let activeUser: Partial<SupabaseUser>  = {
        id: null, 
        user_metadata: {
            game_id: null,
            player_name: null,
            role: null,
        }
    }

    let activeGame: Partial<AppGame> = {...defaultGame}
    let watchingGame = null

    function watch(){
        currentUser.subscribe( async userUpdate => {
            let a = JSON.stringify({
                id: userUpdate.id,
                meta: userUpdate.user_metadata,
            })
            let b = JSON.stringify({
                id: activeUser.id,
                meta: activeUser.user_metadata,
            })
            
            let sameData = a === b
            
            console.log(`<_layout> detected a ${sameData ? 'same' : 'different'} user: `, userUpdate)
            
            if(userUpdate.id){
                // userUpdate.user_metadata.game_id && watchGame(userUpdate.user_metadata.game_id)
                console.log( 'server subs: ', $serverSubscriptions.game )
                userUpdate.user_metadata.game_id && !$serverSubscriptions.game && getAndWatchGame(userUpdate.user_metadata.game_id)
                !sameData && (activeUser = userUpdate)
                $page.path === "/" && userUpdate.user_metadata.game_id && redirect('/game')
            }
            else{
                activeUser = {id: null, user_metadata: {}}
                $page.path !== "/" && authChecked && redirect('/')
            }

            !authChecked && (authChecked = true)
        })

        currentGame.subscribe(game => {
            console.log('_layout:: got game subscription: ', game)
            if(game && game.game_id){
                if(
                    activeGame.game_id !== game.game_id
                    || activeGame.id !== game.id
                    || activeGame.round !== game.round
                    || activeGame.started !== game.started
                    || activeGame.ended !== game.ended
                    || JSON.stringify(activeGame.deck) !== JSON.stringify(game.deck)
                ){
                    console.log('_layout:: udpating layouts local game: ', game)
                    activeGame = {...game}
                }
                else{
                    console.log('got new game data but was identical to local data. will not update')
                }
            }
            else {
                activeGame = {...defaultGame}
            }
        })

        reloadAfterRedirect.subscribe(shouldReload => {
            console.log('should reload: ', shouldReload)
            if(shouldReload){
                browser && location.reload()
            }
        })
    }

    onMount(() => {
        watch()
    })

    afterUpdate(() => {
        if(authChecked && !activeUser.id && $page.path !== '/'){
            redirect('/')
        }
    })

</script>

<style>
    .checking-auth {
        height: 100vh;
        width: 100vw;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 5vw;
    }

    .checking-auth h1 {
        font-size: 1.28em;
        font-weight: 100;
    }

    .user-details {
        position: fixed;
        top: 35px;
        left: 8vw;
    }

    .user-details p {
        font-size: 0.8em;
        font-weight: 300;
        color: var(--dm-mid)!important;
    }

    /* .user-details span {
        font-weight: 300;
        color: black!important;
    } */
</style>