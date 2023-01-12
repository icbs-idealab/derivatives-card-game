<script lang="ts">
    import { Logger } from "$lib/helpers.js";
    import { currentUser } from "$lib/state.js";
    import type { SupabaseUser } from "$lib/types.js";
    import type { RealtimeChannel } from "@supabase/supabase-js";
    import { onMount, afterUpdate, onDestroy } from "svelte";
    import { supabase } from "./supabase.js";
    
    let watchState = false;
    let watcher: RealtimeChannel | undefined;
    let opts = {capture: true};

    window.addEventListener('pagehide', (event) => {
      event.preventDefault();
      checkOut()
      Logger(['removing presence!'])
      window.alert('page hide is true!')
      // If the event's persisted property is `true` the page is about
      // to enter the back/forward cache, which is also in the frozen state.
      // If the event's persisted property is not `true` the page is
      // about to be unloaded.
      // logStateChange(event.persisted ? 'frozen' : 'terminated');
    }, opts);


    function handleWatch(res: any){
      console.log("RES: ", res);
      console.log('Watcher is now: ', watcher)
    };
  
    function watchTestDB() {
      console.log("starting to watch");
      watcher = supabase
        .channel("*")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "test" },
            handleWatch
        )
        .subscribe();
  
      watchState = true;
    }
  
    async function add() {
      console.log("adding!");
      const { data, error } = await supabase
        .from("test")
        .insert({ value: "The time was " + Date.now() })
        .select();
  
      if (!error) {
        console.log("add res: ", data);
      } else console.log("add error: ", error);
    }
  
    async function increment() {
      let id = "901da505-ff67-418e-b5b3-3f0c0ff932ef";
      const { data, error } = await supabase
        .from("test")
        .update({ value: "The time is now " + Date.now() })
        .eq("id", id)
        .select();
  
      error && console.log("Error from increment: ", error);
      !error && console.log("Result of increment: ", data);
    }

    currentUser.subscribe(activeUser => {
      if(activeUser && activeUser.id){
        // check if user is in a game by looking at meta data
        activeUser.user_metadata.game_id &&
        checkIn()
      }
      else { checkOut() }
    })

    async function fetchFunction(check: string){
      let game_id = $currentUser.user_metadata.game_id
      let user_id = $currentUser.id
      const fetchUrl = `http://localhost:5177/${check}?game=${game_id}&user=${user_id}`
      return await fetch(fetchUrl, {
        method: 'POST',
      })
      .then(res => {
        console.log(`successfully fetched! ${check}`)
        return res
      })
      .catch(err => {
        console.log(`err fetching: ${check}`, err)
        return err 
      })
    }

    async function checkIn(){
      return await fetchFunction('checkin')
    }

    async function checkOut(){
      return await fetchFunction('checkout')
    }

    onMount(() => {
      setTimeout(() => {
        supabase && watchTestDB();
      }, 1000);
    });

    onDestroy(() => {
      checkOut()
    })
  </script>
  
  <div class="container">
    <h1>{watchState}</h1>
    <hr>
    <button on:click={add}>Add</button>
    <hr>
    <button on:click={increment}>Increment</button>
  </div>
  
  <style>
    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex-wrap: wrap;
      align-items: center;
      gap: 40px;
    }
  </style>