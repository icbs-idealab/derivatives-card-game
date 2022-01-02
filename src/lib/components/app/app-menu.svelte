<script lang="ts">
    import { displayErrorReporter, displayRules, endGame, leaveGame, setLoadingModal, singOut } from "$lib/actions";
    import { currentGame, showEndGameModal, showGameRules } from "$lib/state";
    import AppMenuItem from "./app-menu-item.svelte";

    export let hasGame: boolean = false
    export let isAuthenticated: boolean = false
    export let isAdmin: boolean = false

    function end(){
        console.log('would end game')
        showEndGameModal.set(true)
        // endGame()
        // .then(result => {
        //     console.log('result of ending game: ', result)
        // })
        // .catch(error => {
        //     console.log('error ending game: ', error)
        // })
        // .finally(() => {
        //     setLoadingModal(false)
        // })
    }

    $:items = [
        {
            label: 'Leave Game',
            icon: 'leave',
            action: () => leaveGame(),
            condition: isAuthenticated && hasGame
        },
        {
            label: 'Sign-out',
            icon: 'logout',
            action: () => singOut(),
            condition: isAuthenticated
        },
        {
            label: 'View Rules',
            icon: 'info',
            action: () => showGameRules.set(true),
        },
        {
            label: 'Report Issue',
            icon: 'bug',
            action: () => displayErrorReporter(true),
        },
    ]
</script>

<ul class="app-menu flex jc-start">
    {#each items as menuItem}
        {#if menuItem}
            <li>
                <AppMenuItem 
                    icon={menuItem.icon} 
                    label={menuItem.label} 
                    action={menuItem.action} 
                />
            </li>
        {/if}
    {/each}

    {#if isAdmin && $currentGame.game_id}
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