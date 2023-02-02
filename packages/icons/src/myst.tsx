export function MystLogo({
  size = 24,
  fill = '#616161',
  highlight = '#F37726',
  className,
}: {
  size?: number;
  fill?: string | 'currentColor';
  highlight?: string | 'currentColor';
  className?: string;
}) {
  return (
    <svg
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      stroke="none"
      className={className}
    >
      <g id="icon">
        <path
          fill={fill}
          d="M23.8,54.8v-3.6l4.7-0.8V17.5l-4.7-0.8V13H36l13.4,31.7h0.2l13-31.7h12.6v3.6l-4.7,0.8v32.9l4.7,0.8v3.6h-15
          v-3.6l4.9-0.8V20.8H65L51.4,53.3h-3.8l-14-32.5h-0.1l0.2,17.4v12.1l5,0.8v3.6H23.8z"
        />
        <path
          fill={highlight}
          d="M47,86.9c0-5.9-3.4-8.8-10.1-8.8h-8.4c-5.2,0-9.4-1.3-12.5-3.8c-3.1-2.5-5.4-6.2-6.8-11l4.8-1.6
          c1.8,5.6,6.4,8.6,13.8,8.8h9.2c6.4,0,10.8,2.5,13.1,7.5c2.3-5,6.7-7.5,13.1-7.5h8.4c7.8,0,12.7-2.9,14.6-8.7l4.8,1.6
          c-1.4,4.9-3.6,8.6-6.8,11.1c-3.1,2.5-7.3,3.7-12.4,3.8H63c-6.7,0-10,2.9-10,8.8"
        />
      </g>
    </svg>
  );
}

export function MadeWithMyst() {
  return (
    <a
      className="flex w-fit mx-auto text-gray-700 hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-400"
      href="https://curvenote.com"
      target="_blank"
      rel="noreferrer"
    >
      <MystLogo />
      <span className="self-center text-sm ml-2">Made with MyST</span>
    </a>
  );
}
