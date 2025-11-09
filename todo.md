# TODO

This is a chatbot to help with weight loss, starting as just a daily motivation and inspiration notification through Telegram.

- test-driven development, so create tests that go from red, green, to refactor. don't commit while in progress, only after refactor.
- new api, typescript, node.js, express.js, jest
- /send-inspiration endpoint
  - only accessible from localhost, but not for the whole api, as a cronjob will be used to call this
  - start with two categories, that are chosen at random on function call: Motivation, Check-in. Each category needs a prompt for the AI. Instruct to keep it short, fitted to a normal text message.
  - With the category prompt, call the deepseek api and store the text in a variable.
  - After the Deepseek api call, send the text to the hardcoded telegram user.
