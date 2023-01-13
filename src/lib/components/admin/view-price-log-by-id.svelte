<script lang="ts">
    import { getPriceChangeLogs } from "$lib/actions";
    import { Logger, makeCSV } from "$lib/helpers";
    import type { AdminControlButton, RateChangeLog } from "$lib/types";
    import Loader from "../app/loader.svelte";
    import LoadingModal from "../app/loading-modal.svelte";
    import Icon from "../icon/icon.svelte";
    import TableControls from "./table-controls.svelte";


    let gameId: string = '' // eg 5EsiPBZ7idWG
    let submitting: boolean = false
    let downloading: boolean = false
    let calculating: boolean = false
    let logs: RateChangeLog[] = []

    function handleInput({target}: any){
        gameId = target.value
    }

    function setLogData(data: any){
        logs = data
    }

    async function submit(){
        submitting = true
        let {logData, error} = await getLogs(gameId)
        setTimeout(() => {
            submitting = false
            logData && logData.length && setLogData(logData)
        })
    }

    async function getLogs(id: string): Promise<{logData: any[], error: any}>{
        return new Promise( async (resolve, reject) => {
            const {data, error} = await getPriceChangeLogs(id)
            Logger(['Parsed data: ', data])
            !error && resolve({logData: data, error})
            error && reject({logData: null, error})
        })
    }

    function getCSVHeaders(){
        return `#,time,timestamp,round,buy,sell,market,player`
    }

    function parseDownloadData(){
        return logs.map((datum, index) => [
            index,
            datum.parsedTime ? `${datum.parsedTime.day}/${datum.parsedTime.month}/${datum.parsedTime.year}@${datum.parsedTime.hour}:${datum.parsedTime.minute}:${datum.parsedTime.second}` : '',
            datum.time,
            datum.round,
            datum.buy,
            datum.sell,
            datum.role,
            datum.player_name,
        ].join(','))
        .join(`\n`)
    }

    async function downloadLogs(){
        Logger(['Downloading!'])
        downloading = true
        let csv = `${getCSVHeaders()}\n`
        csv += parseDownloadData()
        await makeCSV(gameId, `Price Log`, csv)
        endDownload()
    }
    
    function endDownload(){
        setTimeout(() => {
            Logger(['Stopping Download!'])
            downloading = false
        }, 1000)
    }

    $: buttons = [
        {
            label: 'Download',
            action: downloadLogs,
            icon: 'download',
            disabled: downloading
        },
    ] as AdminControlButton[]
</script>

<div class="view-log">
    <div class="view-title">
        <h2>Price Log By Game ID</h2>
    </div>

    <!-- game id input -->

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
            >Find Logs</button>
        </div>
    </div>

    <!-- results -->

    <TableControls buttons={buttons} />

    <div class="results">
        {#if logs && logs.length}
        <div class="headers">
            <div class="log-attribute">#</div>
            <div class="log-attribute">Time</div>
            <div class="log-attribute">Timestamp</div>
            <div class="log-attribute">Round</div>
            <div class="log-attribute">Buy</div>
            <div class="log-attribute">Sell</div>
            <div class="log-attribute">Market</div>
            <div class="log-attribute">Player</div>
        </div>
        <div class="list-output">
            {#each logs as log, index}
                <div class="log-row">
                    <div class="log-attribute">{index + 1}</div>
                    <div class="log-attribute is-time">
                        {#if log.parsedTime}
                            <span class="date-time">
                                <Icon icon="calendar" />
                                {log.parsedTime.day}.{log.parsedTime.month}.{log.parsedTime.year}
                            </span>
                            <span class="time-time">
                                <Icon icon="clock" />
                                {log.parsedTime.hour}:{log.parsedTime.minute}:{log.parsedTime.second}
                            </span>
                        {/if}
                    </div>
                    <div class="log-attribute">{log.time}</div>
                    <div class="log-attribute">{log.round || ''}</div>
                    <div class="log-attribute">{log.buy}</div>
                    <div class="log-attribute">{log.sell}</div>
                    <div class="log-attribute">{log.role}</div>
                    <div class="log-attribute">{log.player_name}</div>
                </div>
            {/each}
        </div>
        {/if}

    </div>
    {#if submitting || downloading} <LoadingModal /> {/if}


</div>

<style>
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

    input {
        width: 100%;
        border: none;
        height: 55px;
        background-color: white;
        border-radius: 6px;
        padding: 10px;
    }

    /* table */

    .log-row, .headers {
        display: grid;
        grid-template-columns: 0.2fr 0.85fr 0.65fr 0.35fr 0.35fr 0.35fr 0.65fr 1fr;
        border-bottom: solid thin lightgray;
    }

    .log-row {
        background: rgba(240, 240, 240, 0.15);
    }

    .headers {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        /* background-color: white; */
    }

    .log-attribute {
        word-wrap: break-word;
        white-space: pre-wrap;
        overflow-x: scroll;
        padding: 5px;
        border-right: solid thin lightgray;
        font-size: 12pt;
    }

    .results {
        position: relative;
        min-height: 600px;
        height: 600px;
        width: 100%;
        background: var(--lm-light);
        margin-top: 40px;
        /* padding: 40px; */
        border-radius: 6px;
        overflow:hidden;
        border: solid thin lightgray;
    }

    .list-output {
        overflow-y: scroll;
        min-height: calc(100% - 90px - 40px);
        position: relative;
        top: 40px;
        padding-bottom: 40px;
        height: 100%;
        background: white;
    }

    .time-time, .date-time {
        display: inline-grid;
        align-items: center;
        grid-template-columns: 25px 1fr;
        gap: 0;
    }

    .is-time {
        display: grid;
        grid-template-columns: 1fr 1fr;    
    }
</style>