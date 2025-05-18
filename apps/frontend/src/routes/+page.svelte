<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, login } from '$lib/stores/auth.svelte';
  import { onMount } from 'svelte';
  import './index.css';

  let username = $state('');
  let password = $state('');

  onMount(() => {
    if (authStore.jwt) {
      // TODO: valid JWT인지 체크 추가
      goto('/home');
    }
  });

  async function submitLogin(e: Event) {
    e.preventDefault();
    try {
      await login(username, password);
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
  <h2>콘텐츠로 영어공부</h2>
  <form onsubmit={submitLogin} class="login-form">
    <div class="form-group">
      <label for="username">아이디</label>
      <input id="username" type="text" bind:value={username} required />
    </div>

    <div class="form-group">
      <label for="password">비밀번호</label>
      <input id="password" type="password" bind:value={password} required />
    </div>

    <button type="submit" class="login-button">로그인</button>
  </form>
</div>

<style lang="scss">
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

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-width: 300px;
      margin: 15px auto 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;

      label {
        font-weight: 500;
      }

      input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
      }
    }

    .login-button {
      padding: 10px;
      background-color: #4682b4;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        background-color: darken(#4682b4, 10%);
      }
    }
  }
</style>
