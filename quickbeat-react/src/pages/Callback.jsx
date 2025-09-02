import { useEffect } from "react";
import { getToken } from "../services/spotifyAuth";

function Callback() {
  useEffect(() => {
    (async () => {
      await getToken();
      window.location.href = "/shuffle"; // redirect after token
    })();
  }, []); // empty dependency → runs only once

  return <div>Redirecting…</div>;
}

export default Callback;