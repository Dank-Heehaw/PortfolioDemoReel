/** Shown the moment a route changes, so the previous page does not stay on screen. */
export default function Loading() {
  return <div className="route-pending" aria-busy="true" />;
}
