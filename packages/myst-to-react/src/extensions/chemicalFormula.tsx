import type { NodeRenderer } from '@myst-theme/providers';

/**
 * Separate numbers and letters so that numbers can be <sub>2</sub>
 * @param formula a string H2O
 * @returns ['H', '2', '0']
 */
function parseFormula(formula?: string) {
  return [...(formula ?? '')].reduce((acc, current) => {
    const last = acc.pop();
    const letter = current === '+' ? '⁺' : current === '-' ? '⁻' : current;
    const isNumber = letter.match(/[0-9]/);
    const lastIsNumber = last?.match(/[0-9]/);
    if (isNumber) {
      if (lastIsNumber) {
        return [...acc, `${last ?? ''}${letter}`];
      }
      return [...acc, last, letter].filter((v) => !!v) as string[];
    }
    if (lastIsNumber) {
      return [...acc, last, letter].filter((v) => !!v) as string[];
    }
    return [...acc, `${last ?? ''}${letter}`];
  }, [] as string[]);
}

export const ChemicalFormula: NodeRenderer = ({ node }) => {
  const parts = parseFormula(node.value);
  return (
    <span className="text-inherit" aria-roledescription="Chemical Formula">
      {parts.map((letter, index) => {
        if (letter.match(/[0-9]/)) return <sub key={index}>{letter}</sub>;
        return <span key={index}>{letter}</span>;
      })}
    </span>
  );
};

const CHEM_RENDERERS = {
  chemicalFormula: ChemicalFormula,
};

export default CHEM_RENDERERS;
