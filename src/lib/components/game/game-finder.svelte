<script lang="ts">
    import TabConent from "$lib/components/tabs/tab-conent.svelte";
    import TabbedContainer from "$lib/components/tabs/tabbed-container.svelte";
    import Tabs from "$lib/components/tabs/tabs.svelte";
    import type { MarketButtonParameters } from "$lib/types";
    import CreateGame from "./create-game.svelte";
    import Join from "./join-game.svelte";
    const tabs = [
        {
            label: 'Join Game',
            id: 'join',
            icon: 'game',
            onClick: () => setShow('join-game')
        },
        {
            label: 'Create Game',
            id: 'create-game',
            icon: 'add',
            onClick: () => setShow('create-game')
        },
    ]

    export let show: string = tabs[0].id

    function setShow(target){
        console.log('setting...')
        show = target
    }

    const tabHandler: (tab: any) => any = ({id}: {id: string}) => {
        setShow(id)
    }

    let selectedMarket = {
        name: 'clubs',
        icon: '&clubs',
    } as MarketButtonParameters
    
    let playerName: string = ''
    let gameId: string = ''
    let maximumSpread: number = 4

    const updatePlayerMarket = (newMarket: MarketButtonParameters) => {
        selectedMarket = newMarket
    }

    const updatePlayerName = (newPlayerName: string) => {
        playerName = newPlayerName
    }

    const updateGameId = (newGameId: string) => {
        gameId = newGameId
    }

    const updateMaximumSpread = (newSpread: number) => {
        maximumSpread = newSpread
    }

</script>

<TabbedContainer>
    <Tabs tabs={tabs} onClick={tabHandler} activeTabId={show} />
    <TabConent>
        {#if show === 'join'}
            <Join 
                playerName={playerName}
                updatePlayerName={updatePlayerName}
                gameId={gameId}
                updateGameId={updateGameId}
            />
        {:else}
            <CreateGame 
                market={selectedMarket} 
                updatePlayerMarket={updatePlayerMarket}
                playerName={playerName}
                updatePlayerName={updatePlayerName}
                updateMaximumSpread={updateMaximumSpread}
            />
        {/if}
    </TabConent>
</TabbedContainer>