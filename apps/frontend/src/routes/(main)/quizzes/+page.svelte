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

  onMount(() => {
    fetchQuizSets();
  });

  // 단어장 삭제
  async function deleteQuizSet(id: number) {
    await client.quizSet[':id'].$delete({ param: { id: String(id) } });
    await fetchQuizSets();
  }
</script>

{#if errorMsg}
  <div class="info">{errorMsg}</div>
{:else if quizSets.length === 0}
  <div class="info">퀴즈 세트가 없습니다. 단어장에서 퀴즈 세트를 만들어보세요.</div>
{:else}
  <ul>
    {#each quizSets as set (set.id)}
      <li>
        <div>
          <a class="title" href={`/quizzes/${set.id}`}>QuizSet #{set.id}</a>
          <a class="wordlistLink" href={`/wordlist/${set.wordlistId}`}>단어장</a>
        </div>
        <button class="delete" onclick={() => deleteQuizSet(set.id)}>✖</button>
      </li>
    {/each}
  </ul>
{/if}

<style lang="scss">
  @use 'sass:color';

  .info {
    text-align: center;
  }

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
    justify-content: space-between;
    transition: background 0.2s;

    .title {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.15rem;
      margin-right: 12px;
      transition: color 0.2s;

      &:hover {
        color: #1e40af;
        text-decoration: underline;
      }
    }

    .wordlistLink {
      color: #64748b;
      font-size: 1rem;
    }

    .delete {
      width: 4px;
      min-width: 4px;
      padding: 2px 0;
      font-size: 1rem;
      background: none;
      color: #ef4444;
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }

    &:hover {
      background-color: color.adjust(#f9fafb, $lightness: -2%);
    }
  }
</style>
