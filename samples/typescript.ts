// Readonly and mutable property colors should match with semantic tokens on/off.
const lantern: { readonly label: string; title: string } = {
  label: "Warm light",
  title: "Paper lantern",
};
console.log(lantern.label, lantern.title);
const describe = () => lantern.title;
describe();
