type InputHandler = (elements: HTMLInputElement[]) => void

// query global elements
const form = document.querySelector('form')
const submitButton = document.querySelector('button')
const result = document.getElementById('result')

// check for the presence of at least one value in each form column
const validateForm: InputHandler = elements => {
  const columnState = elements
    .reduce(
      (columns, input: HTMLInputElement) => ({
        ...columns,
        [input.name]: columns[input.name] || !!input.value?.trim()
      }),
      {
        duration: false,
        equipment: false,
        movement: false,
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
    .filter(element => element instanceof HTMLInputElement) as HTMLInputElement[]

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

// set up "generate" button listeners
const generateWorkout = (event: Event) => {
  event.preventDefault()
  const columns = Array
    .from(form.elements)
    .filter((input: HTMLInputElement) => !!input?.value)
    .reduce(
      (columns, input: HTMLInputElement) => ({
        ...columns,
        [input.name]: [...(columns[input.name] || []), input]
      }),
      {} as Record<string, HTMLInputElement[]>
    )

  const {equipment, movement, duration} = Object
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

  result.textContent = `Your workout: ${equipment} ${movement} for ${duration} minutes`
}

submitButton.addEventListener('click', generateWorkout)
