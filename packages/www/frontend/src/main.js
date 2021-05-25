import Styles from './Styles.svelte'
import DrosseLogo from './components/DrosseLogo.svelte'
import Icon from './components/Icon.svelte'
import NpmButton from './components/NpmButton.svelte'
import Terminal from './components/Terminal.svelte'
import ThemeSwitcher from './components/ThemeSwitcher.svelte'

const load = (component, targetSelector, props = []) => {
  const elements = document.querySelectorAll(targetSelector)

  if (!elements) {
    return
  }

  elements.forEach(target => {
    new component({
      target,
      props: {
        ...props.reduce((obj, prop) => {
          const _prop = target.getAttribute(prop)
          if (_prop) {
            obj[prop] = _prop
          }
          return obj
        }, {})
      }
    })
  })
}

new Styles({ target: document.body })
load(DrosseLogo, 'j-drosse-logo')
load(Icon, 'j-icon', ['name', 'size', 'color'])
load(NpmButton, 'j-npm-button', ['command'])
load(Terminal, 'j-terminal', ['steps'])
load(ThemeSwitcher, 'j-theme-switcher', ['defaultTheme'])