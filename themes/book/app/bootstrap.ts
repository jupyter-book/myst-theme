import type { NodeRenderers } from '@myst-theme/providers';
import { createInstance } from '@module-federation/runtime';

/**
 * Generated modules from 
 * jq '.dependencies | to_entries | map({key: .key, value: {get: "() => import(\"\(.key)\").then(mod => () => mod)", scope: "default", shareConfig: {singleton:true,import:false,requiredVersion: .value | sub("\\^(?<v>.*)"; "~\(.v)")}}}) | from_entries' package.json | wl-copy
 * This would be handled by the build system typically (invisibly)
 */

export type Remote = {
  name: string;
  entry: string;
}

export async function loadRenderers(remotes: Remote[]): Promise<NodeRenderers> {

  const mf = createInstance({
    name: 'host',
    remotes,
    shared: {
  "@heroicons/react": {
    get: () => import("@heroicons/react").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~2.0.18"
    }
  },
  "@myst-theme/anywidget": {
    get: () => import("@myst-theme/anywidget").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/common": {
    get: () => import("@myst-theme/common").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/frontmatter": {
    get: () => import("@myst-theme/frontmatter").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/icons": {
    get: () => import("@myst-theme/icons").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/jupyter": {
    get: () => import("@myst-theme/jupyter").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/landing-pages": {
    get: () => import("@myst-theme/landing-pages").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/providers": {
    get: () => import("@myst-theme/providers").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/search": {
    get: () => import("@myst-theme/search").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/search-minisearch": {
    get: () => import("@myst-theme/search-minisearch").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/site": {
    get: () => import("@myst-theme/site").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "@myst-theme/styles": {
    get: () => import("@myst-theme/styles").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "myst-spec-ext": {
    get: () => import("myst-spec-ext").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.8.1"
    }
  },
  "myst-to-react": {
    get: () => import("myst-to-react").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.3.1"
    }
  },
  "myst-common": {
    get: () => import("myst-common").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.8.1"
    }
  },
  "myst-config": {
    get: () => import("myst-config").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.8.1"
    }
  },
  "myst-migrate": {
    get: () => import("myst-migrate").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~1.7.1"
    }
  },
  "thebe-core": {
    get: () => import("thebe-core").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~0.5.0"
    }
  },
  "react": {
    get: () => import("react").then(mod => () => mod),
    "scope": "default",
    "shareConfig": {
      "singleton": true,
      "import": false,
      "requiredVersion": "~19.1.0"
    }
  }
}
,
  });

 return await Promise.all(remotes.map(r => mf.loadRemote(r.name).then((m) => m.default)));
}
