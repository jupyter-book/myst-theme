import classnames from 'classnames';
import JupyterLogo from './jupyter.svg';
import JupyterGreyLogo from './jupyter-grey.svg';

function Jupyter({ className, isDark }: { className?: string; isDark?: boolean }) {
  return (
    <div className={classnames('not-prose px-1', className)} title="Jupyter Notebook">
      <img src={isDark ? JupyterGreyLogo : JupyterLogo} alt="Juyter Logo" width="21" />
    </div>
  );
}

export default Jupyter;
