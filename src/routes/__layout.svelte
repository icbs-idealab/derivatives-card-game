<main data-ui-mode={ui}>
    {#if $authChecked}
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
            game={activeGame}
            isAuthenticated={activeUser.id !== null}
            isAdmin={activeUser.user_metadata.admin}
        />
    {/if}

    {#if $showGameRules}
        <AppRules />
    {/if}

    {#if $showEndGameModal}
        <EndGameModal />
    {/if}
    
    {#if $showPasswordUpdater}
        <UpdatePassword />
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
    import { checkIfPasswordChanged, getAndWatchGame, removeGameFromUserRecord, setLoadingModal } from "$lib/actions";
    import AppMenu from "$lib/components/app/app-menu.svelte";
    import RedirectHandler from "$lib/components/util/redirect-handler.svelte";
    import { Logger, redirect } from "$lib/helpers";
    import { currentGame, currentUser, passwordUpdated, reloadAfterRedirect, serverSubscriptions, showEndGameModal, showGameRules, showLoadingModal, showPasswordUpdater, authChecked} from "$lib/state";
    import { afterUpdate, onMount } from "svelte";
    import LoadingModal from '$lib/components/app/loading-modal.svelte';
    import { page } from '$app/stores';
    import type { AppGame, SupabaseUser } from '$lib/types';
    import { defaultGame } from '$lib/constants';
    import { browser } from '$app/env';
    import EndGameModal from '$lib/components/app/end-game-modal.svelte';
    import AppRules from '$lib/components/app/app-rules.svelte';
    import UpdatePassword from '$lib/components/auth/update-password.svelte';

    // let subs = get(serverSubscriptions)
    $:ui = 'light'
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

    function removeFromRecord(){
        setLoadingModal(true)
            removeGameFromUserRecord()
            .catch(err => Logger(['error removing game data from user record: ', err]))
            .finally(() => {
                redirect('/')
                setLoadingModal(false)
            })
    }

    function compareUserData(newUserData){
        let a = JSON.stringify({
                id: newUserData.id,
                meta: newUserData.user_metadata,
            })
            let b = JSON.stringify({
                id: activeUser.id,
                meta: activeUser.user_metadata,
            })
            
            return a === b
    }

    function watchRemoteGame(newUserData){
        newUserData.user_metadata.game_id && !$serverSubscriptions.game && getAndWatchGame(newUserData.user_metadata.game_id)
    }
    
    function updateLocalUser(newUserData){
        let isSame = compareUserData(newUserData)
        !isSame && (activeUser = newUserData)
    }

    function updatePath(newUserData){
        $page.path === "/" && newUserData.user_metadata.game_id && redirect('/game')
    }

    function handleNewData(newUserData){
        let isSame = compareUserData(newUserData)
        if(newUserData.id){
            // newUserData.user_metadata.game_id && watchGame(newUserData.user_metadata.game_id)
            Logger([ 'server subs: ', $serverSubscriptions.game ])
            watchRemoteGame(newUserData)
            updateLocalUser(newUserData)
            updatePath(newUserData)
        }
        else{
            activeUser = {id: null, user_metadata: {}}
            $page.path !== "/" && $authChecked && redirect('/')
        }
    }

    async function isPasswordUpdated(newUserData){
        const {data, error} = await checkIfPasswordChanged(newUserData)
        Logger(['$$pwd: ', data])
        Logger(['$$pwd error: ', error])
        return data[0]
    }

    function watch(){
        currentUser.subscribe( async userUpdate => {
            // let isSame = compareUserData(userUpdate)
            // Logger([`<_layout> detected a ${isSame ? 'same' : 'different'} user: `,] userUpdate)
            // handleNewData(userUpdate, isSame)

            if(userUpdate.id){
                let updatedPassword = !$passwordUpdated && await isPasswordUpdated(userUpdate)
                Logger(['$$pwd updated: ', updatedPassword])
                if(!updatedPassword){
                    updateLocalUser(userUpdate)
                    Logger(['$$pwd will show password updater'])
                    Logger(['$$was auth checked? ', $authChecked])
                    $authChecked && !$showPasswordUpdater && showPasswordUpdater.set(true)
                    Logger(['$$SPWU ', $showPasswordUpdater])
                }
                else{
                    $authChecked && $showPasswordUpdater && showPasswordUpdater.set(false)
                    handleNewData(userUpdate)
                }
            }
            else{
                handleNewData(userUpdate)
            }

        })

        currentGame.subscribe(game => {
            Logger(['_layout:: got game subscription: ', game])
            if(game && game.game_id){
                if(
                    activeGame.game_id !== game.game_id
                    || activeGame.id !== game.id
                    || activeGame.round !== game.round
                    || activeGame.started !== game.started
                    || activeGame.ended !== game.ended
                    || JSON.stringify(activeGame.deck) !== JSON.stringify(game.deck)
                ){
                    Logger(['_layout:: udpating layouts local game: ', game])
                    activeGame = {...game}
                    // if(game.ended){
                    //     removeFromRecord()
                    // }
                }
                else{
                    Logger(['got new game data but was identical to local data. will not update'])
                }
            }
            else {
                if(game.ended){
                    removeFromRecord()
                }
                activeGame = {...defaultGame}
            }
        })

        reloadAfterRedirect.subscribe(shouldReload => {
            Logger(['should reload: ', shouldReload])
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