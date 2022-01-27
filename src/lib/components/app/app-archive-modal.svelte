<script lang=ts>
    import { getArchives } from "$lib/actions";
    import { emptyHand, playerRevealRounds } from "$lib/constants";
    import { makeGamePlayersAsObject } from "$lib/helpers";
    import { appMessage, archives, currentUser, showAppMessage, showArchivesModal } from "$lib/state";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import Icon from "../icon/icon.svelte";
    import SuitIcon from "../suit/suit-icon.svelte";
    import Backdrop from "./backdrop.svelte";
    import LoadingText from "./loading-text.svelte";
    import fileSaver from 'file-saver'
    const {saveAs} = fileSaver

    function hide(){
        showArchivesModal.set(false)
    }

    let gettingArchives = false
    let localArchives = []
    let disabled: {[index: string]: {trades: boolean, players: boolean }} = {}

    async function findArchives(){
        gettingArchives = true
        const {data, error} = await getArchives( get(currentUser).id );
        if(!error && data) {

            setDisabledMap(data)
            localArchives = parseArchives(data)

        }
        else if(error){
            console.log('error getting archive: ', error)
            showAppMessage.set(true)
            appMessage.set({
                message: 'Could not find archives',
                errorMessage: error.message,
                caller: 'app-archive-modal.svelte: findArchives()'
            })
        }
        gettingArchives = false
    }

    function setDisabledMap(data: any){
        Array.isArray(data) && data.map((g) => {
            // console.log('a')
            disabled[g.game_id] = {
                players: false,
                trades: false,
            }
        })
    }

    function parseArchives(list){
        // let ids = {}
        // let usable = []
        // list.forEach((arch) => {
        //     if( !ids[arch.game_id] ){
        //         usable.push(arch)
        //         ids[arch.game_id] = true
        //     }
        //     console.log('$ids$: ', ids)
        // })

        return list.map(arch => {
            let mapped = {
                ...arch,
                players: arch.players.data,
                mappedPlayers: makeGamePlayersAsObject(arch.players.data),
                // trades: JSON.parse(arch.trades),
                participants: arch.participants.split('_'),
            }
            console.log('arch: ', mapped)
            return mapped
        })
    }

    function parseDate(date){
        let d = new Date(date)
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
    }

    function parseTime(date){
        let d = new Date(date)
        return `${d.getHours()}:${d.getMinutes()}:${d.getMilliseconds()}`
    }

    function getPlayer(player_id: string, archive){
        let targetPlayer = archive.players.filter(p => p.user_id === player_id)
        if(targetPlayer.length){
            return targetPlayer[0].player_name || 'case a'
        }
        else{
            return player_id
        }
    }

    const tableKeys  = {
        players: 'game id,role,player name,clubs,diamonds,hearts,spades,round 1,round 6,round 11, round 16, round 21,round 26',
        trades: 'game id,actor,actor id,market,round,price,type,date,time'
    }

    const extractors = {
        players: (keys, source, archive?) => {
            let csvData = `${keys}\n`
            source.map((player, index) => {
                let hand = {...emptyHand}
                function countCards(){
                    for(let round in player.revealed){
                        if(player.revealed[round]){
                            hand[ player.revealed[round] ] += 1
                        }
                    }
                }
                
                countCards()

                console.log('current player: ', player)

                csvData += [
                    player.game_id,
                    player.role,
                    player.player_name || 'n/a',
                    player.hand ? hand.clubs : 'n/a',
                    player.hand ? hand.diamonds : 'n/a',
                    player.hand ? hand.hearts : 'n/a',
                    player.hand ? hand.spades : 'n/a',
                    player.revealed ? player.revealed['1'] || 'n/a' : 'n/a',
                    player.revealed ? player.revealed['6'] || 'n/a' : 'n/a',
                    player.revealed ? player.revealed['11'] || 'n/a' : 'n/a',
                    player.revealed ? player.revealed['16'] || 'n/a' : 'n/a',
                    player.revealed ? player.revealed['21'] || 'n/a' : 'n/a',
                    player.revealed ? player.revealed['26'] || 'n/a' : 'n/a',
                ].join(',') + '\n'
            })
            return csvData
        },
        trades: (keys, source, archive) => {
            let csvData = `${keys}\n`
            source.map((trade) => {
                let line = ([
                    trade.game_id,
                    trade.market,
                    getPlayer(trade.actor, archive),
                    trade.actor,
                    trade.price,
                    trade.round,
                    trade.type,
                    parseDate(trade.created_at),
                    parseTime(trade.created_at),
                ].join(',') + '\n')
                csvData += line
            })
            return csvData
        },
    }

    function getData(targetArchive, target: string){
        disabled[targetArchive.game_id][target] = true

        let source = targetArchive[target]
        console.log(`extracting: ${target} from: `, source)
        let keys = tableKeys[target]
        // let csvData = `${keys}\n`
        let handler = extractors[target]
        let output = handler(keys, source, targetArchive)
        console.log('output: ', output)

        let filename =  `icbs_derivatives_${targetArchive.game_id}_${target}.csv`
        let blob = new Blob([output], {type: 'text/plain;charset=utf8'})
        saveAs(blob, filename)
        setTimeout(() => {
            disabled[targetArchive.game_id][target] = false
        })
    }

    onMount(() => {
        findArchives()
    })
</script>
<Backdrop>
    <div class="fill flex"></div>
    {#if gettingArchives}
        <LoadingText />
    {:else}
        <div class="archives flex fd-col jc-start ai-start">
            <h1 class="main-title">Game Archives</h1>
            <p>You have participated in {localArchives.length} games.</p>
            <ul class="archive-list flex fd-col">
                <li class="archive-keys">
                    <div>Game ID</div>
                    <div>Date Archived</div>
                    <div>Date Started</div>
                    <div>Players</div>
                    <div>Completed</div>
                    <!-- <div>Abandoned</div> -->
                    <div>Trades</div>
                    <div>Downloads</div>
                </li>
                {#each [...localArchives] as arch}
                    <li class="archive-entry">
                        <div>{arch.game_id}</div>
                        <div>{parseDate(arch.created_at)}</div>
                        <div>{parseDate(arch.game.created_at)}</div>
                        <div class="arch-players flex fw-wrap jc-start">
                            {#each arch.players as player}
                                {#if player.user_id}
                                    <div class="arch-player flex">
                                        <SuitIcon suit={player.role} />
                                        <p class="player-name">{player.player_name}</p>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                        <div>{arch.game.completed || arch.game.round === 33}</div>
                        <!-- <div>{arch.game.ended && arch.game.completed}</div> -->
                        <div>{arch.trades.length}</div>
                        <div class="download-buttons flex fd-col ai-stretch">
                            <button 
                                class="download-button flex jc-between" 
                                disabled={disabled[arch.game_id].trades}
                                on:click={() => getData(arch, 'trades')}
                            >
                                <span class="label flex jc-start">Trades</span>
                                <Icon icon="dollar" color="white" />
                            </button>
                            <button 
                                class="download-button flex jc-between" 
                                disabled={disabled[arch.game_id].players}
                                on:click={() => getData(arch, 'players')}
                            >
                                <span class="label flex jc-start">Players</span>
                                <Icon icon="users" color="white" />
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
        <div class="controls flex" on:click={hide}>
            <!-- <button class="close button" on:click={hideRules}>Close Rules</button> -->
            <div class="flex">
                <Icon icon="close" />
            </div>
        </div>
    {/if}
</Backdrop>

<style>
    .main-title {
        margin-top: 0;
        width: 100%;
        max-width: 700px;
        text-align: left;
    }

    ul > li {
        padding: 10px;
        margin-bottom: 10px;
        width: 100%;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 20px 0 0;
        min-width: 100%;
    }

    li.archive-keys {
        border-bottom: solid thin lightgray;
        font-size: 0.8em;
        color: gray;
        padding: 10px 0;
    }

    li.archive-keys > div {
        display: flex;
        justify-content: flex-start;
        align-items: stretch;
        font-weight: bold;
    }

    li {
        display: grid;
        /* grid-template-columns: 1fr 0.65fr 0.65fr 1fr 0.5fr 0.5fr 1fr 0.5fr; */
        grid-template-columns: 1fr 0.65fr 0.65fr 1fr 0.5fr 1fr 0.5fr;
        grid-template-rows: auto;
        gap: 10px
    }
    
    li:not(.archive-keys){
        font-size: 0.8em;
        width: 100%;
        font-weight: 100;
        margin-bottom: 8px;
        padding: 10px 0;
        background: whitesmoke;
        border-radius: 3px;
        border-bottom: solid thin lightgray;

    }

    .controls {
        position: fixed;
        top: 40px;
        right: 50px;
        width: 50px;
        height: 50px;
        border: solid thin gray;
        border-radius: 40px;
        background: white;
    }

    .archives {
        position: fixed;
        top: 40px;
        bottom: 40px;
        left: 50px;
        right: 140px;
        background-color: whitesmoke;
        overflow-y: scroll;
        border-radius: 3px;
        padding: 40px;
    }

    div::-webkit-scrollbar-track {
        background: transparent;
        width: 0;
    }

    .arch-player {
        margin-right: 5px;
        margin-bottom: 5px;
        background: lightgray;
        padding: 4px;
        border-radius: 4px;
    }

    .arch-player p {
        margin-left: 5px;
        margin-right: 5px;
        font-size: 0.8em;
    }

    .download-button {
        margin-bottom: 5px;
        background: black;
        padding: 4px 10px;
        border-radius: 4px;
        width: 100%;
    }

    .download-button .label {
        color: white!important;
        font-size: 0.9em;
        margin: 0;
    }

    .download-button[disabled]{
        opacity: 0.5;
    }

</style>