<div class="view-games">
    <div class="view-title">
        <h1>View Players for a given Game ID</h1>
        <p>Enter a game ID below to find and list all the players associated with that game.</p>
    </div> 
    <div class="game-id-input">
        <label for="game-trades-by-id" class="label">
            <span class="label-main">Game ID</span>
            <!-- <span class="label-instructions">Enter a Game ID to list all associated trades.</span> -->
        </label>
        <div class="input-and-submit">
            <input
                type="text"
                id="game-trades-by-id"
                name="game-trades-by-id"
                placeholder="Type here"
                value={gameId}
                on:input={handleInput}
            >
            <button 
                type="submit" 
                on:click={submit}
                disabled={submitting || !gameId}
            >Find Trades</button>
        </div>
    </div>

    
    <div class="results">
        <!-- {#if submitting}
            <div class="submitting">
                <div class="loader-wrapper">
                    <Loader />
                </div>
            </div>
        {/if} -->

        <!-- <p>{submitting}</p>
        <p>{gameId}</p> -->
    
        {#if players.length}
            <div class="players-results flex jc-between fd-col">
                <div class="controls flex jc-between">
                    <div class="trade-count">Found {players.filter(p => p.user_id !== '').length} Players</div>
                </div>
                <div class="player-list">
                    <div class="admin-row headers">
                        <div class="attribute">#</div>
                        <div class="attribute">User Id</div>
                        <div class="attribute">Role</div>
                        <div class="attribute">Player Name</div>
                        <div class="attribute">misc</div>
                        <div class="attribute">misc</div>
                    </div>
                    <div class="list-output flex fd-col">
                        {#each players as player, index}
                            <!-- <Trade {...trade} /> -->
                            <div class="admin-row" data-role={player.role}>
                                <div class="trade-attribute">{index + 1}</div>
                                <div class="trade-attribute"> {player.user_id} </div>
                                <div class="trade-attribute">{player.role}</div>
                                <div class="trade-attribute"> {player.player_name} </div>
                                <div class="trade-attribute"> ... </div>
                                <div class="trade-attribute"> ... </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    [data-role="clubs"]{order: 1}
    [data-role="diamonds"]{order: 2}
    [data-role="hearts"]{order: 3}
    [data-role="spades"]{order: 4}
    [data-role="speculator1"]{order: 5}
    [data-role="speculator2"]{order: 6}
    [data-role="speculator3"]{order: 7}
    [data-role="speculator4"]{order: 8}
    [data-role="speculator5"]{order: 9}
    [data-role="speculator6"]{order: 10}

    .controls {
        width: 100%;
        height: 50px;
        margin-bottom: 10px;
    }

    .trade-count {
        padding: 10px;
        font-size: 12pt;
        font-weight: bold;
    }

    .admin-row {
        min-width: 100%;
        display: grid;
        grid-template-columns: 0.3fr 1fr 0.5fr 1.3fr 0.5fr 0.5fr;
        border-bottom: solid thin lightgray;
    }

    .trade-attribute {
        word-wrap: break-word;
        white-space: pre-wrap;
        overflow-x: scroll;
        padding: 5px;
        border-right: solid thin lightgray;
    }

    .results {
        position: relative;
        min-height: 600px;
        height: 600px;
        width: 100%;
        background: var(--lm-light);
        margin-top: 40px;
        padding: 40px;
        border-radius: 6px;
    }

    .players-results {
        height: 100%;
    }

    .player-list {
        width: 100%;
        background: white;
        min-height: calc(100% - 90px);
        position: relative;
        overflow: hidden;
    }
    
    .list-output {
        overflow-y: scroll;
        min-height: calc(100% - 90px - 40px);
        position: relative;
        top: 5px;
        padding-bottom: 40px;
        height: 100%;
    }

    .admin-row.headers {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        background-color: white;
    }

    .input-and-submit {
        display: flex;
        justify-content: flex-start;
        position: relative;
    }

    button {
        background-color: black;
        color: white;
    }

    .input-and-submit button {
        position: absolute;
        right: 4px;
        top: 4px;
        bottom: 4px;
        width: auto;
        padding-left: 30px;
        padding-right: 30px;
    }

    .input-and-submit button:hover {
        background: rgb(50, 50, 50)
    }
    .input-and-submit button:disabled {
        opacity: 0.5!important;
    }

    .input-and-submit button:disabled:hover {
        background: black!important;
        cursor: not-allowed; 
    }

    .view-title {
        width: 100%;
    }

    .view-title h1, .view-title p {
        text-align: left;
    }

    .view-title {
        margin-bottom: 30px;
    }

    .game-id-input {
        padding: 25px;
        background: rgba(240, 240, 240, 1);
        border-radius: 6px;
        border: solid thin lightgray; 
        max-width: 700px;
    }

    label span {
        display: block;
        text-align: left;
    }

    label span.label-main {
        font-size: 18pt;
        margin-bottom: 20px;
    }
    label span.label-instructions {
        font-size: 12pt;
        color: gray;
        margin-bottom: 20px;
    }

    input {
        width: 100%;
        border: none;
        height: 55px;
        background-color: white;
        border-radius: 6px;
        padding: 10px;
    }
</style>

<script lang="ts">
    import {getPlayerData, getTrades} from '$lib/actions'
    import { getDate, getTime, makeCSV } from '$lib/helpers';
    import Loader from '../app/loader.svelte'
    let gameId: string = '' // eg 5EsiPBZ7idWG
    let submitting: boolean = false
    let downloading: boolean = false
    let players: any[] = []

    function handleInput({target}){
        gameId = target.value
    }

    async function submit(){
        submitting = true
        await findPlayers(gameId)
        submitting = false
    }

    function findPlayer(id){
        let pIndex = players.findIndex(player => player.user_id === id)
        return players[pIndex].player_name
    }

    async function findPlayers(gameId: string){
        return new Promise( async (resolve, reject) => {
            const {data, error} = await getPlayerData(gameId)
            console.log('results: ', data)
            console.log('errors: ', error)
            

            if(data && data.length){ 
                players = data
            }
            else { players = [] }

            data && !error && resolve({
                data, 
                error,
            })

            !data && error && reject(error)
        })
    }
</script>