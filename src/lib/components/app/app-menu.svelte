<script lang="ts">
    import { displayErrorReporter, displayRules, leaveGame, singOut } from "$lib/actions";
    import { showGameRules } from "$lib/state";
    import AppMenuItem from "./app-menu-item.svelte";

    export let hasGame: boolean = false
    export let isAuthenticated: boolean = false

    function leave(){
        leaveGame()
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
            action: () => displayRules(true),
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
</ul>

<style>
    .app-menu {
        position: fixed;
        bottom: 35px;
        left: 45px;
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
</style>