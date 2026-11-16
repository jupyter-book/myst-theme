type SiteAnalytics = {
  analytics_google?: string;
  analytics_plausible?: string;
};

/** `option` is a Plausible script URL, or a site domain for the legacy script */
function PlausibleAnalytics({ option }: { option: string }) {
  if (option.startsWith('http') && option.includes('.js')) {
    return <script async src={option}></script>;
  }
  return <script defer data-domain={option} src="https://plausible.io/js/plausible.js"></script>;
}

const getGoogleAnalyticsScript = (tag: string) =>
  `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${tag}');`;

export function Analytics({ analytics_google, analytics_plausible }: SiteAnalytics) {
  return (
    <>
      {analytics_plausible && <PlausibleAnalytics option={analytics_plausible} />}
      {analytics_google && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics_google}`}
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: getGoogleAnalyticsScript(analytics_google),
            }}
          />
        </>
      )}
    </>
  );
}
