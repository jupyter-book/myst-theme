# Developer tips and best practices

## Using Providers for MyST content

When using components that render MyST content (using `<MyST ast={content} />`), they must be wrapped wrap them in various providers e.g. `TabStateProvider` to ensure proper React context is available.
These providers facilitate an alternative to prop drilling, the name used to describe passing props down several layers of React components.

See [`themes/book/app/routes/$.tsx#L98-L121`](https://github.com/jupyter-book/myst-theme/blob/f758f671a883bbdc2e9950ed2da9c0b99fb96720/themes/book/app/routes/$.tsx#L98-L121) for examples of how the Banner and Footer components are wrapped in `TabStateProvider`.

## Recommended VSCode Extensions

- [Headwind](https://marketplace.visualstudio.com/items?itemName=heybourn.headwind): sorts the tailwind class names