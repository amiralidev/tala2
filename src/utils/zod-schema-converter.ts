function convertBrackets(input: string): string {
  return input.replace(/\[/g, "#").replace(/\]/g, "&");
}

function reverseConvert(input: string): string {
  return input.replace(/#/g, "[").replace(/&/g, "]");
}

export { convertBrackets, reverseConvert };
