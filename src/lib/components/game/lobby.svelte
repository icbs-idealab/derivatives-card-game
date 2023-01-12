<script lang="ts">
    import LobbyPlayerSelector from "$lib/components/game/lobby-player-selector.svelte";
    import { assignGamePlayers, getAndWatchLobby, getAndWatchPlayers, startGame } from "$lib/actions";
    // import Players from "$lib/game/players.svelte";
    // import { roleKeys } from "$lib/../constants";
    import { currentUser, gamePlayers, lobby, lobbyRequirements, currentGame } from "$lib/state";
    import SuitIcon from "$lib/components/suit/suit-icon.svelte";
    import { setLoadingModal } from "$lib/actions";
    import { allRoleNames, bots, roleKeys } from "$lib/constants";
    import { Logger, makeGamePlayers } from "$lib/helpers";
    import { get } from "svelte/store";
    import Icon from "../icon/icon.svelte";
    import type { AppGame, LobbyPlayerBasicInfo, SuitName } from "$lib/types";
	import { afterUpdate } from "svelte";

    export let adminId: string = ''
    export let haveRequiredRoles: boolean = false;
    let localLobby: {user_id: string, game_id: string, player_name: string}[] = []
    let localGamePlayers = $gamePlayers
    let localUser = $currentUser


    // filtered list of players that should be included in the player selection list
    let selectedRoles: {[index: string]: any} = {
        clubs: null,
        diamonds: null,
        hearts: null,
        spades: null,
    }

    $:allSelected = selectedRoles.clubs 
        && selectedRoles.diamonds
        && selectedRoles.hearts
        && selectedRoles.spades

    // $:allAssigned = $gam

    $:filtered = localLobby.filter(l => {
        return JSON.stringify($gamePlayers).indexOf(l.user_id) === -1
            && JSON.stringify(selectedRoles).indexOf( l.user_id ) === -1 
    })

    let listReady = false

    function selectUser(selected: any, role: string){
        selectedRoles[role] = selected
        Logger(['Just selected User: ', selected])
        Logger(['Game Users are now: ', selectedRoles])
    }


    function selectBot(targetRole: SuitName){
        let bot = {...bots[targetRole]}
        let gameId = $currentGame.game_id
        gameId && (bot.game_id = gameId)
        bot.game_id && (selectedRoles[targetRole] = bot)
        
        Logger(['Just assigned bot to roel: ', targetRole])
        Logger(['Game players are now: ', selectedRoles])
    }

    const lobbySubscription = lobby.subscribe(newLobbyData => {
        Logger(['got new lobby data: ', newLobbyData])
        if(newLobbyData && typeof newLobbyData.map === 'function'){
            let ids: any[] = []
            let users: any[] = []
            newLobbyData.map(player => {
                if( ids.indexOf(player.user_id) === -1 ){
                    ids.push(player.user_id)
                    users.push(player)
                }
            })
            localLobby = users
        }
    })

    // user checked and updated in layout component
    currentUser.subscribe(newUserData => {
        localUser = newUserData
        // with new data, can find game players
        
        if(newUserData.user_metadata && newUserData.user_metadata.game_id){
            // with new data, can watch player lobby
            getAndWatchLobby( newUserData.user_metadata.game_id )

            // with new data, can watch player lobby
            // getAndWatchPlayers( newUserData.user_metadata.game_id )
        }
    })
    

    lobbyRequirements.subscribe(lobbyReq => {
        Logger(['lobby-req: ', lobbyReq])
        if(lobbyReq.gamePlayers && lobbyReq.lobbyPlayers){
            // can now properly render player selection list
            listReady = true
            setLoadingModal(false)
        }
    })

    let adminRole = {
        role: "",
        user_id: "",
        player_name: "",
        game_id: "",
    }

    $:isAdmin = localUser.id && localUser.id === adminId

    gamePlayers.subscribe(newGamePlayers => {
        Logger(['got new game players in <Lobby /> ', newGamePlayers])
        
        for(let gamePlayer in newGamePlayers){
            if(newGamePlayers[gamePlayer].is_admin){
                adminRole = {
                    role: gamePlayer,
                    user_id: newGamePlayers[gamePlayer].user_id,
                    player_name: newGamePlayers[gamePlayer].player_name,
                    game_id: newGamePlayers[gamePlayer].game_id
                }

                selectedRoles[gamePlayer] = {...adminRole}
            }
        }
    })

    function submit(){
        setLoadingModal(true)
        // create object representing player role assignments
        let assingments = {...localGamePlayers}
        Logger(['Got initial assignments: ', {...assingments}])
        Logger(['Got local lobby: ', localLobby])
        Logger(['Got selected roles: ', selectedRoles])

        let assignedPlayers: string[] = []
        let pool = Array.from(localLobby)

        for(let role in selectedRoles){
            // selectedRoles[role]
            let currentRoleAssignment = assingments[role].user_id
            
            console.log('$debug: ', currentRoleAssignment)

            // for admin player currentRoleAssignment has a value
            if(!currentRoleAssignment){
                assingments[role].user_id = selectedRoles[role].user_id
                assingments[role].player_name = selectedRoles[role].player_name
                let indexInPool = pool.findIndex(poolPlayer => poolPlayer.user_id === selectedRoles[role].user_id)
                if(indexInPool > -1){
                    Logger(['splicing player with role at index: ', indexInPool, ' selected player: ', selectedRoles[role].user_id])
                    pool.splice(indexInPool, 1)
                    Logger(['pool after splice: ', [...pool]])
                }
            }
        }

        // speculators cannot have assignments. no need to check for matching role
        pool.forEach((poolPlayer, index) => {
            Logger(['$debug setting speculator with pool index: ', index])
            Logger(['$debug pool player: ', poolPlayer])
            // 
            let role = 'speculator' + (index + 1)
            if(poolPlayer.user_id && poolPlayer.player_name){
                assingments[role].user_id = poolPlayer.user_id
                assingments[role].player_name = poolPlayer.player_name
            }
        })

        let assignmentArray = []
        for(let role in assingments){
            assingments[role].user_id && assignmentArray.push(assingments[role])
        }

        Logger(['$debug assignments: ', assingments])
        Logger(['$debug pool: ', pool])

        assignGamePlayers(localUser.user_metadata.game_id, assignmentArray as any)
        .catch(err => {
            Logger(['$debug error assigning players: ', err])
        })
        .finally(() => {
            setLoadingModal(false)
        })
    }

    afterUpdate(() => {
        Logger([
            'filtered players are: ',
            filtered
        ])
        Logger([
            'unfiltered lobby is: ',
            localLobby
        ])
    })
</script>

<div class="lobby flex fd-col">

    <div class="flex jc-between" style="width: 800px;">
        <h1>Lobby</h1>
        <div class="players flex jc-end">
            {#each localLobby as player}
                <div class="pending-player flex fd-col">
                    <div class="pp-icon">☻</div>
                    <div class="pp-name">
                        {player.player_name}
                    </div>
                </div>
            {/each}
            {#if adminRole.player_name}
                <div class="pending-player flex fd-col">
                    <div class="pp-icon flex">
                        👑
                    </div>
                    <!-- <div class="pp-icon" style="color: var(--blue);">☻</div> -->
                    <div class="pp-name">
                        {adminRole.player_name}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <div class="details flex jc-between ai-start">
        <div class="detail-group left">
            <p class="detail-label">Instructions</p>
            <p class="detail-value">Assign 4 players a role using the selectors below.</p>
        </div>
        <div class="detail-group right">
            <p class="detail-label">Game ID</p>
            <p class="detail-value">{localUser.user_metadata && localUser.user_metadata.game_id}</p>
        </div>
    </div>

    <div class="lobby-player-selectors">
        {#each roleKeys as role}
            <div class="lobby-selector">
                <div class="symbol flex">
                    <SuitIcon 
                        suit={role}
                        size={30}
                    />
                </div>
                <div class="selector-main" data-is-admin={isAdmin} data-admin={adminRole.role}>
                    {#if listReady && isAdmin && adminRole.role !== role}
                        <LobbyPlayerSelector
                            players={filtered} 
                            select={selectUser}
                            selectedPlayer={selectedRoles[role]}
                            role={role}
                            selectBot={() => selectBot(role)}
                        />
                    {:else if adminRole.role === role && listReady}
                        <div class="current-player flex is-admin">
                            <p>{adminRole.player_name}</p>
                        </div>
                    {:else if listReady}
                        <div class="current-player flex">
                            {#if selectedRoles[role]}
                                <p>{selectedRoles[role].player_name}</p>
                            {:else}
                                <p> None </p>
                            {/if}
                        </div>
                    {:else}
                        <div class="is-loading"></div>
                    {/if}
                    <!-- <div class="is-loading"></div> -->
                </div>
            </div>
        {/each}
    </div>

    <div class="lobby-controls flex jc-end ai-end">
        {#if isAdmin && !haveRequiredRoles}
            <button 
                class="submit-button" 
                disabled={!allSelected}
                on:click={submit}
                >
                Assign Players
            </button>
            <!-- <button 
                class="submit-button" 
                disabled={!haveRequiredRoles}
                on:click={start}
                >
                Start Game
            </button> -->
        {:else}
        <div class="waiting">
            <p>Waiting for game to start.</p>
            <div class="loading-bar flex jc-end">
                <div class="is-loading"></div>
            </div>
        </div>
        {/if}
    </div>

</div>

<style>
    .lobby {
        height: 100%;
        width: 100%;
        padding: 15vw;
    }

    .lobby h1 {
        margin: 0;
    }

    .pending-player {
        position: relative;
        margin-left: 15px
    }

    .is-admin {
        position: absolute;
        bottom: 42px;
        left: -1px;
        right: 0;
        height: 18px;
        width: 42px;
        display: inline-flex!important;
    }

    .pp-icon {
        font-size: 2em;
        margin: 0 0 8px;
        height: 36px;
        width: 36px;
        color: var(--dm-lighter)
    }

    .pp-name {
        font-size: 0.7em;
    }

    .lobby-player-selectors {
        width: auto;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        /* grid-template-rows: repeat(1fr 1fr); */
        grid-gap: 10px;
    }

    .lobby-selector  {
        width: 400px;
        height: 100px;
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: 0;
        background: rgb(235, 235, 235);
        border: solid thin lightgray;
        box-shadow: var(--lm-container-shadow);
        border-radius: 6px;
        cursor: default;
    }

    .selector-main {
        position: relative;
    }

    .is-loading, .current-player {
        height: calc(100% - 10px);
        width: calc(100% - 5px);
        top: 5px;
        border: solid thin rgba(210, 210, 210, 0.5);
        border-radius: 4px;
    }

    .current-player {
        position: relative;
    }

    .loading-bar {
        margin-top: 5px;
        height: 8px;
        width: calc(100% + 20px);
        position: relative;
        left: -20px;
    }

    .details {
        width: 800px;
        padding: 50px 0;
    }

    .detail-group.right p {
        text-align: right;
    }

    .detail-group p:first-child {
        font-size: 0.7em;
        opacity: 0.5;
    }

    .lobby-controls {
        padding: 50px 0;
        width: 800px;
    }

    button {
        background: var(--blue);
        border-radius: 4px;
        color: white;
        padding: 15px 30px;
        border: solid thin rgba(20, 80, 180, 0.6);
        box-shadow: var(--lm-container-shadow);
    }

    button:not([disabled]):hover {
        opacity: 0.9;
    }

    button[disabled]{
        background: gray;
        box-shadow: none;
        border: none;
        color: lightgray;
    }

</style>