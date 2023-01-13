<svelte:head>
    <script 
        src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"
        integrity="sha512-SGWgwwRA8xZgEoKiex3UubkSkV1zSE1BS6O4pXcaxcNtUlQsOmOmhVnDwIvqGRfEmuz83tIGL13cXMZn6upPyg=="
        crossorigin="anonymous" 
        referrerpolicy="no-referrer">
    </script>
</svelte:head>

<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { checkIfAdmin } from "$lib/actions";
    import Icon from "$lib/components/icon/icon.svelte";
    import { Logger, redirect } from "$lib/helpers";
    import { currentUser } from "$lib/state";
    import { afterUpdate, onMount } from "svelte";
    import ViewGames from "$lib/components/admin/view-games.svelte";
    import LoadingText from "$lib/components/app/loading-text.svelte";
    import CreateUsers from "$lib/components/auth/create-users.svelte";
    import ViewUsers from "$lib/components/admin/view-users.svelte";
    import ViewTrades from "$lib/components/admin/view-trades.svelte";
    import ViewPlayersByGameId from "$lib/components/admin/view-players-by-game-id.svelte";
    import ViewPriceLogById from "$lib/components/admin/view-price-log-by-id.svelte";
    
    let view = 'create-users'
    let canView = false
    let checking = true
    let adminEmail = ""
    let adminTools = [
        {
            id: 'create-users',
            label: 'Create Users',
            icon: 'add'
        },
        {
            id: 'view-trades',
            label: 'View Trades by ID',
            icon: 'list'
        },
        {
            id: 'view-players-by-game-id',
            label: 'Players by GameID',
            icon: 'list'
        },
        {
            id: 'view-price-log-by-id',
            label: 'Price Change Log',
            icon: 'dollar'
        },
        {
            id: 'view-users',
            label: 'User List',
            icon: 'users',
            disabled: true
        },
        {
            id: 'view-games',
            label: 'View Games',
            icon: 'game',
            disabled: true
        },
    ]

    function setView(newView: any){
        view = newView
    }
    function home(){
        browser && redirect('/')
    }

    currentUser.subscribe(async (newUser) => {
        let adminRecord = await getAdminList(newUser)
        console.log('admin record: ', adminRecord)
        setTimeout(() => {
            canView = adminRecord && adminRecord.active
            adminEmail = adminRecord.email
            checking = false
        }, 1000)

    })

    async function getAdminList(newUserData: any){
        const {data, error} = await checkIfAdmin(newUserData)
        Logger(['$$admin: ', data])
        Logger(['$$admin error: ', error])
        return !error && data.length ?
            data[0]
            : null
    }

    const components: any = {
        'create-users': CreateUsers,
        'view-users': ViewUsers,
        'view-price-log-by-id': ViewPriceLogById,
        'view-trades': ViewTrades,
        'view-players-by-game-id': ViewPlayersByGameId,
    }
</script>

<!-- <h1>Woo!</h1>
<h1>{Date.now()}!</h1> -->

<div class={"admin-page" + canView ? '' : 'flex'}>
    {#if checking && !canView}
        <div class="no-auth flex fd-col">
            <LoadingText loadingText="Checking Priveliges" />
        </div>
    {:else if canView}
        <div class="admin">
            <div class="admin-tools flex fd-col jc-start">
                <div class="title flex jc-between">
                    <h3>Admin Tools</h3>
                    <button on:click={home}>
                        <Icon icon="home" />
                    </button>
                </div>

                <p class="small">{adminEmail}</p>

                <div class="admin-tools-operations">
                    {#each adminTools as tool}
                        <button 
                            class="admin-tool flex jc-start" 
                            on:click={() => !tool.disabled && setView(tool.id)}
                            data-disabled={tool.disabled}
                        >
                            <Icon icon={tool.icon} />
                            <p class="tool-label">{tool.label}</p>

                            {#if view === tool.id}
                                <div class="marker"></div>
                            {/if}    
                        </button>
                    {/each}
                </div>

            </div>

            <!-- output -->

            <div class="content">
                <svelte:component this={components[view]} />
            </div>
            
            <!-- end output -->

        </div>
    {:else}
        <div class="no-auth flex fd-col">
            <h1>Access Denied</h1>
            <p>You do not have access to view this page.</p>
            <br>
            <br>
            <button class="flex jc-between" on:click={home}>
                <span>Return to Home Page</span>
                <Icon icon="home" />
            </button>
        </div>
        <!-- <div class="auth-loaing flex fd-col">
            <h1>Authenticating...</h1>
            <div class="is-loading flex"></div>
        </div> -->
    {/if}
</div>

<style>
    [data-disabled="true"]{
        opacity: 0.25!important;
    }

    .small {
        font-size: 0.7em;
        width: 100%;
        overflow: hidden;
        margin-bottom: 20px;
    }

    .admin {
        padding: 40px;
        padding-left: 280px;
        width: 100%;
        height: 100%;
    }

    .admin-tools {
        background: var(--lm-lighter);
        border-right: solid thin lightgray;
        height: 100vh;
        width: 240px;
        padding: 20px;
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
    }

    .admin-tool {
        background: var(--lm-light);
        border: solid thin lightgray;
        height: 40px;
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        position: relative;
        margin-bottom: 10px;
        cursor: default!important;
    }

    .admin-tool p {
        font-size: 0.8em;
        margin: 0 0 0 5px;
    }

    .marker {
        height: 10px;
        width: 10px;
        border-radius: 10px;
        background: var(--green);
        position: absolute;
        right: 10px;
    }

    .title {
        width: 100%;
        margin: 24px 0 25px;
        padding-bottom: 5px;
        border-bottom: solid thin lightgray;
    }

    .title h3 {
        margin: 0 0 10px;
    }
</style>