---
slug: coding-browser-click-counter
---

Coding is the practice of expressing a process in instructions a computer can execute. A useful first project should accept input, change stored information, produce visible output, and include a way to test whether the result is correct. This guide builds a click counter in one HTML file, changes its behavior, introduces a deliberate defect, and verifies the repair.

## What the browser will do

The project starts at zero. Selecting **Add one** increases the count by one. Selecting **Reset** returns it to zero. The browser handles keyboard activation because both controls are native HTML buttons.

That small behavior contains the main parts of a program:

| Part | Counter example |
|---|---|
| Input | A person activates Add one or Reset |
| State | The current numeric count |
| Process | Add the increment or replace the count with zero |
| Output | Display the current count |
| Test | Compare the displayed value with the expected value after a known sequence |

HTML supplies the document structure, CSS controls presentation, and JavaScript supplies the changing behavior. MDN's [first website guide](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web) introduces the same separation: HTML structures content, CSS styles it, and JavaScript adds interactivity.

## Run the finished example

Open the [complete click-counter example](/examples/click-counter/) in a browser. It is a self-contained file with no framework, package installation, account, or network request. Use the browser's Save Page command if you want a local working copy.

Try this sequence before reading the implementation:

1. Confirm the initial value is `0`.
2. Select **Add one** three times and confirm the result is `3`.
3. Select **Reset** and confirm the result is `0`.
4. Move focus to **Add one** with the Tab key and activate it with Enter or Space.

The last check matters because a clickable visual element is not automatically an operable control. Native buttons include expected keyboard behavior without custom key handling.

## Build the document structure

The essential HTML is small:

```html
<main class="counter-card">
  <p class="label">Current count</p>
  <output id="count" aria-live="polite">0</output>

  <div class="actions">
    <button id="add" type="button">Add one</button>
    <button id="reset" type="button">Reset</button>
  </div>
</main>
```

Each `id` gives JavaScript a precise element to select. The `output` element represents a calculated result. `aria-live="polite"` allows compatible assistive technology to announce a changed count without abruptly interrupting other speech.

The controls use `type="button"`. This prevents them from becoming submit buttons if the component is later placed inside a form.

CSS can change color, spacing, type, and layout, but it should not carry the count or the interaction. Keeping responsibility separated makes a defect easier to locate.

## Add the program

The complete example uses this JavaScript:

```js
const countOutput = document.querySelector('#count');
const addButton = document.querySelector('#add');
const resetButton = document.querySelector('#reset');
const increment = 1;
let count = 0;

function render() {
  countOutput.textContent = String(count);
}

addButton.addEventListener('click', () => {
  count += increment;
  render();
});

resetButton.addEventListener('click', () => {
  count = 0;
  render();
});

render();
```

`document.querySelector()` locates an element using a CSS selector. MDN's [DOM scripting guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) explains this relationship between JavaScript and the document. The three constants hold references to elements. `increment` records a configuration value that will not be reassigned, while `count` uses `let` because its value changes.

The `render` function has one responsibility: convert the number to text and place it in the output. Both event handlers change state and then call the same rendering function. This prevents two separate copies of display logic from drifting apart.

MDN's [events guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) recommends `addEventListener()` for registering event handlers. Here, each listener waits for a button's `click` event. Mouse, touch, and standard keyboard activation of a button all lead to that event.

## Trace one interaction

Suppose `count` is `2` and `increment` is `1`.

1. The browser receives a click on Add one.
2. The registered callback runs.
3. `count += increment` changes the state from `2` to `3`.
4. `render()` converts `3` to the string `"3"`.
5. The output's `textContent` changes, so the browser displays `3`.

Tracing the values in order is a core debugging technique. It replaces a broad question such as “Why is it broken?” with a sequence of observable checks.

## Change the requirement

Change this line:

```js
const increment = 1;
```

to:

```js
const increment = 2;
```

Reload the page and select Add one three times. The expected result is `6`, not `3`. The control label should also change to **Add two** so the interface states what the program will do.

This edit demonstrates why configuration should have one clear source. If the number `1` had been repeated throughout the code, every copy would need review. A named value also communicates why the number exists.

## Introduce and diagnose a defect

Now create a mismatch deliberately. Change the HTML from:

```html
<output id="count" aria-live="polite">0</output>
```

to:

```html
<output id="total" aria-live="polite">0</output>
```

Leave the JavaScript selector as `document.querySelector('#count')`. The selector no longer finds an element, so `countOutput` becomes `null`. When `render()` tries to assign `textContent`, the browser reports a JavaScript error. Exact wording varies by browser, but the message should indicate that a property cannot be set on `null`.

Use this debugging sequence:

1. Reproduce the problem with one click or page load.
2. Open the browser developer tools and select the Console.
3. Read the first relevant error and its file location.
4. Inspect `countOutput` in the Console.
5. Compare the selector `#count` with the current HTML IDs.
6. Restore `id="count"`, reload, and repeat the tests.

The repair is not to suppress the error. It is to restore the contract between the markup and the program. The JavaScript expects one element with the ID `count`, so the HTML must provide it or the script must intentionally select the new ID.

## Test behavior, not only appearance

A counter that looks correct at zero can still fail after interaction. Use a compact behavior table:

| Test | Action | Expected result |
|---|---|---|
| Initial state | Load or reload the page | Count displays `0` |
| Single addition | Select Add one once | Count displays `1` |
| Repeated addition | Select Add one three more times | Count displays `4` |
| Reset | Select Reset | Count displays `0` |
| Continue after reset | Select Add one | Count displays `1` |
| Keyboard | Focus Add one and press Enter or Space | Count increases once |

The repository also runs an automated test against the downloadable example. It executes the inline script with controlled button elements, confirms the initial state, invokes the Add one handler three times, checks for `3`, invokes Reset, and checks for `0`. This tests the same state transitions without relying only on visual inspection.

Automation does not replace the keyboard and browser checks. It confirms the program logic quickly, while the browser checks cover native interaction and presentation.

## Common first-project mistakes

### The script runs before the elements exist

Place the script near the end of `body`, as the example does, or load it with `defer`. Otherwise, selectors can run before the browser has parsed the controls.

### The selector and ID differ

`#count` selects `id="count"`. Capitalization and punctuation matter. Inspect the returned value before trying to use it.

### A value is treated as text unexpectedly

Form fields usually expose strings. In projects that read a numeric input, convert and validate it before arithmetic. This counter stores a number internally and converts it to text only when rendering.

### State changes but the page does not

Changing `count` does not automatically update the document. Call `render()` after every state transition that should be visible.

### One large callback does everything

Separate state changes from rendering when the project begins to grow. Small functions give tests and future edits a clear target.

### A generic element replaces a button

A styled `div` does not receive all button behavior automatically. Use the native element that matches the action, then style it.

## Extend the project in controlled steps

Add one requirement at a time and update the test table before editing the code.

1. Add a **Subtract one** button and decide whether negative values are allowed.
2. Add a numeric step input and reject empty, nonnumeric, or unsafe values.
3. Add a maximum and disable Add one when the count reaches it.
4. Store the value with `localStorage` and define what Reset should remove.
5. Add a history list that records each operation rather than only the current result.

Each extension introduces a new design decision. For example, persistence raises questions about stale values and shared devices. A maximum raises questions about disabled-state explanation. Write the expected behavior before implementing it.

## What works best for learning

Use a project small enough to predict by hand but complete enough to test. Type or edit the code, state the expected result before running it, and diagnose one intentional defect. Reading syntax explains available tools; changing and testing a program develops the ability to use them.

After the counter works, rebuild it without looking at the finished file. Compare structure and behavior rather than exact formatting. Then extend one requirement and add its tests. That sequence produces transferable skills: decomposing a task, naming state, handling events, rendering output, investigating errors, and checking results.
