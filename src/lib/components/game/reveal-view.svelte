<script lang="ts">
    import { roleKeys } from "$lib/constants";
    import { currentGame, currentUser } from "$lib/state";
    import type { PlayerRole, SuitName } from "$lib/types";
    import { get } from "svelte/store";
    import AppMenu from "../app/app-menu.svelte";
    import Backdrop from "../app/backdrop.svelte";
    import SuitIcon from "../suit/suit-icon.svelte";
    export let selectCard: (card: string) => any = (card: string) => console.log('selecting card ', card)
    export let selectedCard: string = ''
    export let localRole: any = ''
    export let reveals: any = {}
    export let playerHand: any = {
        clubs: 0,
        diamonds: 0,
        hearts: 0,
        spades: 0,
    }
    
    $:completedRevealRound = localRole && reveals[localRole] !== ""

    export let processingCardSelection = false
    export let revealCard = () => {
        console.log('would reveal card')
    }

    $:revealType = localRole && roleKeys.indexOf(localRole) !== -1 ? 'market' : 'speculator'

    let game = get(currentGame)
    let user = get(currentUser)
</script>

<Backdrop zIndex={10} opacity={0.1}>
    <div 
        class="player-reveal-view" 
        data-reveal-type={revealType}
        data-reveal-completed={completedRevealRound}>
            {#if localRole && roleKeys.indexOf(localRole) !== -1}
                <div class="title-section flex fd-col">
                    <h1>Reveal Phase</h1>
                    <p>Please select a card to reveal below:</p>
                </div>
            {/if}

            {#if localRole && roleKeys.indexOf(localRole) !== -1}    
                <div class="cards-view">
                    {#each roleKeys as role}
                        <div class="card flex fd-col">
                            <div class="card-wrapper flex" >
                                <button 
                                    class="card-main flex" 
                                    on:click={() => !completedRevealRound && !processingCardSelection && selectCard(role)}
                                    data-selected={selectedCard === role}
                                    data-exists={playerHand[role] !== 0}
                                >
                                    <SuitIcon suit={role} size={80}  />
                                </button>
                            </div>
                            <p class="card-count">
                                <span>{playerHand[role]}</span>
                                <span>Cards</span>
                            </p>
                        </div>
                    {/each}
                </div>
    
                <div class="rv-reveal-control flex">
                    {#if !completedRevealRound}
    
                        {#if selectedCard && processingCardSelection}
                            <div class="faux-button">
                                Selecting {selectedCard}
                            </div>
                        {:else}
                            <button 
                                disabled={!selectedCard || processingCardSelection || !playerHand[selectedCard]}
                                on:click={revealCard}
                            >
                                Reveal Card
                            </button>
                        {/if}
    
                    {:else if localRole}
                        <!-- <p class="white" > You revealed {localReveals[localRole].reveals[localGame.round]} </p> -->
                        <p class="white" > You revealed {reveals[localRole]} </p>
                    {/if}
                </div>  
            {:else}
                <div class="title-section flex fd-col">
                    <h1>Reveal Phase</h1>
                </div>
                <div class="placeholder flex">
                    <p>Waiting for market makers to select their cards</p>
                </div>
                <!-- <div class="placeholder"></div> -->
            {/if}

            <div class="players-display"> 
                {#each roleKeys as role}
                    <div 
                        class="rv-player-role flex jc-start" 
                        data-revealed={reveals[role] !== ""}
                        >
                        <div class="rv-player-icon flex">
                            <SuitIcon suit={role} size={20} />
                        </div>
                        <p class="rv-player-text">
                            { 
                                reveals[role] ?
                                    'Has revealed their card'
                                    : 'is making a selection'
                            }
                        </p>
                    </div>
                {/each}
            </div>
    </div>

    <AppMenu 
        hasGame={user.user_metadata.game_id}
        game={game}
        isAuthenticated={user.id !== null}
        inRevealPhase={true}
    />

</Backdrop>

<style>
    .player-reveal-view {
        width: 100%;
        height: calc(100% - 115px);
        position: relative;
        top: 115px;
        padding: 30px;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 100px auto 150px auto;
        background: rgba(40, 40, 40, 0.975)
    }

    .player-reveal-view[data-reveal-type="market"] {
        grid-template-rows: minmax(100px, auto) minmax(200px, auto) minmax(70px, auto) auto;
        padding-bottom: 85px;
    }

    .player-reveal-view p {
        color: white!important;
    }

    .title-section h1 {
        font-size: 1.5em;
        font-weight: bold;
        letter-spacing: 1.2px;
        word-spacing: 4px;
        color: white!important;
        margin: 0 0 5px;
        /* text-transform: uppercase; */
    }

    .title-section p {
        font-size: 1em;
        color: lightgray!important;
        opacity: 0.75;
    }

    .cards-view, .players-display {
        display: grid;
        /* grid-template-columns: repeat(4, 1fr); */
        grid-template-columns: repeat(4, auto);
        grid-template-rows: 100%;
        grid-gap: 20px;
        justify-content: center;
        /* background: rgba(190, 150, 150, 0.5); */
        width: 100%;
    }

    .players-display {
        grid-gap: 10px; 
        align-items: center;
        justify-content: center;
        padding-left: 10vw;
        padding-right: 10vw;

    }

    .card {
        width: 100%;
        height: 100%;
        padding-top: 25px;
    }

    .card-wrapper {
        /* height: calc(100% - 80px); */
        height: auto;
        width: 100%;
        /* background: gray; */
        margin-bottom: 20px;
    }

    .card-main {
        min-height: 160px;
        min-width: 120px;
        background: white;
        border-radius: 8px;
        position: relative;
    }

    .card-main[data-selected="true"]:before {
        content: "";
        height: 100%;
        width: 100%;
        border: solid 5px var(--red);
        position: absolute;
        border-radius: 7px;
    }

    .card-main[data-exists="false"] {
        opacity: 0.2;
    }

    :not([data-reveal-completed="true"]) .card-main[data-exists="true"]:not([data-seleted="true"]):hover:after {
        content: "";
        height: 100%;
        width: 100%;
        background: var(--red);
        position: absolute;
        opacity: 0.2;
    }

    .card-count {
        font-size: 1.05em;
        color: white!important;
    }

    .faux-button {
        color: white!important;
    }

    .rv-player-icon {
        height: 40px;
        width: 40px;
        border-radius: 40px;
        background: lightgray;
        margin-right: 10px;
    }

    .rv-player-text {
        color: white!important;
        font-size: 0.7em;
    }

    .rv-reveal-control {
        width: 100%;
        padding-bottom: 25px;
    }

    .rv-reveal-control button {
        padding: 15px 30px;
    }

    /* .players-display {
        align-items: flex-start;
    } */

    .rv-player-role:not([data-revealed="true"]) p {
        color: gray;
    }

    .rv-player-role:not([data-revealed="true"]) .rv-player-icon {
        opacity : 0.125;
    }

</style>