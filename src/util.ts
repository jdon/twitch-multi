const chunk = (arr: any[], size: number) => {
  const newArr: any[] = [];

  // Init
  for (let x = 0; x < size; x++) {
    newArr.push([]);
  }

  for (let i = 0; i < arr.length; i++) {
    newArr[i % size].push(arr[i]);
  }

  return newArr;
}

export const gridify = (arr: any[]) => {
  let size = Math.ceil(Math.sqrt(arr.length));
  return chunk(arr, size).reverse();
};
