/** Runs before paint (in <head>) so a saved dark preference never flashes light. Light is the default. */
export const themeScript = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;
