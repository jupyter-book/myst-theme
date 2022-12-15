type SiteAnalytics = {
  analytics_google?: string;
  analytics_plausible?: string;
};

const getGoogleAnalyticsScript = (tag: string) =>
  `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${tag}');`;

export function Analytics({ analytics_google, analytics_plausible }: SiteAnalytics) {
  return (
    <>
      {analytics_plausible && (
        <script
          defer
          data-domain={analytics_plausible}
          src="https://plausible.io/js/plausible.js"
        ></script>
      )}
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
