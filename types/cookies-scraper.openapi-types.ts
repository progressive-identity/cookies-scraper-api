/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/cookies/{url}": {
    /**
     * Your GET endpoint 
     * @description Fetch cookies from the url of a website present in path param.
     */
    get: operations["getCookies"];
    parameters: {
      path: {
        url: string;
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** User */
    User: {
      /** @description Unique identifier for the given user. */
      id: number;
      firstName: string;
      lastName: string;
      /** Format: email */
      email: string;
      /**
       * Format: date 
       * @example 1997-10-31
       */
      dateOfBirth?: string;
      /** @description Set to true if the user's email has been verified. */
      emailVerified: boolean;
      /**
       * Format: date 
       * @description The date that the user was created.
       */
      createDate?: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  getCookies: {
    /**
     * Your GET endpoint 
     * @description Fetch cookies from the url of a website present in path param.
     */
    responses: {
      /** @description OK */
      200: never;
    };
  };
}
