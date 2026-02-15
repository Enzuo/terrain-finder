<script>
  export let title = 'Sidebar';
  let open = false;
  function toggle() {
    open = !open;
  }
</script>

<style>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0,0,0,0.08);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(.4,0,.2,1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}
.sidebar.open {
  transform: translateX(0);
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: #f8f8f8;
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
.toggle-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
  background: #0077ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>

<button class="toggle-btn" on:click={toggle} aria-label="Toggle sidebar">
  {#if open}Close Sidebar{:else}Open Sidebar{/if}
</button>

<aside class="sidebar {open ? 'open' : ''}">
  <div class="sidebar-header">
    <span>{title}</span>
    <button on:click={toggle} aria-label="Close sidebar">×</button>
  </div>
  <div class="sidebar-content">
    <slot />
  </div>
</aside>
