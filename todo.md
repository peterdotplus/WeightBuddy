# TODO

This is a chatbot to help with weight loss, starting as just a daily motivation and inspiration notification through Telegram.

[x] test-driven development, so create tests that go from red, green, to refactor. don't commit while in progress, only after refactor.
[x] new api, typescript, node.js, express.js, jest
[x] /send-inspiration endpoint
  [x] only accessible from localhost, but not for the whole api, as a cronjob will be used to call this
  [x] start with two categories, that are chosen at random on function call: Motivation, Check-in. Each category needs a prompt for the AI. Instruct to keep it short, fitted to a normal text message.
  [x] With the category prompt, call the deepseek api and store the text in a variable.
  [x] After the Deepseek api call, send the text to the hardcoded telegram user.
- chat endpoint, when a user sends a text, check if it is a slash-command (starts with /) and if not it is a regular chat that needs to be read and responded to. use the same text length and context length as the send inspiration endpoint.
