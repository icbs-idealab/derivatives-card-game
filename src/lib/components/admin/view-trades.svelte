<div class="view-games">
    <div class="view-title">
        <h1>View Trades By ID</h1>
        <p>Enter a game ID below to find and list all the trades associated with that game.</p>
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
        {#if submitting}
            <div class="submitting">
                <!-- <div class="loader-text">Finding trades</div> -->
                <div class="loader-wrapper">
                    <Loader />
                </div>
            </div>
        {/if}

        <!-- <p>{submitting}</p>
        <p>{gameId}</p> -->
    
        {#if trades.length}
            <div class="trade-values flex jc-between fd-col">
                <div class="controls flex jc-between">
                    <div class="trade-count">Found {trades.length} Trades</div>
                    <div class="buttons flex jc-end">
                        <button 
                            id="download-trades"
                            on:click={downloadTradeData}
                            disabled={downloading}
                        > Download </button>
                    </div>
                </div>
                <div class="trade-list">
                    <div class="admin-trade headers">
                        <div class="trade-attribute">#</div>
                        <div class="trade-attribute">market</div>
                        <div class="trade-attribute">type</div>
                        <div class="trade-attribute">actor</div>
                        <div class="trade-attribute">round</div>
                        <div class="trade-attribute">price</div>
                    </div>
                    <div class="list-output">
                        {#each trades as trade, index}
                            <!-- <Trade {...trade} /> -->
                            <div class="admin-trade">
                                <div class="trade-attribute">{index + 1}</div>
                                <div class="trade-attribute">{trade.market}</div>
                                <div class="trade-attribute">{trade.type}</div>
                                <div class="trade-attribute">{trade.actor}</div>
                                <div class="trade-attribute">{trade.round}</div>
                                <div class="trade-attribute">{trade.price}</div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>

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

    .admin-trade {
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

    .trade-values {
        height: 100%;
    }

    .trade-list {
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
        top: 40px;
        height: 100%;
    }

    .admin-trade.headers {
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
    let trades: any[] = []
    let players: any[] = []

    function handleInput({target}){
        gameId = target.value
    }

    async function submit(){
        submitting = true
        await findTrades(gameId)
        submitting = false
    }

    function findPlayer(id){
        let pIndex = players.findIndex(player => player.user_id === id)
        return players[pIndex].player_name
    }

    async function findTrades(gameId: string){
        return new Promise( async (resolve, reject) => {
            const {data, error} = await getTrades(gameId)
            const {data: pData, error: pError} = await getPlayerData(gameId)
            console.log('results: ', data)
            console.log('errors: ', error)
            console.log('player results: ', pData)
            console.log('player errors: ', pError)
            

            if(data && data.length && pData && pData.length){ 
                trades = data
                players = pData
                // trades = data.map(tData => {
                //     let actor = findPlayer(tData.actor)
                //     if(actor && actor.player_name){
                //         return {
                //             ...tData,
                //             actor
                //         }
                //     }
                //     else return tData
                // })
            }
            else { trades = [] }

            data && !error && resolve({
                data, 
                error,
            })

            !data && error && reject(error)
        })
    }

    async function downloadTradeData(){
        downloading = true

        let line1 = 'game_id,market,actor,actor_id,price,round,type,date,time';
        let csv = `${line1}\n`

        trades.map(trade => {
            csv += `${trade.game_id},${trade.market},${findPlayer(trade.actor)},${trade.actor},${trade.price},${trade.round},${trade.type},${getDate(trade.created_at)},${getTime(trade.created_at)}\n`
        })

        makeCSV(gameId, 'trades', csv)
        downloading = false
    }
</script>