<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
    import ClickWrapper from "$lib/components/interaction/click-wrapper.svelte";
    import {nanoid} from 'nanoid'
    import { emailIsValid, Logger } from "$lib/helpers";
    import { createUser, setLoadingModal, setShowAppMessage, showMessage } from "$lib/actions";
    import Papa from 'papaparse'

    let list = [createNewUserInput()]
    let submitting = false
    $: userList = list
    
    function submit(){
        let go = hasAllEmails()
        Logger(['has all emails: ', go])
        go && createUsersFromList()
        !go && showError()

        function showError(){
            showMessage({
                message: 'There are invalid emails in your list. Please check and correct them.',
                errorMessage: '',
                timestamp: Date.now()
            })

            setShowAppMessage(true)
        }
    }

    async function createUsersFromList(){
        submitting = true
        userList.forEach((u, i) => {
            createUser(u.email)
            .then(result => {

                // if(result.user && !result.error){
                    Logger(['result of creating user: ', result.user])
                    list[i].success = !result.error
                    list[i].user = result.user
                    list[i].error = result.error
                // }


            })
            .catch(err => {
                Logger(['error creating user: ', err])
                // list[i].success = false
                // list[i].error = newUser.error
            })
        })

        // submitting = 
        // userList.forEach(async (u, i) => {
        //     let newUser = await createUser(u.email)
        //     if(newUser.error){
        //         Logger(['error creating user: ', newUser.error])
        //         list[i].success = false
        //         list[i].error = newUser.error
        //     }
        //     else {
        //         Logger(['created user: ', newUser.user])
        //         list[i].success = true
        //         list[i].user = newUser
        //     }
        // })
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
        Logger(['adding...'])
        let n = createNewUserInput()
        list = list.concat([n])
    }

    function selectFile(e){
        // display file selector
        setLoadingModal(true)
        console.log('selecting file: ', e)
        if(e.target.files && e.target.files.length){
            console.log('target file: ', e.target.files[0])
            let f = Papa.parse(e.target.files[0], {complete: (res) => {

                console.log('result: ', res)
                let newList = []
                let added: any = {}
                res.data.map(row => {

                    let n: any = {
                        // email: (row[0] as string),
                        id: nanoid(12),
                        user: null,
                        success: null,
                    }
                    if(Array.isArray(row) && row[0] && row[0] !== 'email'){
                        n.email = (row[0] as string)
                        // only add unique emails
                        if(!added[row[0]]){
                            newList.push(n)
                            added[row[0]] = true
                        }
                    }
                    else if(typeof row === 'string'){
                        // only add unique emails
                        n.email = row
                        if(!added[row]){
                            newList.push(n)
                            added[row] = true
                        }
                    }
                })

                list = list.concat(newList)

                setTimeout(() => {
                    setLoadingModal(false)
                }, 1000)
            }})
        }
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

    p, .button-label {
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

    #csv {
        /* display: hidden; */
        opacity: 0;
        height: 0;
        width: 0;
        position: fixed;
        top: -9999px;
        left: -9999px;
    }
</style>

<div class="create-users">
    <div class="controls flex jc-between">
        <div class="flex jc-start">
            <div class="tool">
                <ClickWrapper handler={add}>
                    <div class="flex jc-start">
                        <span class="button-label">Add Email</span>
                        <Icon icon="add" />
                    </div>
                </ClickWrapper>
            </div>
            <div class="">
                <!-- <ClickWrapper handler={selectFile}> -->
                    <form>
                        <div class="" for="csv">
                            <label class="tool flex jc-start" for="csv">
                                <span class="button-label">Import CSV</span>
                                <Icon icon="fileImport" />
                            </label>
                        </div>
                        <!-- hidden input -->
                        <input type="file" name="csv" id="csv" on:input={selectFile}>
                    </form>
                <!-- </ClickWrapper> -->
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