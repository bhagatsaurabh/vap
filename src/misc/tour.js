export const tourSteps = [
  {
    selector: `[data-tour="1"]`,
    content: "Here, you can find, create and edit your own flows.",
  },
  {
    selector: `[data-tour="2"]`,
    content: "Let's create one ! Click on the 'Create' button",
    disableNav: true,
    waitFor: "click",
    delay: 200,
  },
  {
    selector: `[data-tour="3"]`,
    content: "Select an Empty Flow",
    disableNav: true,
    waitFor: "click",
    delay: 200,
  },
  {
    selector: `[data-tour="4"]`,
    content: "You can add new nodes onto the editor from Library",
    stepInteraction: false,
  },
  {
    selector: `[data-tour="5"]`,
    content: "Run your flow from here",
    stepInteraction: false,
  },
  {
    selector: `[data-tour="6"]`,
    content: "You can save, export and delete your flow from here",
    stepInteraction: false,
  },
];
