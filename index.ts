type InputHandler = (elements: HTMLInputElement[]) => void

window.addEventListener('load', () => {
  // query global elements
  const form = document.getElementById('post-form')
  const submitButton = document.getElementById('generate')
  const result = document.getElementById('result')
  const count = document.querySelector('input[name="count"]')

  // check for the presence of at least one value in each form column
  const validateForm: InputHandler = elements => {
    const columnState = elements
      .reduce(
        (columns, input: HTMLInputElement) => ({
          ...columns,
          [input.name]: columns[input.name] || !!input.value?.trim()
        }),
        {
          pillar: false,
          filter: false,
          type: false,
        }
      )

    // enable or disable the submitButton based on the presence of all columns
    const hasRequiredColumns = Object
      .values(columnState)
      .every(Boolean)

    hasRequiredColumns
      ? submitButton.removeAttribute('disabled')
      : submitButton.setAttribute('disabled', 'true')
  }

  // make sure that every column has N + 1 inputs, where N is the number of inputs with values
  const setInputCount: InputHandler = elements => {
    const columns = elements
      .reduce(
        (columns, input: HTMLInputElement) => ({
          ...columns,
          [input.name]: [...(columns[input.name] || []), input]
        }),
        {} as Record<string, HTMLInputElement[]>
      )

    Object
      .values(columns)
      .forEach(inputs => {
        // remove all but the first empty input in each column
        const [empty, ...vestigials] = inputs.filter(input => !input.value)

        vestigials.forEach(vestigial => vestigial.remove())

        // if there are no empty inputs, create a new one after the last existing input
        if (!empty) {
          const last = inputs[inputs.length - 1]
          const input = last.cloneNode()

          if (input instanceof HTMLInputElement) {
            input.value = ''
            input.removeAttribute('required')
            last.after(input)
          }
        }

        // make sure that the first input left on the page is still required
        inputs[0].setAttribute('required', 'true')
      })
  }

  // run all form-related actions
  const handleForm = (form: HTMLFormElement) => {
    const inputs = Array
      .from(form.elements)
      .filter(element => element instanceof HTMLInputElement)
      .filter((input: HTMLInputElement) => input.name !== 'count') as HTMLInputElement[]

    setInputCount(inputs)
    validateForm(inputs)
  }

  // combine all of the form keyboard listeners into one parent listener 
  const handleFormInteraction = (event: KeyboardEvent) => {
    const input = event.target as HTMLInputElement
    const form = input.closest('form')

    handleForm(form)
  }

  // set up keypress listeners on the form
  form.addEventListener('keyup', handleFormInteraction)

  // initialize the form once on page load
  handleForm(form)

  // handle "count" changes
  const handleCount = (event: InputEvent) => {
    let prompt = 'Generate Post'
    const element = event.target as HTMLInputElement
    const isPlural = Number(element.value) > 1

    if (isPlural) {
      prompt += 's'
    }

    submitButton.textContent = prompt
  }

  // set up change listeners on "count" input
  count.addEventListener('input', handleCount)

  interface Accumulator {
    count: number
    columns: Record<string, HTMLInputElement[]>
  }

  // set up "generate" button listeners
  const generatePost = (event: Event) => {
    event.preventDefault()

    const {count, columns}: Accumulator = Array
      .from(form.elements)
      .filter((input: HTMLInputElement) => !!input?.value)
      .reduce(
        ({count, columns}, input: HTMLInputElement) => {
          if (input.name === 'count') {
            return {
              columns,
              count: Number(input.value)
            }
          }

          return {
            count,
            columns: {
              ...columns,
              [input.name]: [...(columns[input.name] || []), input]
            }
          }
        },
        {count: 1, columns: {}}
      )

    const posts = (new Array(count))
      .fill(0)
      .map(() => {
        const {pillar, filter, type} = Object
          .entries(columns)
          .reduce(
            (chosenColumns, [column, choices]) => {
              const choiceIndex = Math.round(Math.random() * (choices.length - 1))

              return {
                ...chosenColumns,
                [column]: choices[choiceIndex].value
              }
            },
            columns
          )

        return `<li>${pillar} / ${filter} / ${type}</li>`
      })
      .join('\n')

    result.innerHTML = posts
  }

  submitButton.addEventListener('click', generatePost)
})
