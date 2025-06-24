---
jupyter:
  kernelspec:
    display_name: Python 3
    language: python
    name: python3
---
# Example content

This page contains example content for previewing or demonstrating theme functionality.

## Admonitions

```{note} A sample admonition.
Here's an admonition body.
```

## Code cells

### Pandas

```{code-cell}
import pandas as pd
import numpy as np

df = pd.DataFrame(np.random.randn(10, 4), columns=['A', 'B', 'C', 'D'])
df
```

### Matplotlib

```{code-cell}
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
plt.scatter(df['A'], df['B'], alpha=0.7)
plt.xlabel('Column A')
plt.ylabel('Column B')
plt.title('Scatter Plot of DataFrame Columns')
plt.grid(True, alpha=0.3)
plt.show()
```

### Plotly

```{code-cell}
import plotly.express as px

fig = px.scatter(df, x='A', y='B', title='Interactive Scatter Plot with Plotly')
fig.update_layout(
    xaxis_title='Column A',
    yaxis_title='Column B',
    showlegend=False
)
fig.show()
```

### Altair

```{code-cell}
import altair as alt

chart = alt.Chart(df.reset_index()).mark_circle().encode(
    x=alt.X('A:Q', title='Column A'),
    y=alt.Y('B:Q', title='Column B'),
    tooltip=['index', 'A', 'B']
).properties(
    title='Interactive Chart with Altair',
    width=400,
    height=300
)

chart
```

## Sidebars

````{sidebar}
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

```{note} Test note!
Here's a test note!
```

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

````


```{note} Test note!
Here's a test note!
```

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
