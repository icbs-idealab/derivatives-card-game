<div class={"admin-page" + canView ? '' : 'flex'}>
    {#if canView}
        <div class="admin">
            <div class="admin-tools flex fd-col jc-start">
                <div class="title flex jc-between">
                    <h3>Admin Tools</h3>
                    <div on:click={home}>
                        <Icon icon="home" />
                    </div>
                </div>
                <div 
                    class="admin-tool flex jc-start" 
                    on:click={() => setView('create-user')}
                    style="width: 100%"    
                >
                    <Icon icon="user" />
                    <p>Create Users</p>
                    {#if view === 'create-user'}
                        <div class="marker"></div>
                    {/if}
                </div>
                <!-- <div 
                    class="admin-tool flex jc-start" 
                    on:click={() => setView('view-issues')}
                    style="width: 100%"    
                >
                    <Icon icon="bug" />
                    <p>View Issues</p>
                    {#if view === 'view-issues'}
                        <div class="marker"></div>
                    {/if}
                </div> -->
            </div>
            <div class="content">
                {#if view === 'create-user'}
                    <CreateUsers />
                {/if}
            </div>
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

<script>
    import { browser } from "$app/env";
    import { goto } from "$app/navigation";
    import CreateUsers from "$lib/components/auth/create-users.svelte";
    import Icon from "$lib/components/icon/icon.svelte";
    import { currentUser } from "$lib/state";
    import { afterUpdate, onMount } from "svelte";
    let view = 'create-user'
    const admins = {
        'winger.shane@gmail.com': true,
        'shane@fulcrum.house': true,
        'p.tulip@imperial.ac.uk': true,
    }

    let count = 0
    let canView = false

    function setView(newView){
        view = newView
    }
    function home(){
        browser && goto('/')
    }

    currentUser.subscribe((newUser) => {
        if(newUser.id && newUser.email && admins[newUser.email]){
            console.log('user is admin... ', count)
        }
        count += 1
        console.log('count: ', count)
    })

    onMount(() => {
        if($currentUser.id && $currentUser.email && admins[$currentUser.email]){
            canView = true
        }
    })
</script>

<style>
    /* .is-loading {
        height: 15px;
        border-radius: 10px;
        border: solid thin lightgray;
        width: 400px;
    }

    .auth-loaing {
        width: 100%;
        max-width: 600px
    } */

    /* .admin-page {
        padding: 0px;
        width: 100%;
        min-height: 100vh;
    } */

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
        width: 100%
    }
</style>