export const tourSteps = [
  {
    selector: `[data-tour="1"]`,
    content: "",
  },
  {
    selector: `[data-tour="2"]`,
    content: "",
    disableNav: true,
    waitFor: "click",
    delay: 200,
  },
  {
    selector: `[data-tour="3"]`,
    content: "",
    disableNav: true,
    waitFor: "click",
    delay: 200,
    navBack: true,
  },
  {
    selector: `[data-tour="4"]`,
    content: "",
    stepInteraction: false,
  },
  {
    selector: `[data-tour="5"]`,
    content: "",
    stepInteraction: false,
  },
  {
    selector: `[data-tour="6"]`,
    content: "",
    stepInteraction: false,
  },
];

export const tourStepContent = [
  "Here, you can find, create and edit your own flows.",
  "Let's create one ! Click on the 'Create' button",
  "Select an Empty Flow",
  "You can add new nodes onto the editor from Library",
  "Run your flow from here",
  "You can save, export and delete your flow from here",
];
