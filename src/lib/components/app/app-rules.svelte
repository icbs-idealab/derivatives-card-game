<script>
    import { showGameRules } from "$lib/state";
    import Icon from "../icon/icon.svelte";
    import Backdrop from "./backdrop.svelte";
    function hideRules(){
        showGameRules.set(false)
    }
</script>
<Backdrop>
    <div class="app-rules flex fd-col">
        <h1 class="main-title">Game Rules</h1>
        <ul class="flex fd-col">
            <div>
                <li class="title">Game Parameters</li>
                <li>The game starts with a deck of 52 cards comprised of 13 clubs, diamonds, hearts and spades.</li>
                <li>4 players are assigned the task of controlling the value of a 'market' <span>(clubs/diamonds/hearts/spades)</span>.</li>
                <li>The market controllers are dealt 6 random cards each from the game's deck.</li>
                <li>Any other players will be given the role of a market speculators.</li>
                <li>Speculators cannot alter the prices of markets.</li>
                <li>All players start game with a balance of 0.</li>
                <li>All players can trade (buy or sell) contracts within any of the 4 markets.</li>
                <li>All trades affect the trading parties balances.</li>
            </div>

            <div>
                <li class="title">Game Rounds</li>
                <li>The game includes 33 rounds, 6 of those rounds feature a player-reveal phase.</li>
                <li>Each round at least 1 card is revealed.</li>
                <li>Player reveal phases are triggered at the beginning of rounds 1, 6, 11, 16, 21 and 26.</li>
                <li>The player-reveal phase requires market controllers reveal 1 card from their hand.</li>
                <li>In normal rounds, one card will be removed from the top of the deck.</li>
            </div>

            <div>
                <li class="title">Goal</li>
                <li>The goal is to anticipate or calculate which card will be revealed last.</li>
                <li>At the end of the game <span>(round 33)</span>, For each card owned by a player, they recieve a bonus of $1.00.</li>
            </div>
        </ul>
    </div>
    <div class="controls flex" on:click={hideRules}>
        <!-- <button class="close button" on:click={hideRules}>Close Rules</button> -->
        <div class="flex">
            <Icon icon="close" />
        </div>
    </div>
</Backdrop>

<style>
    .main-title {
        margin-top: 0;
        width: 100%;
        max-width: 700px;
        text-align: left;
    }

    ul > div {
        padding: 10px;
        margin-bottom: 10px;
        width: 100%;
        max-width: 700px;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    li.title {
        font-size: 0.9em;
        font-weight: 500;
        margin-bottom: 20px;
    }
    
    li:not(.title){
        font-size: 0.8em;
        font-weight: 100;
        margin-bottom: 8px;
        list-style: disc;
        margin-left: 15px;
    }

    .controls {
        position: fixed;
        top: 60px;
        right: 80px;
        width: 50px;
        height: 50px;
        border: solid thin gray;
        border-radius: 40px;
    }

    .app-rules {
        position: fixed;
        top: 40px;
        bottom: 40px;
        /* width: 100%; */
        /* height: calc(100% - 150px); */
        left: 50px;
        right: 50px;
        background-color: whitesmoke;
        overflow-y: scroll;
        border-radius: 10px;
    }

    .app-rules::-webkit-scrollbar-track {
        background: transparent;
        width: 0;
    }

</style>