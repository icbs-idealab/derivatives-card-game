<main data-ui-mode={ui}>
    {#if $authChecked && $gameChecked}
        <RedirectHandler>
            <slot />
        </RedirectHandler>
    {:else}
        <div class="checking-auth flex">
            <LoadingText loadingText="Authenticating" />
        </div>
    {/if}

    <!-- user details -->

    {#if $page.path !== '/admin'}
        <div class="user-details">
            <div class="current-game flex jc-start">
                {#if activeGame.game_id}
                    <p>Game ID: 
                        <span><b id="target">{activeGame.game_id}</b></span>
                    </p>
                {/if}
                <!-- <div 
                    class="copy-icon" 
                    data-hide={!activeGame.game_id}
                    style="margin-left: 10px;"
                    data-clipboard-target="#target"
                >
                    <Icon icon="copy" />
                </div>
                <div class="copied" data-show={showCoppied}>Copied!</div> -->
            </div>
            {#if activeUser.email}
                <div class="current-user">
                    <!-- <p>UID: <span>{activeUser.id}</span> </p> -->
                    <p style="font-size: 9.75pt;">Email: <span>{activeUser.email}</span> </p>  
                    <p style="font-size: 9.75pt;">Player ID : <span>{activeUser.id}</span> </p>  
                </div>
            {/if}
        </div>
    {/if}

    {#if $showGameRules}
        <AppRules />
    {/if}

    <!-- game menu -->

    {#if activeUser && activeUser.id}
        <AppMenu 
            hasGame={activeUser.user_metadata.game_id}
            game={activeGame}
            isAuthenticated={activeUser.id !== null}
            inRevealPhase={false}
        />
    {/if}

    <!-- end game modal -->

    {#if $showEndGameModal}
        <EndGameModal />
    {/if}

    {#if $showArchivesModal}
        <AppArchiveModal />
    {/if}

    {#if $showAppMessage}
        <AppErrorMessage />
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
    import { getReveals, hasAll, Logger, redirect } from "$lib/helpers";
    import { currentUser, passwordUpdated, reloadAfterRedirect, serverSubscriptions, showEndGameModal, showGameRules, showLoadingModal, showPasswordUpdater, authChecked, showAppMessage, appMessage, gameChecked, showArchivesModal, gamePlayers, currentGame} from "$lib/state";
    import { afterUpdate, onMount } from "svelte";
    import LoadingModal from '$lib/components/app/loading-modal.svelte';
    import { page } from '$app/stores';
    import type { AppGame, SuitReveals, SupabaseUser } from '$lib/types';
    import { defaultGame, playerRevealRounds } from '$lib/constants';
    import { browser } from '$app/env';
    import EndGameModal from '$lib/components/app/end-game-modal.svelte';
    import AppRules from '$lib/components/app/app-rules.svelte';
    // import UpdatePassword from '$lib/components/auth/update-password.svelte';
    // import ClipboardJS from 'clipboard'
    // import Icon from '$lib/components/icon/icon.svelte';
    import AppErrorMessage from '$lib/components/app/app-error-message.svelte';
    import AppArchiveModal from '$lib/components/app/app-archive-modal.svelte';
    import LoadingText from '$lib/components/app/loading-text.svelte';
    import { get } from 'svelte/store';

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
    let showCoppied = false

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
            console.log('path is: ', $page.path)
            activeUser = {id: null, user_metadata: {}}
            $page.path !== "/" && $page.path !== "/admin" && $page.path !== "/reset-password" && $authChecked && redirect('/')
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
            Logger([`<_layout> detected a user change: `, userUpdate])
            // handleNewData(userUpdate, isSame)

            if(userUpdate.id){
                let updatedPassword = !$passwordUpdated && await isPasswordUpdated(userUpdate)
                Logger(['$$pwd updated: ', updatedPassword])
                if(!updatedPassword){
                    updateLocalUser(userUpdate)
                    Logger(['$$pwd will show password updater'])
                    Logger(['$$was auth checked? ', $authChecked])
                    // $authChecked && !$showPasswordUpdater && showPasswordUpdater.set(true)
                    $authChecked && !$showPasswordUpdater && redirect('/update-password')
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
                    Logger([`_layout:: updating layout's local game: `, game])
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

    let revealRoundState: SuitReveals = getReveals(get(gamePlayers), activeGame)
    $:showRevealRound = playerRevealRounds[activeGame.round] && !hasAll(revealRoundState)

    onMount(() => {
        watch()
    })

    let nonRedirectPaths = ['/', '/admin', '/update-password', '/reset-password', '/account-verified']

    afterUpdate(() => {
        if(authChecked && !activeUser.id && nonRedirectPaths.indexOf($page.path) === -1){
            Logger(['afterUpdate() triggered'])
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

    /* .checking-auth h1 {
        font-size: 1.28em;
        font-weight: 100;
    } */

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

    /* [data-hide="true"] {
        opacity: 0!important;
    }

    .copied {
        position: absolute;
        right: 0;
        top: 0;
        background: lightgray;
        border-radius: 4px;
        padding: 4px;
        font-size: 0.8em;
        transition: all .2s ease;
        opacity: 0;
        z-index: 5;
        width: 40px;
        cursor: pointer;
        user-select: none;
    }

    .copied[data-show="true"] {
        right: -60px;
        opacity: 1;
    } */
    /* .user-details span {
        font-weight: 300;
        color: black!important;
    } */
</style>