import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
// @ts-ignore
import plugin from "tw-neumorphism";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    screens: {
      xs: "375px", // mobile medium
      sm: "425px", // mobile large
      md: "768px",
      lg: "1024px",
      ms: "320px", // mobile small
      mm: "375px", // mobile medium
      ml: "425px", // mobile large
      desktop: "600px",
    },
    extend: {
      fontFamily: {
        mono: [
          '"VT323"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
        logo: ['"Black Ops One"', "cursive"],
        digits: ["var(--font-segment)"],
      },
      gridTemplateColumns: {
        desktop: "7rem 20rem 7rem",
        mobile: "5rem minmax(10rem, 20rem) 5rem",
      },
    },
    colors: {
      // default Tailwind colors
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.stone,
      red: colors.red,
      yellow: colors.amber,
      green: colors.emerald,
      blue: colors.blue,
      indigo: colors.indigo,
      purple: colors.violet,
      pink: colors.pink,
      // Tetromino colors
      tetro_i: colors.cyan,
      tetro_o: colors.yellow,
      tetro_t: colors.purple,
      tetro_s: colors.green,
      tetro_z: colors.red,
      tetro_j: colors.blue,
      tetro_l: colors.orange,
      "bay-of-many": "#273c75", // Replace with the actual hex code for Bay of Many 900
      "mine-shaft": "#292524",
    },
    boxShadow: {
      "custom-light": "4px 6px 12px rgba(0, 0, 0, 0.25)",
      "custom-dark": "4px 6px 12px rgba(0, 0, 0, 0.5)",
      "inner-light":
        "inset 0px 5px 15px rgba(0, 0, 0, 0.25), inset 0px -5px 15px rgba(255, 255, 255, 0.4)",
      //   "custom-dark": "-4px -4px 10px rgba(0, 0, 0, 0.2)",
      // Add more custom shadows as needed
    },
    theme: {
      extend: {},
    },
  },
  plugins: [plugin],
};
export default config;
