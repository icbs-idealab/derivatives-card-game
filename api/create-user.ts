import { createClient } from '@supabase/supabase-js'
const supabaseURL = process.env.VITE_SUPABASE_URL as string
const anonKey = process.env.VITE_SUPABASE_ADMIN_KEY as string
export const supabase = createClient(supabaseURL, anonKey)

export default async function handler(request, response) {
    const req = JSON.parse(request.body);
    const {emailList} = req
    // console.log('typeof email list: ', typeof emailList)
    // const keys = Object.keys(request.query)
    // console.log('request keys: ', keys)
    // console.log('request: ', request.body)
    let password = 'test123'
    // console.log('req: ', req, ' / ', typeof req)
    // console.log('email list: ', emailList)

    let calls = []

    emailList.forEach( async ({email}, index) => {
        console.log('will create user with email: ', email)
        
        // process and then set new value in object 
        // let { data: user, error } = await supabase.auth.api.createUser({
        //     email,
        //     password
        // })    

        calls.push(
            async () => {
                console.log('email in call: ', email)
                return await supabase.auth.api.createUser({
                    email,
                    password
                })
            }
        )

        // console.log('error creating user? : ', error)

        // emailList[index].success = !error
        // emailList[index].user = user
        // emailList[index].error = error
    })

    Promise.all(
        calls.map(c => c())
    )
    .then(res => {
        response.status(200).send(JSON.stringify({promiseResult: res}));
    }) 
    .catch(err => {
        console.log('error creating all: ', err)
        response.status(400).send(JSON.stringify({promiseError: emailList, err}));
    }) 
    
    // console.log('pResult: ', pResult)

    // response.status(200).send(JSON.stringify({result: "Working!"}));
}