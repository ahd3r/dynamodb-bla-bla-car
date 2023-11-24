import pino from 'pino';

export const logger = pino();

export class ServerError extends Error {
  public type = 'ServerError';
  public status = 500;
  public internal = true;

  constructor(msg: string) {
    super(msg);
  }
}

export class ValidationError extends Error {
  public type = 'ValidationError';
  public status = 400;
  public internal = true;
  public errors: string[] | undefined;

  constructor(msg: string | string[]) {
    super(Array.isArray(msg) ? 'ValidationArrayError' : msg);
    if (Array.isArray(msg)) {
      this.errors = msg;
    }
  }
}

export const filterAndSortByAppearance = <T extends { id: string }>(arrayWithId: T[]): T[] => {
  const usesId: string[] = [];
  const res: [T, number][] = [];
  arrayWithId.forEach((el) => {
    const indexOfRes = usesId.indexOf(el.id);
    if (indexOfRes !== -1) {
      res[indexOfRes][1]++;
    } else {
      usesId.push(el.id);
      res.push([el, 1]);
    }
  });
  return res.sort((t1, t2) => t1[1] - t2[1]).map((el) => el[0]);
};
