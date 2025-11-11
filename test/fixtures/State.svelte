<script>
  const { defaultState } = $props()

  function clone() {
    const newState = structuredClone(defaultState)
  }
</script>

<button onclick={clone}>Clone</button>
