<script lang="ts">
    import { revealPlayerCard } from "$lib/actions";
    import { defaultGame, emptyHand, emptyReveals, emptySuitsBool, roleKeys } from "$lib/constants";
    import { makeGamePlayersAsObject } from "$lib/helpers";
    import type { AppGame } from "$lib/types";
    import { afterUpdate } from "svelte";
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
    export let trades = []
    export let balance = 0
    export let contracts = {...emptyHand}
    export let playerRole: string = ''
    export let game: AppGame = {...defaultGame}
    export let lastRevealed = {...emptySuitsBool}
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
    export let endGame: () => any = () => console.log('end game')
    export let nextRound: () => any = () => console.log('next round')
    
    function withSymbol(val){
        let symbol = val < 0 ? '-' : ''
        return `${symbol}$${Math.abs(val/100)}`
    }

    $:derivedBalance = withSymbol(balance)
    
    function calcHand(cards, revealed){
        let h = {...cards}
        // console.log('$H: ', h)
        // console.log('$H2: ', revealed)
        for(let revealRound in revealed){
            let card = revealed[revealRound]
            // console.log('$card: ', card)
            if(card){
                h[card] -= 1
            }
        }

        return h
    }

    $:playerCards = playerRole ? players[playerRole].hand : emptyHand
    $:playerReveals = playerRole ? players[playerRole].revealed : emptyReveals
    $:hand = calcHand(playerCards, playerReveals)

    let processingCardSelection = false
    let selectedCard = ''
    function selectCardForReaval(card){
        selectedCard = card
    }
    function revealSelectedCard(){
        if(playerRole && players[playerRole]){
            processingCardSelection = true
            let update = players[playerRole]
            update.hand[selectedCard] -= 1
            update.revealed[game.round] = selectedCard

            console.log('will update player with new hand: ', update)

            revealPlayerCard(
                update,
                game.game_id,
                players[playerRole].user_id
            )
            .then(res => {
                console.log('successfully revealed card: ', res)
            })
            .catch(err => {
                console.log('error revealing card: ', err)
            })
            .finally(() => {
                processingCardSelection = false
            })
        }
    }

    let localRates = {
        buy: 36,
        sell: 40,
    }

    let canTrade = {
        clubs: true,
        diamonds: true,
        hearts: true,
        spades: true,
    }

    function processTrade(suit, type){
        console.log('processing trade in play.svelte')
        canTrade[suit] = false
        setTimeout(() => {
            canTrade[suit] = true
        }, 3000)
    }
</script>

<section id="game">
    <div class="game-output">
        <GameProperties 
            round={game.round}
            players={players}
        />
        <SectionLabels />

        <!-- game main -->

        <div class="div flex" style="position:fixed; bottom: 50px; right: 50px; font-size: 0.65em;">
            <!-- Player role {playerRole} -->
            <!-- <pre style="font-size: 0.7em;"> {JSON.stringify(playerCards)} </pre> -->
            <pre> {JSON.stringify(hand)} </pre>
            <!-- <pre> {JSON.stringify(hand)} </pre> -->
        </div>

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
                            isActivePlayer={playerRole && playerRole === role}
                            roleData={players[role]}
                            localRates={localRates}
                            suit={role}
                            playerCards={hand}
                            contracts={contracts[role]}
                            revealed={revealed[role]}
                            isLastRevealed={lastRevealed[role]}
                        />
                    {/each}

                    <!-- controls -->

                    <div class="game-controls flex">
                        {#if playerRole && players && players[playerRole].is_admin}
                            {#if !game.started && !game.ended && game.round === 0}
                                <Button action={startGame} label="Start Game" disabled={!haveRequiredRoles} />
                            {:else if game.started && !game.ended && game.round < 33}
                                <Button action={nextRound} label="Next Round" />
                            {:else}
                                <Button action={endGame} label="Finish Game" />
                            {/if}
                        {/if}
                    </div>

                    <!-- max spread -->

                    <div class="max-spread flex">
                        <p><span>Max-Spread:</span> {game.maximum_spread} </p>
                    </div>

                    <!-- balance -->

                    <div class="balance flex">
                        <p>Balance: { derivedBalance }</p>
                    </div>

                    <!-- max spread -->

                    <div class="remaining-cards flex">
                        <p>{game.deck.held.length} Cards in Deck</p>
                    </div>
                </div>
                <TradeLedger trades={trades} />
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
        max-width: 1000px;
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