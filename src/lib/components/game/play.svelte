<script lang="ts">
    import { goto } from "$app/navigation";
    import { getBotParams, getTrades, revealPlayerCard, performBotActions, updateBotsInCloud } from "$lib/actions";
    import { defaultGame, emptyHand, emptyReveals, emptySuitsBool, playerRevealRounds, roleKeys } from "$lib/constants";
    import { calculatePlayerInventory, getBotParamFrequency, getBotsFromPlayers, getRandomCardFromHand, getRelevantTrades, Logger, makeGamePlayersAsObject, valueWithSymbol } from "$lib/helpers";
    import { botParams, currentGame, currentUser, gamePhase, gamePlayers, gameTrades } from "$lib/state";
    import type { AppGame, 
        GameEndState, 
        CardHand, 
        RevealRounds, 
        SuitName, 
        AppGamePlayer,
        SuitCount,
		BotSuitCount,
		AppGamePlayersByRole,
		RevealRoundNumnber
    } from "$lib/types";
	import { afterUpdate, onMount } from "svelte";
	import { get_slot_changes } from "svelte/internal";
    import { get } from "svelte/store";
    import Backdrop from "../app/backdrop.svelte";
    import Button from "../button/button.svelte";
    import GameProperties from "./game-properties.svelte";
    import GameRow from "./game-row.svelte";
    import RevealView from "./reveal-view.svelte";
    import SectionLabels from "./section-labels.svelte";
    import TradeLedger from "./trade-ledger.svelte";

    export let showGameRound = false
    export let showRevealRound = false
    export let haveRequiredRoles = false
    export let trades: any[] = []
    export let balance = 0
    export let contracts = {...emptyHand}
    export let playerRole: string = ''
    export let game: AppGame = {...defaultGame}
    export let lastRevealed: {[index: string]: boolean} = {...emptySuitsBool}
    let defaultPlayers = {...makeGamePlayersAsObject()}
    export let players = {...defaultPlayers}
    export let revealed = {...emptyHand}
    export let revealsForRound = {
        clubs: "",
        diamonds: "",
        hearts: "",
        spades: "",
    }
    export let startGame: () => any = () => console.log('init')
    export let finishGame: () => any = () => console.log('end game')
    export let nextRound: () => any = () => console.log('next round')
    export let clearRevealInterval: () => void = () => null

    let desiredRound = game.round
    let canUseNext = true
    let derivedFinalBalance: string | null = null
    let isRevealRound: boolean = true
    let botActionInterval: any = null
    let revealingBotHands = false
    let calculatingBotAction: NodeJS.Timeout | null = null
    // $: gamePhase = getGamePhase()
    // $: botIntervalTime = botParams && botParams. 2500 as number
    $: botIntervalTime = 2500 as number
    $:derivedBalance = valueWithSymbol(balance)
    $:bots = getBotsFromPlayers(players)
    
    $:isPractice = Object.keys(bots).length > 0
    function initiateGame(){
        desiredRound = game.round + 1
        canUseNext = false
        setTimeout(() => {
            startGame()
        }, 100)
    }

    function goToNextRound(){
        desiredRound = game.round + 1
        canUseNext = false
        setTimeout(() => {
            nextRound()
        }, 100)
    }

    export let calcPlayerRole: () => any

    async function getFinal(game_id: string){
        if(game_id){
            const {data} = await getTrades(game_id)
            if(Array.isArray(data)){
                let relevant = getRelevantTrades(data, get(currentUser).id, playerRole)
                let {contracts, balance} = calculatePlayerInventory(relevant, playerRole)
                // count bonus
                let last = ''
                for(let l in lastRevealed){
                    if(lastRevealed[l]){
                        last = l
                    }
                }
                let count = contracts[last]
                let bonus = count * 100
                //
                derivedFinalBalance = valueWithSymbol(balance + bonus)
            }
        }
    }

    currentGame.subscribe((update) => {
        update.game_id 
        && update.completed 
        && getFinal(game.game_id)

        if(desiredRound === game.round){
            canUseNext = true
        }

        if(playerRevealRounds[ update.round ]){
            isRevealRound = true
        } 
        else isRevealRound = false

        // when game data get_slot_changes, reset the interval counter to make sure the bot will act the appropriate number of times for a given round
        // resetBotActionInterval()
        startBotInterval()
    })

    function getBots(){
        return players.filter((player: AppGamePlayer) => player.user_id.includes('-bot'))
    }

    async function revealBotHands(){
        revealingBotHands = true
        let gId = game.game_id
        const targetBots: {[index: string]: AppGamePlayer} = {}
        for(let playerBot in bots){
            let bot = bots[playerBot]
            let canRevealCard = bot.revealed.hasOwnProperty(String(game.round)) && bot.revealed[game.round] === ""
            if(canRevealCard){
                let botHand = bot.hand as any
                let randomCard = getRandomCardFromHand(botHand) as SuitName
                // let newBotHand: {[index: string]: number} = {...bot.hand}
                let newBotHand: BotSuitCount = {...bot.hand}
                newBotHand[randomCard] -= 1
    
                let newBotRevealed: {[index: string | number]: string} = {...bot.revealed}
                newBotRevealed[game.round] = randomCard
    
                targetBots[playerBot] = {
                    ...bots[playerBot],
                    hand: newBotHand as SuitCount,
                    revealed: newBotRevealed as any
                }
            }
        }

        const {success, error, result} = await updateBotsInCloud(gId, targetBots)
        setTimeout(() => revealingBotHands = false)
        !error && Logger(['New Bots are: ', targetBots])
        !error && success && result && Logger(['Result of setting new Bots is: ', result])
    }

    function resetBotActionInterval(){
        clearInterval(botActionInterval)
        botActionInterval = null
    }

    function startBotInterval(){
        if(!botActionInterval){
            let freq = getBotParamFrequency()
            Logger(['BOT ACTION FREQ: ', freq])
            botActionInterval = setInterval(calculateBotAction, freq)
        }
    }

    function calculateBotAction(){
        // determine which action makes most sense for bot to take given the current round
        // only runs when showRevealRound is false
        Logger(['CalculatingBotAction()'])
        if(calculatingBotAction){ 
            return null 
        }
        else if($currentGame.started) {
            calculatingBotAction = setTimeout(() => {
                // 1. determine if game stage
                Logger(['BOT GAME PHASE: ', $gamePhase])
                Logger(['Maximum number of actions per bot',  $botParams[ `${$gamePhase}_game_max_trades`]])
                
                let targetBots: AppGamePlayersByRole = {}
        
                function getActionCountForRound(targetBot: string){
                    return (bots[targetBot].bot_action_count as any)[ game.round ]
                }
        
                // 2. check that maximum number of trades have not been made by bot (stored in player records)
                for(let _bot in bots){
                    // if(bots[_bot].bot_action_count){
                        let botCanAct = (bots[_bot].bot_action_count as any)[game.round] < $botParams[ `${$gamePhase}_game_max_trades` ];
                        Logger([`${_bot} bot acting in ${game.round}! action count: `, getActionCountForRound(_bot) ])
                    if( botCanAct && !showRevealRound ){
                        // clone bot into new object that we can manipulate 
                        targetBots[_bot] = {...bots[_bot]};
                    }
                }
        
                Logger([
                    'Target Bots: ', 
                    targetBots
                ])
        
                // pass into function that loops over cloned bots, makes trades and updates player records
                Object.keys(targetBots).length > 0 ? 
                    triggerBotAI(targetBots)
                    : resetBotActionInterval()

                clearCalcTimeout()
            })
        }
    }

    function clearCalcTimeout(){
        if(calculatingBotAction){
            clearTimeout(calculatingBotAction)
            calculatingBotAction = null
        }
    }

    async function triggerBotAI(_bots: AppGamePlayersByRole){
        // trade with bot
        let result = await performBotActions(_bots)
        Logger(['RESULT OF BOT ACTION: ', result])
        // increment action_counts for each bot
    }

    
    function calcHand(players: {[index: string]: any}, playerRole: string){
        if(playerRole){
            let p = players[playerRole]
            let h = {...p.hand}
            let r = p.revealed
            // console.log('$H: ', h)
            // console.log('$H2: ', revealed)
            for(let revealRound in r){
                let card = r[revealRound]
                // console.log('$card: ', card)
                if(card){
                    h[card] -= 1
                }
            }
    
            return h
        }
    }

    // $:playerCards = playerRole ? (players[playerRole].hand || emptyHand) : emptyHand
    $:playerCards = playerRole ? calcHandFromReveals(players[playerRole]) : emptyHand
    $:playerReveals = playerRole ? (players[playerRole].revealed || emptyReveals) : emptyReveals
    $:hand = calcHand(players, playerRole)

    $:endState = game.ended && game.round === 33 ? 
        'Game Completed' :
            game.ended && game.round !== 33 ?
                'Game Ended'
                : '' as GameEndState

    function calcHandFromReveals(playerHandData: any){
        Logger(['Calculating hand!'])
        let {hand} = playerHandData
        return hand
    }

    // function calcHandFromReveals(playerHandData: any){
    //     Logger(['Calculating hand!'])
    //     let {hand, revealed} = playerHandData
    //     if(hand && revealed){
    //         let usableHand: CardHand = {...hand}
            
    //         for(let round in revealed){
    //             let revealedCard: SuitName = revealed[round]
    //             if(revealedCard){
    //                 usableHand[ revealedCard ] -= 1
    //             }
    //         }
    //         return usableHand
    //     }
    //     else {
    //         return emptyHand
    //     }
    // }

    let processingCardSelection = false
    let selectedCard = ''

    function selectCardForReaval(card: any){
        selectedCard = card
    }

    function revealSelectedCard(){
        if(playerRole && players[playerRole]){
            processingCardSelection = true
            let update = players[playerRole]
            update.revealed[game.round] = selectedCard
            // update.hand[selectedCard] -= 1

            Logger(['will update player with new hand: ', update])

            revealPlayerCard(
                update,
                game.game_id,
                players[playerRole].user_id
            )
            .then(res => {
                Logger(['successfully revealed card: ', res])
                clearRevealInterval()
            })
            .catch(err => {
                Logger(['error revealing card: ', err])
            })
            .finally(() => {
                processingCardSelection = false
            })
        }
    }

    export let localRates = {
        buy: 41,
        sell: 40,
    }
    
    let canTrade = {
        clubs: true,
        diamonds: true,
        hearts: true,
        spades: true,
    }    

    function getEndGameBalance(){
        typeof calcPlayerRole === 'function' && calcPlayerRole()
        
        console.log('playerRole: ', playerRole)

        let scores = {
            end: '$0.00',
            final: '$0.00',
        }
        if(playerRole && game.final_scores){
            let b = game.final_scores[playerRole].balance
            let markets: {[index:string]: number} = game.final_scores[playerRole].contracts
            let last = game.final_scores[playerRole].lastRevealed
            let bonus = markets[last] * 100
            scores.end = valueWithSymbol(b)
            scores.final = valueWithSymbol(b + bonus)
        }

        return scores
    }

    function getEndGameContracts(){
        let endGameHand: {[index: string]: any} = {...emptyHand}
        if(playerRole && game.final_scores){
            endGameHand = game.final_scores[playerRole].contracts
        }
        return endGameHand
    }

    async function retrieveBotParams(){
        let {data, error} = await getBotParams()
        // botParams = data
    }

    afterUpdate(() => {
        showRevealRound && isPractice && revealBotHands()
        // isPractice && showRevealRound && botActionInterval && resetBotActionInterval()
        isPractice && showRevealRound && resetBotActionInterval()
        isPractice && !showRevealRound && !botActionInterval && startBotInterval()
    })

    onMount(() => {
        // should update code to only retrieve bot parameters if bots have been detected for a given game
        retrieveBotParams()
    })

</script>

<section id="game">
    <div class="game-output">
        <GameProperties 
            round={game.round}
            endState={endState}
            players={players}
        />
        <SectionLabels />

        <div class="game-interactive">
            {#if showRevealRound}
                <RevealView 
                    playerHand={playerCards}
                    selectedCard={selectedCard}
                    selectCard={selectCardForReaval}
                    localRole={playerRole}
                    reveals={revealsForRound}
                    revealCard={revealSelectedCard}
                    processingCardSelection={processingCardSelection}
                />
            {:else}
                <div class="game-markets">
                    {#each roleKeys as role}
                        <GameRow 
                            isActivePlayer={playerRole === role}
                            roleData={players[role]}
                            localRates={localRates}
                            suit={role}
                            gameRound={game.round}
                            gameActive={game.started && !game.ended}
                            playerCards={playerCards}
                            contracts={game.ended && game.final_scores ? getEndGameContracts()[role] : contracts[role]}
                            revealed={revealed[role]}
                            isLastRevealed={lastRevealed[role]}
                            maxSpread={game.maximum_spread}
                        />
                    {/each}

                    <!-- controls -->

                    <div class="game-controls flex">
                        {#if playerRole && players && players[playerRole].is_admin}
                            {#if !game.started && !game.ended && game.round === 0}
                                <Button
                                    action={initiateGame}
                                    label="Start Game"
                                    disabled={!haveRequiredRoles}
                                />
                            {:else if game.started && !game.ended && game.round < 32}
                                <!-- <Button action={nextRound} label="Next Round" /> -->
                                <Button
                                    action={goToNextRound} 
                                    label="Next Round" 
                                    disabled={desiredRound !== game.round}
                                />
                            {:else if game.round === 32 }
                                <!-- <Button action={nextRound} label="Final Round" /> -->
                                <Button action={goToNextRound} label="Final Round" />
                            {:else if game.ended}
                                <div class="game-completed">
                                    Game Completed
                                </div>
                            {:else}
                                <Button action={finishGame} label="Finish Game" />
                            {/if}
                        {/if}
                    </div>

                    <!-- max spread -->

                    <div class="max-spread flex">
                        <p><span>Max-Spread:</span> {game.maximum_spread} </p>
                    </div>

                    <!-- balance -->

                    <div class="balance flex fd-col">
                        {#if game.final_scores}
                            <p>Balance: { getEndGameBalance().end }</p>
                            <p>Final Balance: { getEndGameBalance().final }</p>
                        {:else}
                            <p>Balance: { derivedBalance }</p>
                            <!-- <p>Balance: { balance }</p> -->
                            {#if derivedFinalBalance !== null}
                                <p>Final Balance: { derivedFinalBalance }</p>
                            {/if}
                        {/if}
                    </div>

                    <!-- max spread -->

                    <div class="remaining-cards flex">
                        <p>{game.deck.held.length} Cards in Deck</p>
                    </div>
                </div>
                <TradeLedger trades={trades} ended={game.ended} />
            {/if}
        </div>

        <!-- end game main -->
    </div>

    {#if showGameRound}
        <Backdrop zIndex={9999}>
            <div class="game-round-container flex">
                <h1>Round {game.round}</h1>
            </div>
        </Backdrop>
    {/if}
</section>

<style>

    p.desired-round {
        position: fixed;
        bottom: 40px;
        right: 40px;
    }

    .game-completed {
        font-size: 0.85em;
        border: solid thin lightgray;
        padding: 10px 15px;
        border-radius: 3px;
    }

    .game-output {
        display: grid;
        grid-template-columns: 100%;
        grid-template-rows: 70px 70px calc(100% - 210px);
        grid-gap: 10px;
        height: calc(100vh - 10px);
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding-top: 30px;
    }

    .game-round-container {
        background: white;
        position: absolute;
        top: 40%;
        left: 40%;
        right: 40%;
        bottom: 40%;
        width: auto; 
        padding: 30px; 
        border-radius: 5px;
    }

    .game-round-container h1 {
        margin: 0;
    }


    .game-interactive {
        position: relative;
        display: grid;
        grid-template-columns: 3fr 1fr;
        grid-gap: 15px;
        height: 100%;
        width: 100%;
        padding: 20px 8vw 0;
    }

    .game-markets {
        position: relative;
        /* border: solid thin lightgray; */
        /* background: cornflowerblue; */
        height: 100%;
        height: calc((85px * 4) + (3 * 10px) + 100px);
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(4, 85px);
        grid-gap: 10px;
        /* max-width: 1000px; */
    }

    .max-spread {
        /* width: 100%; */
        position: absolute;
        left: 0;
        top: calc((85px * 4) + (3 * 10px) + 5px);
        width: 41%;
        height: 45px;
        /* background: pink; */
    }

    .remaining-cards {
        /* width: 100%; */
        position: absolute;
        right: 0;
        top: calc((85px * 4) + (3 * 10px) + 5px);
        height: 45px;
        width: 27%;
        /* background: blueviolet; */
        text-align: center;
    }

    .balance {
        /* width: 100%; */
        position: absolute;
        left: calc(43.5%);
        top: calc((85px * 4) + (3 * 10px) + 5px);
        height: 45px;
        width: 27%;
        /* background: red; */
        text-align: center;
    }

    .max-spread p span {
        font-weight: 100;
        color: gray;
    }

    .max-spread p, 
    .remaining-cards p, 
    .balance p {
        font-size: 0.8em;
    }

    .game-controls {
        /* width: 100%; */
        position: absolute;
        right: 0;
        top: calc((85px * 4) + (3 * 10px) + 55px);
        width: 28%
    }
</style>