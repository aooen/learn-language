<script lang="ts">
  import { onMount } from 'svelte';
  import { client } from '$lib/utils/api';

  let user = { id: '', username: '', image: '' };
  let currentPw = '';
  let newPw = '';
  let confirmPw = '';
  let msg = '';
  let error = '';

  onMount(async () => {
    try {
      const res = await client.user.me.$get();
      if (res.ok) {
        const data = await res.json();
        user = data.user;
      } else {
        error = '사용자 정보를 불러오는 데 실패했습니다';
      }
    } catch (e) {
      console.error(e);
      error = '서버와 통신 중 오류가 발생했습니다';
    }
  });

  async function changePassword() {
    error = msg = '';

    if (newPw !== confirmPw) {
      error = '새 비밀번호가 일치하지 않습니다';
      return;
    }

    try {
      const res = await client.user.me.password.$put({
        json: {
          currentPassword: currentPw,
          newPassword: newPw,
        },
      });

      if (res.ok) {
        msg = '비밀번호가 변경되었습니다';
        currentPw = newPw = confirmPw = '';
      } else {
        const text = await res.text();
        error = text || '비밀번호 변경에 실패했습니다';
      }
    } catch (e) {
      console.error(e);
      error = '서버와 통신 중 오류가 발생했습니다';
    }
  }
</script>

<div class="mypage-container">
  <h2>마이페이지</h2>

  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#if msg}
    <p class="success">{msg}</p>
  {/if}

  <section class="profile">
    <h3>내 정보</h3>
    <p>아이디: <strong>{user.username}</strong></p>
    <div class="stats">
      <div class="stat-item">
        <h4>총 학습 단어</h4>
        <p>--</p>
      </div>
      <div class="stat-item">
        <h4>레벨</h4>
        <p>--</p>
      </div>
    </div>
  </section>

  <section class="password-change">
    <h3>비밀번호 변경</h3>
    <form on:submit|preventDefault={changePassword}>
      <label>
        현재 비밀번호
        <input type="password" bind:value={currentPw} required />
      </label>
      <label>
        새 비밀번호 (최소 8자)
        <input type="password" bind:value={newPw} minlength="8" required />
      </label>
      <label>
        새 비밀번호 확인
        <input type="password" bind:value={confirmPw} minlength="8" required />
      </label>
      <button type="submit">변경하기</button>
    </form>
  </section>
</div>

<style>
  .mypage-container {
    max-width: 480px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
  }

  h2 {
    text-align: center;
    margin-bottom: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  .stats {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .stat-item {
    flex: 1;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 6px;
    text-align: center;
  }

  .stat-item h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #555;
  }

  .stat-item p {
    font-size: 1.25rem;
    font-weight: bold;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
  }

  input {
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #0070f3;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
  }

  button:hover {
    background-color: #005bb5;
  }

  .error {
    color: #e00;
    text-align: center;
    margin-bottom: 1rem;
  }

  .success {
    color: #007e33;
    text-align: center;
    margin-bottom: 1rem;
  }
</style>
