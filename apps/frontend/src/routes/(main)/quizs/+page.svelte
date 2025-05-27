<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/utils/api';

  type QuizSet = {
    id: number;
    wordlistId: number;
    maker: number;
    // add more fields if needed
  };

  let quizSets: QuizSet[] = [];
  let errorMsg = '';

  async function fetchQuizSets() {
    try {
      const res = await client.quizSet.$get();
      if (res.ok) {
        quizSets = await res.json();
      } else {
        errorMsg = '퀴즈 세트 목록을 불러올 수 없습니다.';
      }
    } catch (err) {
      errorMsg = '서버와 통신 중 오류가 발생했습니다.';
    }
  }

  onMount(fetchQuizSets);
</script>

{#if errorMsg}
  <div class="error">{errorMsg}</div>
{:else if quizSets.length === 0}
  <div>퀴즈 세트가 없습니다. 단어장에서 퀴즈 세트를 만들어보세요.</div>
{:else}
  <ul>
    {#each quizSets as set (set.id)}
      <li>
        <a href={`/quizs/${set.id}`}>QuizSet #{set.id}</a> (Wordlist: {set.wordlistId})
      </li>
    {/each}
  </ul>
{/if}
