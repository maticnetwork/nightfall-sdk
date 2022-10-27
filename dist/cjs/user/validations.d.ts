import Joi, { ValidationError } from "joi";
export declare const createOptions: Joi.ObjectSchema<any>;
export declare const makeDepositOptions: Joi.ObjectSchema<any>;
export declare const makeTransferOptions: Joi.ObjectSchema<any>;
export declare const makeWithdrawalOptions: Joi.ObjectSchema<any>;
export declare const finaliseWithdrawalOptions: Joi.ObjectSchema<any>;
export declare const checkBalancesOptions: Joi.ObjectSchema<any>;
export declare function isInputValid(error: ValidationError | undefined): void;
