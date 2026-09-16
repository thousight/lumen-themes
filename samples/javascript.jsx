const lantern = { title: "Paper lantern", enabled: true };
export function Preview() {
  return <section className="lantern" title={lantern.title}>Warm light</section>;
}
