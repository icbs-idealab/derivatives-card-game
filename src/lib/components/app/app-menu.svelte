<script lang="ts">
    import { 
        // deleteTrades,
        // displayErrorReporter,
        // displayRules,
        downloadGameData,
        getArchiveData,
        getArchives,
        getArchivesForGameID,
        getDummyTradesSB,
        // endGame,
        leaveGame,
        postDummyTrades,
        setLoadingModal, 
        showMessage, 
        singOut 
    } from "$lib/actions";
    import { defaultGame } from "$lib/constants";
    import { currentGame, currentUser, showArchivesModal, showEndGameModal, showGameRules } from "$lib/state";
    import type { AppGame } from "$lib/types";
    import AppMenuItem from "./app-menu-item.svelte";
    import fileSaver from 'file-saver'
    import { Logger, parseArchives, redirect } from "$lib/helpers";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import { get } from "svelte/store";
    import Icon from "../icon/icon.svelte";
    import { nanoid } from "nanoid";
    // import { browser } $app.environment;
    const {saveAs} = fileSaver

    export let hasGame: boolean = false
    export let game: Partial<AppGame> = {...defaultGame}
    export let isAuthenticated: boolean = false
    export let inRevealPhase: boolean = false

    function end(){
        showEndGameModal.set(true)
    }

    function goToAdmin(){
        redirect('/admin')
    }

    async function download(game){
        setLoadingModal(true)

        let line1 = 'game_id,market,actor,actor_id,price,round,type,date,time';
        let csv = `${line1}\n`

        let findPlayer = (id, players) => {
            console.log('player from players: ', players)
            console.log('with id: ', id)
            // let pIndex = players.data.findIndex(player => player.user_id === id)
            let pIndex = players.findIndex(player => player.user_id === id)
            Logger(['p index: ', players[pIndex]])
            if(pIndex && id && players[pIndex]){
                return players[pIndex].player_name
            }
            else{
                return id
            }
        }

        let getTime = (date) => {
            let d = new Date(date)
            return `${d.getHours()}:${d.getMinutes()}:${d.getMilliseconds()}`
        }

        let getDate = (date) => {
            let d = new Date(date)
            return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
        }

        let getFile = () => {
            let fileName = `icbs_derivatives_${game.game_id}_trades.csv`
            let blob = new Blob([csv], {type: 'text/plain;charset=utf8'})
            saveAs(blob, fileName)
        }


        if(game.game_id && !game.ended){
            downloadGameData(game.game_id)
            .then(results => {
                Logger(['got game data: ', results])
                let {trades, players} = results

                trades.data.map(trade => {
                    csv += `${trade.game_id},${trade.market},${findPlayer(trade.actor, players.data)},${trade.actor},${trade.price},${trade.round},${trade.type},${getDate(trade.created_at)},${getTime(trade.created_at)}\n`
                })
                
                // setLoadingModal(false)
                Logger(['output csv: ', csv])

                // let fileName = `icbs_derivatives_${game.game_id}_trades.csv`
                // let blob = new Blob([csv], {type: 'text/plain;charset=utf8'})
                // saveAs(blob, fileName)

                getFile()

            })
            .catch(err => {
                Logger(['error processing download: ', err])
                showMessage({
                    timestamp: Date.now(),
                    message: `Failed to download game data.`,
                    errorMessage: err.message || "",
                    caller: 'app-menu.svelte -> download()',
                })
            })
            .finally(() => {
                setLoadingModal(false)
                // console.log('output csv: ', csv)
            })
        }  
        else if(game.game_id){
            let targetArch
            const {data, error} = await getArchiveData(game.game_id)
            let parsedArchs = parseArchives(data)
            console.log('parsed archs: ', parsedArchs)

            if(parsedArchs.length){
                targetArch = parsedArchs[0]
                targetArch.trades.map(trade => {
                    csv += `${trade.game_id},${trade.market},${findPlayer(trade.actor, targetArch.players)},${trade.actor},${trade.price},${trade.round},${trade.type},${getDate(trade.created_at)},${getTime(trade.created_at)}\n`
                })

                getFile()
            }
            setLoadingModal(false)
        }
        else{
            setLoadingModal(false)
            showMessage({
                timestamp: Date.now(),
                message: `Could not download game data.`,
                errorMessage: `Could not find Game ID`,
                caller: 'app-menu.svelte -> download()',
            })
        }
    }

    async function getDummyTrades(gameID: string){
        const {data, error} = await getDummyTradesSB(gameID)
        console.log('trades: ', data)
        console.log('error: ', error)
    }

    async function getTargetArchives(archiveID = "8OFNLriqVRJ2"){
        console.log('getting target archives for: ', archiveID)
        const {data, error} = await getArchivesForGameID(archiveID)
        if(error){
            console.log('error getting archive data: ', error)
        }
        else if(data){
            let parsedArchs = parseArchives(data)
            console.log('parsed archive data for target: ', parsedArchs)
        }
        else{
            console.log('no data')
        }
    }

    async function createDummyTrades(){
        console.log('creating dummy trades');

        let markets = ['clubs', 'diamonds', 'hearts', 'spades'];
        let trades = [];
        let dummyGameId = "DMY_" + nanoid();
        // create 1500 dummy trades
        for(let i = 0; i < 1500; i++){
            console.log('creating dummy trade: ', i)
            let action = Math.random() > 0.5 ? 'buy' : 'sell'
            let market = markets[Math.floor(Math.random() * markets.length)]
            trades.push({
                game_id: dummyGameId,
                market: market,
                // random user between 1 and 4
                actor: "user_" + (Math.floor(Math.random() * 4) + 1),
                price: 30 + Math.floor(Math.random() * 100) + 1,
                round: Math.floor( (i/ 100) + 1),
                type: action,
                created_at: new Date().toISOString()
            })
        }

        console.log('trades: ', trades)
        const result = await postDummyTrades(trades)
        console.log('result of dummy trades: ', result)
    }

    // async function postDummyTrades(trades: any[]){
    //     console.log('posting dummy trades: ', trades)
    //     for(let i = 0; i < trades.length; i += 100){
    //         let chunk = trades.slice(i, i + 100)
    //         console.log('chunk: ', chunk)
    //         // postTrades(chunk)
    //         await supabase.from('game-trades').insert(chunk)
    //     }
    // }

    $:items = [
        {
            label: 'Sign-out',
            icon: 'logout',
            action: async () => {
                setLoadingModal(true)
                await singOut()
                redirect('/')
                setLoadingModal(false)
            },
            condition: isAuthenticated
        },
        {
            label: 'Leave Game',
            icon: 'leave',
            action: () => leaveGame(),
            condition: isAuthenticated && hasGame && $page.url.pathname !== '/admin'
        },
        {
            label: 'View Rules',
            icon: 'info',
            action: () => showGameRules.set(true),
            condition: true
        },
        {
            label: 'Download Trades',
            icon: 'download',
            action: () => download(game),
            condition: isAuthenticated && hasGame && game.game_id && $page.url.pathname !== '/admin'
        },
        {
            label: 'Get Archives',
            icon: 'archive',
            action: () => getArchives($currentUser.id),
            condition: $currentUser.id
        },
        {
            label: 'Get Target Archives',
            icon: 'archive',
            // action: () => getArchives($currentUser.id),
            // action: () => showArchivesModal.set(true),
            action: () => getTargetArchives(),
            condition: $currentUser.id
        },
        {
            label: 'Get Dummy Trades',
            icon: 'archive',
            // action: () => getArchives($currentUser.id),
            // action: () => showArchivesModal.set(true),
            action: () => {
                let gameID = prompt('Enter Game ID');
                if(gameID){
                    getDummyTrades(gameID);
                }
            },
            condition: $currentUser.id
        },
        {
            label: 'Create Dummy Trades',
            icon: 'archive',
            // action: () => getArchives($currentUser.id),
            // action: () => showArchivesModal.set(true),
            action: () => createDummyTrades(),
            condition: $currentUser.id
        },
        // {
        //     label: 'Delete Trades',
        //     icon: 'bin',
        //     action: () => deleteTradesManual(),
        //     condition: browser && location.href.indexOf('localhost') !== -1
        // },
    ]

    $:offset = $page.url.pathname === '/admin'

    let showMenuInReveal = false

    function toggleMenu(){
        showMenuInReveal = !showMenuInReveal
    }
</script>


<span>
    {#if inRevealPhase}
        <button class="toggle-button flex" on:click={toggleMenu}>
            <Icon icon="menu" />
            Menu
        </button>    
    {/if}
    <ul class="app-menu" data-offset={offset} data-in-reveal={inRevealPhase} data-show-in-reveal={showMenuInReveal}>
        <div class={ inRevealPhase ? 'reveal-menu-content t1' : 'normal-menu-content' } >
            {#each items as menuItem}
                {#if menuItem && menuItem.condition}
                    <li>
                        <AppMenuItem 
                            icon={menuItem.icon} 
                            label={menuItem.label} 
                            action={menuItem.action} 
                        />
                    </li>
                {/if}
            {/each}
        
            {#if $currentGame.admin_id === $currentUser.id}
                <li class="end-game-button">
                    <AppMenuItem
                        bg="var(--blue)"
                        color="var(--lm-lighter)"
                        icon="users"
                        label="Admin Panel"
                        action={goToAdmin}
                    />
                </li>

                {#if $currentGame.game_id && !$currentGame.ended}
                    <li class="end-game-button">
                        <AppMenuItem
                            bg="var(--red)"
                            color="var(--lm-lighter)"
                            icon="handStop"
                            label="End Game"
                            action={end}
                        />
                    </li>
                {/if}
            {/if}
        </div>
    </ul>
</span>


<style>
    .app-menu {
        position: fixed;
        bottom: 35px;
        left: 8vw;
        height: auto;
        width: auto;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .toggle-button {
        width: 70px;
        height: 35px;
        position: fixed;
        z-index: 91;
        bottom: 35px;
        left: calc(8vw - 80px);
        padding: 0 8px 0 3.5px;
        font-size: 0.8em;
    }

    .app-menu[data-offset="true"]{
        left: unset;        
        left: 20px;
        bottom: 25px;
        /* flex-direction: column-reverse;
        align-items: flex-start; */
    }
    
    .app-menu[data-offset="true"] li {
        margin-right: 0;
        margin-top: 18px;
    }

    li {
        cursor: pointer;
        margin-right: 15px;
    }

    .normal-menu-content {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        position: relative;
    }

    .app-menu[data-offset="true"] .normal-menu-content {
        flex-direction: column-reverse;
        align-items: flex-start;
    }

    .app-menu[data-offset="true"] .normal-menu-content li {
        margin-top: 5px;
        width: 100%;
    }

    .reveal-menu-content {
        display: flex;
        flex-direction: column-reverse;
        align-items: flex-start;
        justify-content: flex-start;
        position: relative;
    }

    .reveal-menu-content li {
        margin: 10px 0 0!important;
    }

    [data-show-in-reveal] .reveal-menu-content {
        transition: opacity .2s ease;
        transition-delay: .2s;
    }
    
    [data-show-in-reveal] .t1 {
        transition: top .2s ease;
        /* transition-delay: .2s; */
    }

    [data-show-in-reveal="true"] .reveal-menu-content, 
    [data-show-in-reveal="true"] .t1 {
        opacity: 1;
        top: 0;
    }

    [data-show-in-reveal="false"] .reveal-menu-content,
    [data-show-in-reveal="false"] .t1 {
        opacity: 0;
        top: 50vh;
    }

    .end-game-button {
        order: 10;
    }

</style>