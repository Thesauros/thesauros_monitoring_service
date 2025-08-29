export function cutNumber(number: number, space = " ") {
  if (Math.abs(number) > 999 && Math.abs(number) < 999999) {
    return `${
      Math.sign(number) * Number((Math.abs(number) / 1000).toFixed(1))
    }k`;
  }
  if (Math.abs(number) > 999999) {
    return `${
      Math.sign(number) * Number((Math.abs(number) / 1000000).toFixed(1))
    }M`;
  }

  return Math.sign(number) * Math.abs(number);
}
