import { RideStatus } from '../repository/ride';
import { ValidationError } from './utils';

type EntityFieldProp = {
  [field: string]: {
    allowedOp: ('=' | '<>' | '<' | '<=' | '>' | '>=' | '~=' | '->')[];
    validationAndTransformationFn?: (val: string) => string | number | boolean;
  };
};

const filterOperations: ('=' | '<>' | '<' | '<=' | '>' | '>=' | '~=' | '->')[] = [
  '=',
  '<>',
  '<',
  '<=',
  '>',
  '>=',
  '~=',
  '->'
];

// (a = 1 AND b > 2 AND b2 < 22 AND b3 ~= like_operation) OR (c <> 3 AND (d -> (4, 5, 6) AND e >= 7 AND e <= 8))
export const proceedFilter = (
  filter: string,
  allowedFilteringInEntity: EntityFieldProp
): {
  FilterExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: string };
} => {
  let FilterExpression: string = filter;
  let ExpressionAttributeNames: { [key: string]: string } = {};
  let ExpressionAttributeValues: { [key: string]: string } = {};

  // braces correct usage
  const braces: { openBracesIndex: number }[] = [];
  filter.split('').forEach((letter, index, fullFilterArray) => {
    if (letter == '(') {
      braces.push({ openBracesIndex: index });
    }
    if (letter == ')') {
      if (!braces.length) {
        throw new ValidationError('Wrong braces usage');
      }
      let innerBrace = 0;
      const braceConditionWithoutInnerBrace = fullFilterArray
        .slice(braces[braces.length - 1].openBracesIndex + 1, index)
        .filter((l) => {
          if (l == '(') {
            innerBrace++;
          }
          if (l == ')') {
            innerBrace--;
            return false;
          }
          return !innerBrace;
        })
        .join('');
      if (
        !braceConditionWithoutInnerBrace.includes('OR') &&
        !braceConditionWithoutInnerBrace.includes('AND') &&
        !fullFilterArray
          .join('')
          .slice(0, braces[braces.length - 1].openBracesIndex)
          .trim()
          .endsWith('->')
      ) {
        throw new ValidationError('Braces condition has to have at least one OR or AND key word');
      }
      braces.pop();
    }
  });
  if (braces.length) {
    throw new ValidationError('Wrong braces usage');
  }

  // check filter operation
  let closeBraceStay = 0;
  const filterWithoutBraces = filter
    .split('')
    .map((char, index) => {
      if (char === '(') {
        if (filter.slice(0, index).trim().endsWith('->')) {
          closeBraceStay++;
          return char;
        }
        return;
      }
      if (char === ')') {
        if (closeBraceStay) {
          closeBraceStay--;
          return char;
        }
        return;
      }
      return char;
    })
    .join('');
  const separateConditions = filterWithoutBraces.split(/OR|AND/).map((c) => c.trim());
  const acceptedFields = Object.keys(allowedFilteringInEntity);
  if (
    !separateConditions.every((condition) => {
      const filterOperation = filterOperations.find((op) => condition.includes(op));
      if (!filterOperation) {
        return false;
      }
      const [field, value] = condition.split(filterOperation).map((v) => v.trim());
      if (!acceptedFields.includes(field)) {
        return false;
      }
      if (!allowedFilteringInEntity[field].allowedOp.includes(filterOperation)) {
        return false;
      }
      if (allowedFilteringInEntity[field].validationAndTransformationFn) {
        (allowedFilteringInEntity[field].validationAndTransformationFn as any)(value);
      }
      return true;
    })
  ) {
    throw new ValidationError('Some of the condition is wrong');
  }

  separateConditions.forEach((separateCondition, index) => {
    const filterOperation = filterOperations.find((op) => separateCondition.includes(op));
    const [field, value] = separateCondition.split(filterOperation as string).map((v) => v.trim());
    let separateConditionNew = separateCondition;
    if (filterOperation == '~=') {
      separateConditionNew = `contains('#${field}', ':val${index}')`;
      ExpressionAttributeNames[`#${field}`] = field;
      ExpressionAttributeValues[`:val${index}`] = value;
    } else if (filterOperation == '->') {
      const valueForExp = value
        .replace(/[()]/g, '')
        .split(',')
        .map((v) => v.trim())
        .map((valueIn, i) => {
          ExpressionAttributeValues[`:val${index}${i}`] = valueIn;
          return `:val${index}${i}`;
        });
      separateConditionNew = `#${field} IN (${valueForExp.join(', ')})`;
      ExpressionAttributeNames[`#${field}`] = field;
    } else {
      separateConditionNew = `#${field} ${filterOperation} :val${index}`;
      ExpressionAttributeNames[`#${field}`] = field;
      ExpressionAttributeValues[`:val${index}`] = value;
    }
    FilterExpression = FilterExpression.replace(separateCondition, separateConditionNew);
  });

  return {
    FilterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues
  };
};

export const userEntityFilterAllow: EntityFieldProp = {
  id: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (value.length < 1) {
        throw new ValidationError('Id must be longer then 1 char');
      }
      return value;
    }
  },
  email: {
    allowedOp: ['=', '<>', '~=', '->']
  },
  phone: {
    allowedOp: ['=', '<>', '~=', '->']
  },
  created: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('Created value must be a number');
      }
      return Number(value);
    }
  }
};

export const adminEntityFilterAllow: EntityFieldProp = {
  id: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (value.length < 1) {
        throw new ValidationError('Id must be longer then 1 char');
      }
      return value;
    }
  },
  email: {
    allowedOp: ['=', '<>', '~=', '->']
  },
  roleId: {
    allowedOp: ['=', '<>', '->', '~=']
  },
  created: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('Created value must be a number');
      }
      return Number(value);
    }
  }
};

export const carEntityFilterAllow: EntityFieldProp = {
  id: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (value.length < 1) {
        throw new ValidationError('Id must be longer then 1 char');
      }
      return value;
    }
  },
  mark: {
    allowedOp: ['=', '<>', '~=', '->']
  },
  year: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('Created value must be a number');
      }
      return Number(value);
    }
  },
  number: {
    allowedOp: ['=', '<>', '~=', '->']
  },
  created: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('Created value must be a number');
      }
      return Number(value);
    }
  }
};

export const roleEntityFilterAllow: EntityFieldProp = {
  id: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (value.length < 1) {
        throw new ValidationError('Id must be longer then 1 char');
      }
      return value;
    }
  },
  name: {
    allowedOp: ['=', '<>', '~=', '->']
  },
  created: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('Created value must be a number');
      }
      return Number(value);
    }
  }
};

export const rideEntityFilterAllow: EntityFieldProp = {
  id: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (value.length < 1) {
        throw new ValidationError('Id must be longer then 1 char');
      }
      return value;
    }
  },
  driverId: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (value.length < 1) {
        throw new ValidationError('Id must be longer then 1 char');
      }
      return value;
    }
  },
  availablePlaces: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('AvailablePlaces value must be a number');
      }
      return Number(value);
    }
  },
  status: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (!Object.keys(RideStatus).includes(value)) {
        throw new ValidationError(
          `Ride status value must be one of the ${Object.keys(RideStatus).join(', ')}`
        );
      }
      return value;
    }
  },
  carId: {
    allowedOp: ['=', '<>', '->', '~='],
    validationAndTransformationFn: (value: string) => {
      if (value.length < 1) {
        throw new ValidationError('Id must be longer then 1 char');
      }
      return value;
    }
  },
  from: {
    allowedOp: ['=', '<>', '->', '~=']
  },
  to: {
    allowedOp: ['=', '<>', '->', '~=']
  },
  distanceMeters: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('DistanceMeters value must be a number');
      }
      return Number(value);
    }
  },
  timeMinutes: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('TimeMinutes value must be a number');
      }
      return Number(value);
    }
  },
  description: {
    allowedOp: ['=', '<>', '->', '~=']
  },
  created: {
    allowedOp: ['<', '<=', '>', '>='],
    validationAndTransformationFn: (value: string) => {
      if (isNaN(Number(value))) {
        throw new ValidationError('Created value must be a number');
      }
      return Number(value);
    }
  }
};
