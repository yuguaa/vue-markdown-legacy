# @yugu/vue-markdown-legacy

> 这是一个 Fork 自 [`@crazydos/vue-markdown`](https://github.com/shunnNet/vue-markdown) 的 Markdown 渲染组件，增加了对 **Vue 2** 的完整支持。

## useage

查看 [@crazydos/vue-markdown](https://github.com/shunnNet/vue-markdown#readme)很有帮助，大部分的设置相同，以下列举不同点.

完整用法查看 [点击跳转](https://github.com/yuguaa/vue-markdown/blob/main/playground-legacy/src/App.vue)

### slot 插槽

```markdown
<div>
  <slot slot-name="header" value="123">I am slot</slot>
</div>
```

```vue
<VueMarkdown
  :markdown="markdown"
  :customAttrs="customAttrs"
  :remarkPlugins="remarkPlugins"
  :rehypePlugins="rehypePlugins"
  :sanitize="false"
  :sanitizeOptions="sanitizeOptions"
>
    <template v-slot:header="{ children, ...attrs }">
        <div class="custom-slot" v-bind="attrs">
          <VNodeRenderer :nodes="children" />
        </div>
      </template>
      <template v-slot:code="{ children, language, content, ...props }">
        <CodeBlock :code="content" :language="language" />
      </template>
    </VueMarkdown>
```

### 自定义属性

```javascript
  customAttrs: {
    h1: {
      attrs: { class: ['heading'] },
      on: {
        click:()=>{}
      }
    },
    h2: {
      attrs: { class: ['heading'] }
    },
    a: (node, combinedAttrs) => {
      if (typeof node.properties.href === 'string' && node.properties.href.startsWith('https:')) {
        return {
          attrs: { target: '_blank', rel: 'noopener noreferrer' }
        }
      }
      return { attrs: {} }
    }
  },
```
### playground

see [playground-legacy]()
