
import type {
  ShareArgs ,
} from '@module-federation/runtime-core/types';
import type {
  ModuleFederationOptions
} from '@module-federation/vite'

export const consumerConfig: Record<string, ShareArgs> = {"@myst-theme/anywidget/": {
    version: "1.4.1",
    get: () => import("@myst-theme/anywidget").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/common/": {
    version: "1.4.1",
    get: () => import("@myst-theme/common").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/frontmatter/": {
    version: "1.4.1",
    get: () => import("@myst-theme/frontmatter").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/icons/": {
    version: "1.4.1",
    get: () => import("@myst-theme/icons").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/jupyter/": {
    version: "1.4.1",
    get: () => import("@myst-theme/jupyter").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/landing-pages/": {
    version: "1.4.1",
    get: () => import("@myst-theme/landing-pages").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/providers/": {
    version: "1.4.1",
    get: () => import("@myst-theme/providers").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/search/": {
    version: "1.4.1",
    get: () => import("@myst-theme/search").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/search-minisearch/": {
    version: "1.4.1",
    get: () => import("@myst-theme/search-minisearch").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"@myst-theme/site/": {
    version: "1.4.1",
    get: () => import("@myst-theme/site").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"myst-to-react/": {
    version: "1.4.1",
    get: () => import("myst-to-react").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.4.1" },
},
"react/": {
    version: "19.0.0",
    get: () => import("react").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "19.0.0" },
},
"react-dom/": {
    version: "19.0.0",
    get: () => import("react-dom").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "19.0.0" },
},
"@module-federation/runtime-core/": {
    version: "2.9.0",
    get: () => import("@module-federation/runtime-core").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^2.9.0" },
},
"@module-federation/vite/": {
    version: "1.23.5",
    get: () => import("@module-federation/vite").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "^1.23.5" },
},};
export const producerConfig: Required<ModuleFederationOptions['shared']> = {"@myst-theme/anywidget/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/common/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/frontmatter/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/icons/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/jupyter/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/landing-pages/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/providers/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/search/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/search-minisearch/": { singleton: true, requiredVersion: "^1.4.1" },
"@myst-theme/site/": { singleton: true, requiredVersion: "^1.4.1" },
"myst-to-react/": { singleton: true, requiredVersion: "^1.4.1" },
"react/": { singleton: true, requiredVersion: "19.0.0" },
"react-dom/": { singleton: true, requiredVersion: "19.0.0" },
"@module-federation/runtime-core/": { singleton: true, requiredVersion: "^2.9.0" },
"@module-federation/vite/": { singleton: true, requiredVersion: "^1.23.5" },};