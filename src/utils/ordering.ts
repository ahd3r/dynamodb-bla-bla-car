// ascii hashing for string ordering
const ordering = <T>(data: T[], sortBy: { [field: string]: 'ASC' | 'DESC' }): T[] => {
  let res: T[][] = [data];
  Object.keys(sortBy).forEach((fieldToSort) => {
    const newRes: T[][] = [];
    res.forEach((scopedRes) => {
      const falsyItems = scopedRes.filter((item) => !Boolean(item[fieldToSort]));
      const nonFalsyItems = scopedRes.filter((item) => Boolean(item[fieldToSort]));
      if (falsyItems.length) {
        newRes.push(falsyItems);
      }
      if (nonFalsyItems.length) {
        newRes.push(
          ...nonFalsyItems
            .sort((itemOne, itemTwo) => {
              if (sortBy[fieldToSort] === 'DESC') {
                if (typeof itemTwo[fieldToSort] === 'string') {
                  return itemTwo[fieldToSort].localeCompare(itemOne[fieldToSort]);
                } else {
                  return valToNum(itemTwo[fieldToSort]) - valToNum(itemOne[fieldToSort]);
                }
              } else {
                if (typeof itemOne[fieldToSort] === 'string') {
                  return itemOne[fieldToSort].localeCompare(itemTwo[fieldToSort]);
                } else {
                  return valToNum(itemOne[fieldToSort]) - valToNum(itemTwo[fieldToSort]);
                }
              }
            })
            .reduce((r: T[][], item: T) => {
              if (!r.length) {
                r.push([item]);
                return r;
              } else {
                if (
                  r[r.length - 1][r[r.length - 1].length - 1][fieldToSort] !== item[fieldToSort]
                ) {
                  r.push([item]);
                } else {
                  r[r.length - 1].push(item);
                }
                return r;
              }
            }, [])
        );
      }
    });
    res = newRes;
  });
  return res.flat();
};

const valToNum = (val: number | boolean): number => {
  if (typeof val === 'number') {
    return val;
  } else {
    return Number(val);
  }
};
