import * as monaco from 'monaco-editor'

let editor

const getTheme = theme => (theme === 'light' ? 'vs' : 'vs-dark')

export default function useEditor() {
  const load = (container, theme) => {
    editor = monaco.editor.create(container, {
      automaticLayout: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
      },
      minimap: {
        enabled: false,
      },
      fontLigatures: true,
      fontFamily: 'FiraCode',
      fontSize: 13.5,
      tabSize: 2,
      theme: getTheme(theme),
      language: 'text',
      value: '',
    })
  }

  const setContent = (content, language) => {
    editor && editor.setValue(content)
    editor && monaco.editor.setModelLanguage(editor.getModel(), language)
  }

  const switchTheme = theme => {
    monaco.editor.setTheme(getTheme(theme))
  }

  const unload = () => {
    editor && editor.dispose()
  }

  return { load, setContent, switchTheme, unload }
}
