import PortfolioApp from "../../components/PortfolioApp";
import { CMS_PAYLOAD_ID } from "../../lib/cms/store.js";
import { loadCmsPayload, serializeCmsPayload } from "../../lib/cms/load-server.js";

/**
 * Catch-all route — every URL serves the same SPA host.
 * CMS is fetched here (Directus, 60s revalidate) and injected as JSON so the
 * client SPA can hydrate without exposing DIRECTUS_TOKEN.
 */
export default async function CatchAllPage() {
  const cms = await loadCmsPayload();
  const json = serializeCmsPayload(cms);

  return (
    <>
      <script
        id={CMS_PAYLOAD_ID}
        type="application/json"
        dangerouslySetInnerHTML={{ __html: json }}
      />
      <PortfolioApp />
    </>
  );
}
