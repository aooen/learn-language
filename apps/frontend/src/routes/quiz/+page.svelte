<script lang="ts">
  import Card from './Card.svelte';
  let queue = $state([
    {
      front: 'Define photosynthesis.',
      back: 'The process by which green plants convert sunlight into energy.',
    },
    {
      front: 'Name the largest planet in our Solar System.',
      back: 'Jupiter',
    },
    {
      front: 'What is the first element on the periodic table?',
      back: 'Hydrogen',
    },
    {
      front: 'Solve for x: 2x + 3 = 7',
      back: 'x = 2',
    },
    {
      front: "Translate 'ありがとう' (Arigatou) to English.",
      back: 'Thank you',
    },
  ]);

  let flipped = $state(false);
  let tried = $state(false);
  let done = $state(false);
  function flip() {
    flipped = !flipped;
    tried = true;
  }
  function update(later: number) {
    if (later > 0) {
      queue.splice(later, 0, queue[0]);
    } else if (later < 0) {
      //easy
      // update progress
    }
    queue.shift();
    if (queue.length == 0) {
      done = true;
      alert('All done! We are updating your progress.');
    }
    tried = false;
  }

  $inspect(queue);
</script>

{#if !done}
  <div class="wrapper">
    <div onclick={flip} class="cardEventBox">
      <Card front={queue[0].front} back={queue[0].back} {flipped}></Card>
    </div>
  </div>
  {#if tried}
    <div class="buttons">
      <button
        class="again"
        onclick={() => {
          update(2);
        }}
      >
        Again</button
      >
      <button
        class="good"
        onclick={() => {
          update(5);
        }}
      >
        Good</button
      >
      <button
        class="easy"
        onclick={() => {
          update(-1);
        }}
      >
        Easy</button
      >
    </div>
  {/if}
{:else}
  All Done!
{/if}

<style>
  .cardEventBox {
    width: 500px;
  }
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
  }
  button {
    padding: 10px 20px;
    width: 150px;
    font-size: 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition:
      background 0.2s,
      transform 0.1s;
  }
  /* Button Colors */
  .again {
    background-color: #f44336; /* red */
    color: white;
  }

  .good {
    background-color: #4caf50; /* green */
    color: white;
  }

  .easy {
    background-color: #2196f3; /* blue */
    color: white;
  }
  .buttons button:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  /* Active Click Effect */
  .buttons button:active {
    transform: scale(0.95);
  }
</style>
