<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte";
    import TextInput from "$lib/input/text-input.svelte";
    import ClickWrapper from "$lib/components/interaction/click-wrapper.svelte";
    import {nanoid} from 'nanoid'
    import { emailIsValid } from "$lib/helpers";
    import { createUser } from "$lib/actions";

    let list = [createNewUserInput()]
    let submitting = false
    $: userList = list
    
    function submit(){
        let go = hasAllEmails()
        console.log('has all emails: ', go)
        go ?
            createUsersFromList() :
            console.log('will show error message...')
    }

    async function createUsersFromList(){
        submitting = true
        userList.forEach(async (u, i) => {
            let newUser = await createUser(u.email)
            if(newUser.error){
                console.log('error creating user: ', newUser.error)
                list[i].success = false
                list[i].error = newUser.error
            }
            else {
                console.log('created user: ', newUser.user)
                list[i].success = true
                list[i].user = newUser
            }
        })
    }

    function createNewUserInput(){
        return {
            id: nanoid(12),
            email: '',
            user: null,
            error: null,
            success: null,
        }
    }
    function add(){
        console.log('adding...')
        let n = createNewUserInput()
        list = list.concat([n])
    }
    function selectFile(){
        // display file selector
    }

    const hasAllEmails = () => list.filter(i => emailIsValid(i.email)).length === list.length

    function updateEmail(index: number, newValue: string){
        list[index].email = newValue
    }
    function remove(index: number){
        let newList = [...list]
        newList[index] = null
        list = newList.filter(i => i !== null)
    }

    const successStrings = {
        null: 'Pending',
        false: 'Failed!',
        true: 'Success!',
    }
</script>

<style>
    .controls {
        padding: 0 0 10px;
        background: transparent;
        border-bottom: solid thin lightgray;
    }

    p {
        font-size: 0.7em;
        margin: 0;
        color: gray;
        font-weight: 300;
    }

    .tool {
        background: var(--lm-lighter);
        border: solid 1px lightgray;
        padding: 4px 12px;
        border-radius: 4px;
        margin-right: 10px;
        cursor: default;
    }

    .tool:last-child {
        margin: 0;
    }

    .tool:hover {
        border-color: gray;
    }

    .user-email-input {
        margin: 4px 0;
        margin-left: 40px;
        position: relative;
        width: calc(100% - 40px);
        border-radius: 6px;
        background: var(--lm-lighter)
    }

    .user-list {
        padding: 20px 0;
    }

    .remove {
        background: var(--lm-light);
        border-radius: 30px;
        height: 30px;
        width: 30px;
        margin-left: 10px;
        position: absolute;
        left: -48px;
    }

    .scale {
        transform: scale(0.7);
    }

    .potential-user {
        width: 100%;
        padding-left: 10px;
    }

    .potential-user p {
        font-size: 0.85em;
        margin: 0;
        color: var(--dm-mid);
    }

    .user-progress-display {
        width: 100%;
    }

    .user-progress-display .info {
        background: var(--lm-light);
        border-radius: 30px;
        width: 30px;
        height: 30px;
    }
</style>

<div class="create-users">
    <div class="controls flex jc-between">
        <div class="flex jc-start">
            <div class="tool">
                <ClickWrapper handler={add}>
                    <div class="flex jc-start">
                        <p>Add Email</p>
                        <Icon icon="add" />
                    </div>
                </ClickWrapper>
            </div>
            <div class="tool">
                <ClickWrapper handler={add}>
                    <div class="flex jc-start">
                        <p>Import CSV</p>
                        <Icon icon="upload" />
                    </div>
                </ClickWrapper>
            </div>
        </div>
        
        <ClickWrapper handler={submit}>
            <div class="add tool flex jc-start">
                <p>Create Users</p>
                <Icon icon="save" />
            </div>
        </ClickWrapper>
    </div>

    <div class="user-list">
        {#if submitting}
            {#each userList as item, index}
                <div class="user-progress-display flex jc-start">
                    <div class="info flex">
                        <div class="scale flex">
                            {#if item.success}
                                <Icon icon="checkmark" color="green" />
                            {:else if item.success === null}
                                <Icon icon="info" color="lightgray" />
                            {:else}
                                <Icon icon="info" color="red" />
                            {/if}
                        </div>
                    </div>
                    <div class="potential-user flex jc-between">
                        <p>{item.email}</p>
                        <p>{successStrings[String(item.success)]}</p>
                    </div>
                </div>
            {/each}
        {:else}
            {#each userList as item, index}
                <div class="user-email-input flex jc-start">
                    <div class="remove flex">
                        <ClickWrapper handler={() => remove(index)}>
                            <div class="scale flex">
                                <Icon icon="close" />
                            </div>
                        </ClickWrapper>
                    </div>
                    <TextInput 
                        value={item.email}
                        onUpdate={({target}) => updateEmail(index, target.value)}
                        placeholder="Enter the user's email"
                        style="width:100%;"
                    />
                </div>
            {/each}
        {/if}
    </div>
</div>