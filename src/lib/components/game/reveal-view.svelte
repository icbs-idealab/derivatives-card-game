<script lang="ts">
    import { roleKeys } from "$lib/constants";
    import type { PlayerRole, SuitName } from "$lib/types";
    import Backdrop from "../app/backdrop.svelte";
    import SuitIcon from "../suit/suit-icon.svelte";
    export let selectCard: (card: string) => any = (card: string) => console.log('selecting card ', card)
    export let selectedCard: string = ''
    export let localRole: any = ''
    export let reveals: any = {}
    export let playerHand = {
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
</script>

<Backdrop zIndex={10} opacity={0.1}>
    <div class="player-reveal-view">            
            {#if localRole && roleKeys.indexOf(localRole) !== -1}
                <div class="title-section flex fd-col">
                    <h1>Reveal Phase</h1>
                    <p>Select a Card to reveal</p>
                </div>
                
                <div class="cards-view">
                    {#each roleKeys as role}
                        <div class="card flex fd-col">
                            <div class="card-wrapper flex" >
                                <div 
                                    class="card-main flex" 
                                    on:click={() => !processingCardSelection && selectCard(role)}
                                    data-selected={selectedCard === role}
                                    data-exists={playerHand[role] !== 0}
                                >
                                    <SuitIcon suit={role} size={80}  />
                                    <!-- <div class="card-extras"></div> -->
                                </div>
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
                                disabled={!selectedCard || processingCardSelection}
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
</Backdrop>

<style>
    .player-reveal-view {
        width: 100%;
        height: calc(100% - 125px);
        position: relative;
        top: 125px;
        padding: 60px;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 100px 450px 150px 1fr;
        background: rgba(40, 40, 40, 0.95)
    }

    .player-reveal-view p {
        color: white!important;
    }

    .title-section h1 {
        font-size: 1.5em;
        color: white!important;
        margin: 0;
    }

    .title-section p {
        font-size: 1.15em;
        color: gray!important;
    }

    .cards-view, .players-display {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: 100%;
        grid-gap: 20px;
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
        height: 300px;
        width: 200px;
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

    .card-main[data-exists="true"]:not([data-seleted="true"]):hover:after {
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

    .rv-player-role:not([data-revealed="true"]) p {
        color: gray;
    }

    .rv-player-role:not([data-revealed="true"]) .rv-player-icon {
        opacity : 0.125;
    }

</style>