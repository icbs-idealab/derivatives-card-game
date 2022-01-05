<script lang="ts">
    import TabConent from "$lib/components/tabs/tab-conent.svelte";
    import TabbedContainer from "$lib/components/tabs/tabbed-container.svelte";
    import Tabs from "$lib/components/tabs/tabs.svelte";
    import { requestAccess, signIn } from "$lib/actions";
    import Login from "./login.svelte";
    import RequestAccess from "./request-access.svelte";
import { Logger } from "$lib/helpers";
    // import { onMount } from "svelte";
    // import { user } from "$lib/state";
    // import { browser } from "$app/env";
    // import { goto } from "$app/navigation";
    // vars
    $:email = '' as string
    $:password = '' as string
    $:message = '' as string
    //
    const tabs = [
        {
            label: 'Log-in',
            id: 'login',
            icon: 'user',
            onClick: () => setShow('login')
        },
        {
            label: 'Request Access',
            id: 'request',
            icon: 'request',
            onClick: () => setShow('request')
        },
    ]

    export let show: string = tabs[0].id

    function setShow(target){
        Logger(['setting...'])
        show = target
    }

    const submit = async ({email, password, message}: any) => {
        Logger(['async submit'])
        if(show === 'login'){
            // handle log-in submission
            Logger(['handling login: ', email, ' ', password])
            const newUser = await signIn(email, password)
            Logger(['new user is: ', newUser])
            return newUser
        }
        else {
            // handle request submission
            Logger(['hadling request: ', email, ' ', message])
            const requestStatus = await requestAccess(email, message)
            return requestStatus
        }
    }

    const tabHandler: (tab: any) => any = ({id}: {id: string}) => {
        setShow(id)
    }

    const updateEmail = (value) => {
        email = value
        Logger(['udpating'])
    }
    function updatePassword(value){password = value}
    function updateMessage(value){message = value}

    // onMount(() => {
    //     let {id, user_metadata} = $user
    //     if(id){
    //         // send user to game creation page
    //         browser && goto('find-game')
    //     }
    // })
</script>

<TabbedContainer>
    <!-- <div class="tab-header flex"> -->
        <Tabs tabs={tabs} onClick={tabHandler} activeTabId={show} />
    <!-- </div> -->
    <TabConent>
        {#if show === 'login'}
            <Login onSubmit={submit} email={email} password={password} updateEmail={updateEmail} updatePassword={updatePassword} />
        {:else}
            <RequestAccess onSubmit={submit} email={email} message={message} updateEmail={updateEmail} updateMessage={updateMessage} />
        {/if}
    </TabConent>
</TabbedContainer>

