<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { client } from '$lib/utils/api';
  import Card from './Card.svelte';
  import { type Quiz, MinHeap, ButtonType } from './utils.svelte';

  const quizSetId = $derived(page.params['id']);

  const queue = new MinHeap();
  let retired: Quiz[] = $state([]);

  let flipped = $state(false);
  let tried = $state(false);
  let isLoading = $state(false);

  const currentCard = $derived(queue.peek());

  function flip() {
    flipped = !flipped;
    tried = true;
  }

  function update(buttonType: ButtonType) {
    let quiz = queue.pop();

    if (!quiz) {
      // quiz must be exists.
      return;
    }

    quiz.progress = Math.min(quiz.progress + buttonType.progress, 100);
    quiz.due = buttonType.later;

    if (quiz.progress >= 100) {
      retired.push(quiz);
    } else {
      queue.push(quiz);
    }

    client.quizSet[':id'].$put({
      param: {
        id: quizSetId,
      },
      json: quiz,
    });

    tried = false;
    flipped = false;
  }

  onMount(async () => {
    isLoading = true;

    const res = await client.quizSet[':id'].$get({
      param: {
        id: quizSetId,
      },
    });
    const quizzes = await res.json();
    for (const quiz of quizzes) {
      if (quiz.progress >= 100) {
        retired.push(quiz);
        continue;
      }
      queue.push(quiz);
    }

    isLoading = false;
  });
</script>

{#if isLoading}
  <Card front="Loading" />
{:else if !currentCard}
  <Card front="All Done!" />
{:else}
  <div class="wrapper">
    <div
      class="cardEventBox"
      tabindex="0"
      role="button"
      aria-label="Flip card"
      onclick={flip}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') flip();
      }}
    >
      <Card
        front={currentCard.front}
        back={currentCard.back}
        {flipped}
        progress={currentCard.progress}
      />
    </div>
  </div>
  {#if tried}
    <div class="buttons">
      {#each ButtonType.values() as buttonType (buttonType.label)}
        <button
          class={buttonType.name}
          onclick={() => {
            update(buttonType);
          }}
        >
          {buttonType.toString()}
        </button>
      {/each}
    </div>
  {/if}
{/if}

<button class="go-back" onclick={() => goto('/quizzes/')}>Go Back</button>

<style lang="scss">
  .cardEventBox {
    width: 100%;
    max-width: 500px;
  }

  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;

    button {
      &:hover {
        opacity: 0.9;
        transform: scale(1.05);
      }

      /* Active Click Effect */
      &:active {
        transform: scale(0.95);
      }
    }
  }

  button {
    flex: 1;
    padding: 10px 20px;
    max-width: 150px;
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

  .go-back {
    margin: 24px auto 0 auto;
    display: block;
    padding: 8px 24px;
    background: #e5e7eb;
    color: #222;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #cbd5e1;
    }
  }
</style>
