<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/utils/api';

  type WordlistEntry = {
    id: number;
    title: string;
    userId: number;
  };

  let wordlists: WordlistEntry[] = [];
  let showInput = false;
  let newTitle = '';
  let errorMsg = '';

  // 단어장 목록 불러오기
  async function fetchWordlists() {
    try {
      const result = await client.wordlist.$get();
      if (result.ok) {
        wordlists = await result.json();
      } else {
        console.error('단어장 목록 불러오기 실패:', result.status, result.statusText);
        errorMsg = '단어장 목록 불러오기 실패';
      }
    } catch (err) {
      console.error('단어장 목록 불러오기 실패:', err);
      errorMsg = '서버와 통신 중 오류 발생';
    }
  }

  // 단어장 추가
  async function addWordlist() {
    const trimmed = newTitle.trim();

    if (!trimmed) {
      errorMsg = '단어장 이름을 입력해주세요.';
      return;
    }

    const duplicate = wordlists.some((entry) => entry.title === trimmed);
    if (duplicate) {
      errorMsg = `"${trimmed}"은 이미 존재하는 단어장입니다.`;
      return;
    }

    const res = await client.wordlist.$post({ json: { title: trimmed } });

    if (res.ok) {
      await fetchWordlists();
      newTitle = '';
      showInput = false;
      errorMsg = '';
    } else {
      errorMsg = '단어장 추가 실패';
    }
  }

  // 단어장 삭제
  async function deleteWordlist(id: number) {
    const res = await client.wordlist[':id'].$delete({ param: { id: String(id) } });

    if (res.ok) {
      await fetchWordlists();
    } else {
      console.error('단어장 삭제 실패');
    }
  }

  function cancelInput() {
    newTitle = '';
    showInput = false;
    errorMsg = '';
  }

  onMount(() => {
    fetchWordlists();
  });
</script>

<!-- 단어장 출력 -->
<div class="container">
  <h2>📘 단어장</h2>

  <ul>
    {#each wordlists as entry (entry.id)}
      <li>
        <div class="entry">
          <span><strong>{entry.title}</strong></span>
          <button class="delete" onclick={() => deleteWordlist(entry.id)}>✖</button>
        </div>
      </li>
    {/each}
  </ul>

  <button class="add-button" onclick={() => (showInput = true)}>+ 단어장 추가</button>
</div>

<!-- 단어장 추가 모달 -->
{#if showInput}
  <div
    class="overlay"
    role="button"
    onclick={cancelInput}
    aria-label="닫기 배경"
    tabindex="0"
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cancelInput();
      }
    }}
  ></div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <h3>단어장 추가</h3>
    <input bind:value={newTitle} placeholder="단어장 이름 입력 (예: 토익 단어장)" />
    {#if errorMsg}
      <div class="error">{errorMsg}</div>
    {/if}
    <div class="button-group">
      <button onclick={addWordlist}>완료</button>
      <button class="cancel" onclick={cancelInput}>취소</button>
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

  .overlay {
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
