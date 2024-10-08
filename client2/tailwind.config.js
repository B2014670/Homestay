/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}",
  './public/index.html'
  ],
  theme: {
    extend: {
      width: {
        '1100' : '1100px',    
      },
      backgroundColor:{
        primary : '#F5E6CC',
        secondary1 : '#1266dd',
        secondary2 : '#f73859'
      },
      maxWidth: {
        '600' : '600px',
      },
      // cursor:{
      //   pointer: 'pointer',
      // }
    },
  },
  plugins: [],
 
 
}