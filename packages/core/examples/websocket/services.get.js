module.exports = () => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat</title>
  </head>
  <body>
    <h1>Websocket example</h1>
    <p>
      <strong>Responses from server:</strong>
      <br>
      <small>
        What happens in the Network/WS panel of the your browser's dev tools
        is more interesting :) 
      </small>
    </p>
    <ul></ul>
    <form onsubmit="send(); return false">
      <input type=text placeholder="Type a message">
      <button type=submit>Send</button>
    </form>
    <script>
      const ws = new WebSocket('ws://localhost:8000')

      ws.onmessage = function(event) {
        const list = document.querySelector('ul')
        const item = document.createElement('li')
        item.innerHTML = event.data
        list.appendChild(item)
      }
      
      function send() {
        const input = document.querySelector('input')
        const msg = input.value
        
        if (!msg) {
          alert('Please write a message...')
          return
        }

        ws.send(msg)
        input.value = ''
      }
    </script>
  </body>
  </html>`
}
