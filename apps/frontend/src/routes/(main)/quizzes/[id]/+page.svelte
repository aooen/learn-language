<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { client } from '$lib/utils/api';
  import Card from './Card.svelte';
  import { goto } from '$app/navigation';

  type Quiz = {
    id: number;
    front: string;
    back: string;
    progress: number;
    sentenceFrom: string;
    due: number; // timestamp
    quizSetId: number;
  };

  const quizSetId = $derived(page.params['id']);

  class MinHeap {
    heap: Quiz[] = $state([]);

    private getParentIndex(index: number): number {
      return Math.floor((index - 1) / 2);
    }

    private getLeftChildIndex(index: number): number {
      return 2 * index + 1;
    }

    private getRightChildIndex(index: number): number {
      return 2 * index + 2;
    }

    private swap(i: number, j: number): void {
      [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    push(quiz: Quiz): void {
      this.heap.push(quiz);
      this.heapifyUp();
    }

    pop(): Quiz | null {
      if (this.heap.length === 0) return null;
      if (this.heap.length === 1) return this.heap.pop() || null;

      const root = this.heap[0];
      this.heap[0] = this.heap.pop()!;
      this.heapifyDown();
      return root;
    }

    peek(): Quiz | null {
      return this.heap.length > 0 ? this.heap[0] : null;
    }

    size(): number {
      return this.heap.length;
    }

    private heapifyUp(): void {
      let index = this.heap.length - 1;
      while (
        this.getParentIndex(index) >= 0 &&
        this.heap[this.getParentIndex(index)].due > this.heap[index].due
      ) {
        this.swap(index, this.getParentIndex(index));
        index = this.getParentIndex(index);
      }
    }

    private heapifyDown(): void {
      let index = 0;
      const length = this.heap.length;
      while (this.getLeftChildIndex(index) < length) {
        let smallerChildIndex = this.getLeftChildIndex(index);
        const rightChildIndex = this.getRightChildIndex(index);

        if (
          rightChildIndex < length &&
          this.heap[rightChildIndex].due < this.heap[smallerChildIndex].due
        ) {
          smallerChildIndex = rightChildIndex;
        }

        if (this.heap[index].due <= this.heap[smallerChildIndex].due) break;

        this.swap(index, smallerChildIndex);
        index = smallerChildIndex;
      }
    }
  }

  class ButtonType {
    // Defining ButtonTypes Enum
    static readonly Again = new ButtonType('Again', 1, 0);
    static readonly Hard = new ButtonType('Hard', 6, 3);
    static readonly Good = new ButtonType('Good', 10, 10);
    static readonly Easy = new ButtonType('Easy', 1440, 30);

    public readonly label: string;
    public readonly later: number;
    public readonly progress: number;

    private constructor(label: string, later: number, progress: number) {
      this.label = label;
      this.later = later;
      this.progress = progress;
    }

    toString(): string {
      return this.label;
    }

    static values(): ButtonType[] {
      return [ButtonType.Again, ButtonType.Hard, ButtonType.Good, ButtonType.Easy];
    }

    static fromString(label: string): ButtonType | undefined {
      return ButtonType.values().find((btn) => btn.label === label);
    }

    static readonly labelMap: Map<string, ButtonType> = new Map(
      ButtonType.values().map((btn) => [btn.label, btn]),
    );

    static fromLabel(label: string): ButtonType | undefined {
      return this.labelMap.get(label);
    }
  }

  async function fetchQuizs(quizSetId: string) {
    const res = await client.quizSet[':id'].$get({
      param: {
        id: quizSetId,
      },
    });
    const quizs = await res.json();

    const typedQuizs = quizs.map((x) => {
      const newQuiz: Quiz = {
        id: x.id,
        front: x.front,
        back: x.back,
        progress: x.progress,
        sentenceFrom: x.sentenceFrom,
        due: x.due,
        quizSetId: x.quizSetId,
      };
      return newQuiz;
    });

    return typedQuizs;
  }

  // ============================ Sample ======================
  //  const sampleQuizzes: Quiz[] =  fetchQuizs(1);
  //  [
  //   {
  //     id: 1,
  //     front: "What is the capital of France?",
  //     back: "Paris",
  //     progress: 0.5,
  //     sentence_from: "Geography textbook",
  //     due: 0, // due in 1 min
  //   },
  //   {
  //     id: 2,
  //     front: "Who wrote 'Hamlet'?",
  //     back: "William Shakespeare",
  //     progress: 0.8,
  //     sentence_from: "English Literature notes",
  //     due: 0, // due in 30 sec
  //   },
  //   {
  //     id: 3,
  //     front: "What is the chemical symbol for water?",
  //     back: "H₂O",
  //     progress: 0.2,
  //     sentence_from: "Chemistry handout",
  //     due: 0, // due in 2 min
  //   },
  //   {
  //     id: 4,
  //     front: "Solve for x: 2x + 3 = 7",
  //     back: "x = 2",
  //     progress: 0.1,
  //     sentence_from: "Algebra workbook",
  //     due: 0, // due in 45 sec
  //   },
  //   {
  //     id: 5,
  //     front: "Translate 'ありがとう' to English",
  //     back: "Thank you",
  //     progress: 0.6,
  //     sentence_from: "Japanese flashcards",
  //     due: 0, // due in 1.5 min
  //   },
  // ];
  // ====================== Sample =======================

  const queue = new MinHeap();
  let retired: Quiz[] = $state([]);

  // for (const quiz of sampleQuizzes) {
  //   queue.push(quiz);
  // }

  let flipped = $state(false);
  let tried = $state(false);
  let done = $state(false);

  function flip() {
    flipped = !flipped;
    tried = true;
  }

  function update(buttonType: ButtonType) {
    let target_quiz = queue.pop();

    if (target_quiz) {
      if (target_quiz.progress > 100) {
        // quiz done
        flipped = false;
        retired.push(target_quiz);
        return;
      } else {
        target_quiz.progress += buttonType.progress;
        if (target_quiz.progress > 100) {
          target_quiz.progress = 100;
        }
      }
      target_quiz.due = buttonType.later;

      queue.push(target_quiz);
    } else {
      //done
      alert('done');
    }
    client.quizSet[':id'].$put({
      param: {
        id: quizSetId,
      },
      json: [...retired, ...queue.heap],
    });

    tried = false;
    flipped = false;
  }

  onMount(async () => {
    let typedQuizs = await fetchQuizs(quizSetId);
    if (typedQuizs.length === 0) {
      done = true;
      return;
    }
    for (const quiz of typedQuizs) {
      if (quiz.progress >= 100) {
        retired.push(quiz);
        continue;
      }
      queue.push(quiz);
    }
    if (queue.size() === 0) {
      done = true;
    }
  });
</script>

{#if !done}
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
      {#if queue.heap.length != 0}
        <Card
          front={queue.heap[0].front}
          back={queue.heap[0].back}
          {flipped}
          progress={queue.heap[0].progress}
        ></Card>
      {:else}
        <Card front="Loading" back="Loading" {flipped} progress={0}></Card>
      {/if}
    </div>
  </div>
  {#if tried}
    <div class="buttons">
      {#each ButtonType.values() as buttonType (buttonType.label)}
        <button
          class={buttonType.toString().toLowerCase()}
          onclick={() => {
            update(buttonType);
          }}
        >
          {buttonType.toString()}
        </button>
      {/each}
    </div>
  {/if}
{:else}
  <Card front="All Done!" back="We are updating your progress." {flipped} progress={0}></Card>
{/if}

<button class="go-back" onclick={() => goto('/quizzes/')}>Go Back</button>

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
  }
  .go-back:hover {
    background: #cbd5e1;
  }
</style>
