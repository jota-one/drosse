import * as monaco from 'monaco-editor'

let editor

const getTheme = theme => theme === 'light' ? 'vs' : 'vs-dark'

export default function useEditor () {
  const load = ({ container, theme, value, language }) => {
    setTimeout(() => {
      editor = monaco.editor.create(container, {
        automaticLayout: true,
        scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
        },
        fontLigatures: true,
        fontFamily: 'Fira Code',
        fontSize: 13.5,
        tabSize: 2,
        theme: getTheme(theme),
        language,
        value
      })
    }, 250)
  }

  const unload = () => {
    editor && editor.dispose()
  }

  const switchTheme = theme => {
    monaco.editor.setTheme(getTheme(theme))
  }

  return { load, unload, switchTheme }
}
