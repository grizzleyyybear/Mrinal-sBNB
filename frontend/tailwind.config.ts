import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rausch: "#ff385c",
        "rausch-active": "#e00b41",
        "rausch-disabled": "#ffd1da",
        ink: "#222222",
        body: "#3f3f3f",
        muted: "#6a6a6a",
        "muted-soft": "#929292",
        hairline: "#dddddd",
        "hairline-soft": "#ebebeb",
        strong: "#c1c1c1",
        "surface-soft": "#f7f7f7",
        "surface-strong": "#f2f2f2"
      },
      borderRadius: {
        air: "14px"
      },
      boxShadow: {
        airbnb: "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 12px 0",
        pill: "rgba(0,0,0,0.08) 0 1px 2px, rgba(0,0,0,0.10) 0 3px 12px"
      },
      fontFamily: {
        sans: [
          "Airbnb Cereal VF",
          "Circular",
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "Helvetica Neue",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
