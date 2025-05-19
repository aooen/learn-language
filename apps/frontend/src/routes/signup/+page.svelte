<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, signup } from '$lib/stores/auth.svelte';
  import { onMount } from 'svelte';

  const Stage = {
    Username: 0,
    Password: 1,
    MotherLang: 2,
    TargetLang: 3,
  } as const;

  let stage = $state<(typeof Stage)[keyof typeof Stage]>(Stage.Username);
  let username = $state('');
  let password = $state('');
  let passwordConfirm = $state('');
  let motherLang = $state('');
  let targetLang = $state('');

  onMount(() => {
    if (authStore.jwt) {
      goto('/home');
    }
  });

  async function submitSignup(e: Event) {
    e.preventDefault();

    if (stage === Stage.Password) {
      if (password !== passwordConfirm) {
        alert('비밀번호와 비밀번호 확인이 동일하지 않습니다. 다시 입력해주세요.');
        return;
      }
      if (password.length < 8) {
        alert('비밀번호는 8자 이상이어야 합니다.');
        return;
      }
    }

    if (stage < Stage.TargetLang) {
      stage++;
      return;
    }

    try {
      await signup({ username, password, motherLang, targetLang });
      goto('/home');
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  }
</script>

<div class="wrapper">
  <h1>ll.me.kr</h1>
  <h2>회원가입</h2>
  <form onsubmit={submitSignup} class="signup-form">
    {#if stage === Stage.Username}
      <div class="form-group">
        <label for="username">아이디</label>
        <input id="username" type="text" bind:value={username} required />
      </div>
    {/if}

    {#if stage === Stage.Password}
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input id="password" type="password" bind:value={password} required />
      </div>

      <div class="form-group">
        <label for="password">비밀번호 확인</label>
        <input id="passwordConfirm" type="password" bind:value={passwordConfirm} required />
      </div>
    {/if}

    {#if stage === Stage.MotherLang}
      <div class="form-group">
        <label for="motherLang">모국어</label>
        <select id="motherLang" bind:value={motherLang}>
          <option value="">모국어를 선택해주세요</option>
          <option value="ko-KR">한국어</option>
        </select>
      </div>
    {/if}

    {#if stage === Stage.TargetLang}
      <div class="form-group">
        <label for="targetLang">배울 언어</label>
        <select id="targetLang" bind:value={targetLang}>
          <option value="">배울 언어를 선택해주세요</option>
          <option value="en-US">영어</option>
        </select>
      </div>
    {/if}

    <button type="submit" class="signup-button">
      {#if stage === Stage.TargetLang}
        회원가입
      {:else}
        다음
      {/if}
    </button>
  </form>
</div>

<style lang="scss">
  @use 'sass:color';

  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    h1,
    h2 {
      text-align: center;
      margin: 0;
      font-weight: lighter;
    }

    h2 {
      margin-top: 2px;
      color: #333;
      font-size: 1rem;
    }

    .signup-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
      max-width: 360px;
      padding: 0 10px;
      margin: 15px auto 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;

      label {
        font-weight: 500;
      }

      input,
      select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
      }
    }

    .signup-button {
      padding: 10px;
      background-color: #4682b4;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        background-color: color.adjust(#4682b4, $lightness: -10%);
      }
    }
  }
</style>
