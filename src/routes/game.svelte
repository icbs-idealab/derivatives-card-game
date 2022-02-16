<script lang="ts">
    import { endGame, getAndWatchGame, getAndWatchPlayers, getAndWatchTrades, nextRound, setFinalGameScores, setLoadingModal, startGame, updateGame } from "$lib/actions";
    import Lobby from "$lib/components/game/lobby.svelte";
    import Play from "$lib/components/game/play.svelte";
    import { allRoleNames, emptyHand, emptyReveals, emptySuits, emptySuitsBool, playerRevealRounds, roleKeys } from "$lib/constants";
    import { getRelevantTrades, getReveals, hasAll, Logger, makeGamePlayersAsObject } from "$lib/helpers";
    import { currentGame, currentUser, gamePlayers, gameTrades, noSuchGame, serverSubscriptions } from "$lib/state";
    import type { AppGame, SuitName, SuitReveals } from "$lib/types";
    import { afterUpdate, onMount } from "svelte";
    import { get } from "svelte/store";
    let exists = false
    let haveRequiredRoles = false
    let inLobby = false
    let defaultPlayers = {...makeGamePlayersAsObject()}
    let players = defaultPlayers
    let game: AppGame | null
    let trades = []
    // $:tradeCount = calculateContracts(trades)
    let contractCount = {...emptyHand}
    let watchingTrades = false
    // let watchingPlayers = false
    // let watchingPlayers = false
    let showGameRound = false
    $:playable = haveRequiredRoles && exists
    let playerRole = ''
    let currentPlayer = get(currentUser)
    let balance = 0
    let revealRoundIntervalCheck = null

    let revealRoundState: SuitReveals = getReveals(players, game)

    // function getReveals(ps, game): SuitReveals{
    //     let reveals = {...emptySuits}

    //     roleKeys.map((role) => {
    //         reveals[role] = game && game.round ? 
    //             ps[role].revealed[game.round]
    //             : ''
    //     })
    //     return reveals
    // }

    // function hasAll(state){
    //     return state.clubs
    //         && state.diamonds
    //         && state.hearts
    //         && state.spades
    // }

    // $:isRevealRound = playerRevealRounds[game.round]
    $:showRevealRound = playerRevealRounds[game.round] && !hasAll(revealRoundState)
    // let lastRevealed = {...emptySuitsBool}
    $:lastRevealed = setLastRevealed(game.round, showRevealRound)

    function setLastRevealed(round, revealRound){
        let newlyRevealed = {...emptySuitsBool}
        if(playerRevealRounds[round] && !revealRound){
            // only when player reveals have been completed
            roleKeys.forEach(role => {
                let card = players[role].revealed[round]
                if(card && !newlyRevealed[card]){
                    newlyRevealed[card] = true
                }
            })
        }
        else {
            // only when concerend with deck reveals
            let last = game.deck.revealed.length ? 
                game.deck.revealed[ game.deck.revealed.length - 1 ]
                : ""
            newlyRevealed[last] = true
        }

        return newlyRevealed
        // lastRevealed = newlyRevealed
    }

    function calculatePlayerInventory(_trades, targetRole?){
        let testRole = targetRole || playerRole
        let contracts = {...emptyHand}
        let balance = 0
        let tradeMultipliers = {
            buy: 1,
            sell: -1,
        }
        let balanceMultipliers = {
            buy: -1,
            sell: 1,
        }

        _trades.map((trade) => {
            // contracts[trade.market] += tradeMultipliers[trade.type]
            contracts[trade.market] += trade.market === testRole ?
                // invert action since player loses contract to buying player and gains from seller
                (tradeMultipliers[trade.type] * -1) 
                // else add buys, subtract sales
                : tradeMultipliers[trade.type]

            
            // balance += (balanceMultipliers[trade.type] * trade.price)
            balance += trade.market === testRole ?
                // player gains money from trades with type buy if of the same market as they are being 'sold' to the player
                (balanceMultipliers[trade.type] * -1) * trade.price
                // else affect is inverted
                : balanceMultipliers[trade.type] * trade.price
        })

        return {contracts, balance}
    }

    // admin only
    function calculateAllInventories(){

    }

    function checkRequiredRoles(players){
        let roles = {
            clubs: null,
            diamonds: null,
            hearts: null,
            spades: null,
        }

        for(let pyr in players){
            let player = players[pyr]
            if(player && player.user_id){
                player.user_id 
                    && player.player_name 
                    && (roles[player.role] = player)
            }
        }

        if(
            roles.clubs 
            && roles.diamonds
            && roles.hearts
            && roles.spades
        ){
            haveRequiredRoles = true
        }
        else{
            console.log('did not have req roles: ', roles)
        }
    }

    function calcPlayerRole(){
        let playerId = get(currentUser).id
        // console.log('calculatig player role for id: ', playerId)
        if(playerId){
            // playerRole
            for(let p in players){
                // console.log('checking for role in ', p)
                // console.log('role id is ', players[p].user_id)
                if( players[p].user_id === playerId ){
                    playerRole = p
                    break
                }
            }
        }
    }

    function countReveals(_game, _players){
        let revealed = {...emptyHand}
        _game.deck.revealed.map(card => {
            revealed[card] += 1
        })
        for(let p in _players){
            if(roleKeys.indexOf((p as any)) !== -1){
                let player = _players[p]
                for(let r in player.revealed){
                    let card = player.revealed[r]
                    if(card){
                        revealed[card] += 1
                    }
                }
            }
        }
        return revealed
    }

    $:revealed = countReveals(game, players)

    function setPlayers(newPlayers){
        Logger(['setting players locally: ', newPlayers])
        players = newPlayers
    }

    function checkGameDataDiff(newGame){
        if(
            game
            && game.game_id
            && newGame
            && newGame.game_id
        ){
            // there is a current game to compare
            return JSON.stringify(game) !== JSON.stringify(newGame)
        }
        // no game to compare, default to true
        else return true
    }

    async function watchTradesInServer(){
        const res = await getAndWatchTrades(game.game_id)
        Logger(['result of watching trades: ', res])
        watchingTrades = true
        // if(watching){
        // }
    }

    function start(){
        setLoadingModal(true)
        startGame()
            .catch(err => {
                Logger(['<game /> error starting game: ', err])
            })
            .finally(() => {
                setLoadingModal(false)
            })
    }

    async function goToNextRound(){
        setLoadingModal(true)
        // updateGame({round: game.round + 1})
        return nextRound()
        .catch(err => {
            Logger(['err loading: ', err])
            return {success: false, err}
        })
        .finally(() => {
            setLoadingModal(false)
            return {success: true}
            // return true
        })
    }

    function triggerGameRoundDisplay(){
        if(!showGameRound){
            showGameRound = true
            setTimeout(() => {
                showGameRound = false
            }, 1500)
        }
    }

    async function finalAction(_game){
        let lastRevealed = _game.deck.revealed[_game.deck.revealed.length -1]
        Logger(['last revealed: ', lastRevealed])

        // calc player scores
        let fPlayers = get(gamePlayers)
        Logger(['stringified game players: ', JSON.stringify(fPlayers)])
        Logger(['Fplayers: ', fPlayers])
        let playerResults: {[index: string]: {balance: number, contracts: any, lastRevealed: string}} = {}

        let allTrades = get(gameTrades)
        for(let player in fPlayers){
            let targetPlayer = fPlayers[player]

            let relevant = getRelevantTrades(allTrades, targetPlayer.user_id, targetPlayer.role)
            Logger(['relevant trades for player: ', relevant])
            let inventory = calculatePlayerInventory(relevant, targetPlayer.role)

            playerResults[player] = {
                balance: inventory.balance,
                contracts: inventory.contracts,
                lastRevealed,
                // final: inventory.balance + (inventory.contracts[lastRevealed] * 100)
            }


            console.table({
                role: player,
                ...playerResults[player]
            })          

        }
        // add final scores to game data column
        // setLoadingModal(true)
        setFinalGameScores(playerResults)
        .catch(err => {
            Logger(['error setting final game scores: ', err])
        })
        // .finally(() => {
        //     setLoadingModal(false)
        // })
    }

    async function archiveFinishedGame(){
        endGame()
        .then((result) => {
            Logger(['result of ending game: ', result])
        })
        .catch((err) => {
            Logger(['error ending game', err])
        })
        .finally(() => {
            Logger(['ended game!'])
            setTimeout(() => {
                setLoadingModal(false)
            }, 1000)
        })

    }

    async function finishGame(){
        setLoadingModal(true)
        
        let {data, error} = await nextRound(true)

        Logger(['$$$: end: ', data])
        Logger(['$$$: end: ', error])

        if(data && Array.isArray(data)){
            await finalAction(data[0])
            await archiveFinishedGame()
        }
        else {}
        // setLoadingModal(false)
    }

    currentGame.subscribe(newGame => {
        if(checkGameDataDiff(newGame)){
            game 
                && newGame
                && game.id 
                && newGame.round === (game.round + 1) 
                && triggerGameRoundDisplay()

            game = newGame
            
            
            if(playerRevealRounds[newGame.round]){
                revealRoundState = getReveals(players, game)
                setTimeout(() => {
                    showRevealRound = playerRevealRounds[game.round] && !hasAll(revealRoundState)
                })
                checkRevealRound(newGame, players)
            }
        }

        exists = newGame.game_id !== ""
        inLobby = !newGame.started && !newGame.ended

        if(exists){
            countReveals(newGame, players)
        }
    })


    function updateReveals(newPlayers){
        console.log('$R$ syncing reveals... ', revealRoundState)
        if(hasAll(revealRoundState)){
            clearRevealInterval()
        }
        else{
            let reveals = getReveals(newPlayers, game)
            for(let rev in reveals){
                reveals[rev] && !revealRoundState[rev] && (revealRoundState[rev] = reveals[rev])
            }
        }
    }

    function checkRevealRound(_game =  game, _players = players){
        if(playerRevealRounds[game.round]){
            console.log('$R$ state?:: ', revealRoundState)

            if(!hasAll(revealRoundState)){
                console.log('$R$ before init: ', revealRoundIntervalCheck)
                if(!revealRoundIntervalCheck){
                    console.log('$R$ no revealRound interval check')
                    updateReveals(_players)
                    // revealRoundState = getReveals(_players)
                    console.log('setting interval')
                    revealRoundIntervalCheck = setInterval(() => {
                        // revealRoundState = getReveals(_players)
                        updateReveals(_players)
                    }, 4000)
                }
                else{
                    // revealRoundState = getReveals(_players)
                    updateReveals(_players)
                }
            }
            else{
                console.log('$R$ has all:: ', revealRoundState)
                clearRevealInterval()
            }

        }
        else{
            clearRevealInterval()
            // clearInterval(revealRoundIntervalCheck)
            // revealRoundIntervalCheck = null
            // console.log('$R$ cleared interval()! ', revealRoundIntervalCheck)
        }

    }

    function clearRevealInterval(){
        clearInterval(revealRoundIntervalCheck)
        // revealRoundIntervalCheck = null
        console.log('$R$ cleared interval()! ', revealRoundIntervalCheck)
    }

    gamePlayers.subscribe(newPlayers => {
        Logger(['got game players: ', newPlayers])
        setPlayers(newPlayers)
        checkRequiredRoles(newPlayers)

        checkRevealRound(game, newPlayers)

        // if(playerRevealRounds[game.round]){
        //     console.log('$R$ state?:: ', revealRoundState)

        //     if(!hasAll(revealRoundState)){
        //         if(!revealRoundIntervalCheck){
        //             console.log('$R$ no revealRound interval check')
        //             updateReveals(newPlayers)
        //             // revealRoundState = getReveals(newPlayers)
        //             revealRoundIntervalCheck = setInterval(() => {
        //                 // revealRoundState = getReveals(newPlayers)
        //                 updateReveals(newPlayers)
        //             }, 4000)
        //         }
        //         else{
        //             // revealRoundState = getReveals(newPlayers)
        //             updateReveals(newPlayers)
        //         }
        //     }
        //     else{
        //         console.log('$R$ somehow has all?:: ', revealRoundState)
        //     }

        // }
        // else{
        //     clearInterval(revealRoundIntervalCheck)
        //     revealRoundIntervalCheck = null
        //     console.log('$R$ cleared interval()! ', revealRoundIntervalCheck)
        // }
        
        if(!playerRole){
            calcPlayerRole()
        }
    })

    gameTrades.subscribe(newGameTrades => {
        Logger(['got new game trades: ', newGameTrades])
        if(JSON.stringify(newGameTrades) !== JSON.stringify(trades)){
            Logger(['trades different, will update'])
            let usableTrades = [...newGameTrades]
            if(usableTrades.length > 10){
                usableTrades.length = 10
            }
            trades = usableTrades
        }

        let relevant = getRelevantTrades(newGameTrades, currentPlayer.id, playerRole)
        Logger(['relevant trades: ', relevant])
        let inventory = calculatePlayerInventory(relevant)
        Logger(['inventory: ', inventory])
        balance = inventory.balance
        contractCount = inventory.contracts
    })
    
    afterUpdate(() => {
        if(playable && !watchingTrades){
            Logger(['will watch all trades'])
            watchTradesInServer()
            // watchTradesLocal()
        }
        if(currentPlayer.user_metadata.game_id && playable && !$serverSubscriptions.game){
            getAndWatchGame(currentPlayer.user_metadata.game_id)
        }
        if(currentPlayer.user_metadata.game_id && !$serverSubscriptions.players){
            getAndWatchPlayers(currentPlayer.user_metadata.game_id)
        }
        if(!playerRole){
            calcPlayerRole()
        }
    })

    onMount(() => {
        Logger(['current user on mount: ', currentPlayer])
        // if(currentPlayer.id){
        //     getAndWatchPlayers(currentPlayer.user_metadata.game_id)
        //     if(currentPlayer.user_metadata.game_id){
        //         getAndWatchGame(currentPlayer.user_metadata.game_id)
        //     }
        // }
    })
</script>

<div class="page-wrapper">
    <!-- <h1>{$currentGame.game_id}</h1> -->
    <!-- if authed -->
    {#if playable}
        <div class="play-wrapper">
            <!-- <h3>A game is available</h3>
            <h1>{$currentGame.game_id}</h1> -->
            <Play
                showRevealRound={showRevealRound}
                showGameRound={showGameRound}
                haveRequiredRoles={haveRequiredRoles}
                players={players}
                game={game}
                trades={trades}
                balance={balance}
                contracts={contractCount}
                playerRole={playerRole}
                revealed={revealed}
                startGame={start}
                finishGame={finishGame}
                revealsForRound={revealRoundState}
                nextRound={goToNextRound}
                lastRevealed={lastRevealed}
                calcPlayerRole={calcPlayerRole}
                clearRevealInterval={clearRevealInterval}
            />

            <!-- <div class="div flex" style="position:fixed; top: 50px; right: 50px; font-size: 0.65em;">
                <pre>{JSON.stringify(contractCount)}</pre>
                <pre>{JSON.stringify(revealRoundState)}</pre>
                <pre>{String(showRevealRound)}</pre>
            </div> -->
        </div>
    {:else if exists && inLobby && !haveRequiredRoles}
        <Lobby 
            haveRequiredRoles={haveRequiredRoles}
            adminId={$currentGame.admin_id}
        />
    {:else if $noSuchGame}
        <div class="no-such-game flex">
            <div class="content">
                <h1 class="error-title">Error finding game.</h1>
                <h2 class="error-sub-title">You may be attempting to join a game that does not exist.</h2>
                <p>Please check (with your game admin if necessary) that the game-id used is correct and try again by clicking the 'leave game' button at the bottom of your screen.</p>
            </div>
        </div>
    {:else if exists && $currentGame.game_id && (!inLobby || !haveRequiredRoles)}
        <div class="loading-lobby flex">
            <div class="loading-lobby-inner flex fd-col">
                <h1>This Game has ended</h1>
                <p>You may still download the game data using the <b>Get Archives</b> link below.</p>
                <!-- <div class="is-loading loading-line"></div> -->
            </div>
        </div>
    {:else}
        <ul class="lobby-details">
            <li>waiting for game data</li>
            <li>exists: {exists}</li>
            <li>game id: {$currentGame.game_id}</li>
            <li>Required Roles: {haveRequiredRoles}</li>
            <li>Playable: {playable}</li>
            <li>In Lobby: {inLobby}</li>
        </ul>

        <div class="loading-lobby flex">
            <div class="loading-lobby-inner flex fd-col">
                <h1>Loading Game</h1>
                <div class="is-loading loading-line"></div>
            </div>
        </div>
    {/if}
    <!-- else -->
</div>

<style>

    .no-such-game {
        height: 100vh;
        width: 100vw;
        position: absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        padding: 10vw 15vw;
    }

    .no-such-game .content {
        width: 100%;
        max-width: 700px;
        padding: 40px;
        border-radius: 8px;
        border: solid thin lightgray;
    }

    .no-such-game .content p {
        opacity: 0.7;
    }

    .error-title {
        margin: 0 0 35px;
        width: 100%;
        color: var(--red)!important;
        font-size: 1.7em;
        font-weight: 600;
        text-align: left;
    }

    .error-sub-title {
        margin: 0 0 35px;
        width: 100%;
        text-align: left;
        font-size: 1.25em;
    }

    .loading-lobby {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .loading-lobby-inner {
        padding: 30px;
    }

    .loading-line{
        height: 4px;
        width: 300px;
    }

    .lobby-details {
        display: grid;
        grid-auto-columns: auto;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
        position: fixed;
        top: 125px;
        left: 45px;
    }
    
    li {
        font-size: 0.8em;
    }

</style>