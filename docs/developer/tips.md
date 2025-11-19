# Developer tips and best practices

## Using Providers for MyST content

Providers create [React contexts](https://react.dev/reference/react/createContext) so deeply nested components can share state and keep isolated subtrees in sync. For example, wrapping a page in `<ArticleProvider>...</ArticleProvider>` shares the current article's `kind`, `frontmatter`, and `references` with every descendant, while `TabStateProvider` ensures tab interactions remain local to the subtree you wrap.

Any component that renders MyST content (such as `<MyST ast={content} />`) should sit inside the provider stack used by the rest of the app. See [`themes/book/app/routes/$.tsx#L98-L121`](https://github.com/jupyter-book/myst-theme/blob/f758f671a883bbdc2e9950ed2da9c0b99fb96720/themes/book/app/routes/$.tsx#L98-L121) for a concrete example.

## Recommended VSCode Extensions

- [Headwind](https://marketplace.visualstudio.com/items?itemName=heybourn.headwind): sorts the tailwind class names
