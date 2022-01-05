<script lang="ts">
    import { displayErrorReporter, displayRules, downloadGameData, endGame, leaveGame, setLoadingModal, showMessage, singOut } from "$lib/actions";
    import { defaultGame } from "$lib/constants";
    import { currentGame, showEndGameModal, showGameRules } from "$lib/state";
    import type { AppGame } from "$lib/types";
    import AppMenuItem from "./app-menu-item.svelte";
    import {saveAs} from 'file-saver'

    export let hasGame: boolean = false
    export let game: Partial<AppGame> = {...defaultGame}
    export let isAuthenticated: boolean = false
    export let isAdmin: boolean = false

    function end(){
        console.log('would end game')
        showEndGameModal.set(true)
    }

    function download(game){
        setLoadingModal(true)

        let line1 = 'game_id,market,actor,actor_id,price,round,type,date';
        let csv = `${line1}/n`

        if(game.game_id){
            downloadGameData(game.game_id)
            .then(results => {
                console.log('got game data: ', results)
                let {trades, players} = results

                let findPlayer = (id) => {
                    let pIndex = players.data.findIndex(player => player.user_id === id)
                    console.log('p index: ', players.data[pIndex])
                    if(pIndex && id){
                        return players.data[pIndex].player_name
                    }
                    else{
                        return ''
                    }
                }

                let getDate = (date) => {
                    let d = new Date(date)
                    return `${d.getSeconds()}/${d.getMinutes()}/${d.getHours()}`
                }

                console.log('AAAA')

                trades.data.map(trade => {
                    csv += `${trade.game_id},${trade.market},${findPlayer(trade.actor)},${trade.actor},${trade.price},${trade.round},${trade.type},${getDate(trade.created_at)}/n`
                })
                
                // setLoadingModal(false)
                console.log('output csv: ', csv)

                let fileName = `icbs_derivatives_${game.game_id}.csv`
                let blob = new Blob([csv], {type: 'text/plain;charset=utf8'})
                saveAs(blob, fileName)

            })
            .catch(err => {
                console.log('error processing download: ', err)
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

    $:items = [
        {
            label: 'Sign-out',
            icon: 'logout',
            action: () => singOut(),
            condition: isAuthenticated
        },
        {
            label: 'Leave Game',
            icon: 'leave',
            action: () => leaveGame(),
            condition: isAuthenticated && hasGame
        },
        {
            label: 'View Rules',
            icon: 'info',
            action: () => showGameRules.set(true),
            condition: true
        },
        {
            label: 'Report Issue',
            icon: 'bug',
            action: () => displayErrorReporter(true),
            condition: true
        },
        {
            label: 'Download Data',
            icon: 'leave',
            action: () => download(game),
            condition: isAuthenticated && hasGame && game.game_id
        },
    ]
</script>

<ul class="app-menu flex jc-start">
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

    {#if isAdmin && $currentGame.game_id && !$currentGame.ended}
        <li class="end-game-button">
            <AppMenuItem
                color="var(--lm-lighter)"
                icon="handStop"
                label="End Game"
                action={end}
            />
        </li>
    {/if}
</ul>

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

    li {
        cursor: pointer;
        margin-right: 15px;
    }

    li.end-game-button {
        padding: 6px 12px;
        background: var(--red);
        border-radius: 6px;
    }
</style>