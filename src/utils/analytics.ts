import { ValidationError } from './utils';

const allowedFunctions: string[] = ['count', 'max', 'min', 'avg', 'sum'];

/**
 * Function to analyze data by incoming query
 * @param {any[]} data filtered and sorted data;
 * @param {string} [attrs] Optional; Example: count(status), max(price), min(price), avg(age), id, ...;
 * @param {string} [group_by] Optional; Example: status, price;
 *
 * @example
 * proceedAnalytic([{...}, {...}, {...}], 'count(status), max(price), min(price), avg(age), id, ...', 'status')
 * proceedAnalytic([{...}, {...}, {...}], 'count(status), max(price), min(price), avg(age), id, ...', 'status, price')
 * proceedAnalytic([{...}, {...}, {...}], 'count(status), max(price), min(price), avg(age), id, ...')
 * proceedAnalytic([{...}, {...}, {...}])
 */
export const proceedAnalytic = (data: any[], attrs?: string, group_by?: string): any => {
  if (!data.length) {
    return [];
  }

  // validate attrs
  if (attrs) {
    attrs
      .split(',')
      .map((v) => v.trim())
      .forEach((attr) => {
        const indexOfOpenBrace = attr.indexOf('(');
        if (indexOfOpenBrace !== -1) {
          if (attr.split('').filter((char) => char === '(' || char === ')').length !== 2) {
            throw new ValidationError('Wrong braces in attribute definition');
          }
          if (!allowedFunctions.includes(attr.slice(0, indexOfOpenBrace))) {
            throw new ValidationError(`Function ${attr.slice(0, indexOfOpenBrace)} does not exist`);
          }
        }
      });
  }

  let resWithGroup: any[] = [];
  let resWithoutGroup: any[] = [];

  // proceed group_by
  if (group_by) {
    const usedValueForGrouping: any[] = [];
    const fieldsToGroup = group_by.split(',').map((v) => v.trim());
    data.forEach((item) => {
      const currentItemValue: any[] = [];
      fieldsToGroup.forEach((groupField) => {
        currentItemValue.push(item[groupField]);
      });
      const indexOfUsedValueForGrouping = usedValueForGrouping.findIndex((usedValues) =>
        usedValues.every((val, index) => val === currentItemValue[index])
      );
      if (indexOfUsedValueForGrouping === -1) {
        usedValueForGrouping.push(currentItemValue);
        resWithGroup.push([item]);
      } else {
        resWithGroup[indexOfUsedValueForGrouping].push(item);
      }
    });
  } else {
    resWithoutGroup = data;
  }

  // proceed attr's functions
  if (attrs) {
    const separateAttrs = attrs.split(',').map((attr) => attr.trim());
    const attrsSeparateWithFunc = separateAttrs.map((attr) => {
      const indexOfOpenBraces = attr.indexOf('(');
      if (indexOfOpenBraces !== -1) {
        return [attr.slice(0, indexOfOpenBraces), attr.slice(indexOfOpenBraces + 1, -1)];
      }
      return attr;
    });
    const attrsWithFunc = attrsSeparateWithFunc.filter((attr) => Array.isArray(attr));
    if (!attrsWithFunc.length) {
      const res: any[] = resWithGroup.length ? resWithGroup.map((v) => v[0]) : resWithoutGroup;
      return res.map((r) => {
        const returnRes = {};
        separateAttrs.forEach((a) => {
          returnRes[a] = r[a];
        });
        return returnRes;
      });
    } else {
      const fieldsToAdd = separateAttrs.filter((attr) => attr.includes('('));
      const fieldsToSave = [
        ...new Set(fieldsToAdd.map((field) => field.slice(field.indexOf('(') + 1, -1)))
      ];
      if (resWithGroup.length) {
        resWithGroup.forEach((groupedRes) => {
          const tempSave = {};
          fieldsToSave.forEach((field) => {
            tempSave[field] = [];
          });
          groupedRes.forEach((item) => {
            fieldsToSave.forEach((field) => {
              tempSave[field].push(item[field] || undefined);
            });
          });
          fieldsToAdd.forEach((fieldToAdd) => {
            const fieldToCount = fieldToAdd.slice(fieldToAdd.indexOf('(') + 1, -1);
            const func = fieldToAdd.slice(0, fieldToAdd.indexOf('('));
            if (func === 'count') {
              groupedRes[0][fieldToAdd] = tempSave[fieldToCount].filter(
                (v) => v !== undefined && v !== null
              ).length;
            } else if (func === 'sum') {
              const numberValue = tempSave[fieldToCount].filter((v) => !isNaN(Number(v)));
              if (!numberValue.length) {
                throw new ValidationError('For function sum does not exist number value');
              }
              groupedRes[0][fieldToAdd] = numberValue.reduce(
                (valueOne, valueTwo) => valueOne + valueTwo
              );
            } else if (func === 'max') {
              const numberValue = tempSave[fieldToCount].filter((v) => !isNaN(Number(v)));
              if (!numberValue.length) {
                throw new ValidationError('For function max does not exist number value');
              }
              groupedRes[0][fieldToAdd] = numberValue.reduce((max, value) =>
                max > value ? max : value
              );
            } else if (func === 'min') {
              const numberValue = tempSave[fieldToCount].filter((v) => !isNaN(Number(v)));
              if (!numberValue.length) {
                throw new ValidationError('For function min does not exist number value');
              }
              groupedRes[0][fieldToAdd] = numberValue.reduce((min, value) =>
                min < value ? min : value
              );
            } else {
              const numberValue = tempSave[fieldToCount].filter((v) => !isNaN(Number(v)));
              if (!numberValue.length) {
                throw new ValidationError('For function avg does not exist number value');
              }
              groupedRes[0][fieldToAdd] =
                numberValue.reduce((value1, value2) => value1 + value2) / groupedRes.length;
            }
          });
        });
      } else {
        resWithoutGroup;
      }
      const res: any[] = resWithGroup.length ? resWithGroup.map((v) => v[0]) : resWithoutGroup[0];
      return res.map((r) => {
        const returnRes = {};
        separateAttrs.forEach((a) => {
          returnRes[a] = r[a];
        });
        return returnRes;
      });
    }
  }

  if (resWithGroup.length) {
    return resWithGroup.map((r) => r[0]);
  } else {
    return resWithoutGroup;
  }
};
