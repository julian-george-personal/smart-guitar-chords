export function comparePriorities(aPriority: number, bPriority: number) {
  if (aPriority < bPriority) {
    return -1;
  } else if (aPriority > bPriority) {
    return 1;
  }
  return null;
}

export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

export function processInputString(input: string): string {
  return input.trim();
}

export const withLoading = (setIsLoading: (isLoading: boolean) => void) => function (func: Function) {
  return async (...args: any[]) => {
    setIsLoading(true);
    try {
      return await func(...args);
    }
    finally {
      setIsLoading(false);
    }
  }
}