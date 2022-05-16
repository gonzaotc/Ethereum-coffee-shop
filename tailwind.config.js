const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      bgGradientDeg: {
        75: "75deg",
      },
      fontFamily: {
        Roboto: ["Roboto", "system-ui"],
      },
      colors: {
        borderOpacity: "hsla(0,0%,100%,.11)",
        bgOpacity: "hsla(0,0%,100%,.05)",
        bgOpacityStrong: "hsla(0,0%,100%,.14)",
      },
      spacing: {
        "30vh": "30vh",
        "40vh": "40vh",
        "50vh": "50vh",
        "60vh": "60vh",
        "63vh": "63vh",
        "70vh": "70vh",
        "80vh": "80vh",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-gradient": angle => ({
            "background-image": `linear-gradient(${angle}, var(--tw-gradient-stops))`,
          }),
        },
        {
          values: Object.assign(
            theme("bgGradientDeg", {}), // name of config key. Must be unique
            {
              10: "10deg", // bg-gradient-10
              15: "15deg",
              20: "20deg",
              25: "25deg",
              30: "30deg",
              45: "45deg",
              60: "60deg",
              90: "90deg",
              120: "120deg",
              135: "135deg",
              247: "247deg",
            }
          ),
        }
      );
    }),
  ],
};
