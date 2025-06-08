// @ts-nocheck
import Vue from 'vue'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { html, find } from 'property-information'
import deepmerge from 'deepmerge'

const VueMarkdown = Vue.extend({
  name: 'VueMarkdown',
  props: {
    markdown: {
      type: String,
      default: ''
    },
    customAttrs: {
      type: Object,
      default: () => ({})
    },
    remarkPlugins: {
      type: Array,
      default: () => []
    },
    rehypePlugins: {
      type: Array,
      default: () => []
    },
    rehypeOptions: {
      type: Object,
      default: () => ({})
    },
    sanitize: {
      type: Boolean,
      default: false
    },
    sanitizeOptions: {
      type: Object,
      default: () => ({})
    }
  },
  render(h) {
    const props = this.$props
    const slots = this.$scopedSlots || {}

    const processor = unified()
      .use(remarkParse)
      .use(props.remarkPlugins)
      .use(remarkRehype, { allowDangerousHtml: true, ...props.rehypeOptions })
      .use(props.rehypePlugins)

    if (props.sanitize) {
      const { sanitizeOptions = {}, mergeOptions = {} } = props.sanitizeOptions
      processor.use(rehypeSanitize, deepmerge(defaultSchema, sanitizeOptions, mergeOptions))
    }

    const computeCustomAttrs = (node, aliasList, combinedAttrs) => {
      for (let i = aliasList.length - 1; i >= 0; i--) {
        const name = aliasList[i]
        if (props.customAttrs.hasOwnProperty(name)) {
          const value = props.customAttrs[name]
          const result = typeof value === 'function' ? value(node, combinedAttrs) : value
          return {
            attrs: result.attrs || {},
            on: result.on || {}
          }
        }
      }
      return { attrs: {}, on: {} }
    }

    const parseChildren = (nodeList, context, parent) => {
      const keyCounter = {}

      return nodeList.map(node => {
        const aliasList = []
        let attrs = {}
        const vnodeProps = {}
        const thisContext = { ...context }

        switch (node.type) {
          case 'text':
            return node.value

          case 'element':
            aliasList.push(node.tagName)
            keyCounter[node.tagName] = keyCounter[node.tagName] ? keyCounter[node.tagName] + 1 : 0
            vnodeProps.key = `${node.tagName}-${keyCounter[node.tagName]}`
            node.properties = node.properties || {}

            attrs = Object.entries(node.properties).reduce((acc, [key, val]) => {
              const info = find(html, key)
              acc[info.attribute] = val
              return acc
            }, {})

            switch (node.tagName) {
              case 'h1':
              case 'h2':
              case 'h3':
              case 'h4':
              case 'h5':
              case 'h6':
                vnodeProps.level = parseInt(node.tagName[1])
                aliasList.push('heading')
                break

              case 'code':
                const cls = attrs.class
                vnodeProps.languageOriginal = Array.isArray(cls) ? cls.find(c => c.startsWith('language-')) : ''
                vnodeProps.language = vnodeProps.languageOriginal
                  ? vnodeProps.languageOriginal.replace('language-', '')
                  : ''
                vnodeProps.inline = parent && parent.tagName !== 'pre'
                vnodeProps.content = node.children[0] && node.children[0].value
                aliasList.push(vnodeProps.inline ? 'inline-code' : 'block-code')
                break

              case 'thead':
              case 'tbody':
                thisContext.currentContext = node.tagName
                break

              case 'td':
              case 'th':
              case 'tr':
                vnodeProps.isHead = context.currentContext === 'thead'
                break

              case 'ul':
              case 'ol':
                thisContext.listDepth = context.listDepth + 1
                thisContext.listOrdered = node.tagName === 'ol'
                thisContext.listItemIndex = -1
                vnodeProps.ordered = thisContext.listOrdered
                vnodeProps.depth = thisContext.listDepth
                aliasList.push('list')
                break

              case 'li':
                thisContext.listItemIndex++
                vnodeProps.ordered = thisContext.listOrdered
                vnodeProps.depth = thisContext.listDepth
                vnodeProps.index = thisContext.listItemIndex
                aliasList.push('list-item')
                break

              case 'slot':
                if (typeof node.properties['slot-name'] === 'string') {
                  aliasList.push(node.properties['slot-name'])
                  delete node.properties['slot-name']
                }
                break
            }
            break

          default:
            return null
        }
        const customAttrs = computeCustomAttrs(node, aliasList, { ...attrs, ...vnodeProps })
        for (let i = aliasList.length - 1; i >= 0; i--) {
          const slotName = aliasList[i]
          if (slots[slotName]) {
            return slots[slotName]({
              ...attrs,
              ...customAttrs.attrs,
              ...vnodeProps,
              on: customAttrs.on,
              children: parseChildren(node.children, thisContext, node)
            })
          }
        }

        // 如果没有插槽，则渲染默认的 HTML 标签
        return h(
          node.tagName,
          {
            attrs: { ...attrs, ...customAttrs.attrs },
            on: customAttrs.on
          },
          parseChildren(node.children, thisContext, node)
        )
      })
    }

    const mdast = processor.parse(props.markdown)
    const hast = processor.runSync(mdast)

    return h(
      'div',
      this.$attrs,
      parseChildren(hast.children, { listDepth: -1, listOrdered: false, listItemIndex: -1 }, hast)
    )
  }
})

export { VueMarkdown }
