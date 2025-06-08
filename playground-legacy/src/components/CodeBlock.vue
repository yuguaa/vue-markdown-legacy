<script>
export default {
  name: 'CodeBlock',
  props: {
    code: {
      type: String
    }
  }
}
</script>
<template>
  <code class="code">
    {{ code }}
  </code>
</template>
<style>
.code {
  padding: 20px;
  background-color: #eee;
  border-radius: 8px;
  display: block;
}
</style>
