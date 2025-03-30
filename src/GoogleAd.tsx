import React, { useEffect, useRef } from "react";

let uniqueAdIdCounter = 0;

interface GoogleAdProps {
  slot?: string;
  format?: string;
  style?: React.CSSProperties;
}

export default function GoogleAd({
  slot = "2521397147",
  format = "auto",
  style = { display: "block" },
}: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const uniqueId = `google-ad-${++uniqueAdIdCounter}`;

  useEffect(() => {
    const adElem = adRef.current?.querySelector("ins.adsbygoogle");

    if (adElem && !adElem.getAttribute("data-adsbygoogle-status")) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, []);

  return (
    <div ref={adRef} id={uniqueId}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-4976003459814781"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
