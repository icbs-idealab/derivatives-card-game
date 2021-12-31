<script lang="ts">
    import { getAndWatchPlayers, getAndWatchTrades, nextRound, setLoadingModal, startGame, updateGame } from "$lib/actions";
    import Lobby from "$lib/components/game/lobby.svelte";
    import Play from "$lib/components/game/play.svelte";
    import { emptyHand, emptyReveals, emptySuits, emptySuitsBool, playerRevealRounds, roleKeys } from "$lib/constants";
    import { getRelevantTrades, makeGamePlayersAsObject } from "$lib/helpers";
    import { currentGame, currentUser, gamePlayers, gameTrades } from "$lib/state";
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
    let showGameRound = false
    $:playable = haveRequiredRoles && exists
    let playerRole = ''
    let currentPlayer = get(currentUser)
    let balance = 0

    let revealRoundState: SuitReveals = getReveals(players)

    function getReveals(ps): SuitReveals{
        let reveals = {...emptySuits}

        roleKeys.map((role) => {
            reveals[role] = game && game.round ? 
                ps[role].revealed[game.round]
                : ''
        })
        return reveals
    }

    function hasAll(state){
        return state.clubs
            && state.diamonds
            && state.hearts
            && state.spades
    }

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

    function calculatePlayerInventory(_trades){
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
            contracts[trade.market] += trade.market === playerRole ?
                // invert action since player loses contract to buying player and gains from seller
                (tradeMultipliers[trade.type] * -1) 
                // else add buys, subtract sales
                : tradeMultipliers[trade.type]

            
            // balance += (balanceMultipliers[trade.type] * trade.price)
            balance += trade.market === playerRole ?
                // player gains money from trades with type buy if of the same market as they are being 'sold' to the player
                (balanceMultipliers[trade.type] * -1) * trade.price
                // else affect is inverted
                : balanceMultipliers[trade.type] * trade.price
        })

        return {contracts, balance}
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
                if( playerId && players[p].user_id === playerId ){
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
        console.log('setting players locally: ', newPlayers)
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
        console.log('result of watching trades: ', res)
        watchingTrades = true
        // if(watching){
        // }
    }

    function start(){
        setLoadingModal(true)
        startGame()
            .catch(err => {
                console.log('<game /> error starting game: ', err)
            })
            .finally(() => {
                setLoadingModal(false)
            })
    }

    let goingToNextRound = false

    function goToNextRound(){
        if(!goingToNextRound){
            let goingToNextRound = true
            setLoadingModal(true)
            // updateGame({round: game.round + 1})
            nextRound()
            .catch(err => {
                console.log('err loading: ', err)
            })
            .finally(() => {
                setLoadingModal(false)
            })
        }
    }

    function triggerGameRoundDisplay(){
        if(!showGameRound){
            showGameRound = true
            setTimeout(() => {
                showGameRound = false
            }, 1500)
        }
    }

    currentGame.subscribe(newGame => {
        if(checkGameDataDiff(newGame)){
            game 
                && newGame
                && game.id 
                && newGame.round === (game.round + 1) 
                && triggerGameRoundDisplay()

            game = newGame
        }

        exists = newGame.game_id !== ""
        inLobby = !newGame.started && !newGame.ended

        if(exists){
            countReveals(newGame, players)
        }
    })

    gamePlayers.subscribe(newPlayers => {
        console.log('got game players: ', newPlayers)
        setPlayers(newPlayers)
        checkRequiredRoles(newPlayers)
        if(playerRevealRounds[game.round]){
            revealRoundState = getReveals(newPlayers)
        }
        if(!playerRole){
            calcPlayerRole()
        }
    })

    gameTrades.subscribe(newGameTrades => {
        console.log('got new game trades: ', newGameTrades)
        if(JSON.stringify(newGameTrades) !== JSON.stringify(trades)){
            console.log('trades different, will update')
            let usableTrades = [...newGameTrades]
            if(usableTrades.length > 10){
                usableTrades.length = 10
            }
            trades = usableTrades
        }

        let relevant = getRelevantTrades(newGameTrades, currentPlayer.id, playerRole)
        console.log('relevant trades: ', relevant)
        let inventory = calculatePlayerInventory(relevant)
        console.log('inventory: ', inventory)
        balance = inventory.balance
        contractCount = inventory.contracts
    })

    afterUpdate(() => {
        if(playable && !watchingTrades){
            console.log('will watch all trades')
            watchTradesInServer()
            // watchTradesLocal()
        }
    })

    onMount(() => {
        console.log('current user on mount: ', currentPlayer)
        if(currentPlayer.id){
            getAndWatchPlayers(currentPlayer.user_metadata.game_id)
        }
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
                revealsForRound={revealRoundState}
                nextRound={goToNextRound}
                lastRevealed={lastRevealed}
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
        />
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