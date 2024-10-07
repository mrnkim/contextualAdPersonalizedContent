import type { Config } from "tailwindcss";
import colors from "./src/styles/colors"; // colors 파일을 import 합니다

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
		colors: {
			inherit: 'inherit',
			transparent: 'transparent',
			current: 'currentColor',
			black: '#000000',
			white: '#FFFFFF',
			primary: colors.green[500],
			secondary: colors.mossGreen[800],
			error: colors.red[500],
			grey: colors.grey,
			green: colors.green,
			moss_green: colors.mossGreen,
			turquoise: colors.turquoise,
			yellow: colors.yellow,
			orange: colors.orange,
			red: colors.red,
			purple: colors.purple
		},
		fontFamily: {
			aeonik: ['Aeonik, Helvetica, Arial, sans-serif'],
			denton: ['Denton, Helvetica, Arial, sans-serif']
		},
		extend: {
			zIndex: {
				1: 1,
				2: 2,
				3: 3,
				4: 4,
				5: 5,
				6: 6,
				7: 7,
				8: 8,
				9: 9
			},
			fontSize: {
				subtitle1: ['1.25rem', {
					lineHeight: '1.5rem',
					fontWeight: '500'
				}],
				'subtitle1-bold': ['1.25rem', {
					lineHeight: '1.5rem',
					fontWeight: '700'
				}],
				subtitle2: ['1rem', {
					lineHeight: '1.25rem',
					fontWeight: '500',
				}],
				'subtitle2-bold': ['1rem', {
					lineHeight: '1.25rem',
					fontWeight: '700'
				}],
				subtitle3: ['0.875rem', {
					lineHeight: '1.25rem',
					fontWeight: '500'
				}],
				'subtitle3-bold': ['0.875rem', {
					lineHeight: '1.25rem',
					fontWeight: '700'
				}],
				body1: ['1rem', {
					lineHeight: '1.5rem',
					fontWeight: '400'
				}],
				body2: ['0.875rem', {
					lineHeight: '1.25rem',
					fontWeight: '400'
				}],
				body3: ['0.75rem', {
					lineHeight: '1rem',
					fontWeight: '400'
				}]
			},
			animation: {
				'spin-slow': 'spin 3s linear infinite'
			}
		}
	},
  plugins: [],
};
export default config;
