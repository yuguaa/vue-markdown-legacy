<template>
  <div class="app">
    <section class="section">
      <textarea v-model="markdown"></textarea>
    </section>
    <section class="section">
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
    </section>
  </div>
</template>

<script>
import CodeBlock from './components/CodeBlock.vue'
import VNodeRenderer from './components/VNodeRenderer.vue'
import { VueMarkdown } from 'vue-markdown-legacy'

import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkToc from 'remark-toc'
import rehypeSlug from 'rehype-slug'
const md = `# Markdown Test

## Structure

## Autolink literals

www.example.com, https://example.com, and contact@example.com.

## Footnote
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)
![pic](https://picsum.photos/200/300)

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a | b  |  c |  d  |
| - | - | - | - |
| 1 | 2 | 3 | 4 |

## Tasklist

* [ ] to do
* [x] done

## Raw
<div class="note">

A mix of *markdown* and <em>HTML</em>.

</div>

## Math
Lift($$L$$) can be determined by Lift Coefficient ($$C_L$$) like the following
equation.
$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$

## Vue Slot
<div>
<slot slot-name="header" value="123">I am slot</slot>
</div>
`
export default {
  components: {
    VueMarkdown,
    CodeBlock,
    VNodeRenderer
  },
  data() {
    return {
      markdown: '',
      // customAttrs: {
      //   h1: {
      //     attrs: { class: ['heading'] },
      //     on: {
      //       click: this.handleH1Click // 处理 h1 的点击事件
      //     } // 显式声明空事件对象
      //   },
      //   h2: {
      //     attrs: { class: ['heading'] }
      //   },
      //   a: (node, combinedAttrs) => {
      //     if (typeof node.properties.href === 'string' && node.properties.href.startsWith('https:')) {
      //       return {
      //         attrs: { target: '_blank', rel: 'noopener noreferrer' }
      //       }
      //     }
      //     return { attrs: {}, on: {} } // 返回空 attrs 和 on
      //   }
      // },
      customAttrs: {
        heading: (node, combinedAttrs) => {
          return {
            attrs: {
              level: node.tagName
            },
            on: {
              click: () => {
                console.log('click')
              }
            }
          }
        }
      },
      remarkPlugins: [remarkGfm, remarkMath, [remarkToc, { heading: 'structure' }]],
      rehypePlugins: [rehypeRaw, rehypeKatex, rehypeSlug],
      sanitizeOptions: {
        sanitizeOptions: {
          tagNames: ['slot'],
          attributes: {
            slot: ['slot-name', 'value'],
            '*': ['class', 'target', 'rel', 'value', 'slot-name']
          }
        }
      }
    }
  },
  mounted() {
    // 设置默认的 markdown 内容
    let index = 0
    setInterval(() => {
      index++
      this.markdown = md.slice(0, index) // 每次增加100个字符
    }, 100);
  },
  methods: {
    handleH1Click() {
      alert('H1 clicked!')
    }
  }
}
</script>
<style scoped>
.app {
  display: flex;
  height: 100vh;
}
.section {
  flex: 1;
  margin: 20px;
  overflow: auto;
  border: 1px solid #ccc;
}
textarea {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  font-size: 14px;
  box-sizing: border-box;
}
</style>
<style>
html,
body {
  height: 100%;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
</style>
