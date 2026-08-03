"use client";

import { useEffect } from "react";
import { siteContentDb } from "@/lib/siteContentDb";

export function GTMScript() {
  useEffect(() => {
    siteContentDb.getAll().then(content => {
      const id = content.gtm_id?.trim();
      if (!id) return;

      // Head script
      const script = document.createElement("script");
      script.id = "gtm-head";
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
      if (!document.getElementById("gtm-head")) {
        document.head.appendChild(script);
      }

      // Body noscript fallback
      if (!document.getElementById("gtm-body")) {
        const noscript = document.createElement("noscript");
        noscript.id = "gtm-body";
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }).catch(() => {});
  }, []);

  return null;
}
