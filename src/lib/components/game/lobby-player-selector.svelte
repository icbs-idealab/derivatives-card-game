<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte";
	import { Logger } from "$lib/helpers";
	import { afterUpdate } from "svelte";
    export let select = (player: any, role: string) => {
        // console.log('will notify parent component that we are trying to assign the selected player')
    }
    export let selectBot: (...props: any) => any = () => console.log('selecting bot!')
    export let role: string = 'unknown'
    
    export let players: {
        user_id: string
        game_id: string
        player_name: string
    }[] = []

    export let selectedPlayer = {
        player_name: 'none',
        game_id: '',
        user_id: '',
        is_bot: false
    }

    function selectLocal(player: any){
        console.log('selecting: ', player)
        select(player, role)
        toggleList()
    }

    function selectLocalBot(){
        selectBot()
        toggleList()
    }

    let showList = false
    const toggleList = () => showList = !showList

    afterUpdate(() => {
        Logger([
            'players are: ',
            players
        ])
    })
</script>

<div class="player-selector">
    <div 
        class="selected-player flex" 
        on:click={toggleList} 
        data-selected={selectedPlayer !== null}
        on:keydown={() => console.log('on keydown')}
    >
        {#if selectedPlayer}
            <p class="selected-name" data-bot={selectedPlayer.is_bot}>
                {#if selectedPlayer.is_bot}
                    <Icon icon="bot" />
                {/if}
                <span>
                    {selectedPlayer.player_name}
                </span>
            </p>
        {:else}
            <p>None</p>
        {/if}
        <div class="icon-fix flex">
            <Icon icon="chevronDown" />
        </div>
    </div>
    {#if showList}
        <div class="player-list">
            {#each players as player}
                <div 
                    class="select-content" 
                    on:click={() => selectLocal(player)} 
                    on:keydown={() => console.log('on keydown')}
                >
                    <Icon icon="user" />
                    <p>{player.player_name}</p>
                </div>
            {/each}
            <div 
                class="select-content" 
                on:click={selectLocalBot} 
                on:keydown={() => console.log('on keydown')}
            >
                <Icon icon="bot" />
                <p class="capitalise">{role} Bot</p>
            </div>
            <div on:click={() => selectLocal(null)} on:keydown={() => console.log('on keydown')}>
                <p>None</p>
            </div>
        </div>
    {/if}
</div>

<style>

    [data-selected=true]{
        background-color: rgba(80, 180, 30, 0.3)!important;
    }

    .player-selector {
        width: 100%;
        height: calc(100% - 10px);
        position: absolute;
        left: -5px;
        top: 5px;
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 5px;
    }

    .selected-player {
        border: none;
        /* background: var(--lm-light); */
        background: rgb(225, 225, 225);
        color: black;
        border-radius: 4px;
        position: relative;
    }

    .player-list {
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 10px;
        position: absolute;
        z-index: 999;
        top: calc(100% + 5px);
        border-radius: 4px;
        left: 0;
        padding: 20px;
        right: 0;
        /* width: calc(100% - 85px); */
        width: (100% + 15px);
        border: solid thin lightgray;
        /* background: whitesmoke; */
        background: rgb(235, 235, 235);
        box-shadow: var(--lm-container-shadow)
    }

    .player-list p {
        margin: 0;
    }

    .player-list > div {
        width: 100%;
    }

    .player-list > div:hover {
        opacity: 0.5;
    }

    .icon-fix {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: 80px;
    }

    .select-content, [data-bot="true"] {
        display: grid;
        grid-template-columns: 25px 1fr;
        gap: 10px;
        align-items: center;
        justify-content: flex-start;
        align-content: flex-start;
    }
</style>

