<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/utils/api';

  type QuizSet = {
    id: number;
    wordlistId: number;
    maker: number | null;
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
      console.error('퀴즈 세트 목록 불러오기 실패:', err);
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
        <a href={`/quizzes/${set.id}`}>QuizSet #{set.id}</a>
        <span>(Wordlist: {set.wordlistId})</span>
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul {
    list-style: none;
    padding: 0;
    margin: 32px auto 0 auto;
    max-width: 500px;
  }
  li {
    background: #f9fafb;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 18px;
    padding: 20px 28px;
    display: flex;
    align-items: center;
    transition:
      box-shadow 0.2s,
      transform 0.2s;
  }
  li:hover {
    box-shadow: 0 6px 24px rgba(37, 99, 235, 0.12);
    transform: translateY(-2px) scale(1.02);
  }
  a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.15rem;
    margin-right: 12px;
    transition: color 0.2s;
  }
  a:hover {
    color: #1e40af;
    text-decoration: underline;
  }
  li span {
    color: #64748b;
    font-size: 1rem;
  }
</style>
