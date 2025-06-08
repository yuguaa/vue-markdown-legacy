<template>
  <div>
    <template v-for="(node, index) in nodes">
      <span v-if="typeof node === 'string'" :key="index">{{ node }}</span>
      <template v-else>
        <component v-if="node.children" :is="node.tag" :key="node.data?.key || index" v-bind="node.data?.attrs || {}">
          <VNodeRenderer v-if="node.children" :nodes="node.children" />
        </component>
        <template v-else>{{ node.text }}</template>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: 'VNodeRenderer',
  props: {
    nodes: {
      type: Array,
      required: true
    }
  }
}
</script>
