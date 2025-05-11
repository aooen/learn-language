<script lang="ts">
  import { onMount } from 'svelte';

  // API로부터 받아오는 데이터 구조
  type ApiWordEntry = {
    id: number;
    word: string;
    meaning: string;
    user_id: number;
  };

  // 실제 화면에서 사용하는 데이터 구조
  type WordEntry = {
    id: number;
    word: string;
    meaning: string;
  };

  let wordList: WordEntry[] = [];
  let showInput = false;
  let newWord = '';
  let newMeaning = '';
  let errorMsg = '';

  // 단어 목록 불러오기
  async function fetchWordList() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/wordlist`);
      if (res.ok) {
        const data: ApiWordEntry[] = await res.json();
        wordList = data.map(
          (item): WordEntry => ({
            id: item.id,
            word: item.word,
            meaning: item.meaning,
          }),
        );
      } else {
        console.error('단어 목록 불러오기 실패');
      }
    } catch (err) {
      console.error('Fetch 오류:', err);
    }
  }

  // 단어 추가
  async function addWord() {
    const trimmedWord = newWord.trim();
    const trimmedMeaning = newMeaning.trim();

    if (!trimmedWord || !trimmedMeaning) {
      errorMsg = '단어와 뜻을 모두 입력해주세요.';
      return;
    }

    const isDuplicate = wordList.some((entry) => entry.word === trimmedWord);
    if (isDuplicate) {
      errorMsg = `"${trimmedWord}"는 이미 존재하는 단어입니다.`;
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/wordlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: trimmedWord,
        meaning: trimmedMeaning,
      }),
    });

    if (res.ok) {
      await fetchWordList(); // 목록 새로고침
      newWord = '';
      newMeaning = '';
      showInput = false;
      errorMsg = '';
    } else {
      errorMsg = '단어 추가 실패';
    }
  }

  // 단어 삭제
  async function deleteWord(id: number) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/wordlist/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      await fetchWordList();
    } else {
      console.error('단어 삭제 실패');
    }
  }

  function cancelInput() {
    newWord = '';
    newMeaning = '';
    showInput = false;
    errorMsg = '';
  }

  // 페이지 진입 시 목록 불러오기
  onMount(() => {
    fetchWordList();
  });
</script>

<!-- 단어장 출력 영역 -->
<div class="container">
  <h2>📘 단어장</h2>

  <ul>
    {#each wordList as entry (entry.id)}
      <li>
        <div class="entry">
          <span><strong>{entry.word}</strong> : {entry.meaning}</span>
          <button class="delete" on:click={() => deleteWord(entry.id)}>✖</button>
        </div>
      </li>
    {/each}
  </ul>

  <button class="add-button" on:click={() => (showInput = true)}>+ 단어 추가</button>
</div>

<!-- 단어 추가 모달 -->
{#if showInput}
  <button
    class="overlay"
    type="button"
    on:click={cancelInput}
    aria-label="닫기 배경"
    tabindex="0"
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cancelInput();
      }
    }}
  ></button>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal" on:click|stopPropagation>
    <h3>단어 추가</h3>
    <input bind:value={newWord} placeholder="단어 입력 (예: apple)" />
    <input bind:value={newMeaning} placeholder="뜻 입력 (예: 사과)" />
    {#if errorMsg}
      <div class="error">{errorMsg}</div>
    {/if}
    <div class="button-group">
      <button on:click={addWord}>완료</button>
      <button class="cancel" on:click={cancelInput}>취소</button>
    </div>
  </div>
{/if}

<style>
  .container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h2 {
    text-align: center;
  }

  ul {
    padding: 0;
  }

  li {
    list-style: none;
    margin: 10px 0;
    padding: 12px 16px;
    background: #f0f0f0;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
  }

  .entry {
    display: flex;
    align-items: center;
  }

  .entry span {
    flex: 1;
    word-break: break-word;
  }

  .delete {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #ef4444;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .add-button {
    margin-top: 16px;
    display: block;
    width: 100%;
    padding: 10px 0;
    background-color: #3b82f6;
    border: none;
    color: white;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }

  button.overlay {
    all: unset;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    cursor: pointer;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    z-index: 101;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .modal h3 {
    margin-bottom: 1rem;
    text-align: center;
  }

  input {
    display: block;
    margin: 8px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    width: 100%;
    font-size: 1rem;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  button {
    flex: 1;
    padding: 10px 0;
    border: none;
    border-radius: 6px;
    background-color: #3b82f6;
    color: white;
    font-size: 1rem;
    cursor: pointer;
  }

  button.cancel {
    background-color: #aaa;
  }

  .error {
    color: red;
    font-size: 0.9rem;
    margin-top: 4px;
  }
</style>
