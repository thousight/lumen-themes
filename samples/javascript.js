// Object properties must remain distinct without semantic highlighting.
const lantern = {
  title: "Paper lantern",
  "label": "Warm light",
  enabled: true,
  count: 42,
  describe() { return this.title; }
};
console.log(lantern.title, lantern.describe());
